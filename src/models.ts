export interface IEntity{
    id: string;
    name: string;
}

export interface IIngredient extends IEntity{
    price: number;
}

export interface IPizzaBase extends IEntity{
    price: number;
    isClassic: boolean; 
}

export interface IPizza extends IEntity{
    base: IPizzaBase;
    ingredients: IIngredient[];
    totalPrice: number;
    bortik?: IPizzaBortik;
    size: PizzaSize;
}

export interface IPizzaBortik extends IEntity{
    ingredients: IIngredient[];
    price: number;
    allowedPizzaIds: string[]
}

export type PizzaSize = 'small' | 'medium' | 'large';


export interface IOrder extends IEntity{
    items: IPizza[];
    totalPrice: number;
    comment: string;
    createdAt: Date;
    timeWhenNeeded: Date;
}


