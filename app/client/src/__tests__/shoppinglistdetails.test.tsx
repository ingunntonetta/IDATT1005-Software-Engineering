import { ShoppingListDetail } from "@/routes/shoppingListDetails";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedNavigate = vi.fn();
const mockedUseParams = { id: "1" };
const mockedShoppinglistArchive = vi.fn((id: number) => { id; return { data: { archived: true }, redirect: "/shopping-lists" } });
const mockedShoppinglistDelete = vi.fn((id: number) => { id; return { redirect: "/shopping-lists" } });

vi.mock("@/services/shoppingLists", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/shoppingLists")>();

    class ShoppingListService {
        async get(id: number) {
            return {
                data: {
                    id,
                    updatedAt: "2024-04-23T12:46:52.549Z",
                    name: "Kiwi",
                    description: "Shopping trip to Kiwi",
                    archived: false,
                    householdId: "607c5be6-d4cf-4bb3-8642-96db6252a1fb",
                    items: [
                        {
                            purchased: false,
                            item: {
                                id: 12,
                                name: "Corn"
                            }
                        },
                        {
                            purchased: true,
                            item: {
                                id: 13,
                                name: "Ground beef"
                            }
                        }
                    ]
                }
            }
        }

        async archive(id: number) {
            return mockedShoppinglistArchive(id);
        }

        async delete(id: number) {
            return mockedShoppinglistDelete(id);
        }
    }


    return {
        ...original,
        default: new ShoppingListService()
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
                    { id: 4, name: "Milk" },
                    { id: 12, name: "Corn" },
                    { id: 13, name: "Ground beef" }
                ]
            }
        }
    }

    return {
        ...original,
        default: new ItemService()
    }
});

describe("Shoppinglist details page render", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useParams").mockImplementation(() => mockedUseParams)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should render the correct shopping list with all items", async () => {
        render(<BrowserRouter><ShoppingListDetail /></BrowserRouter>);

        expect(await screen.findByText("Kiwi")).toBeInTheDocument();
        expect(await screen.findByText("Shopping trip to Kiwi")).toBeInTheDocument();
        expect(await screen.findByText("Corn")).toBeInTheDocument();
        expect(await screen.findByText("Ground beef")).toBeInTheDocument();
    });
});

describe("Shoppinglist details page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useParams").mockImplementation(() => mockedUseParams)
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to archive the list", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><ShoppingListDetail /></BrowserRouter>);

        await user.click(await screen.findByText("Archive"));
        await user.click(await screen.findByText("Yes"));

        expect(mockedShoppinglistArchive).toHaveBeenCalledWith(1);
    });

    it("Should be possible to delete the list", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><ShoppingListDetail /></BrowserRouter>);

        await user.click(await screen.findByText("Delete"));
        await user.click(await screen.findByText("Yes"));

        expect(mockedShoppinglistDelete).toHaveBeenCalledWith(1);
        expect(mockedNavigate).toHaveBeenCalledWith("/shopping-lists");
    });

});