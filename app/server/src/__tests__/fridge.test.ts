import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("GET /fridge/items/ endpoint", () => {
    it("Should return all items", () => {
        testUtils.authenticate();

        const items = [
            { item: { id: 4, name: "Egg" } },
            { item: { id: 1, name: "Chicken" } },
            { item: { id: 5, name: "Tomatoes" } },
            { item: { id: 7, name: "Milk" } }
        ];

        // @ts-ignore
        prismaMock.fridge.findMany.mockResolvedValue(items);

        return request(app)
            .get("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => {
                expect(res.body.data).toEqual(items.map((item) => item.item));
            });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.fridge.findMany.mockImplementation(() => { throw new Error("Error message") });

        return request(app)
            .get("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Error message" });
    });
});

describe("POST /fridge/items", () => {
    it("Should be possible to add items", () => {
        testUtils.authenticate();

        const items = [1, 2, 3, 4];

        return request(app)
            .post("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(200)
            .expect({ message: "Item added to fridge" });
    });

    it("Should give an error if invalid items", () => {
        testUtils.authenticate();

        const items = [1, 2, 3, "a"];

        return request(app)
            .post("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(400)
            .expect({ error: "Items must be numbers" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.fridge.createMany.mockImplementation(() => { throw new Error("Error message") });

        const items = [1, 2, 3, 4];

        return request(app)
            .post("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(500)
            .expect({ error: "Error message" });
    });
});

describe("DELETE /fridge/items", () => {
    it("Should be possible to delete items", () => {
        testUtils.authenticate();

        const items = [1, 2, 3, 4];

        return request(app)
            .delete("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(200)
            .expect({ message: "Item removed from fridge" });
    });

    it("Should give an error if invalid items", () => {
        testUtils.authenticate();

        const items = [1, 2, 3, "a"];

        return request(app)
            .delete("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(400)
            .expect({ error: "Items must be numbers" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.fridge.deleteMany.mockImplementation(() => { throw new Error("Error message") });

        const items = [1, 2, 3, 4];

        return request(app)
            .delete("/api/v1/fridge/items")
            .set("Cookie", testUtils.validCookie)
            .send({ items })
            .expect(500)
            .expect({ error: "Error message" });
    });
});