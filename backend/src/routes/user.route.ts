import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
	getSuggestedConnections,
	getPublicProfile,
	updateProfile,
} from "../controllers/user.controller";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);

router.put("/profile", protectRoute, updateProfile);

export default router;
