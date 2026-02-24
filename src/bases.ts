import readlineSync from 'readline-sync';
import{v4 as uuidv4}from 'uuid';
import{baseRepo, pizzaRepo}from './state';

export function addBaseMenu(){
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

export function showBases(){
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

export function removeBaseMenu(){
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

export function editBaseMenu(){
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