import{v4 as uuidv4}from 'uuid';
import{ingredientRepo, baseRepo, pizzaRepo}from './state';

export function initDemoData(){
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