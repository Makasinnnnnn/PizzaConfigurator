import{execSync}from 'child_process';
if(process.platform==='win32'){
    execSync('chcp 65001');
}

import readlineSync from 'readline-sync';
import{addIngredientMenu, showIngredients, removeIngredientMenu, editIngredientMenu}from './ingredients';
import{addBaseMenu, showBases, removeBaseMenu, editBaseMenu}from './bases';
import{createPizzaMenu, create5050Menu, showPizzas, removePizzaMenu, editPizzaMenu}from './pizzas';
import{addbortikMenu}from './bortiks';
import{orderMenu, showConcreteOrdersMenu}from './orders';
import{initDemoData}from './demo';

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

initDemoData();
mainMenu();