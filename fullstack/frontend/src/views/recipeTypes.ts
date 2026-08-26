export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  category?: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export interface NewRecipeForm {
  title: string;
  servings: string;
  image: string;
  ingredients: string;
  instructions: string;
}
