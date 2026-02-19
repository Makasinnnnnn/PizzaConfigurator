import { v4 as uuidv4 } from 'uuid';

// 1. Простейший интерфейс (для проверки типизации)
interface ICheck {
    id: string;
    message: string;
    status: number;
}

// 2. Функция, которая вернет объект
function testSystem(): ICheck {
    return {
        id: uuidv4(), // Проверка работы библиотеки UUID
        message: "Система TypeScript успешно запущена!",
        status: 200
    };
}

// 3. Вывод в консоль
console.log("========================================");
const result = testSystem();
console.log(result.message);
console.log(`Твой уникальный ID: ${result.id}`);
console.log(`Статус проверки: ${result.status} OK`);
console.log("========================================");