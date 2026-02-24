import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{ingredientRepo, pizzaRepo}from './state';

export function addIngredientMenu(){
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

export function showIngredients(){
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

export function removeIngredientMenu(){
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

export function editIngredientMenu(){
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