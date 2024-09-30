import { Prisma } from "@prisma/client";
import { Request } from "express";
import passportGoogle, { VerifyCallback } from "passport-google-oauth2";
import passportJwt from "passport-jwt";
import passportLocal from "passport-local";
import prisma from "./prisma";
import prismaValidators from "./prisma-validators";
import utils from "./utils";

// Function to extract the JWT from the cookie
function cookieExtractor(req: Request): string | null {
    let token = null;
    if (req && req.headers.cookie) {
        // Regex that matches the JWT format in the cookie, and then parses out only the JWT
        token = req.headers.cookie.match(/jwt=([\w-]+\.[\w-]+\.[\w-]+)/g);
        if (token) token = token[0].split("jwt=")[1];
    }
    return token;
}

// The main strategy used on all endpoints that require authentication
// This strategy extracts the JWT from the cookie, verifies it and returns a user
const jwtStrategy: passportJwt.Strategy = new passportJwt.Strategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: utils.jwtSecret,
    jsonWebTokenOptions: { maxAge: "1d" }
}, async (jwtPayload: { uid: string }, done: VerifyCallback) => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                id: jwtPayload.uid
            },
            ...prismaValidators.user.info
        });

        if (user) return done(null, user);
        return done(null, false);
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma error, in this case give error if user does not exist
            if (e.code === "P2025") {
                return done(null, false);
            }
        }

        return done(e, false);
    }
});

const localStrategy: passportLocal.Strategy = new passportLocal.Strategy(async (username: string, password: string, done: VerifyCallback) => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                username
            },
            ...prismaValidators.user.authLocal
        });

        if (utils.verifyPassword(password, user.salt, user.passwordHash)) {
            return done(null, user);
        } else {
            return done(null, false, { message: "Incorrect username or password" });
        }

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma error, in this case give error if user does not exist
            if (e.code === "P2025") {
                return done(null, false, { message: "Incorrect username or password" });
            }
        }

        return done(e, false);
    }
});

// This strategy is only used once, when a user logs in with Google
const googleStrategy: passportGoogle.Strategy = new passportGoogle.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.BASE_URL + "/api/v1/auth/google/callback",
    proxy: true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}, (_accessToken: string, _refreshToken: string, profile: any, cb: VerifyCallback) => {
    createOauthUser(profile.id, profile.given_name, profile.family_name, profile.email, "google", cb, profile.picture);
});

const createOauthUser = async (oauthId: string, firstName: string, lastName: string, email: string, provider: string, cb: VerifyCallback, avatarUrl?: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            },
            ...prismaValidators.user.oauthInfo
        });

        if (user) {
            // If the user already has an account, and it is linked to the oauth account, return the user
            if (user.oauthUser.find((oauthUser) => oauthUser.oauth_id === oauthId && oauthUser.provider === provider)) {
                return cb(null, user);
            } else {
                // If the user already has an account, but it is not linked to the oauth account, link the oauth account
                await prisma.oauthUser.create({
                    data: {
                        user: {
                            connect: {
                                id: user.id
                            }
                        },
                        oauth_id: oauthId,
                        provider
                    }
                });

                return cb(null, user);
            }
        } else {
            // If the user does not already have an account, create one and link the oauth account
            if (!avatarUrl)
                avatarUrl = `https://avatar.iran.liara.run/username?username=${firstName.slice(0, 1)}+${lastName.slice(0, 1)}`;

            let username = firstName.substring(0, 4) + lastName.substring(0, 4);
            username += Math.floor(10_000_000 + Math.random() * 90_000_000).toString();
            username = username.toLowerCase();

            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    firstName,
                    lastName,
                    passwordHash: "0".repeat(64),
                    salt: "0".repeat(32),
                    avatarUrl,
                    houseHold: {
                        create: {
                            joinCode: utils.generateJoinCode()
                        }
                    },
                    oauthUser: {
                        create: {
                            oauth_id: oauthId,
                            provider
                        }
                    }
                }
            });

            return cb(null, newUser);
        }
    } catch (e) {
        return cb(e, false);
    }
};

export default { jwtStrategy, localStrategy, googleStrategy };