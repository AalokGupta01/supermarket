import { Router } from "express";

// Ensure your auth middleware can verify Admin tokens
// You might need a specific 'verifyAdminJWT' if your generic 'verifyJWT' only checks the User collection
import { verifyAdmin } from "../middlewares/admin.middleware.js";

import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAllSellers,
    getCategoryStats,
    getAdmin
} from "../controllers/admin.controller.js";
import { get } from "mongoose";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";

const router = Router();

// Public Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Routes
router.route("/logout").post(verifyAdmin, logoutAdmin);

// Dashboard Routes
router.route("/sellers").get(verifyAdmin, getAllSellers);
router.route("/categories").get(verifyAdmin, getCategoryStats);
router.route("/get-admin").get(verifyAdmin, getAdmin);
router.route("/orders").get(verifyAdmin, getAllOrders);
router.route("/orders/:orderId/status").patch(verifyAdmin, updateOrderStatus);

export default router;