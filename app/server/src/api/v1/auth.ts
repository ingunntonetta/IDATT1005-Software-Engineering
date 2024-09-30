import { Prisma } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import prisma from "../../services/prisma";
import { UserInfo } from "../../services/prisma-validators";
import utils from "../../services/utils";

const router: Router = express.Router();

router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
    return utils.returnCookie((req.user as UserInfo).id, "/fridge", res);
});

router.all("/logout", (req, res) => {
    res.clearCookie("jwt", { path: "/" });
    return res.redirect("/");
});

router.get("/google/login", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    return utils.returnCookie((req.user as UserInfo).id, "/fridge", res);
});

router.post("/register", async (req: Request, res: Response) => {

    // Extract the needed fields from the request body
    const { username, email, firstName, lastName, password } = req.body;

    // extract the avatarUrl separately, if it is not provided, generate it
    let avatarUrl = req.body.avatarUrl;

    if (!avatarUrl)
        avatarUrl = `https://avatar.iran.liara.run/username?username=${firstName.slice(0, 1)}+${lastName.slice(0, 1)}`;

    // validate input data
    if (!username || !email || !firstName || !lastName || !password) return res.status(400).json({ message: "Missing username, email, password or name" });
    if (!utils.emailRegex.test(email)) return res.status(400).json({ message: "Email is not valid" });
    if (!utils.usernameRegex.test(username)) return res.status(400).json({ message: "Username is not valid" });
    if (!utils.passwordRegex.test(password)) return res.status(400).json({ message: "Password is not valid" });

    try {
        // Hash the password
        const { salt, passwordHash } = utils.hashPassword(password);

        // Prisma query to create a new user
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                firstName,
                lastName,
                passwordHash,
                salt,
                avatarUrl,
                houseHold: {
                    create: {
                        joinCode: utils.generateJoinCode()
                    }
                }
            }
        });

        // if successful Return the JWT token
        return utils.returnCookie(newUser.id, "/fridge", res);

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma error, in this case give error if username or email already exists
            if (e.code === "P2002") {
                if (e.meta && e.meta.target instanceof Array) {
                    const target = e.meta.target[0];

                    if (target === "username") {
                        return res.status(400).json({ message: "Username already exists." });
                    } else if (target === "email") {
                        return res.status(400).json({ message: "Email already exists." });
                    }
                }

                return res.status(500).json({ message: "Something went wrong", code: e.code });
            }
        }

        return res.status(500).json({ message: "Something went wrong" });
    }

});

export default router;