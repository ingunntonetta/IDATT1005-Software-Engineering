import { NavBar } from "@/components/app/nav-bar";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

describe("Navbar redirection works", async () => {
    it("Shopping list button works", async () => {
        render(<BrowserRouter><NavBar /></BrowserRouter>);
        const links = screen.getAllByRole("link");

        const linkHref = links.find((link) => link.getAttribute("href") === "/shopping-lists");
        expect(linkHref).toBeInTheDocument();

        act(() => linkHref?.click());
        expect(window.location.pathname).toBe("/shopping-lists");
    });

    it("Fridge button works", async () => {
        render(<BrowserRouter><NavBar /></BrowserRouter>);
        const links = screen.getAllByRole("link");

        const linkHref = links.find((link) => link.getAttribute("href") === "/fridge");
        expect(linkHref).toBeInTheDocument();

        act(() => linkHref?.click());
        expect(window.location.pathname).toBe("/fridge");
    });

    it("Recipes button works", async () => {
        render(<BrowserRouter><NavBar /></BrowserRouter>);
        const links = screen.getAllByRole("link");

        const linkHref = links.find((link) => link.getAttribute("href") === "/recipes");
        expect(linkHref).toBeInTheDocument();

        act(() => linkHref?.click());
        expect(window.location.pathname).toBe("/recipes");
    });
});