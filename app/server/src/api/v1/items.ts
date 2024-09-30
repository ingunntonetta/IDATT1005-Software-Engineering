import { Prisma } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import utils from "../../services/utils";

const router: Router = express.Router();

// Get all items
router.get("/", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // Prisma query to get all items
    try {
        const items = await prisma.item.findMany();

        // ifsuccessful reutrn the items with a 200 status code to indicate success
        return res.status(200).json({ data: items });

    } catch (e) {

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // if the error is known to Prisma, provide a more specific error message
            return res.status(500).json({ error: "Something went wrong", code: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Create new item
router.post("/", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve the name from the request body
    let name = req.body.name

    // validate input data
    if (!name || typeof name != "string") return res.status(400).json({ error: "Name is required" });
    if (!utils.itemNameRegex.test(name)) return res.status(400).json({ error: "Invalid item name" });

    // capitalize only the first letter of the name
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().trim();

    try {
        // Prisma query to create a new item
        const item = await prisma.item.create({ data: { name } });

        // if successful, return the item with a 201 status code to indicate success
        return res.status(201).json({ data: item });
    } catch (e) {

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // if the error is known to Prisma, provide a more specific error message
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