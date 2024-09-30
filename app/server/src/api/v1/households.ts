import { Prisma } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import prismaValidators, { UserInfo } from "../../services/prisma-validators";
import utils from "../../services/utils";

const router: Router = express.Router();

// Join a new household
router.post("/join", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // Retrieve the user from the request
    const user = req.user as UserInfo;

    // Retrieve the join code from the request body
    let { joinCode } = req.body;

    // Validate the input data
    if (!joinCode) return res.status(400).json({ error: "Invalid join code" });

    joinCode = joinCode.toUpperCase();

    try {
        // Prisma transaction to join a household
        return await prisma.$transaction(async (tx) => {
            const newHousehold = await tx.household.findFirst({ where: { joinCode } });

            if (!newHousehold) throw new Error("Invalid join code");

            await tx.user.update({
                where: { id: user.id },
                data: { householdId: newHousehold.id },
            });

            // Delete the old household if no one is in it anymore
            if (await tx.user.count({ where: { householdId: user.houseHold.id } }) === 0) {
                await tx.household.delete({
                    where: {
                        id: user.houseHold.id
                    }
                });
            }
            // if successful, return a 200 status code to indicate success
            return res.status(200).json({ message: "Successfully joined household" });
        });
    } catch (e) {

        // if the error is a known Prisma error, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            if (e.message === "Invalid join code") return res.status(400).json({ error: e.message });
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Leave a household
router.post("/leave", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // Retrieve the user from the request
    const user = req.user as UserInfo;

    try {
        return await prisma.$transaction(async (tx) => {
            // Create a new household and add user to it
            await tx.user.update({
                where: { id: user.id },
                data: {
                    houseHold: {
                        create: {
                            joinCode: utils.generateJoinCode()
                        }
                    }
                },
            });

            // Delete the old household if no one is in it anymore
            if (await tx.user.count({ where: { householdId: user.houseHold.id } }) === 0) {
                await tx.household.delete({
                    where: {
                        id: user.houseHold.id
                    }
                });
            }
            // if successful, return a 200 status code to indicate success
            return res.status(200).json({ message: "Successfully left household" });
        });
    } catch (e) {

        // if the error is a known Prisma error, provide a more specific error message
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({ error: e.code });
        }

        // if the error is a generic error, provide the error message
        if (e instanceof Error) {
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Get all members in the  user"s household
router.get("/members", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve the user from the request
    const user = req.user as UserInfo;

    try {
        // Prisma query to get all members in the user"s household
        const members = await prisma.user.findMany({
            where: {
                householdId: user.houseHold.id
            },
            // Using prismaValidators to select only the necessary fields
            ...prismaValidators.user.househouldMemberInfo
        });

        // if successful, return the members with a 200 status code to indicate success
        return res.status(200).json({ data: members });
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

// Edit the name of a household
router.put("/edit", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {

    // retrieve the user from the request
    const user = req.user as UserInfo;

    // retrieve the name from the request body
    const { name } = req.body;

    // validate the input data
    if (!name) return res.status(400).json({ error: "Invalid name" });
    if (name.length > 24) return res.status(400).json({ error: "Name too long" });

    try {
        // Prisma query to update the household name
        await prisma.household.update({
            where: { id: user.houseHold.id },
            data: { name }
        });
        // if successful, return a 200 status code to indicate success
        return res.status(200).json({ message: "Successfully updated household name" });

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