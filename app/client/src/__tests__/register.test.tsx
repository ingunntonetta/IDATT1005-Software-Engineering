import { NewUser } from "@/datatypes";
import { Register } from "@/routes/register";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedUserRegister = vi.fn();
const mockedNavigate = vi.fn();
const mockedUseToast = vi.fn();

vi.mock("@/services/user", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/user")>();

    class UserService {
        async register(user: NewUser) {
            mockedUserRegister(user);
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

describe("Register page interaction", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useNavigate").mockImplementation(() => mockedNavigate)
    });

    afterEach(() => {
        vi.restoreAllMocks()
    });

    it("Should be possible to register with valid information", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Register /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("First name"), "First");
        await user.type(await screen.findByPlaceholderText("Last name"), "Last");
        await user.type(await screen.findByPlaceholderText("Email"), "test@example.com");
        await user.type(await screen.findByPlaceholderText("Username"), "username");
        await user.type(await screen.findByPlaceholderText("Password"), "correctpassword");
        await user.type(await screen.findByPlaceholderText("Confirm password"), "correctpassword");

        await userEvent.click(await screen.findByRole("button", { name: "Create" }));

        expect(mockedUserRegister).toHaveBeenCalledWith({
            firstName: "First",
            lastName: "Last",
            username: "username",
            password: "correctpassword",
            email: "test@example.com"
        });
        expect(mockedNavigate).toHaveBeenCalledWith("/fridge");
    });

    it("Should not be possible to register with invalid information", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Register /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("First name"), "First");
        await user.type(await screen.findByPlaceholderText("Last name"), "Last");
        await user.type(await screen.findByPlaceholderText("Email"), "invalid@");
        await user.type(await screen.findByPlaceholderText("Username"), "ab");
        await user.type(await screen.findByPlaceholderText("Password"), "short");
        await user.type(await screen.findByPlaceholderText("Confirm password"), "correctpassword");


        expect(await screen.findByText("The email address is not valid.")).toBeInTheDocument();
        expect(await screen.findByText("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.")).toBeInTheDocument();
        expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    });

    it("Should not be possible to register with missing information", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Register /></BrowserRouter>);

        await user.type(await screen.findByPlaceholderText("Last name"), "Last");
        await user.type(await screen.findByPlaceholderText("Email"), "test@example.com");
        await user.type(await screen.findByPlaceholderText("Username"), "username");
        await user.type(await screen.findByPlaceholderText("Password"), "correctpassword");
        await user.type(await screen.findByPlaceholderText("Confirm password"), "correctpassword");

        await userEvent.click(await screen.findByRole("button", { name: "Create" }));

        // expect(await screen.findByText("Please fill in all fields")).toBeInTheDocument();
        expect(mockedUseToast).toHaveBeenCalledWith({
            title: "Please fill in all fields",
            variant: "destructive",
            duration: 1500,
        });
        expect(mockedUserRegister).not.toHaveBeenCalled();
    });

    it("Should be possible to register after fixing invalid information", async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Register /></BrowserRouter>);

        const emailInput = await screen.findByPlaceholderText("Email");

        await user.type(await screen.findByPlaceholderText("First name"), "First");
        await user.type(await screen.findByPlaceholderText("Last name"), "Last");
        await user.type(emailInput, "invalid@");
        await user.type(await screen.findByPlaceholderText("Username"), "username");
        await user.type(await screen.findByPlaceholderText("Password"), "correctpassword");
        await user.type(await screen.findByPlaceholderText("Confirm password"), "correctpassword");

        await userEvent.click(await screen.findByRole("button", { name: "Create" }));

        expect(await screen.findByText("The email address is not valid.")).toBeInTheDocument();

        await user.clear(emailInput);
        await user.type(emailInput, "test@example.com");
        await userEvent.click(await screen.findByRole("button", { name: "Create" }));

        expect(mockedUserRegister).toHaveBeenCalledWith({
            firstName: "First",
            lastName: "Last",
            username: "username",
            password: "correctpassword",
            email: "test@example.com"
        });
        expect(mockedNavigate).toHaveBeenCalledWith("/fridge");
    });
});