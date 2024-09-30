import { Item } from "@/datatypes";
import axios from "axios";

class ItemService {
    // Get all the items
    async getAll(): Promise<{ data: Item[] }> {
        return axios.get<{ data: Item[] }>("/api/v1/items/")
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    }

    // Create a new item
    async create(name: string): Promise<{ data: Item }> {
        return axios.post<{ data: Item }>("/api/v1/items/", { name })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            });
    }
}

const itemService = new ItemService();
export default itemService;