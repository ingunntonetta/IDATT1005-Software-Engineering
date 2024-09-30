import { Fridge } from "@/routes/fridge";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockedFridgeAdd = vi.fn();
const mockedFridgeRemove = vi.fn();
const mockedItemCreate = vi.fn((name: string) => { return { data: { id: 5, name } } });

vi.mock("@/services/fridge", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/fridge")>();

    class FridgeService {
        async items() {
            return [
                { id: 1, name: "Egg" },
                { id: 4, name: "Milk" }
            ]
        }

        async add(items: number[]) {
            mockedFridgeAdd(items);
        }

        async remove(items: number[]) {
            mockedFridgeRemove(items);
        }
    }

    return {
        ...original,
        default: new FridgeService()
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

        async create(name: string) {
            return mockedItemCreate(name);
        }
    }

    return {
        ...original,
        default: new ItemService()
    }
});

describe("Fridge page render", async () => {
    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should show the fridge items correctly", async () => {
        render(<Fridge />);

        expect(await screen.findByText("Egg")).toBeInTheDocument();
        expect(await screen.findByText("Milk")).toBeInTheDocument();
    });
});

class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe("Fridge page interaction", async () => {
    window.ResizeObserver = ResizeObserver;

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to add existing item to fridge", async () => {
        const user = userEvent.setup();
        render(<Fridge />);

        await user.click(await screen.findByText("Add a new item..."));

        const input = (await screen.findByPlaceholderText("Search items..."));

        await user.type(input, "Chicken");
        await user.type(input, "{enter}");

        await user.click(await screen.findByText("Add"));

        expect(await screen.findByText("Chicken")).toBeInTheDocument();
        expect(mockedFridgeAdd).toHaveBeenCalledWith([2]);
    });

    it("Should be possible to remove items from fridge", async () => {
        const user = userEvent.setup();
        render(<Fridge />);

        const removecCheckboxes = await screen.findAllByRole("checkbox");

        await user.click(removecCheckboxes[0]);
        await user.click(removecCheckboxes[1]);

        await user.click(await screen.findByText("Remove"));

        expect(mockedFridgeRemove).toHaveBeenCalledWith([1, 4]);
    });

    it("Should be possible to create a non-existing item and add to fridge", async () => {
        const user = userEvent.setup();
        render(<Fridge />);

        await user.click(await screen.findByText("Add a new item..."));

        const input = (await screen.findByPlaceholderText("Search items..."));
        await user.type(input, "Asparagus");

        await user.click(await screen.findByText("Create new item"));
        await user.click(await screen.findByText("Create"));

        expect(await screen.findByText("Asparagus")).toBeInTheDocument();
        expect(mockedItemCreate).toHaveBeenCalledWith("Asparagus");
    });
});