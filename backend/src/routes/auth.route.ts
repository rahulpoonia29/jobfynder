import express from "express";
import {
	login,
	logout,
	signup,
	getCurrentUser,
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protectRoute, getCurrentUser);

export default router;
