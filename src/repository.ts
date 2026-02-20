import { IEntity } from './models';

export class Repository<T extends IEntity> {
    private items: T[] = []; // Наше "хранилище" — обычный массив

    // Добавление
    create(item: T): void {
        this.items.push(item);
    }

    // Чтение всех
    getAll(): T[] {
        return this.items;
    }

    // Поиск одного по ID (понадобится для редактирования)
    getById(id: string): T | undefined {
        return this.items.find(item => item.id === id);
    }

    // Удаление: фильтруем массив, оставляя всё, кроме объекта с этим ID
    delete(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    // Редактирование: Partial<T> означает, что мы можем прислать только ЧАСТЬ полей (например, только новую цену)
    update(id: string, updates: Partial<T>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            // Магия: берем старый объект и "накладываем" на него обновления
            this.items[index] = { ...this.items[index], ...updates };
        }
    }
}