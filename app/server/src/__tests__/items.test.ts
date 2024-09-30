import { Prisma } from "@prisma/client";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("GET /items/ endpoint", () => {
    it("Should return all items", () => {
        testUtils.authenticate();

        const items = [
            { id: 4, name: "Egg" },
            { id: 1, name: "Chicken" },
            { id: 5, name: "Tomatoes" },
            { id: 7, name: "Milk" }
        ];

        prismaMock.item.findMany.mockResolvedValue(items);

        return request(app)
            .get("/api/v1/items")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => {
                expect(res.body.data).toEqual(items);
            });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.item.findMany.mockImplementation(() => { throw new Error("Error message") });

        return request(app)
            .get("/api/v1/items")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Error message" });
    });
});

describe("POST /items/ endpoint", () => {
    it("Should create a new item", () => {
        testUtils.authenticate();

        const item = {
            id: 10,
            name: "Aspargus"
        };

        prismaMock.item.create.mockResolvedValue(item);

        return request(app)
            .post("/api/v1/items")
            .set("Cookie", testUtils.validCookie)
            .send({ name: "Aspargus" })
            .expect(201)
            .expect("Content-Type", /json/)
            .expect((res) => {
                expect(res.body.data).toEqual(item);
            });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.item.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Message", { code: "P2002", meta: { target: ["name"] } }));

        return request(app)
            .post("/api/v1/items")
            .set("Cookie", testUtils.validCookie)
            .send({ name: "Aspargus" })
            .expect(500)
            .expect({ error: "Something went wrong", code: "P2002" });
    });

    it("Should fail with invalid item name", () => {
        testUtils.authenticate();

        return request(app)
            .post("/api/v1/items")
            .set("Cookie", testUtils.validCookie)
            .send({ name: "food!" })
            .expect(400)
            .expect({ error: "Invalid item name" });
    });
});