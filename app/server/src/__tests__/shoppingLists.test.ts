import { Prisma } from "@prisma/client";
import request from "supertest";
import { describe, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("/lists/create endpoint", () => {
    it("Should be possible to create a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.create.mockResolvedValue({ id: 1 });

        return request(app)
            .post("/api/v1/lists/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                name: "Test list",
                description: "Test description",
                items: [1, 2, 3]
            })
            .expect(201)
            .expect("Content-Type", /json/)
            .expect({ data: { id: 1 }, redirect: "/shopping-lists/1" });
    });

    it("Should fail with invalid data", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.create.mockResolvedValue({ id: 1 });

        return request(app)
            .post("/api/v1/lists/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                name: "Test list",
                description: "a".repeat(256),
                items: [1, 2, 3]
            })
            .expect(400)
            .expect("Content-Type", /json/)
            .expect({ error: "Description too long" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.create.mockRejectedValue(new Error("Test error"));

        return request(app)
            .post("/api/v1/lists/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                name: "Test list",
                description: "Test description",
                items: [1, 2, 3]
            })
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("/lists/:id endpoint", () => {
    it("Should be possible to fetch a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.findUniqueOrThrow.mockResolvedValue({ id: 1 });

        return request(app)
            .get("/api/v1/lists/1")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({ data: { id: 1 } });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.findUniqueOrThrow.mockRejectedValue(new Error("Test error"));

        return request(app)
            .get("/api/v1/lists/1")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("/lists endpoint", () => {
    it("Should be possible to fetch all shopping lists", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        return request(app)
            .get("/api/v1/lists")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect({ data: [{ id: 1 }, { id: 2 }] });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.findMany.mockRejectedValue(new Error("Test error"));

        return request(app)
            .get("/api/v1/lists")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("DELETE /lists/:id/ endpoint", () => {
    it("Should be possible to delete a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.delete.mockResolvedValue({ id: 1 });

        return request(app)
            .delete("/api/v1/lists/1")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ data: { id: 1 }, redirect: "/shopping-lists" })
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.delete.mockRejectedValue(new Error("Test error"));

        return request(app)
            .delete("/api/v1/lists/1")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("/lists:id/add endpoint", () => {
    it("Should be possible to add an item to a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.update.mockResolvedValue({ id: 1 });

        return request(app)
            .post("/api/v1/lists/1/add")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(200)
            .expect({ data: { id: 1 } });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingList.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Message", { code: "P2025" }));

        return request(app)
            .post("/api/v1/lists/1/add")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(404)
            .expect({ error: "The item does not exist" });
    });
});

describe("/lists/:id/remove endpoint", () => {
    it("Should be possible to remove an item from a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingListItem.delete.mockResolvedValue({ id: 1 });

        return request(app)
            .delete("/api/v1/lists/1/remove")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(200)
            .expect({ data: { id: 1 }, redirect: "/shopping-lists" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingListItem.delete.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Message", { code: "P2025" }));

        return request(app)
            .delete("/api/v1/lists/1/remove")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(404)
            .expect({ error: "Shopping list item not found" });
    });
});

describe("/list/:id/update endpoint", () => {
    it("Should be possible to update a shopping list", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingListItem.findUniqueOrThrow.mockResolvedValue({ purchased: false });

        const updatedItem = { purchased: true, shoppingListId: 1, itemId: 1 }
        prismaMock.shoppingListItem.update.mockResolvedValue(updatedItem);

        return request(app)
            .put("/api/v1/lists/1/update")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(200)
            .expect({ data: updatedItem });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.shoppingListItem.findUniqueOrThrow.mockRejectedValue(new Error("Test error"));

        return request(app)
            .put("/api/v1/lists/1/update")
            .set("Cookie", testUtils.validCookie)
            .send({ itemId: 1 })
            .expect(500)
            .expect({ error: "Test error" });
    });
});