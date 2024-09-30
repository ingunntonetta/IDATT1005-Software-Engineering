import { ShoppingListItem } from "@/datatypes";
import { ShoppingLists } from "@/routes/shoppingLists";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedNavigate = vi.fn();
const mockedShoppingListCreate = vi.fn(
    (name: string, items: ShoppingListItem[], description: string) => {
        name; items; description; return { redirect: "/shopping-lists/1" }
    });

vi.mock("@/services/shoppingLists", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/shoppingLists")>();

    class getShoppingLists {
        async getAll() {
            return {
                data: [
                    {
                        "id": 1,
                        "updatedAt": "2024-04-10T10:36:59.915Z",
                        "name": "REMA 1000",
                        "description": "List for my next trip to rema",
                        "archived": true,
                        "householdId": "607c5be6-d4cf-4bb3-8642-96db6252a1fb"
                    },
                    {
                        "id": 2,
                        "updatedAt": "2024-04-10T11:00:51.873Z",
                        "name": "Coop",
                        "description": null,
                        "archived": false,
                        "householdId": "607c5be6-d4cf-4bb3-8642-96db6252a1fb"
                    }]
            }
        }

        async create(name: string, items: ShoppingListItem[], description: string) {
            return mockedShoppingListCreate(name, items, description);
        }
    }

    return {
        ...original,
        default: new getShoppingLists()
    }
});

describe("Shopping page render", async () => {
    it("Should only render unarchived shopping lists", async () => {
        render(<BrowserRouter><ShoppingLists /></BrowserRouter>);

        expect(await screen.findByText("Coop")).toBeInTheDocument();
        expect(screen.queryByText("REMA 1000")).toBeNull();
    });
});

describe("Shopping page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to view archived lists", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><ShoppingLists /></BrowserRouter>);

        expect(await screen.findByText("Active")).toBeInTheDocument();
        expect(await screen.findByText("Coop")).toBeInTheDocument();
        expect(screen.queryByText("REMA 1000")).toBeNull();

        await user.click(await screen.findByRole("switch"));

        expect(await screen.findByText("Archived")).toBeInTheDocument();
        expect(await screen.findByText("REMA 1000")).toBeInTheDocument();
        expect(await screen.findByText("List for my next trip to rema")).toBeInTheDocument();
        expect(screen.queryByText("Coop")).toBeNull();
    });

    it("Should be possible to create new shopping lists", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><ShoppingLists /></BrowserRouter>);

        await user.click(await screen.findByRole("button", { name: "" }));

        await user.type(await screen.findByPlaceholderText("Title"), "Title");
        await user.click(await screen.findByText("Next"));

        await user.type(await screen.findByPlaceholderText("Description"), "Description");
        await user.click(await screen.findByText("Create"));

        expect(mockedShoppingListCreate).toHaveBeenCalledWith("Title", [], "Description");
        expect(mockedNavigate).toHaveBeenCalledWith("/shopping-lists/1");
    });
});