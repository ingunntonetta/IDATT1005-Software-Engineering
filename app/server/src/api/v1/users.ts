import express, { Router } from "express";
import passport from "passport";

const router: Router = express.Router();

// Returns the currently logged in user
// GET /api/v1/users/me
router.get("/me", passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.json(req.user);
});

export default router;