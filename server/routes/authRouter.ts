import express from "express";

import { signup, login } from "../controllers/userController";
import { signupLocal, loginLocal, logoutLocal } from "../controllers/userControllerLocal";

const router = express.Router();

if (process.env.NODE_ENV === "production") {
    router.post("/signup", signup);
    router.post("/login", login);
}
else {
    router.post("/signup", signupLocal);
    router.post("/login", loginLocal);
    router.post("/logout", logoutLocal);
}
// router.post("/signup", signup);

// router.post("/login", login);

router.use((err, res) => {
    res.status(500).json({
        status: 500,
        message: "Internal Server Error",
    });
});

export default router;
