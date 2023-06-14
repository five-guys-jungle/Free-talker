import express from "express";

import { signup, login } from "../controllers/userController";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.use((err, res) => {
    res.status(500).json({
        status: 500,
        message: "Internal Server Error",
    });
});

export default router;
