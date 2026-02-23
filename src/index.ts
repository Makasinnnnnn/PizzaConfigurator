import{execSync}from 'child_process';
if(process.platform==='win32'){
    execSync('chcp 65001');
}


import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{IIngredient, IPizzaBase, IPizza, IPizzaBortik, PizzaSize, IOrder}from './models';
import{Repository}from './repository';


const ingredientRepo=new Repository<IIngredient>();
const baseRepo=new Repository<IPizzaBase>();
const pizzaRepo=new Repository<IPizza>();
const bortikRepo=new Repository<IPizzaBortik>();
const orderRepo=new Repository<IOrder>();


function mainMenu(){
    while (true){
        console.clear();
        console.log('КОНФИГУРАТОР');
        console.log('1. Добавить ингредиент');
        console.log('2. Добавить основу для пиццы');
        console.log('3. Создать пиццу');
        console.log('4. Показать каталог пицц');
        console.log('5. Показать ингредиенты');
        console.log('6. Показать основы');
        console.log('7. Редактировать ингредиент');
        console.log('8. Редактировать основу');
        console.log('9. Редактировать пиццу');
        console.log('10. Удалить ингредиент');
        console.log('11. Удалить пиццу');
        console.log('12. Удалить основу');
        console.log('13. Добавить бортик');
        console.log('14. Создать пиццу 50/50');
        console.log('15. Меню заказа');
        console.log('16. Просмотреть заказы');
        console.log('0. Выход');

        const choice=readlineSync.question('Выберите пункт:');

        switch (choice){
            case '1':
                addIngredientMenu();
                break;
            case '2':
                addBaseMenu();
                break;
            case '3':
                createPizzaMenu();
                break;
            case '4':
                showPizzas();
                break;
            case '5':
                showIngredients();
                break;
            case '6':
                showBases();
                break;
            case '7':
                editIngredientMenu();
                break;
            case '8':
                editBaseMenu();
                break;
            case '9':
                editPizzaMenu();
                break;
            case '10':
                removeIngredientMenu();
                break;
            case '11':
                removePizzaMenu();
                break;
            case '12':
                removeBaseMenu();
                break;
            case '13':
                addbortikMenu();
                break;
            case '14':
                create5050Menu();
                break;
            case '15':
                orderMenu();
                break;
            case '16':
                showConcreteOrdersMenu();
                break;
            case '0':
                console.log('Пока!');
                process.exit(0);
            default:
                console.log('Неверный выбор!');
                readlineSync.question('Нажмите Enter чтобы продолжить');
        }
    }
}




function addIngredientMenu(){
    console.clear();
    console.log('\nДобавить ингредиент');
    let name='';
    while (name.trim().length===0){
        name=readlineSync.question('Введите название ингредиента: ');
        if (name.trim().length===0){
            console.log("Ошибка: Название не может быть пустым. Попробуйте еще раз.");
        }
    }
    const priceInput=readlineSync.question('Введите стоимость: ');
    const price=parseInt(priceInput, 10);
    if (isNaN(price)||price<=0){
        console.log("Ошибка:неверная цена!");
        return;
    }
    ingredientRepo.create({ id: uuidv4(), name: name.trim(), price });
    console.log(`Ингредиент "${name}" успешно добавлен!`);
}




function addBaseMenu(){
    console.clear();
    console.log('Добавление основы');
    const name=readlineSync.question('Название основы:');
    const priceStr=readlineSync.question('Цена:');
    const price=parseInt(priceStr);

    if(isNaN(price)||price<=0){
        console.log('Ошибка:неверная цена!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    const allBases=baseRepo.getAll();
    const classic=allBases.find(b=>b.isClassic);
    const isClassicInput=readlineSync.question('Это классическая основа? (y/n):');
    const isClassic=isClassicInput.toLowerCase()==='y';

    if(isClassic && classic){
        console.log('Ошибка:классическая основа уже существует');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    if(!isClassic && classic){
        const limit=classic.price*1.2;
        if(price>limit){
            console.log(`Ошибка:Основа "${name}" слишком дорогая (Максимум:${limit}р)`);
            readlineSync.question('Нажмите Enter чтобы продолжить');
            return;
        }
    }

    const id=uuidv4();
    baseRepo.create({ id, name, price, isClassic });
    console.log(`Основа "${name}" добавлена!`);
    readlineSync.question('Нажмите Enter чтобы продолжить');
}




function createPizzaMenu(saveToRepo: boolean=true): IPizza | void{
    console.log('\nСоздать пиццу');
    let name='';
    while (name.trim().length===0){
        name=readlineSync.question('Придумайте название для пиццы: ');
        if (name.trim().length===0){
            console.log("Ошибка: Название не может быть пустым. Попробуйте еще раз.");
        }
    }
    const bases=baseRepo.getAll();
    if (bases.length===0){
        console.log("Ошибка: сначала добавьте основы!");
        return;
    }
    const baseIndex=readlineSync.keyInSelect(bases.map(b=>b.name), 'Выберите основу:');
    if (baseIndex===-1) return;
    const selectedBase=bases[baseIndex];
    const selectedIngredients: IIngredient[]=[];
    while (true){
        const ingredients=ingredientRepo.getAll();
        const ingIndex=readlineSync.keyInSelect(ingredients.map(i=>i.name), 'Добавить ингредиент?');
        if (ingIndex===-1) break;
        selectedIngredients.push(ingredients[ingIndex]);
    }

    let selectedbortik: IPizzaBortik | undefined;
    if (readlineSync.keyInYN('Хотите добавить бортик?')){
        const availableBortik=bortikRepo.getAll().filter(b=>b.allowedPizzaIds.length===0);
        if (availableBortik.length===0){
            console.log("Доступных бортиков для этой пиццы нет.");
        }else{
            const bortikIndex=readlineSync.keyInSelect(availableBortik.map(b=>b.name), 'Выберите бортик:');
            if (bortikIndex !== -1) selectedbortik=availableBortik[bortikIndex];
    }
}
    
    
    const sizes: PizzaSize[]=['small', 'medium', 'large'];
    const sizeIndex=readlineSync.keyInSelect(['Маленькая', 'Средняя', 'Большая'], 'Выберите размер пиццы:');
    if (sizeIndex===-1) return;
    const selectedSize=sizes[sizeIndex];

    let sizeMultiplier=1;
    if (selectedSize==='medium') sizeMultiplier=1.5;
    if (selectedSize==='large') sizeMultiplier=2;

    const bortikPrice=selectedbortik?selectedbortik.price : 0;
    const ingredientsPrice=selectedIngredients.reduce((sum, ing)=>sum+ing.price, 0);
    const totalPrice=Math.round((selectedBase.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
    
    const newPizza: IPizza ={
        id: uuidv4(),
        name: name.trim(),
        base: selectedBase,
        ingredients: selectedIngredients,
        bortik: selectedbortik,
        size: selectedSize,
        totalPrice
    };

    if (saveToRepo){
        pizzaRepo.create(newPizza);
        console.log(`Пицца "${name}" [${selectedSize}] создана! Цена: ${totalPrice}р`);
        return;
    }else{
        console.log(`Пицца "${name}" [${selectedSize}] собрана (в памяти). Цена: ${totalPrice}р`);
        return newPizza;
    }
}




function create5050Menu(){
    console.clear();
    console.log('\nСоздать пиццу 50/50');
    const pizzas=pizzaRepo.getAll();
    if (pizzas.length<2){
        console.log('Ошибка: нужно минимум 2 пиццы в каталоге');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    pizzas.forEach((p, i)=>console.log(`${i+1}. ${p.name}`));
    const aIdx=parseInt(readlineSync.question('Номер первой половины: ')) - 1;
    const bIdx=parseInt(readlineSync.question('Номер второй половины: ')) - 1;

    if (isNaN(aIdx)||isNaN(bIdx)||!pizzas[aIdx]||!pizzas[bIdx]){
        console.log('Неверный выбор');
        return;
    }

    const pizzaA=pizzas[aIdx];
    const pizzaB=pizzas[bIdx];

    const bases=baseRepo.getAll();
    const baseIndex=readlineSync.keyInSelect(bases.map(b=>b.name), 'Выберите общую основу для пиццы 50/50:');
    if (baseIndex===-1) return;
    const selectedBase=bases[baseIndex];

    const sizes: PizzaSize[]=['small', 'medium', 'large'];
    const sIdx=readlineSync.keyInSelect(['Маленькая', 'Средняя', 'Большая'], 'Выберите размер:');
    if (sIdx===-1) return;
    const selectedSize=sizes[sIdx];
    const multiplier=selectedSize==='small'?1 : (selectedSize==='medium'?1.5 : 2);

    let selectedbortik: IPizzaBortik | undefined;
    if (readlineSync.keyInYN('Хотите добавить бортик?')){
        const availableBortik=bortikRepo.getAll().filter(b=>b.allowedPizzaIds.length===0);
        if (availableBortik.length===0){
            console.log('Нет доступных бортиков.');
        }else{
            const bortikIndex=readlineSync.keyInSelect(availableBortik.map(b=>b.name), 'Выберите бортик:');
            if (bortikIndex !== -1) selectedbortik=availableBortik[bortikIndex];
        }
    }

    const ingPriceA=pizzaA.ingredients.reduce((sum, i)=>sum+i.price, 0);
    const ingPriceB=pizzaB.ingredients.reduce((sum, i)=>sum+i.price, 0);
    const ingredientsPrice=ingPriceA+ingPriceB; 
    const bortikPrice=selectedbortik?selectedbortik.price : 0;
    const finalPrice=Math.round((selectedBase.price+ingredientsPrice+bortikPrice)*multiplier);

    const newPizza: IPizza ={
        id: uuidv4(),
        name: `${pizzaA.name}/${pizzaB.name}50/50`,
        base: selectedBase,
        ingredients: [...pizzaA.ingredients, ...pizzaB.ingredients],
        bortik: selectedbortik,
        size: selectedSize,
        totalPrice: finalPrice
    };

    pizzaRepo.create(newPizza);
    console.log(`Пицца 50/50 создана! Итого: ${finalPrice}р`);
    readlineSync.question('Нажмите Enter чтобы продолжить');
}




function orderMenu(){
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




function showPizzas(){
    console.clear();
    console.log('Каталог пицц');
    const allPizzas=pizzaRepo.getAll();
    
    const filterKeyword=readlineSync.question('Введите название ингредиента для поиска (или Enter для всех): ');
    
    let displayPizzas=allPizzas;
    if (filterKeyword.trim()!==''){
        displayPizzas=allPizzas.filter(pizza=>pizza.ingredients.some(ing=>ing.name.toLowerCase().includes(filterKeyword.toLowerCase())));
    }

    if(displayPizzas.length===0){
        console.log('Пицц не найдено');
    }else{
        displayPizzas.forEach(pizza =>{
            console.log(`\n${pizza.name}[${pizza.size||'стандарт'}]`);
            const bortikInfo=pizza.bortik?`+Бортик: ${pizza.bortik.name}(+${pizza.bortik.price}р)` : '';
            console.log(`Основа: ${pizza.base.name}(${pizza.base.price}р) ${bortikInfo}`);
            console.log(`Ингредиенты: ${pizza.ingredients.map(i=>i.name).join(', ')}`);
            console.log(`Цена: ${pizza.totalPrice}р`);
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}




function showIngredients(){
    console.clear();
    console.log('\nСписок ингредиентов');
    const allIngredients=ingredientRepo.getAll();
    
    const filter=readlineSync.question('Поиск по названию (Enter - показать все): ').toLowerCase();
    const displayList=allIngredients.filter(ing=>ing.name.toLowerCase().includes(filter));

    if (displayList.length===0){
        console.log('Ингредиенты не найдены.');
    }else{
        displayList.forEach(ing =>{
            console.log(`ID: ${ing.id.slice(0,8)} Название: ${ing.name} Цена: ${ing.price}р`);
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}

function showBases(){
    console.clear();
    console.log('Основы');
    const allBases=baseRepo.getAll();
    
    const filter=readlineSync.question('Поиск по названию (Enter - показать все): ').toLowerCase();
    const displayList=allBases.filter(b=>b.name.toLowerCase().includes(filter));

    if (displayList.length===0){
        console.log('Основы не найдены!');
    }else{
        displayList.forEach(base =>{
            console.log(`- ${base.name}: ${base.price}р ${base.isClassic?'[Классика]' : ''}`);
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}

function removeIngredientMenu(){
    console.clear();
    console.log('Удаление ингредиента');
    const ingredients=ingredientRepo.getAll();
    
    if (ingredients.length===0){
        console.log('Список ингредиентов пуст.');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }
    ingredients.forEach((ing, i) =>{
        console.log(`${i+1}. ${ing.name}(${ing.price}р)`);
    });

    const choice=readlineSync.question('\nВыберите номер ингредиента для удаления (или Enter для отмены): ');
    const index=parseInt(choice) - 1;

    if (isNaN(index)||index<0||index>=ingredients.length){
        console.log('Удаление отменено или введен неверный номер.');
    }else{
        const removed=ingredients[index]; 
        const pizzasWithIng=pizzaRepo.getAll().filter(p=>p.ingredients.some(i=>i.id===removed.id));
        
        pizzasWithIng.forEach(pizza =>{
            const updatedIngs=pizza.ingredients.filter(i=>i.id !== removed.id);
            const ingredientsPrice=updatedIngs.reduce((sum, i)=>sum+i.price, 0);
            const bortikPrice=pizza.bortik?pizza.bortik.price : 0;
            const sizeMultiplier=pizza.size==='small'?1 : (pizza.size==='medium'?1.5 : 2);
            
            const newTotal=Math.round((pizza.base.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
            pizzaRepo.update(pizza.id,{ 
                ingredients: updatedIngs, 
                totalPrice: newTotal 
            });
        });
        ingredientRepo.delete(removed.id);
        
        console.log(`\nУспех: Ингредиент "${removed.name}" полностью удален.`);
        if (pizzasWithIng.length > 0){
            console.log(`Обновлено связанных пицц: ${pizzasWithIng.length}`);
        }
    }
    
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}




function removePizzaMenu(){
    console.clear();
    console.log('Удалить пиццу');
    const pizzas=pizzaRepo.getAll();
    
    if(pizzas.length===0){
        console.log('Пицц нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    pizzas.forEach((p, i)=>console.log(`${i+1}. ${p.name}(${p.totalPrice}р)`));
    
    const indexStr=readlineSync.question('Выберите номер для удаления:');
    const index=parseInt(indexStr) - 1;

    if(isNaN(index)||index<0||index>=pizzas.length){
        console.log('Ошибка:неверный выбор!');
    }else{
        const removed=pizzas[index];
        pizzaRepo.delete(removed.id);
        console.log(`Пицца "${removed.name}" удалена!`);
    }
    readlineSync.question('Нажмите Enter чтобы продолжить');
}




function removeBaseMenu(){
    console.clear();
    console.log('Удалить основу');
    const bases=baseRepo.getAll();
    
    if(bases.length===0){
        console.log('Основ нет(');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    bases.forEach((b, i)=>console.log(`${i+1}. ${b.name}(${b.price}р)${b.isClassic?'[Классика]' :''}`));
    
    const indexStr=readlineSync.question('Выберите номер для удаления:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index>=bases.length){
        console.log('Ошибка:неверный выбор!');
    }else{
        const removed=bases[index];
        const pizzasUsingBase=pizzaRepo.getAll().filter(p=>p.base.id===removed.id);
        pizzasUsingBase.forEach(p=>pizzaRepo.delete(p.id));
        baseRepo.delete(removed.id);
        console.log(`Основа "${removed.name}" удалена!`);
        if(pizzasUsingBase.length > 0){
            console.log(`Удалено пицц с этой основой:${pizzasUsingBase.length}`);
        }
    }
    readlineSync.question('Нажмите Enter чтобы продолжить');
}




function editIngredientMenu(){
    console.clear();
    console.log('Редактировать ингредиент');
    const ingredients=ingredientRepo.getAll();
    
    if(ingredients.length===0){
        console.log('Ингредиентов нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    ingredients.forEach((ing, i)=>console.log(`${i+1}. ${ing.name}(${ing.price}р)`));
    
    const indexStr=readlineSync.question('Выберите номер для редактирования:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index>=ingredients.length){
        console.log('Ошибка:неверный выбор');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    const selected=ingredients[index];
    const name=readlineSync.question(`Название (${selected.name}):`)||selected.name;
    const priceStr=readlineSync.question(`Цена (${selected.price}):`);
    const price=priceStr?parseInt(priceStr):selected.price;

    if(isNaN(price)||price<0){
        console.log('Ошибка:неверная цена!');
    }else{
        ingredientRepo.update(selected.id,{ name, price });
        console.log(`Ингредиент "${name}" обновлен!`);
        
        const pizzasUsingIng=pizzaRepo.getAll().filter(p=>p.ingredients.some(i=>i.id===selected.id));
        pizzasUsingIng.forEach(pizza=>{
            const newIngredients=pizza.ingredients.map(i =>i.id===selected.id?{ ...i,name,price}:i);
            const ingredientsPrice=newIngredients.reduce((sum, i)=>sum+i.price, 0);
            const bortikPrice=pizza.bortik?pizza.bortik.price : 0;
            const sizeMultiplier=pizza.size==='small'?1 : pizza.size==='medium'?1.5 : 2;
            const total=Math.round((pizza.base.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
            pizzaRepo.update(pizza.id,{ ingredients:newIngredients, totalPrice:total});
        });
        if(pizzasUsingIng.length>0){
            console.log(`Обновлено пицц с этим ингредиентом:${pizzasUsingIng.length}`);
        }
    }
    readlineSync.question('Нажмите Enter чтобы продолжить');
}




function editBaseMenu(){
    console.clear();
    console.log('Редактировать основу');
    const bases=baseRepo.getAll();
    
    if(bases.length===0){
        console.log('Основ нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    bases.forEach((b, i)=>console.log(`${i+1}. ${b.name}(${b.price}р)${b.isClassic?' [Классика]' :''}`));
    
    const indexStr=readlineSync.question('Выберите номер для редактирования:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index >= bases.length){
        console.log('Ошибка:неверный выбор');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;}

    const selected=bases[index];
    const name=readlineSync.question(`Название (${selected.name}):`)||selected.name;
    const priceStr=readlineSync.question(`Цена (${selected.price}):`);
    const price=priceStr?parseInt(priceStr):selected.price;

    if(isNaN(price)||price<0){
        console.log('Ошибка:неверная цена');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;}

    const allBases=bases.filter(b=>b.id!==selected.id);
    const classic=allBases.find(b=>b.isClassic);

    if(!selected.isClassic&&classic){
        const limit=classic.price*1.2;
        if(price>limit){
            console.log(`Ошибка:Основа слишком дорогая! Максимум:${limit}р`);
            readlineSync.question('Нажмите Enter чтобы продолжить');
            return;}}

    baseRepo.update(selected.id,{name, price});
    console.log(`Основа "${name}" обновлена`);
    
const pizzasUsingBase=pizzaRepo.getAll().filter(p=>p.base.id===selected.id);

pizzasUsingBase.forEach(pizza =>{
    const newBase ={ ...pizza.base, name, price };
    const ingredientsPrice=pizza.ingredients.reduce((sum, i)=>sum+i.price, 0);
    const bortikPrice=pizza.bortik?pizza.bortik.price : 0;
    const sizeMultiplier=pizza.size==='small'?1 : (pizza.size==='medium'?1.5 : 2);
    const total=Math.round((newBase.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
    pizzaRepo.update(pizza.id,{ base: newBase, totalPrice: total });
});

if (pizzasUsingBase.length > 0){
    console.log(`Обновлено пицц с этой основой: ${pizzasUsingBase.length}`);
}
readlineSync.question('Нажмите Enter чтобы продолжить');
}




function editPizzaMenu(){
    console.clear();
    console.log('Редактировать пиццу');
    const pizzas=pizzaRepo.getAll();
    
    if(pizzas.length===0){
        console.log('Пицц нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    pizzas.forEach((p, i)=>console.log(`${i+1}. ${p.name}(${p.totalPrice}р)`));
    
    const indexStr=readlineSync.question('Выберите номер для редактирования:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index>=pizzas.length){
        console.log('Ошибка:неверный выбор');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;}

    const selected=pizzas[index];
    
    const name=readlineSync.question(`Название (${selected.name}):`)||selected.name;
    
    const bases=baseRepo.getAll();
    console.log('\nДоступные основы:');
    bases.forEach((b, i)=>{const marker=b.id===selected.base.id?' *' :'';
        console.log(`${i+1}. ${b.name}(${b.price}р)${b.isClassic?' [Классика]' :''}${marker}`);});
    const baseIndexStr=readlineSync.question('Выберите основу (номер, Enter - оставить):');
    let selectedBase=selected.base;
    if(baseIndexStr){
        const baseIndex=parseInt(baseIndexStr)-1;
        if(!isNaN(baseIndex)&&baseIndex>=0&&baseIndex<bases.length){
            selectedBase=bases[baseIndex];
        }
    }
  
    const ingredients=ingredientRepo.getAll();
    console.log('\nДоступные ингредиенты (введите номера через запятую):');
    ingredients.forEach((ing, i)=>{
        const isSelected=selected.ingredients.some(si=>si.id===ing.id);
        const marker=isSelected?' *' :'';
        console.log(`${i+1}. ${ing.name}(${ing.price}р)${marker}`);});

    const ingInput=readlineSync.question('Выберите ингредиенты(Enter - оставить как есть):');
    let selectedIngredients=selected.ingredients;
    if(ingInput.trim()){
        const ingIndices=ingInput.split(',').map(s =>parseInt(s.trim())-1).filter(i=>!isNaN(i)&&i>=0&&i<ingredients.length);
        if(ingIndices.length > 0){
            selectedIngredients=ingIndices.map(i=>ingredients[i]);
        }
    }
    let selectedbortik=selected.bortik; 
    if (readlineSync.keyInYN('Хотите изменить бортик?')){
        const availableBortik=bortikRepo.getAll().filter(b =>b.allowedPizzaIds.length===0||b.allowedPizzaIds.includes(selected.id));
        const bortikNames=['(без бортика)', ...availableBortik.map(b=>b.name)];
        const bortikIndex=readlineSync.keyInSelect(bortikNames, 'Выберите бортик:');
        if (bortikIndex===0){
            selectedbortik=undefined;
        }else if (bortikIndex > 0){
            selectedbortik=availableBortik[bortikIndex - 1];
    }
}      
    const ingredientsPrice=selectedIngredients.reduce((sum, ing)=>sum+ing.price, 0);
    const bortikPrice=selectedbortik?selectedbortik.price : 0;
    const sizeMultiplier=selected.size==='small'?1 : (selected.size==='medium'?1.5 : 2);
    const total=Math.round((selectedBase.price+ingredientsPrice+bortikPrice)*sizeMultiplier);
    
    pizzaRepo.update(selected.id,{
        name,
        base:selectedBase,
        ingredients:selectedIngredients,
        bortik: selectedbortik,
        totalPrice:total
    });
    
    console.log(`\nПицца "${name}" обновлена! Итого:${total}р`);
    readlineSync.question('Нажмите Enter чтобы продолжить');}




function initDemoData(){
    const cheeseId=uuidv4();
    const tomatoId=uuidv4();
    const pepperoniId=uuidv4();
    const mushroomsId=uuidv4();
    const sauceId=uuidv4();

    ingredientRepo.create({ id:cheeseId, name:'Сыр Российский', price:50 });
    ingredientRepo.create({ id:tomatoId, name:'Помидор красный', price:40 });
    ingredientRepo.create({ id:pepperoniId, name:'Пепперони', price:90 });
    ingredientRepo.create({ id:mushroomsId, name:'Грибы шампиньоны', price:70 });
    ingredientRepo.create({ id:sauceId, name:'Соус томатный', price:30 });

    const baseClassicId=uuidv4();
    const baseThickId=uuidv4();

    baseRepo.create({ id:baseClassicId, name:'Тонкая итальянская', price:200, isClassic:true });
    baseRepo.create({ id:baseThickId, name:'Толстая американская', price:220, isClassic:false });

    pizzaRepo.create({
        id:uuidv4(),
        name:'Маргарита',
        base:baseRepo.getById(baseClassicId)!,
        ingredients:[
            ingredientRepo.getById(cheeseId)!,
            ingredientRepo.getById(tomatoId)!,
            ingredientRepo.getById(sauceId)!
        ],
        size:'small',
        totalPrice:320
    });

    pizzaRepo.create({
        id:uuidv4(),
        name:'Пепперони',
        base:baseRepo.getById(baseThickId)!,
        ingredients:[
            ingredientRepo.getById(cheeseId)!,
            ingredientRepo.getById(pepperoniId)!,
            ingredientRepo.getById(sauceId)!
        ],
        size:'small',
        totalPrice:390
    });

    pizzaRepo.create({
        id:uuidv4(),
        name:'Грибная',
        base:baseRepo.getById(baseThickId)!,
        ingredients:[
            ingredientRepo.getById(cheeseId)!,
            ingredientRepo.getById(mushroomsId)!,
            ingredientRepo.getById(sauceId)!
        ],
        size:'small',
        totalPrice:370
    });

    console.log('Демо-данные загружены!\n');
}




function addbortikMenu(){
    console.clear();
    console.log('\nДобавить бортик');
    let name='';
    while (name.trim().length===0){
        name=readlineSync.question('Введите название бортика (например, С кунжутом): ');
        if (name.trim().length===0){
            console.log("Ошибка: Название не может быть пустым.");
        }
    }
    const priceInput=readlineSync.question('Введите стоимость бортика: ');
    const price=parseInt(priceInput, 10);
    if (isNaN(price)||price<=0){
        console.log("Ошибка: неверная цена!");
        return;
    }
    const bortikIngs: IIngredient[]=[];
    while (true){
        const ings=ingredientRepo.getAll();
        const ingIndex=readlineSync.keyInSelect(ings.map(i=>i.name), 'Из чего состоит бортик? (Отмена - закончить выбор):');
        if (ingIndex===-1) break;
        bortikIngs.push(ings[ingIndex]);
    }

    const allowedPizzaIds: string[]=[];
    if (readlineSync.keyInYN('Ограничить использование этого бортика только для конкретных пицц?')){
        const allPizzas=pizzaRepo.getAll();
        while (true){
            const pIdx=readlineSync.keyInSelect(allPizzas.map(p=>p.name), 'Выберите пиццу (Отмена - закончить выбор):');
            if (pIdx===-1) break;
            if (!allowedPizzaIds.includes(allPizzas[pIdx].id)){
                allowedPizzaIds.push(allPizzas[pIdx].id);
            }
        }
    }

    bortikRepo.create({ id: uuidv4(), name: name.trim(), price, ingredients: bortikIngs, allowedPizzaIds });
    console.log(`Бортик "${name}" успешно добавлен!`);
}




function showConcreteOrdersMenu(){
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

initDemoData();
mainMenu();