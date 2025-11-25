import { Router } from "express";

// Ensure your auth middleware can verify Seller tokens
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    registerSeller,
    loginSeller,
    logoutSeller,
    updateStoreDetails
} from "../controllers/seller.controller.js";

const router = Router();

// Public Routes
router.post("/register", registerSeller);
router.post("/login", loginSeller);

// Protected Routes
router.route("/logout").post(verifyJWT, logoutSeller);
router.route("/update-store").patch(verifyJWT, updateStoreDetails);

export default router;