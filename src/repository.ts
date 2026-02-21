import { IEntity } from './models';

export class Repository<T extends IEntity>{
    private items: T[]=[]; 
    create(item: T): void {
        this.items.push(item);
    }
    
    getAll():T[]{return this.items;}

    getById(id: string): T|undefined{
        return this.items.find(item=>item.id===id);}

    //оставляем все кроме элемента выбранного
    delete(id: string): void{this.items=this.items.filter(item=>item.id!==id);}
    update(id: string, updates: Partial<T>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1){
            this.items[index] = { ...this.items[index], ...updates};//апдейтим старый элем новыми данными
        }
    }
}