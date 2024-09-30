import { HouseholdMember } from "@/datatypes";
import axios from "axios";

class HouseholdService {
    // Join a household
    async join(joinCode: string): Promise<{ message: string }> {
        return axios.post<{ message: string }>("/api/v1/households/join", { joinCode })
            .then((response) => {
                return response.data;
            })
            .catch((error) => { throw error });
    }

    // Leave a household
    async leave(): Promise<{ message: string }> {
        return axios.post<{ message: string }>("/api/v1/households/leave")
            .then((reponse) => {
                return reponse.data;
            })
            .catch((error) => { throw error });
    }

    // Get all members in the logged on user's household
    async members(): Promise<HouseholdMember[]> {
        return axios.get<{ data: HouseholdMember[] }>("/api/v1/households/members")
            .then((response) => response.data.data)
            .catch((error) => { throw error });
    }

    // Edit the name of a household
    async edit(name: string): Promise<{ message: string }> {
        return axios.put<{ message: string }>("/api/v1/households/edit", { name })
            .then((response) => {
                return response.data;
            })
            .catch((error) => { throw error });
    }
}

const householdService = new HouseholdService();
export default householdService;