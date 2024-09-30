import { TopBar } from "@/components/app/top-bar";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as router from "react-router";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockedUseLocation = {
    pathname: "/fridge",
    search: "",
    hash: "",
    state: null,
    key: ""
};

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

describe("Top bar rendering", async () => {
    beforeEach(() => {
        vi.spyOn(router, "useLocation").mockImplementation(() => mockedUseLocation)
    });

    it("Should render the correct text depending on location", async () => {
        render(<BrowserRouter><TopBar /></BrowserRouter>);

        expect(await screen.findByText("FRIDGE ITEMS")).toBeInTheDocument();
    });
});