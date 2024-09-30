import { Prisma } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import prismaValidators, { UserInfo } from "../../services/prisma-validators";

const router: Router = express.Router();

// Creates a new shopping list
router.post("/create", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request
    const user = req.user as UserInfo;
    const { name, items, description } = req.body;

    // validates input data
    if (!name) return res.status(400).json({ error: "Missing name" });
    if (!items) return res.status(400).json({ error: "Missing items" });
    if (!(items instanceof Array)) return res.status(400).json({ error: "Items need to be an array" });
    if (description && description.length > 255) return res.status(400).json({ error: "Description too long" });

    // prisma query to create a new shopping list
    try {
        const newShoppingList = await prisma.shoppingList.create({
            data: {
                name,
                description,
                items: {
                    create: items.map(item => {
                        return {
                            item: {
                                connect: {
                                    id: item
                                }
                            }
                        }
                    })
                },
                householdId: user.houseHold.id
            }
        });
        // if successful, return the new shopping list and status 201 to indicate creation
        return res.status(201).json({ data: newShoppingList, redirect: `/shopping-lists/${newShoppingList.id}` });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // if the error is known to Prisma, provide a more specific error message
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }
        if (e instanceof Error) {
            // if the error is a generic error, provide the error message
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" })
    }
});

// Get a specific shopping list by id, with all items
router.get("/:id", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request and the shoppinglist id from the request parameters
    const user = req.user as UserInfo;
    const id = parseInt(req.params.id);

    // validates input data
    if (!id) return res.status(400).json({ error: "Missing id" });

    // prisma query to get a shopping list by id
    try {
        const shoppingList = await prisma.shoppingList.findUniqueOrThrow({
            where: {
                id,
                householdId: user.houseHold.id
            },
            // using prisma validators to ensure that the data is in the correct format
            ...prismaValidators.shoppingList.fullInfo
        });

        // if successful, return the shopping list
        return res.status(200).json({ data: shoppingList });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                // if the shopping list is not found, return a 404 error
                return res.status(404).json({ error: "Shopping list not found" });
            }
            // if the error is known to Prisma, provide a more specific error message
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }
        if (e instanceof Error) {
            // if the error is a generic error, provide the error message
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Get all shopping lists for the current user"s household, without items
router.get("/", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request
    const user = req.user as UserInfo;

    // prisma query to get all shopping lists for the current user"s household
    try {
        return res.status(200).json({
            data: await prisma.shoppingList.findMany({
                where: {
                    householdId: user.houseHold.id
                },
                // using prisma validators to ensure that the data is in the correct format
                ...prismaValidators.shoppingList.shortInfo
            })
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // if the error is known to Prisma, provide a more specific error message
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }
        if (e instanceof Error) {
            // if the error is a generic error, provide the error message
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Mark list as archived / unarchived
router.put("/:id/archive", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request and the shoppinglist id from the request parameters
    const user = req.user as UserInfo;
    const id = parseInt(req.params.id);

    // validates input data
    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
        // prisma query to get the shopping list by id, with the archived and items fields
        const shoppingList = await prisma.shoppingList.findUniqueOrThrow({
            where: {
                id: id,
                householdId: user.houseHold.id
            },
            select: {
                archived: true,
                items: true,
            }
        });

        // filtering and mapping the items to get the item id and household id
        const fridgeItems = shoppingList.items.filter((e) => e.purchased === true)
            .map((e) => {
                return {
                    itemId: e.itemId,
                    householdId: user.houseHold.id
                }
            });

        // get all items in the fridge that already are in the shopping list, to avoid duplicates
        const duplicate = await prisma.fridge.findMany({
            where: {
                itemId: {
                    in: fridgeItems.map((e) => e.itemId)
                },
                householdId: user.houseHold.id
            },
            select: {
                itemId: true
            }
        });

        // prisma query to create new fridge items for the items in the shopping list that are not in the fridge
        await prisma.fridge.createMany({
            data: fridgeItems.filter((e) => !duplicate.some((d) => d.itemId === e.itemId))
        });

        // prisma query to update the shopping list, setting the archived field to the opposite of its current value
        const updatedList = await prisma.shoppingList.update({
            where: {
                id: id
            },
            data: {
                archived: !shoppingList.archived,
                items: {
                    deleteMany: {
                        purchased: true
                    }
                }
            }
        });

        // if successful, return the updated shopping list and status 200 to indicate success
        return res.status(200).json({ data: updatedList, redirect: "/shopping-lists" });

    } catch (e) {
        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                return res.status(404).json({ error: "Shopping list not found" });
            }
        }
        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Delete a shopping list
router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {
    const user = req.user as UserInfo;

    const id = parseInt(req.params.id);

    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
        const deletedList = await prisma.shoppingList.delete({
            where: {
                id: id,
                householdId: user.houseHold.id
            }
        });
        // if successful, return the deleted shopping list and status 200 to indicate success
        return res.status(200).json({ data: deletedList, redirect: `/shopping-lists` });
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

// Add an item to a shopping list
router.post("/:id/add", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request
    const user = req.user as UserInfo;
    // retrieves the item id and shopping list id from the request body and parameters
    const itemId: number = req.body.itemId;
    const shoppingListId: number = parseInt(req.params.id);

    // validates input data
    if (!itemId) return res.status(400).json({ error: "Missing itemId" });
    if (!shoppingListId) return res.status(400).json({ error: "Missing shoppingListId" });

    // prisma query to add an item to a shopping list
    try {
        const newItem = await prisma.shoppingList.update({
            where: {
                id: shoppingListId,
                householdId: user.houseHold.id
            },
            data: {
                items: {
                    create: [
                        { item: { connect: { id: itemId } } }
                    ]
                }
            }
        });

        // if successful, return the new item and status 200 to indicate success
        return res.status(200).json({ data: newItem })
    }
    catch (e) {

        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            switch (e.code) {
                case "P2025": // Item doesn"t exist
                    return res.status(404).json({ error: "The item does not exist" });
                case "P2002": // Item already in shopping list, ignore
                    return res.status(409).json({ error: "Item already in shopping list" });
                default:
                    return res.status(500).json({ error: "Something went wrong", code: e.code });
            }
        }
        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Remove an item from a shopping list
router.delete("/:id/remove", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request
    const user = req.user as UserInfo;

    // retrieves the item id and shopping list id from the request body and parameters
    const itemId: number = req.body.itemId;
    const shoppingListId: number = parseInt(req.params.id);

    // validates input data
    if (!itemId) return res.status(400).json({ error: "Missing itemId" });
    if (!shoppingListId) return res.status(400).json({ error: "Missing shoppingListId" });

    // prisma query to remove an item from a shopping list
    try {
        const deletedItem = await prisma.shoppingListItem.delete({
            where: {
                shoppingListId_itemId: {
                    shoppingListId: shoppingListId,
                    itemId: itemId
                },
                shoppingList: {
                    householdId: user.houseHold.id
                }
            }
        });

        // if successful, return the deleted item and status 200 to indicate success
        return res.status(200).json({ data: deletedItem, redirect: `/shopping-lists` });

    } catch (e) {
        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                return res.status(404).json({ error: "Shopping list item not found" });
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

// Toggle shopping list item as purchased/not purchased
router.put("/:id/update", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieves user info from the request
    const user = req.user as UserInfo;

    // retrieves the item id and shopping list id from the request body and parameters
    const itemId: number = parseInt(req.body.itemId);
    const shoppingListId: number = parseInt(req.params.id);

    // validates input data
    if (!itemId) return res.status(400).json({ error: "Missing itemId" });
    if (!shoppingListId) return res.status(400).json({ error: "Missing shoppingListId" });

    try {

        // prisma query to get the shoppinglist item, including the purchased field
        const isPurchased = await prisma.shoppingListItem.findUniqueOrThrow({
            where: {
                shoppingListId_itemId: {
                    shoppingListId: shoppingListId,
                    itemId: itemId
                },
                shoppingList: {
                    householdId: user.houseHold.id
                }
            },
            select: {
                purchased: true
            }
        });

        // prisma query to update the shoppinglist item, setting the purchased field to the opposite of its current value
        const updatedItem = await prisma.shoppingListItem.update({
            where: {
                shoppingListId_itemId: {
                    shoppingListId: shoppingListId,
                    itemId: itemId
                },
                shoppingList: {
                    householdId: user.houseHold.id
                }
            },
            data: {
                purchased: !isPurchased.purchased
            }
        });

        // if successful, return the updated item and status 200 to indicate success
        return res.status(200).json({ data: updatedItem });

    } catch (e) {
        // if the error is known to Prisma, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                return res.status(404).json({ error: "Shopping list item not found" });
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


export default router;