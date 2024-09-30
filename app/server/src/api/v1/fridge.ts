import { Prisma, } from "@prisma/client";
import express, { Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import { UserInfo } from "../../services/prisma-validators";

const router: Router = express.Router();

// Get all items in the fridge
router.get("/items", passport.authenticate("jwt", { session: false }), async (req, res) => {

    // retrieve the user from the request
    const user = req.user as UserInfo;

    try {
        // Prisma query to get all items in the user"s fridge
        const items = await prisma.fridge.findMany({
            where: { householdId: user.houseHold.id },
            select: { item: true }
        });

        // return the items in the fridge
        return res.json({ data: items.map((item) => item.item) });
    } catch (e) {

        // if the error is a known Prisma error, provide a more specific error message
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

// Add item(s) to the fridge
router.post("/items", passport.authenticate("jwt", { session: false }), async (req, res) => {

    // retrieve the user and items from the request
    const user = req.user as UserInfo;
    const items: number[] = req.body.items;

    // validate the input data
    if (!items) return res.status(400).json({ error: "Items not provided" });
    if (!Array.isArray(items)) return res.status(400).json({ error: "Items must be an array" });
    if (items.length === 0) return res.status(400).json({ error: "Items cannot be empty" });
    if (items.some((item) => typeof item !== "number")) return res.status(400).json({ error: "Items must be numbers" });

    try {
        // Prisma query to add items to the user"s fridge
        await prisma.fridge.createMany({
            data: items.map((item) => {
                return {
                    itemId: item,
                    householdId: user.houseHold.id
                }
            })
        });

        // if successful, return a success message with a 200 status code
        return res.status(200).json({ message: "Item added to fridge" });
    } catch (e) {

        // if the error is a known Prisma error, provide a more specific error message
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

// Remove item(s) from fridge
router.delete("/items", passport.authenticate("jwt", { session: false }), async (req, res) => {

    // retrieve the user and items from the request
    const user = req.user as UserInfo;
    const items: number[] = req.body.items;

    // validate the input data
    if (!items) return res.status(400).json({ error: "Items not provided" });
    if (!Array.isArray(items)) return res.status(400).json({ error: "Items must be an array" });
    if (items.length === 0) return res.status(400).json({ error: "Items cannot be empty" });
    if (items.some((item) => typeof item !== "number")) return res.status(400).json({ error: "Items must be numbers" });

    try {
        // Prisma query to remove items from the user"s fridge
        await prisma.fridge.deleteMany({
            where: {
                householdId: user.houseHold.id,
                itemId: { in: items }
            }
        });

        // if successful, return a success message with a 200 status code
        return res.status(200).json({ message: "Item removed from fridge" });

    } catch (e) {

        // if the error is a known Prisma error, provide a more specific error message
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