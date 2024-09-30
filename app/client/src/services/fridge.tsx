import { Item } from "@/datatypes";
import axios from "axios";

class FridgeService {
    // Get all items in the fridge
    async items(): Promise<Item[]> {
        return axios.get<{ data: Item[] }>("/api/v1/fridge/items")
            .then((response) => response.data.data)
            .catch((error) => { throw error });
    }

    // Add item(s) to the fridge
    async add(items: number[]): Promise<{ message: string }> {
        return axios.post<{ message: string }>("/api/v1/fridge/items", { items })
            .then((response) => {
                return response.data;
            })
            .catch((error) => { throw error });
    }

    // Remove item(s) from the fridge
    async remove(items: number[]): Promise<{ message: string }> {
        return axios.delete<{ message: string }>("/api/v1/fridge/items", { data: { items } })
            .then((response) => {
                return response.data;
            })
            .catch((error) => { throw error });
    }
}

const fridgeService = new FridgeService();
export default fridgeService;