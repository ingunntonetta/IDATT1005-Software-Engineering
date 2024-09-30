import { ShoppingList, ShoppingListItem, shoppingListReturnItem } from "@/datatypes";
import axios from "axios";

class ShoppingListService {
    // Gget all shopping lists for the user/household
    async getAll(): Promise<{ data: ShoppingList[] }> {
        return axios.get<{ data: ShoppingList[] }>("/api/v1/lists/")
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Get a specific shopping list by id
    async get(id: number): Promise<{ data: ShoppingList }> {
        return axios
            .get(`/api/v1/lists/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Remove an item from a shopping list
    async removeItem(shoppingListId: number, itemId: number): Promise<{ data: shoppingListReturnItem }> {
        return axios.delete<{ data: shoppingListReturnItem }>(`/api/v1/lists/${shoppingListId}/remove`, { data: { itemId: itemId } })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Mark an item as purchased
    async purchase(shoppingListId: number, itemId: number): Promise<{ data: ShoppingListItem }> {
        return axios.put<{ data: ShoppingListItem }>(`/api/v1/lists/${shoppingListId}/update`, { itemId: itemId })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Archive a shopping list
    async archive(shoppingListId: number): Promise<{ data: ShoppingList, redirect: string }> {
        return axios.put<{ data: ShoppingList, redirect: string }>(`/api/v1/lists/${shoppingListId}/archive`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Add item to the list
    async add(listId: number, itemId: number): Promise<{ data: ShoppingListItem }> {
        return axios.post<{ data: ShoppingListItem }>(`/api/v1/lists/${listId}/add`, { itemId: itemId })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Create a shopping list
    async create(name: string, items: ShoppingListItem[], description: string): Promise<{ data: ShoppingList, redirect: string }> {
        return axios.post<{ data: ShoppingList, redirect: string }>(`/api/v1/lists/create`, {
            name: name,
            items: items,
            description: description,
        })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Delete a shopping list
    async delete(id: number): Promise<{ data: ShoppingList, redirect: string }> {
        return axios.delete<{ data: ShoppingList, redirect: string }>(`/api/v1/lists/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

}

const shoppingListService = new ShoppingListService();
export default shoppingListService;
