import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{IPizza, IPizzaBortik, PizzaSize, IOrder}from './models';
import{orderRepo, pizzaRepo, baseRepo, bortikRepo}from './state';
import{createPizzaMenu}from './pizzas';

export function orderMenu(){
    console.clear();
    console.log('Меню заказа');
    const order: IOrder ={ id: uuidv4(), name: 'Новый заказ', items: [], totalPrice: 0, comment: '', createdAt: new Date(), timeWhenNeeded: new Date() };
    while (true){
        console.log('\n1. Добавить готовую пиццу в заказ');
        console.log('2. Собрать пиццу вручную (в заказ)');
        console.log('3. Показать текущие позиции');
        console.log('4. Завершить и сохранить заказ');
        console.log('5. Добавить пиццу 50/50 (в заказ)');
        console.log('0. Отменить');
        const ch=readlineSync.question('Выберите:');
        if (ch==='0') return;
        if (ch==='1'){
            const pizzas=pizzaRepo.getAll();
            if (pizzas.length===0){
                console.log('Каталог пуст. Сначала добавьте пиццы.');
                continue;
            }
            const pizzaNames=pizzas.map(p=>`${p.name} (базовая цена: ${p.totalPrice}р)`);
            const pizzaIndex=readlineSync.keyInSelect(pizzaNames, 'Выберите пиццу для добавления:');
            if (pizzaIndex===-1) continue; 
            const chosen=pizzas[pizzaIndex];
            const sizes: PizzaSize[]=['small', 'medium', 'large'];
            const sizeIndex=readlineSync.keyInSelect(['Маленькая', 'Средняя', 'Большая'], `Выберите размер для "${chosen.name}":`);
            if (sizeIndex===-1) continue; 
            const selectedSize=sizes[sizeIndex];
            let sizeMultiplier=1;
            if (selectedSize==='medium') sizeMultiplier=1.5;
            if (selectedSize==='large') sizeMultiplier=2;
            const cloned: IPizza=structuredClone(chosen);
            const isDouble=readlineSync.keyInYN('Удвоить ингредиенты в этой пицце?');
            if (isDouble){
                cloned.ingredients=[...cloned.ingredients, ...cloned.ingredients];
                cloned.name += ' (Двойные ингредиенты)';
            }
            const bortikPrice=cloned.bortik?cloned.bortik.price : 0;
            const ingredientsPrice=cloned.ingredients.reduce((sum, ing)=>sum+ing.price, 0);
            cloned.size=selectedSize;
            cloned.totalPrice=Math.round((cloned.base.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
            order.items.push(cloned);
            console.log(`Добавлено в заказ: ${cloned.name}[${selectedSize}] (${cloned.totalPrice}р)`);
        }else if (ch==='2'){
            const manual=createPizzaMenu(false);
            if (manual){
                order.items.push(manual as IPizza);
                console.log(`Пицца добавлена в заказ (только в памяти): ${(manual as IPizza).name}`);
            }
        } else if (ch === '5') {
            const bases = baseRepo.getAll();
            const baseIndex = readlineSync.keyInSelect(bases.map(b => b.name), 'Выберите общую основу для пиццы 50/50:');
            if (baseIndex === -1) continue;
            const selectedBase = bases[baseIndex];
            const pizzas = pizzaRepo.getAll();
            if (pizzas.length < 2) {
                console.log('Ошибка: в каталоге должно быть минимум 2 пиццы для создания 50/50');
                continue;
            }
            const pizzaNames = pizzas.map(p => `${p.name} (${p.totalPrice}р)`);
            console.log('Выберите первую половину:');
            const aIdx = readlineSync.keyInSelect(pizzaNames, 'Первая половина:');
            if (aIdx === -1) continue;
            console.log('Выберите вторую половину:');
            const bIdx = readlineSync.keyInSelect(pizzaNames, 'Вторая половина:');
            if (bIdx === -1) continue;
            const sizes: PizzaSize[] = ['small', 'medium', 'large'];
            const sizeIndex = readlineSync.keyInSelect(['Маленькая', 'Средняя', 'Большая'], 'Выберите размер для 50/50:');
            if (sizeIndex === -1) continue;
            const selectedSize = sizes[sizeIndex];
            const sizeMult = selectedSize === 'medium'?1.5 : selectedSize === 'large'?2 : 1;
            const pizzaA = pizzas[aIdx];
            const pizzaB = pizzas[bIdx];
            const combinedIngredients = [...pizzaA.ingredients, ...pizzaB.ingredients];
            const ingredientsPrice = combinedIngredients.reduce((sum, ing) => sum+ing.price, 0); 
            let selectedBortik: IPizzaBortik | undefined;
            if (readlineSync.keyInYN('Хотите добавить бортик?')) {
                const availableBortik = bortikRepo.getAll().filter(b => b.allowedPizzaIds.length === 0);
                if (availableBortik.length > 0) {
                    const bortikIndex = readlineSync.keyInSelect(availableBortik.map(b => b.name), 'Выберите бортик:');
                    if (bortikIndex !== -1) selectedBortik = availableBortik[bortikIndex];
                }
            }
            const bortikPrice = selectedBortik?selectedBortik.price : 0;
            const totalPrice = Math.round((selectedBase.price+ingredientsPrice+bortikPrice)*sizeMult);
            const newPizza: IPizza = {
                id: uuidv4(),
                name: `${pizzaA.name}/${pizzaB.name} 50/50`,
                base: selectedBase,
                ingredients: combinedIngredients,
                bortik: selectedBortik,
                size: selectedSize,
                totalPrice
            };
            order.items.push(newPizza);
            console.log(`Добавлено в заказ: ${newPizza.name}[${selectedSize}] (${totalPrice}р)`);            
        }else if (ch==='3'){
            if (order.items.length===0){
                console.log('Позиции отсутствуют');
            }else{
                order.items.forEach((it, i)=>console.log(`${i+1}. ${it.name}(${it.totalPrice}р)`));
            }
        }else if (ch==='4'){
            if (order.items.length===0){
                console.log('Заказ пуст. Сначала добавьте пиццы!');
                continue;
            }
            order.totalPrice=order.items.reduce((s, it)=>s+it.totalPrice, 0);
            order.comment=readlineSync.question('\nВведите комментарий к заказу (Enter - пропустить): ');
            const isDelayed=readlineSync.keyInYN('Это отложенный заказ (ко времени)?');
            if (isDelayed){
                const today=new Date();
                const hint=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}18:30`;
                let validDate=false;
                while (!validDate){
                    const timeStr=readlineSync.question(`Введите дату и время заказа (например, ${hint}): `);
                    const parsedDate=new Date(timeStr);
                    if (isNaN(parsedDate.getTime())){
                        console.log('Ошибка: неверный формат даты/времени. Попробуйте еще раз.');
                    }else if (parsedDate<new Date()){
                        console.log('Ошибка: нельзя сделать заказ в прошлое!');
                    }else{
                        order.timeWhenNeeded=parsedDate;
                        validDate=true;
                    }
                }
            }else{
                order.timeWhenNeeded=new Date(); 
            }
            orderRepo.create(order);
            console.log(`\nЗаказ успешно сохранён. Итог: ${order.totalPrice}р`);
            if (isDelayed){
                console.log(`Заказ будет готов к: ${order.timeWhenNeeded.toLocaleString()}`);
            }
            readlineSync.question('Нажмите Enter чтобы продолжить');
            return;
        }
    }
}

export function showConcreteOrdersMenu(){
    console.clear();
    console.log('Просмотр заказов');
    const allOrders=orderRepo.getAll();
    const dateFilter=readlineSync.question('Введите дату для поиска (ГГГГ-ММ-ДД) или Enter для всех: ');
    let displayOrders=allOrders;
    if (dateFilter.trim() !== ''){
        displayOrders=allOrders.filter(order =>{
            const orderDate=order.createdAt.toISOString().split('T')[0];
            return orderDate===dateFilter;
        });
    }
    if (displayOrders.length===0){
        console.log('Заказов не найдено.');
    }else{
        displayOrders.forEach(order =>{
            console.log(`\nЗаказ от ${order.createdAt.toLocaleString()}`);
            console.log(`Позиций: ${order.items.length}, Итого: ${order.totalPrice}р`);
            console.log(`Комментарий: ${order.comment||'нет'}`);
            console.log(`ID заказа: ${order.id}`);
            order.items.forEach(p=>console.log(` - ${p.name}(${p.totalPrice}р)`));
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}