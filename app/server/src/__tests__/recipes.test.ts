import request from "supertest";
import { describe, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("/recipes/create endpoint", () => {
    it("Should be possible to create a recipe", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.create.mockResolvedValue({ id: 5 });

        return request(app)
            .post("/api/v1/recipes/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 2,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(201)
            .expect({ data: { id: 5 }, redirect: "/recipes/5" });
    });

    it("Should fail with invalid data", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.create.mockResolvedValue({ id: 5 });

        return request(app)
            .post("/api/v1/recipes/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 0,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(400)
            .expect({ error: "Invalid Cost" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.create.mockRejectedValue(new Error("Test error"));

        return request(app)
            .post("/api/v1/recipes/create")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 2,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("GET /recipes/:id endpoint", () => {
    it("Should be possible to get a recipe", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.findUniqueOrThrow.mockResolvedValue(true);

        return request(app)
            .get("/api/v1/recipes/1")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ data: true });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.findUniqueOrThrow.mockRejectedValue(new Error("Test error"));

        return request(app)
            .get("/api/v1/recipes/1")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
})

describe("/recipes/ endpoint", () => {
    it("Should be possible to get all recipes", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.findMany.mockResolvedValue(true);

        return request(app)
            .get("/api/v1/recipes")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ data: true });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.findMany.mockRejectedValue(new Error("Test error"));

        return request(app)
            .get("/api/v1/recipes")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("DELETE /recipes/:id endpoint", () => {
    it("Should be possible to delete a recipe", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.delete.mockResolvedValue(true);

        return request(app)
            .delete("/api/v1/recipes/1")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ data: true, redirect: "/recipes" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.delete.mockRejectedValue(new Error("Test error"));

        return request(app)
            .delete("/api/v1/recipes/1")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("/recipes/:id/createlist endpoint", () => {
    it("Should be possible to create a shopping list from a recipe", () => {
        testUtils.authenticate();

        prismaMock.recipe.findUnique.mockResolvedValue({
            title: "Test Recipe",
            // @ts-ignore
            ingredients: [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }, { itemId: 4 }]
        });

        // @ts-ignore
        prismaMock.fridge.findMany.mockResolvedValue([{ itemId: 1 }, { itemId: 2 }]);

        // @ts-ignore
        prismaMock.shoppingList.create.mockResolvedValue({ id: 1 });

        return request(app)
            .post("/api/v1/recipes/1/createlist")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ data: { id: 1 }, redirect: "/shopping-lists/1" });
    });

    it("Should fail with invalid id", () => {
        testUtils.authenticate();

        prismaMock.recipe.findUnique.mockResolvedValue(null);

        return request(app)
            .post("/api/v1/recipes/1/createlist")
            .set("Cookie", testUtils.validCookie)
            .expect(404)
            .expect({ error: "Recipe not found" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.recipe.findUnique.mockRejectedValue(new Error("Test error"));

        return request(app)
            .post("/api/v1/recipes/1/createlist")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Test error" });
    });
});

describe("/recipes/:id/edit endpoint", () => {
    it("Should be possible to edit a recipe", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.update.mockResolvedValue({ id: 5 });

        return request(app)
            .put("/api/v1/recipes/1/edit")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 2,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(201)
            .expect({ data: { id: 5 }, redirect: "/recipes/5" });
    });

    it("Should fail with invalid data", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.update.mockResolvedValue({ id: 5 });

        return request(app)
            .put("/api/v1/recipes/1/edit")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 0,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(400)
            .expect({ error: "Invalid Cost" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.recipe.update.mockRejectedValue(new Error("Test error"));

        return request(app)
            .put("/api/v1/recipes/1/edit")
            .set("Cookie", testUtils.validCookie)
            .send({
                title: "Test Recipe",
                description: "Test Description",
                difficulty: 1,
                time: "30",
                cost: 2,
                recipeText: "Test Recipe Text",
                ingredients: [{ itemId: 1, amount: "4 tbsps" }, { itemId: 2, amount: "2 grams" }],
            })
            .expect(500)
            .expect({ error: "Test error" });
    });
});