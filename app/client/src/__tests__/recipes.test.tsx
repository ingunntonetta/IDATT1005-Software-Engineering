import { Recipes } from "@/routes/recipes";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("@/services/recipes", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/recipes")>();

    class RecipeService {
        async getAll() {
            return {
                data: [
                    {
                        id: 1,
                        title: "Recipe 1",
                        difficulty: 1,
                        time: 35,
                        cost: 1,
                        createdById: "b8c2e023-0adf-4401-921c-22dbcc7c44f8",
                        imageUrl: "",
                        description: "A good recipe"
                    },
                    {
                        id: 2,
                        title: "Recipe 2",
                        difficulty: 3,
                        time: 130,
                        cost: 2,
                        createdById: "98e444fa-a4a1-4580-bde4-fc534f1458b4",
                        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhy3WJ3J94R8yS4D-pVzxI7rJ4y_DRYhFoA_i6tmY_Q&s",
                        description: "A complicated and really amazing recipe"
                    }
                ]
            }
        }
    }

    return {
        ...original,
        default: new RecipeService()
    }
});
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe("Recipes page render", async () => {
    window.ResizeObserver = ResizeObserver;

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should show all recipes", async () => {
        render(<BrowserRouter><Recipes /></BrowserRouter>);

        expect(await screen.findByText("Recipe 1")).toBeInTheDocument();
        expect(await screen.findByText("Recipe 2")).toBeInTheDocument();
    });
});

describe("Recipes page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to click a recipe and be navigated to the expected recipe", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Recipes /></BrowserRouter>);

        await user.click(await screen.findByText("Recipe 1"));

        expect(mockedNavigate).toHaveBeenCalledWith("/recipes/1");
    });
});
