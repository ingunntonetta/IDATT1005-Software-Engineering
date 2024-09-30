import jwt from "jsonwebtoken";
import prismaMock from "../services/__mocks__/prisma";
import utils from "../services/utils";

class TestUtils {
    authenticate(): void {
        // Mock the authentication database call
        prismaMock.user.findFirstOrThrow.mockResolvedValue({
            "id": "edf5d799-2ad0-48a4-b1f8-2b1334aedff4",
            "username": "testuser",
            "email": "test@example.com",
            "firstName": "First",
            "lastName": "Last",
            "avatarUrl": "https://avatar.iran.liara.run/username?username=t+t",
            // @ts-ignore
            "houseHold": {
                "id": "607c5be6-d4cf-4bb3-8642-96db6252a1fb",
                "createdAt": "2024-04-05T13:44:23.873Z",
                "name": "Household",
                "joinCode": "WUD9381H"
            },
        });
    };

    validCookie = "jwt=" + jwt.sign({ id: "edf5d799-2ad0-48a4-b1f8-2b1334aedff4" }, utils.jwtSecret, { expiresIn: "1d" })
}

const testUtils = new TestUtils();
export default testUtils;