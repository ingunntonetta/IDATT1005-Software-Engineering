import { Profile } from "@/routes/profile";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockedUseTheme = vi.fn();

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

vi.mock("@/components/theme-provider", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/components/theme-provider")>();

    return {
        ...original,
        useTheme: () => ({
            setTheme: mockedUseTheme
        })
    }
});

describe("Profile page render", async () => {
    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should show username correctly", async () => {
        render(<BrowserRouter><Profile /></BrowserRouter>);

        expect(await screen.findByText("@testuser")).toBeInTheDocument();
    });
});

describe("Profile page interaction", async () => {
    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be able to change theme", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Profile /></BrowserRouter>);

        await user.click(await screen.findByText("Change theme"));
        await user.click(await screen.findByText("Light"));
        await user.click(await screen.findByText("Change theme"));
        await user.click(await screen.findByText("Dark"));

        expect(mockedUseTheme).toHaveBeenCalledTimes(2);
    });
});