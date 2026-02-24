import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{IIngredient}from './models';
import{bortikRepo, ingredientRepo, pizzaRepo}from './state';

export function addbortikMenu(){
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