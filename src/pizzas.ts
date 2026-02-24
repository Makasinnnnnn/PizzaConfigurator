import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{IIngredient, IPizza, IPizzaBortik, PizzaSize}from './models';
import{pizzaRepo, baseRepo, ingredientRepo, bortikRepo}from './state';

export function createPizzaMenu(saveToRepo: boolean=true): IPizza | void{
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

export function create5050Menu(){
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

export function showPizzas(){
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

export function removePizzaMenu(){
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

export function editPizzaMenu(){
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