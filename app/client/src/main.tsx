import App from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "@/index.css";
import { Error404 } from "@/routes/error-404";
import { Fridge } from "@/routes/fridge";
import { Household } from "@/routes/household";
import { Login } from "@/routes/login";
import { Profile } from "@/routes/profile";
import { RecipeCreate } from "@/routes/recipeCreate";
import { RecipeDetails } from "@/routes/recipeDetails";
import { Recipes } from "@/routes/recipes";
import { Register } from "@/routes/register";
import { ShoppingListDetail } from "@/routes/shoppingListDetails";
import { ShoppingLists } from "@/routes/shoppingLists";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

// All the routes for the app
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        // The main 3 pages, these render with a topbar and navbar
        children: [
            {
                path: "/fridge",
                element: <Fridge />,
            },
            {
                path: "/shopping-lists",
                element: <ShoppingLists />,
            },
            {
                path: "/recipes",
                element: <Recipes />,
            },
        ],
    },
    {
        path: "/recipes/:id",
        element: <RecipeDetails />,
    },
    {
        path: "/recipes/create",
        element: <RecipeCreate />,
    },
    {
        path: "/shopping-lists/:id",
        element: <ShoppingListDetail />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/household",
        element: <Household />,
    },
    {
        path: "*",
        element: <Error404 />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    </React.StrictMode>,
)
