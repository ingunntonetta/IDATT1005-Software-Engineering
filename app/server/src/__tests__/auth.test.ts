import { Prisma } from "@prisma/client";
import request from "supertest";
import { describe, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";

vi.mock("../services/prisma");

describe("/auth/login endpoint", () => {
    it("Should be possible to login with correct username and password", () => {
        const user = {
            id: "edf5d799-2ad0-48a4-b1f8-2b1334aedff4",
            // Password is "Passw0rd!"
            passwordHash: "49fa9769ed6d353199841ebc6e4847ecd0eec573535d7fdc8a0c90dcf36fff59",
            salt: "b5f211505eb2888d3e44e2d38c3472fa"
        }

        // @ts-ignore | Mock the authentication database call
        prismaMock.user.findFirstOrThrow.mockResolvedValue(user);

        return request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testuser", password: "Passw0rd!" })
            .expect(302)
            .expect("set-cookie", /jwt=/)
            .expect("Location", "/fridge");
    });

    it("Should not be possible to login with incorrect password", () => {
        const user = {
            id: "edf5d799-2ad0-48a4-b1f8-2b1334aedff4",
            // Password is "Passw0rd!"
            passwordHash: "49fa9769ed6d353199841ebc6e4847ecd0eec573535d7fdc8a0c90dcf36fff59",
            salt: "b5f211505eb2888d3e44e2d38c3472fa"
        }

        // @ts-ignore | Mock the authentication database call
        prismaMock.user.findFirstOrThrow.mockResolvedValue(user);

        return request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testuser", password: "Passw0rd!!" })
            .expect(401);
    });
});

describe("/auth/register endpoint", () => {
    it("Should be possible to register with valid information", () => {
        // @ts-ignore
        prismaMock.user.create.mockResolvedValue({ id: "edf5d799-2ad0-48a4-b1f8-2b1334aedff4" });

        return request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "testuser",
                email: "test@example.com",
                firstName: "First",
                lastName: "Last",
                password: "Passw0rd!"
            })
            .expect(302)
            .expect("set-cookie", /jwt=/)
            .expect("Location", "/fridge");
    });

    it("Should not be possible to register with invalid information", () => {
        // @ts-ignore
        prismaMock.user.create.mockResolvedValue({ id: "edf5d799-2ad0-48a4-b1f8-2b1334aedff4" });

        return request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "testuser",
                email: "example.com",
                firstName: "First",
                lastName: "Last",
                password: "Passw0rd!"
            })
            .expect(400)
            .expect({ message: "Email is not valid" });
    });

    it("Should not be possible to register with an in-use username", () => {
        // @ts-ignore
        prismaMock.user.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Message", { code: "P2002", meta: { target: ["username"] } }));

        return request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "testuser",
                email: "test@example.com",
                firstName: "First",
                lastName: "Last",
                password: "Passw0rd!"
            })
            .expect(400)
            .expect({ message: "Username already exists." });
    });
});