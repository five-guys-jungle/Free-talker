import express from "express";

import { saveDialog, deleteDialog } from "../controllers/saveController";
import { saveDialogLocal, deleteDialogLocal } from "../controllers/saveControllerLocal";

const router = express.Router();

if (process.env.NODE_ENV === "production") {
    router.post("/saveDialog", saveDialog);
    router.post("/deleteDialog", deleteDialog);
}
else {
    router.post("/saveDialog", saveDialogLocal);
    router.post("/deleteDialog", deleteDialogLocal);
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
