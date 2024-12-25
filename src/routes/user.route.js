import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

/**
 * user router
 */
const router = Router();

// "register" route 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "banner",
            maxCount: 1
        }
    ]),
    registerUser
);

export default router;