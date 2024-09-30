import { NewRecipe, Recipe } from "@/datatypes";
import { RecipeCreate } from "@/routes/recipeCreate";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedRecipesCreate = vi.fn((recipe: Recipe) => { return { data: recipe, redirect: `/recipes/${recipe.id}` } });
const mockedNavigate = vi.fn();

vi.mock("@/services/recipes", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/recipes")>();

    class RecipeService {
        async create(recipe: NewRecipe) {
            const newRecipe = {
                ...recipe, ingredients: recipe.ingredients.map((e) => {
                    return {
                        amount: e.amount,
                        item: { name: "test", id: e.item.id }
                    }
                }),
                id: 1
            }

            return mockedRecipesCreate(newRecipe);
        }
    }

    return {
        ...original,
        default: new RecipeService()
    }
});

vi.mock("@/services/items", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/items")>();

    class ItemService {
        async getAll() {
            return {
                data: [
                    { id: 1, name: "Egg" },
                    { id: 2, name: "Chicken" },
                    { id: 3, name: "Tomatoes" },
                    { id: 4, name: "Milk" }
                ]
            }
        }
    }

    return {
        ...original,
        default: new ItemService()
    }
});

describe("Create recipe page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to create a recipe", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><RecipeCreate /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("Title"), "Title");
        await user.type(await screen.findByPlaceholderText("Description"), "Description");
        await user.type(await screen.findByPlaceholderText("Time in minutes"), "60");
        await user.type(await screen.findByPlaceholderText("Steps to make the recipe"), "1. Make it 2. Bake it 3. Eat it");
        await user.type(await screen.findByPlaceholderText("Image URL"), "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhy3WJ3J94R8yS4D-pVzxI7rJ4y_DRYhFoA_i6tmY_Q&s");

        await user.click(await screen.findByText("Add a new item..."));

        const input = (await screen.findByPlaceholderText("Search items..."));
        await user.type(input, "Chicken");
        await user.type(input, "{enter}");

        await user.type(await screen.findByPlaceholderText("Amount"), "1");
        await userEvent.click(await screen.findByRole("button", { name: "Add" }));

        await userEvent.click(await screen.findByRole("button", { name: "Create" }));

        expect(mockedNavigate).toHaveBeenCalledWith("/recipes/1");
    });

    it("Should be possible to cancel creation", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><RecipeCreate /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("Title"), "Title");
        await user.type(await screen.findByPlaceholderText("Description"), "Description");
        await user.type(await screen.findByPlaceholderText("Time in minutes"), "60");
        await user.type(await screen.findByPlaceholderText("Steps to make the recipe"), "1. Make it 2. Bake it 3. Eat it");
        await user.type(await screen.findByPlaceholderText("Image URL"), "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhy3WJ3J94R8yS4D-pVzxI7rJ4y_DRYhFoA_i6tmY_Q&s");

        await user.click(await screen.findByText("Add a new item..."));

        const input = (await screen.findByPlaceholderText("Search items..."));
        await user.type(input, "Chicken");
        await user.type(input, "{enter}");

        await user.type(await screen.findByPlaceholderText("Amount"), "1");
        await userEvent.click(await screen.findByRole("button", { name: "Add" }));

        await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

        expect(mockedNavigate).toHaveBeenCalledWith("/recipes");
        expect(mockedRecipesCreate).not.toHaveBeenCalled();
    });
});