import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/add", verifyJWT, addToCart);
router.get("/", verifyJWT, getCart);
router.put("/item/:itemId", verifyJWT, updateCartItem);
router.delete("/item/:itemId", verifyJWT, removeCartItem);
router.delete("/clear", verifyJWT, clearCart);

export default router;
