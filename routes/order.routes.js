import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { placeOrder } from "../controllers/order.controller.js";
import { getUserOrders } from "../controllers/order.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/place").post(placeOrder);
router.route("/my-orders").get(getUserOrders);

export default router;