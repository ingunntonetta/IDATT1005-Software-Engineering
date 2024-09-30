import { Household } from "@/routes/household";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockedHouseHoldEdit = vi.fn();
const mockedHouseholdJoin = vi.fn();
const mockedHouseholdLeave = vi.fn();

vi.mock("@/services/household", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/household")>();

    class HouseholdService {
        async members() {
            return [
                {
                    firstName: "user",
                    lastName: "one",
                    avatarUrl: "https://avatar.iran.liara.run/username?username=u+o"
                },
                {
                    firstName: "user",
                    lastName: "two",
                    avatarUrl: "https://avatar.iran.liara.run/username?username=u+t"
                },
                {
                    firstName: "user",
                    lastName: "three",
                    avatarUrl: "https://avatar.iran.liara.run/username?username=u+t"
                }
            ]
        }

        async edit(name: string) {
            mockedHouseHoldEdit(name);
        }

        async join(code: string) {
            mockedHouseholdJoin(code);
        }

        async leave() {
            mockedHouseholdLeave();
        }
    }

    return {
        ...original,
        default: new HouseholdService()
    }
});

vi.mock("@/services/user", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/services/user")>();

    class UserService {
        async getMe() {
            return {
                username: "testuser",
                avatarUrl: "https://avatar.iran.liara.run/username?username=t+t",
                houseHold: {
                    id: "607c5be6-d4cf-4bb3-8642-96db6252a1fb",
                    createdAt: "2024-04-05T13:44:23.873Z",
                    name: "Test household",
                    joinCode: "WUGZJLL8"
                }
            }
        }
    }

    return {
        ...actual,
        default: new UserService()
    }
});

describe("Household page render", async () => {
    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should show the household name correctly", async () => {
        render(<BrowserRouter><Household /></BrowserRouter>);

        expect(await screen.findByText("Test household")).toBeInTheDocument();
    });

    it("Should show all members", async () => {
        render(<BrowserRouter><Household /></BrowserRouter>);

        expect(await screen.findByText("user one")).toBeInTheDocument();
        expect(await screen.findByText("user two")).toBeInTheDocument();
        expect(await screen.findByText("user three")).toBeInTheDocument();
    });
});

describe("Household page interaction", async () => {
    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to view the join code", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Household /></BrowserRouter>);

        const button = (await screen.findByText("View join code"));

        await user.click(button);
        expect(await screen.findByText("WUGZJLL8")).toBeInTheDocument();
    });

    it("Should be possible to change the household name", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Household /></BrowserRouter>);

        const button = (await screen.findByText("Change name"));

        await user.click(button);

        const input = await screen.findByRole("textbox");
        await user.clear(input);
        await user.type(input, "New name");

        const saveButton = await screen.findByText("Save changes");
        await user.click(saveButton);

        expect(mockedHouseHoldEdit).toHaveBeenCalledWith("New name");
    });

    it("Should be possible to join a new household", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Household /></BrowserRouter>);

        const button = (await screen.findByText("Join new household"));

        await user.click(button);

        const input = await screen.findByRole("textbox");
        await user.clear(input);
        await user.type(input, "ABCDEFGH");

        const joinButton = await screen.findByText("Join");
        await user.click(joinButton);

        expect(mockedHouseholdJoin).toHaveBeenCalledWith("ABCDEFGH");
    });

    it("Should be possible to leave a household", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Household /></BrowserRouter>);

        const button = (await screen.findByText("Leave household"));

        await user.click(button);

        const joinButton = await screen.findByText("Leave");
        await user.click(joinButton);

        expect(mockedHouseholdLeave).toHaveBeenCalledOnce();
    });
});