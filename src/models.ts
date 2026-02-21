import * as readline from 'readline';

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
