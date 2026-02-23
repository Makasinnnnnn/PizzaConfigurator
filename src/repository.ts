import {IEntity} from './models';

export class Repository<ZOV extends IEntity>{
    private items: ZOV[]=[]; 
    create(item: ZOV): void {
        this.items.push(item);
    }
    
    getAll():ZOV[]{return this.items;}

    getById(id: string): ZOV|undefined{
        return this.items.find(item=>item.id===id);}

    delete(id: string): void{this.items=this.items.filter(item=>item.id!==id);}
    update(id: string, updates: Partial<ZOV>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index!==-1){
            this.items[index]={...this.items[index],...updates};
        }
    }
}