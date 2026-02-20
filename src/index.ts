import{execSync} from 'child_process';
if(process.platform==='win32'){
    execSync('chcp 65001');
}

import readlineSync from 'readline-sync';
import{v4 as uuidv4} from 'uuid';
import{IIngredient, IPizzaBase, IPizza} from './models';
import{Repository} from './repository';

const ingredientRepo=new Repository<IIngredient>();
const baseRepo=new Repository<IPizzaBase>();
const pizzaRepo=new Repository<IPizza>();

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
            case '0':
                console.log('До свидания!');
                process.exit(0);
            default:
                console.log('Неверный выбор!');
                readlineSync.question('Нажмите Enter чтобы продолжить');
        }
    }
}

function addIngredientMenu(){
    console.clear();
    console.log('Добавить ингредиент');
    const name=readlineSync.question('Название ингредиента:');
    const priceStr=readlineSync.question('Цена:');
    const price=parseInt(priceStr);

    if(isNaN(price)||price < 0){
        console.log('Ошибка:неверная цена');
    } else{
        const id=uuidv4();
        ingredientRepo.create({ id, name, price });
        console.log(`Ингредиент "${name}" (${price}р) добавлен`);
    }
    readlineSync.question('Нажмите Enter чтобы продолжить');
}

function addBaseMenu(){
    console.clear();
    console.log('Добавление основы');
    const name=readlineSync.question('Название основы:');
    const priceStr=readlineSync.question('Цена:');
    const price=parseInt(priceStr);

    if(isNaN(price)||price < 0){
        console.log('Ошибка:неверная цена!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    const allBases=baseRepo.getAll();
    const classic=allBases.find(b => b.isClassic);
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

function createPizzaMenu(){
    console.clear();
    console.log('Создать пиццу');

    const bases=baseRepo.getAll();
    if(bases.length===0){
        console.log('Ошибка:сначала добавьте основу!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    console.log('Доступные основы:');
    bases.forEach((b, i) => console.log(`${i + 1}. ${b.name} (${b.price}р)${b.isClassic ? ' [Классика]' :''}`));
    
    const baseIndexStr=readlineSync.question('Выберите основу (номер):');
    const baseIndex=parseInt(baseIndexStr) - 1;
    
    if(isNaN(baseIndex)||baseIndex < 0||baseIndex >= bases.length){
        console.log('Ошибка:неверный выбор!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    const selectedBase=bases[baseIndex];

    const ingredients=ingredientRepo.getAll();
    if(ingredients.length === 0){
        console.log('Ошибка:сначала добавьте ингредиенты!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    console.log('\nДоступные ингредиенты (введите номера через запятую):');
    ingredients.forEach((ing, i) => console.log(`${i + 1}. ${ing.name} (${ing.price}р)`));

    const ingInput=readlineSync.question('Выберите ингредиенты:');
    const ingIndices=ingInput.split(',').map(s => parseInt(s.trim()) - 1).filter(i => !isNaN(i) && i >= 0 && i < ingredients.length);
    
    if(ingIndices.length === 0){
        console.log('Ошибка:выберите хотя бы один ингредиент!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    const selectedIngredients=ingIndices.map(i => ingredients[i]);
    const total=selectedBase.price + selectedIngredients.reduce((sum, ing) => sum + ing.price, 0);

    const name=readlineSync.question('Название пиццы:');

    pizzaRepo.create({
        id:uuidv4(),
        name,
        base:selectedBase,
        ingredients:selectedIngredients,
        totalPrice:total
    });

    console.log(`\n🍕 Пицца "${name}" создана! Итого:${total}р`);
    readlineSync.question('Нажмите Enter чтобы продолжить');
}

function showPizzas(){
    console.clear();
    console.log('=== Каталог пицц ===');
    const pizzas=pizzaRepo.getAll();
    
    if(pizzas.length === 0){
        console.log('Пицц пока нет!');
    } else{
        pizzas.forEach(pizza =>{
            console.log(`\n${pizza.name}`);
            console.log(`   Основа:${pizza.base.name} (${pizza.base.price}р)`);
            console.log(`   Ингредиенты:${pizza.ingredients.map(i => i.name).join(', ')}`);
            console.log(`   Цена:${pizza.totalPrice}р`);
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}

function showIngredients(){
    console.clear();
    console.log('=== Ингредиенты ===');
    const ingredients=ingredientRepo.getAll();
    
    if(ingredients.length === 0){
        console.log('Ингредиентов пока нет!');
    } else{
        ingredients.forEach(ing =>{
            console.log(`- ${ing.name}:${ing.price}р`);
        });
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}

function showBases(){
    console.clear();
    console.log('=== Основы ===');
    const bases=baseRepo.getAll();
    
    if(bases.length === 0){
        console.log('Основ пока нет!');
    } else{
        bases.forEach(base =>{console.log(`- ${base.name}:${base.price}р${base.isClassic?' [Классика]':''}`);});
    }
    readlineSync.question('\nНажмите Enter чтобы продолжить');
}

function removeIngredientMenu(){
    console.clear();
    console.log('Удалить ингредиент');
    const ingredients=ingredientRepo.getAll();
    
    if(ingredients.length===0){
        console.log('Ингредиентов нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    ingredients.forEach((ing, i)=>console.log(`${i + 1}. ${ing.name} (${ing.price}р)`));
    
    const indexStr=readlineSync.question('Выберите номер для удаления:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index>=ingredients.length){
        console.log('Ошибка:неверный выбор!');
    } else{
        const removed=ingredients[index];
        ingredientRepo.delete(removed.id);
        console.log(`Ингредиент "${removed.name}" удален!`);
    }
    readlineSync.question('Нажмите Enter чтобы продолжить');
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

    pizzas.forEach((p, i)=>console.log(`${i + 1}. ${p.name} (${p.totalPrice}р)`));
    
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

    bases.forEach((b, i) => console.log(`${i + 1}. ${b.name} (${b.price}р)${b.isClassic ? '[Классика]' :''}`));
    
    const indexStr=readlineSync.question('Выберите номер для удаления:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index<0||index>=bases.length){
        console.log('Ошибка:неверный выбор!');
    }else{
        const removed=bases[index];
        const pizzasUsingBase=pizzaRepo.getAll().filter(p=>p.base.id===removed.id);
        pizzasUsingBase.forEach(p => pizzaRepo.delete(p.id));
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

    ingredients.forEach((ing, i) => console.log(`${i + 1}. ${ing.name} (${ing.price}р)`));
    
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
    const price=priceStr ? parseInt(priceStr):selected.price;

    if(isNaN(price)||price<0){
        console.log('Ошибка:неверная цена!');
    }else{
        ingredientRepo.update(selected.id,{ name, price });
        console.log(`Ингредиент "${name}" обновлен!`);
        
        const pizzasUsingIng=pizzaRepo.getAll().filter(p=>p.ingredients.some(i=>i.id===selected.id));
        pizzasUsingIng.forEach(pizza=>{
            const newIngredients=pizza.ingredients.map(i =>i.id===selected.id?{ ...i,name,price}:i
            );
            const total=pizza.base.price+newIngredients.reduce((sum,i)=>sum+i.price,0);
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

    bases.forEach((b, i)=>console.log(`${i + 1}. ${b.name} (${b.price}р)${b.isClassic ? ' [Классика]' :''}`));
    
    const indexStr=readlineSync.question('Выберите номер для редактирования:');
    const index=parseInt(indexStr)-1;

    if(isNaN(index)||index < 0||index >= bases.length){
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
    pizzasUsingBase.forEach(pizza=>{
        const newBase={ ...pizza.base,name,price };
        const total=newBase.price+pizza.ingredients.reduce((sum, i)=>sum+i.price, 0);
        pizzaRepo.update(pizza.id,{base:newBase,totalPrice:total});});
    if(pizzasUsingBase.length>0){
        console.log(`Обновлено пицц с этой основой:${pizzasUsingBase.length}`);}
    readlineSync.question('Нажмите Enter чтобы продолжить');}

function editPizzaMenu(){
    console.clear();
    console.log('Редактировать пиццу');
    const pizzas=pizzaRepo.getAll();
    
    if(pizzas.length===0){
        console.log('Пицц нет!');
        readlineSync.question('Нажмите Enter чтобы продолжить');
        return;
    }

    pizzas.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.totalPrice}р)`));
    
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
    bases.forEach((b, i)=>{const marker=b.id === selected.base.id ? ' *' :'';
        console.log(`${i + 1}. ${b.name} (${b.price}р)${b.isClassic ? ' [Классика]' :''}${marker}`);});
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
        const marker=isSelected ? ' *' :'';
        console.log(`${i + 1}. ${ing.name} (${ing.price}р)${marker}`);});

    const ingInput=readlineSync.question('Выберите ингредиенты(Enter - оставить как есть):');
    let selectedIngredients=selected.ingredients;
    if(ingInput.trim()){
        const ingIndices=ingInput.split(',').map(s =>parseInt(s.trim())-1).filter(i=>!isNaN(i)&&i>=0&&i<ingredients.length);
        if(ingIndices.length > 0){
            selectedIngredients=ingIndices.map(i => ingredients[i]);
        }
    }
    
    const total=selectedBase.price+selectedIngredients.reduce((sum, ing)=>sum+ing.price, 0);
    
    pizzaRepo.update(selected.id,{
        name,
        base:selectedBase,
        ingredients:selectedIngredients,
        totalPrice:total
    });
    
    console.log(`\nПицца "${name}" обновлена! Итого:${total}р`);
    readlineSync.question('Нажмите Enter чтобы продолжить');
}


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
        totalPrice:270
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
        totalPrice:340
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
        totalPrice:320
    });

    console.log('Демо-данные загружены!\n');
}

initDemoData();
mainMenu();
