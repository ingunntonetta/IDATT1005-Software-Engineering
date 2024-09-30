import { RecipeDetails } from "@/routes/recipeDetails";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedNavigate = vi.fn();
const mockedUseParams = { id: "1" };
const mockedRecipeCreateList = vi.fn((id) => { id; return { data: { id: 10 } } });
const mockedFridgeRemove = vi.fn();

vi.mock("@/services/user", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/user")>();

    class UserService {
        async getMe() {
            return {
                username: "testuser",
                avatarUrl: "https://avatar.iran.liara.run/username?username=t+t"
            }
        }
    }

    return {
        ...original,
        default: new UserService()
    }
});

vi.mock("@/services/recipes", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/recipes")>();

    class RecipeService {
        async get(id: string) {
            return {
                data: {
                    id,
                    title: "Recipe 1",
                    difficulty: 1,
                    time: 30,
                    cost: 1,
                    createdById: "b8c2e023-0adf-4401-921c-22dbcc7c44f8",
                    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhy3WJ3J94R8yS4D-pVzxI7rJ4y_DRYhFoA_i6tmY_Q&s",
                    description: "A good recipe",
                    recipeText: "1. Make it",
                    ingredients: [
                        {
                            amount: "1 fillet",
                            item: {
                                id: 1,
                                name: "Chicken"
                            }
                        },
                        {
                            amount: "2",
                            item: {
                                id: 4,
                                name: "Egg"
                            }
                        }
                    ]
                }
            }
        }

        async createShoppingList(id: string) {
            return mockedRecipeCreateList(id);
        }
    }

    return {
        ...original,
        default: new RecipeService()
    }
});


vi.mock("@/services/fridge", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/fridge")>();

    class FridgeService {
        async remove(items: number[]) {
            mockedFridgeRemove(items);
        }
    }

    return {
        ...original,
        default: new FridgeService()
    }
});

describe("Recipe details page render", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useParams").mockImplementation(() => mockedUseParams)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should show the recipe correctly", async () => {
        render(<BrowserRouter><RecipeDetails /></BrowserRouter>);

        expect(await screen.findByText("Recipe 1")).toBeInTheDocument();
        expect(await screen.findByText("A good recipe")).toBeInTheDocument();

        expect(screen.getByRole("img")).toHaveAttribute("src", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhy3WJ3J94R8yS4D-pVzxI7rJ4y_DRYhFoA_i6tmY_Q&s");
    });
});

describe("Recipe details page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
        vi.spyOn(router, "useParams").mockImplementation(() => mockedUseParams)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to create a shopping list from a recipe", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><RecipeDetails /></BrowserRouter>);

        await user.click(screen.getByText("Create a shopping list"));
        await user.click(screen.getByText("Create"));

        expect(mockedRecipeCreateList).toHaveBeenCalledWith("1");
        expect(mockedNavigate).toHaveBeenCalledWith("/shopping-lists/10");
    });

    it("Should be possible to delete items after making a recipe", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><RecipeDetails /></BrowserRouter>);

        await user.click(screen.getByText("Remove ingredients from fridge"));
        await user.click(screen.getByText("Confirm"));

        expect(mockedFridgeRemove).toHaveBeenCalledWith([1, 4]);
        expect(mockedNavigate).toHaveBeenCalledWith("/fridge");
    });
});
