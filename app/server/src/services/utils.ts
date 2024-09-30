import crypto from "crypto";
import { Response } from "express";
import jwt from "jsonwebtoken";

class Utils {
    jwtSecret: string = process.env.JWT_SECRET as string;

    /*
        Regex that tries to match a valid email address
        Sourced from: https://emailregex.com/index.html
    */
    emailRegex: RegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    /*
        Regex that matches usernames that:
            - start with a letter
            - are between 2 and 24 characters long (inclusive)
            - can contain letters, numbers, dots, underscores and dashes
    */
    usernameRegex: RegExp = new RegExp(/^[a-zA-Z][a-zA-Z0-9._-]{1,23}$/);

    /*
        Regex that matches passwords that:
            - are at least 8 characters long
            - contain at least one lowercase letter
            - contain at least one uppercase letter
            - contain at least one number
            - contain at least one special character
    */
    passwordRegex: RegExp = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);

    /*
        Regex that matches item names that:
            - are between 1 and 32 characters long (inclusive)
            - can contain letters and spaces
    */
    itemNameRegex: RegExp = new RegExp(/^[a-zA-Z ]{1,32}$/);

    // Generate a random join code (8 characters long, uppercase and digits)
    generateJoinCode(): string {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Hash a password using PBKDF2, return salt and hash
    hashPassword(password: string): { salt: string, passwordHash: string } {
        const salt: string = crypto.randomBytes(16).toString("hex");
        const hexPass: string = crypto.pbkdf2Sync(password, salt, 600_000, 32, "sha256").toString("hex");

        return {
            salt: salt,
            passwordHash: hexPass
        };
    }

    // Verifies a plaintext password against the stored hash
    verifyPassword(password: string, salt: string, hash: string): boolean {
        const hashedPass: Buffer = crypto.pbkdf2Sync(password, salt, 600_000, 32, "sha256");

        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), hashedPass);
    }

    // Return & redirect the user with their JWT cookie set
    returnCookie(uid: string, redirectUrl: string, res: Response): void {
        const token: string = jwt.sign({ uid }, this.jwtSecret, { expiresIn: "1d" });

        res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "strict" });

        res.redirect(redirectUrl);
    }
}

export default new Utils();