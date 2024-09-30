import { LoginUser, NewUser, User } from "@/datatypes";
import axios from "axios";

class UserService {

    // Gets the user data
    async getMe(): Promise<User> {
        return axios.get<User>("/api/v1/users/me")
            .then((response) => response.data)
            .catch((error) => { throw error });
    }

    // Logs in the user
    async login(user: LoginUser) {
        return axios.post<JSON>("/api/v1/auth/login", user)
            .then((response) => { response })
            .catch((error) => { throw error })
    }

    // Registers a new user
    async register(user: NewUser) {
        return axios.post<void>("/api/v1/auth/register", { ...user })
            .then((response) => response)
            .catch((error) => { throw error.response })
    }
}

const userService = new UserService();
export default userService;