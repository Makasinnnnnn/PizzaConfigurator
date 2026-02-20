// // Общий интерфейс для всего, у чего есть ID и имя (чтобы не повторяться)
// export interface IEntity {
//     id: string;
//     name: string;
// }

// // Ингредиент: расширяет IEntity (у него уже есть id и name) + добавляет цену
// export interface IIngredient extends IEntity {
//     price: number;
// }

// // Основа: добавляет цену и флаг "классическая"
// export interface IPizzaBase extends IEntity {
//     price: number;
//     isClassic: boolean; 
// }

// // Пицца: включает в себя название (из IEntity), объект основы и массив ингредиентов
// export interface IPizza extends IEntity {
//     base: IPizzaBase;
//     ingredients: IIngredient[];
//     totalPrice: number; // Мы будем хранить посчитанную цену тут
// }


import * as readline from 'readline';

// --- Ваши интерфейсы (без изменений) ---

export interface IEntity {
    id: string;
    name: string;
}

export interface IIngredient extends IEntity {
    price: number;
}

export interface IPizzaBase extends IEntity {
    price: number;
    isClassic: boolean; 
}

export interface IPizza extends IEntity {
    base: IPizzaBase;
    ingredients: IIngredient[];
    totalPrice: number;
}

// // --- Хранилище данных ---

// let ingredients: IIngredient[] = [];
// let bases: IPizzaBase[] = [];
// let pizzas: IPizza[] = [];

// // --- Вспомогательные функции ---

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// const ask = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

// const generateId = () => Math.random().toString(36).substr(2, 9);

// // --- Логика бизнес-правил ---

// const getClassicPrice = () => bases.find(b => b.isClassic)?.price || 0;

// // Проверка: цена не-классической основы не должна превышать цену классической более чем на 20%
// const isValidBasePrice = (price: number, isClassic: boolean): boolean => {
//     if (isClassic) return true;
//     const classicPrice = getClassicPrice();
//     if (classicPrice === 0) return true; // Если классики еще нет, разрешаем любую
//     return price <= classicPrice * 1.2;
// };

// // --- Функции управления ---

// const manageIngredients = async () => {
//     console.log("\n--- Ингредиенты ---");
//     ingredients.forEach(i => console.log(`[${i.id}] ${i.name} - ${i.price} руб.`));
    
//     const action = await ask("\n1. Добавить | 2. Редактировать | 3. Удалить | 0. Назад: ");
    
//     if (action === '1') {
//         const name = await ask("Название: ");
//         const price = parseFloat(await ask("Цена: "));
//         ingredients.push({ id: generateId(), name, price });
//     } else if (action === '2') {
//         const id = await ask("Введите ID для изменения: ");
//         const item = ingredients.find(i => i.id === id);
//         if (item) {
//             item.name = await ask(`Новое имя (${item.name}): `) || item.name;
//             item.price = parseFloat(await ask(`Новая цена (${item.price}): `)) || item.price;
//         }
//     } else if (action === '3') {
//         const id = await ask("Введите ID для удаления: ");
//         ingredients = ingredients.filter(i => i.id !== id);
//     }
// };

// const manageBases = async () => {
//     console.log("\n--- Основы ---");
//     bases.forEach(b => console.log(`[${b.id}] ${b.name} (${b.isClassic ? 'Классика' : 'Доп'}) - ${b.price} руб.`));

//     const action = await ask("\n1. Добавить | 2. Редактировать | 3. Удалить | 0. Назад: ");

//     if (action === '1') {
//         const name = await ask("Название: ");
//         const price = parseFloat(await ask("Цена: "));
//         const isClassic = (await ask("Классическая? (y/n): ")).toLowerCase() === 'y';

//         if (isValidBasePrice(price, isClassic)) {
//             bases.push({ id: generateId(), name, price, isClassic });
//         } else {
//             console.log("Ошибка: Цена основы превышает лимит (20% от классической)!");
//         }
//     } else if (action === '3') {
//         const id = await ask("Введите ID для удаления: ");
//         bases = bases.filter(b => b.id !== id);
//     }
// };

// const managePizzas = async () => {
//     console.log("\n--- Пиццы ---");
//     pizzas.forEach(p => console.log(`[${p.id}] ${p.name} | Основа: ${p.base.name} | Состав: ${p.ingredients.map(i => i.name).join(', ')} | Итог: ${p.totalPrice} руб.`));

//     const action = await ask("\n1. Создать новую | 2. Удалить | 0. Назад: ");

//     if (action === '1') {
//         if (bases.length === 0) {
//             console.log("Ошибка: Сначала создайте хотя бы одну основу!");
//             return;
//         }

//         const name = await ask("Название пиццы: ");
        
//         console.log("Доступные основы:");
//         bases.forEach((b, i) => console.log(`${i}. ${b.name}`));
//         const baseIdx = parseInt(await ask("Выберите номер основы: "));
//         const selectedBase = bases[baseIdx];

//         const selectedIngredients: IIngredient[] = [];
//         let adding = true;
//         while (adding) {
//             console.log("Доступные ингредиенты:");
//             ingredients.forEach((ing, i) => console.log(`${i}. ${ing.name}`));
//             const ingIdx = await ask("Выберите номер ингредиента (или 'q' для завершения): ");
//             if (ingIdx === 'q') adding = false;
//             else if (ingredients[+ingIdx]) selectedIngredients.push(ingredients[+ingIdx]);
//         }

//         const totalPrice = selectedBase.price + selectedIngredients.reduce((sum, i) => sum + i.price, 0);

//         pizzas.push({
//             id: generateId(),
//             name,
//             base: selectedBase,
//             ingredients: selectedIngredients,
//             totalPrice
//         });
//     } else if (action === '2') {
//         const id = await ask("Введите ID для удаления: ");
//         pizzas = pizzas.filter(p => p.id !== id);
//     }
// };

// // --- Главный цикл ---

// async function mainMenu() {
//     while (true) {
//         console.log("\n=== PIZZA SYSTEM ===");
//         console.log("1. Ингредиенты\n2. Основы\n3. Пиццы\n0. Выход");
//         const choice = await ask("Выберите пункт: ");

//         switch (choice) {
//             case '1': await manageIngredients(); break;
//             case '2': await manageBases(); break;
//             case '3': await managePizzas(); break;
//             case '0': rl.close(); return;
//         }
//     }
// }

// mainMenu();