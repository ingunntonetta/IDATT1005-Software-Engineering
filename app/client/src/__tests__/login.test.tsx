import { LoginUser } from "@/datatypes";
import { Login } from "@/routes/login";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedUserLogin = vi.fn((user: LoginUser) => {
    if (user.username !== "username" || user.password !== "correctpassword") throw new Error();
    return;
});
const mockedNavigate = vi.fn();
const mockedUseToast = vi.fn();

vi.mock("@/services/user", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/user")>();

    class UserService {
        async login(user: LoginUser) {
            mockedUserLogin(user);
        }
    }

    return {
        ...original,
        default: new UserService()
    }
});

vi.mock("@/components/ui/use-toast", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/components/theme-provider")>();

    return {
        ...original,
        useToast: () => ({
            toast: mockedUseToast
        })
    }
});

describe("Login page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to log in with correct username and password", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Login /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("Username"), "username");
        await user.type(await screen.findByPlaceholderText("Password"), "correctpassword");

        await userEvent.click(await screen.findByRole("button", { name: "Login" }));

        expect(mockedUserLogin).toHaveBeenCalledWith({ username: "username", password: "correctpassword" });
        expect(mockedNavigate).toHaveBeenCalledWith("/fridge");
    });

    it("Should not be possible to log in with incorrect username and password", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Login /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("Username"), "username");
        await user.type(await screen.findByPlaceholderText("Password"), "wrongpassword");

        await userEvent.click(await screen.findByRole("button", { name: "Login" }));

        expect(mockedUserLogin).toHaveBeenCalledWith({ username: "username", password: "wrongpassword" });
        expect(mockedNavigate).not.toHaveBeenCalled();
        expect(mockedUseToast).toHaveBeenCalledWith({
            title: "Invalid username or password",
            variant: "destructive",
            duration: 2000,
        });
    });
});