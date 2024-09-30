import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("/users/me endpoint", () => {
    it("Should return info about the current user", () => {
        const user = {
            "id": "edf5d799-2ad0-48a4-b1f8-2b1334aedff4",
            "username": "testuser",
            "email": "test@example.com",
            "firstName": "First",
            "lastName": "Last",
            "avatarUrl": "https://avatar.iran.liara.run/username?username=t+t",
            "household": {
                "id": "607c5be6-d4cf-4bb3-8642-96db6252a1fb",
                "createdAt": "2024-04-05T13:44:23.873Z",
                "name": "Household",
                "joinCode": "WUD9381H"
            },
        }

        // @ts-ignore | Mock the authentication database call
        prismaMock.user.findFirstOrThrow.mockResolvedValue(user);

        return request(app)
            .get("/api/v1/users/me")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => {
                expect(res.body).toEqual(user);
            });
    });

    it("Should return 401 if the user is not authenticated", () => {
        return request(app)
            .get("/api/v1/users/me")
            .expect(401);
    });
});