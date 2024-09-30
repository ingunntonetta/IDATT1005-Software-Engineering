import { Prisma } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import prismaValidators, { UserInfo } from "../../services/prisma-validators";

const router: Router = express.Router();

// Create a new recipe
router.post("/create", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve user info from the request
    const user = req.user as UserInfo;

    // extract the needed fields from the request body
    const { title, difficulty, time, cost, description, recipeText, ingredients } = req.body;
    let imageUrl = req.body.imageUrl;

    // validate input data
    if (!title) return res.status(400).json({ error: "Missing title" });
    if (!time) return res.status(400).json({ error: "Missing time" });
    if (!recipeText) return res.status(400).json({ error: "Missing recipe text" });
    if (!ingredients) return res.status(400).json({ error: "Missing ingredients" });
    if (!description) return res.status(400).json({ error: "Missing description" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!ingredients.every((e: any) => e.itemId && e.amount)) return res.status(400).json({ error: "Invalid ingredients" });

    if (![1, 2, 3].includes(difficulty)) return res.status(400).json({ error: "Invalid difficulty" });
    if (![1, 2, 3].includes(cost)) return res.status(400).json({ error: "Invalid Cost" })
    if (description.length > 255) return res.status(400).json({ error: "Description too long" });
    if (!imageUrl) imageUrl = ""; // Default to empty string if not provided

    try {
        // Prisma query to create a new recipe
        const newRecipe = await prisma.recipe.create({
            data: {
                title,
                difficulty,
                time,
                cost,
                description,
                recipeText,
                imageUrl,
                createdById: user.id,
                ingredients: {
                    create: ingredients
                }
            }
        });

        // if successful return the new recipe
        return res.status(201).json({ data: newRecipe, redirect: `/recipes/${newRecipe.id}` });

    } catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Get a recipe by id
router.get("/:id", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve the recipe id from the request
    const id = parseInt(req.params.id);

    // validate the input data
    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
        // Prisma query to get a recipe by id
        const recipe = await prisma.recipe.findUniqueOrThrow({
            where: {
                id
            },
            // select the fields to return
            ...prismaValidators.recipes.fullInfo
        });

        // if successful return the recipe
        return res.status(200).json({ data: recipe });

    } catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                return res.status(404).json({ error: "Recipe not found" });
            }
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Something went wrong" });
    }
});

// get all recipes
router.get("/", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // Prisma query to get all recipes
    try {
        const recipes = await prisma.recipe.findMany(prismaValidators.recipes.shortInfo);

        // if successful return the recipes
        return res.status(200).json({ data: recipes });
    } catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong", e: e });
    }
});

// Delete a recipe
router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve user info from the request
    const user = req.user as UserInfo;

    // retrieve the recipe id from the request
    const id = parseInt(req.params.id);

    // validate the input data
    if (!id) return res.status(400).json({ error: "Missing id" });

    // Prisma query to delete a recipe
    try {
        const deletedRecipe = await prisma.recipe.delete({
            where: {
                id,
                createdById: user.id
            }
        });

        // if successful return the deleted recipe
        return res.status(200).json({ data: deletedRecipe, redirect: "/recipes" });
    } catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Create a shoppinglist based on a recipe
router.post("/:id/createlist", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve user info from the request
    const user = req.user as UserInfo;

    // retrieve the recipe id from the request
    const recipeId = parseInt(req.params.id);

    // validate the input data
    if (!recipeId) return res.status(400).json({ error: "Missing recipeId" });

    try {
        // Prisma query to get a recipe by id including the ingredients" itemIds
        const recipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId
            },
            select: {
                title: true,
                ingredients: {
                    select: {
                        itemId: true
                    }
                }
            }
        });

        // if the recipe is not found, return an error
        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        // Prisma query to get all items in the fridge
        const fridgeItems = await prisma.fridge.findMany({
            where: {
                householdId: user.houseHold.id
            },
            select: {
                itemId: true
            }
        })

        // extract the itemIds from the recipe and the fridge
        const recipeItems = recipe.ingredients.map((item) => item.itemId);

        // extract the itemIds from the fridge
        const fridgeItemsIds = fridgeItems.map((item) => item.itemId);

        // filter out the items that are not in the fridge
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shoppingListItems = recipeItems.filter((item: any) => {
            return !fridgeItemsIds.includes(item);
        });

        // default new shoppinglist title
        const listName = "Missing items";

        // deafult new shoppinglist description
        const listDescription = `Shopping list for: ${recipe.title}`.substring(0, 255);

        // Prisma query to create a new shoppinglist
        const newShoppingList = await prisma.shoppingList.create({
            data: {
                name: listName,
                description: listDescription,
                householdId: user.houseHold.id,
                items: {
                    create: shoppingListItems.map((itemId: number) => {
                        return {
                            itemId
                        }
                    })
                }
            }
        });

        // if successful return the new shoppinglist
        return res.status(200).json({ data: newShoppingList, redirect: `/shopping-lists/${newShoppingList.id}` });
    }
    catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Edit a recipe
router.put("/:id/edit", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve user info from the request
    const user = req.user as UserInfo;

    // retrieve the required fields from the request body
    const id = parseInt(req.params.id);
    const { title, difficulty, time, cost, description, recipeText, ingredients } = req.body;
    let imageUrl = req.body.imageUrl;

    // validate the input data
    if (!title) return res.status(400).json({ error: "Missing title" });
    if (!time) return res.status(400).json({ error: "Missing time" });
    if (!recipeText) return res.status(400).json({ error: "Missing recipe text" });
    if (!ingredients) return res.status(400).json({ error: "Missing ingredients" });
    if (!description) return res.status(400).json({ error: "Missing description" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!ingredients.every((e: any) => e.itemId && e.amount)) return res.status(400).json({ error: "Invalid ingredients" });

    if (![1, 2, 3].includes(difficulty)) return res.status(400).json({ error: "Invalid difficulty" });
    if (![1, 2, 3].includes(cost)) return res.status(400).json({ error: "Invalid Cost" })
    if (description.length > 255) return res.status(400).json({ error: "Description too long" });
    if (!imageUrl) imageUrl = ""; // Default to empty string if not provided

    try {
        // Prisma query to update a recipe
        const newRecipe = await prisma.recipe.update({
            where: {
                id,
                createdById: user.id,
            },
            data: {
                title,
                difficulty,
                time,
                cost,
                description,
                recipeText,
                imageUrl,
                ingredients: {
                    // delete all old ingredients and create new ones
                    deleteMany: {},
                    create: ingredients
                }
            }
        });
        // if successful return the updated recipe
        return res.status(201).json({ data: newRecipe, redirect: `/recipes/${newRecipe.id}` });

    } catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;