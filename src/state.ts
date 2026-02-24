import{IIngredient, IPizzaBase, IPizza, IPizzaBortik, IOrder}from './models';
import{Repository}from './repository';

export const ingredientRepo=new Repository<IIngredient>();
export const baseRepo=new Repository<IPizzaBase>();
export const pizzaRepo=new Repository<IPizza>();
export const bortikRepo=new Repository<IPizzaBortik>();
export const orderRepo=new Repository<IOrder>();