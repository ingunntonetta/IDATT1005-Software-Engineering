import { NewRecipe, Recipe, RecipeShortInfo, ShoppingList } from "@/datatypes";
import axios from "axios";

class RecipeService {
    // Gets all the recipes in the database
    async getAll(): Promise<{ data: RecipeShortInfo[] }> {
        return axios.get<{ data: RecipeShortInfo[] }>("/api/v1/recipes/")
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                throw error
            });
    }

    // Gets a recipe by id
    async get(id: string): Promise<{ data: Recipe }> {
        return axios.get<{ data: Recipe }>(`/api/v1/recipes/${id}`)
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                throw error
            });
    }

    // Creates a shopping list from a recipe
    async createShoppingList(id: number): Promise<{ data: ShoppingList }> {
        return axios.post<{ data: ShoppingList }>(`/api/v1/recipes/${id}/createlist`)
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                throw error
            })
    }

    // Creates a recipe
    async create(recipe: NewRecipe): Promise<{ data: Recipe, redirect: string }> {
        // creates a new reciepe object with the correct format
        const newRecipe = {
            ...recipe, ingredients: recipe.ingredients.map((e) => {
                return {
                    amount: e.amount,
                    itemId: e.item.id
                }
            })
        }

        // sends the new recipe to the server
        return axios.post<{ data: Recipe, redirect: string }>(`/api/v1/recipes/create`, newRecipe)
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                throw error
            });
    }

    // Edits a recipe
    async edit(id: number, recipe: Recipe): Promise<{ data: Recipe, redirect: string }> {
        return axios.put<{ data: Recipe, redirect: string }>(`/api/v1/recipes/${id}/edit`, recipe)
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                throw error
            });
    }

    // Delete a recipe
    async delete(id: number): Promise<{ data: Recipe, redirect: string }> {
        return axios.delete<{ data: Recipe, redirect: string }>(`/api/v1/recipes/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error
            });
    }
}

const recipeService = new RecipeService();
export default recipeService;