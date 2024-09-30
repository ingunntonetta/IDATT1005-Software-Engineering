import express, { Express, Request, Response } from "express";
import passport from "passport";
import * as path from "path";
import apiAuthRouter from "./api/v1/auth";
import apiFridgeRouter from "./api/v1/fridge";
import apiHouseholdsRouter from "./api/v1/households";
import apiItemsRouter from "./api/v1/items";
import apiRecipesRouter from "./api/v1/recipes";
import apiShoppingListsRouter from "./api/v1/shoppingLists";
import apiUsersRouter from "./api/v1/users";
import passportStrategy from "./services/passport";

const app: Express = express();
const port = process.env.PORT || 3000;

passport.use(passportStrategy.jwtStrategy);
passport.use(passportStrategy.localStrategy);
passport.use(passportStrategy.googleStrategy);

app.use(express.json());

app.use("/api/v1/auth", apiAuthRouter);
app.use("/api/v1/households", apiHouseholdsRouter);
app.use("/api/v1/lists", apiShoppingListsRouter);
app.use("/api/v1/fridge", apiFridgeRouter);
app.use("/api/v1/recipes", apiRecipesRouter);
app.use("/api/v1/users", apiUsersRouter);
app.use("/api/v1/items", apiItemsRouter);

app.get("/api/*", (req: Request, res: Response) => {
    return res.status(404).json({ error: "Not Found" });
});

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("*", (req: Request, res: Response) => {
    return res.sendFile(path.resolve(__dirname, "../../client/dist", "index.html"));
});

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}


export default app;