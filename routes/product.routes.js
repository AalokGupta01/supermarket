import express from "express";
import { upload } from "../middlewares/upload_product.middleware.js"; // Import Middleware
import {
  createProduct,
  uploadProductImage, // Import Controller
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/category/:category", getProductsByCategory);

// Upload Route - Must be before /:id to avoid ID conflict logic
// This endpoint will be: /api/v1/products/upload
router.post("/upload", upload.single("image"), uploadProductImage);

// Protected routes (Ensure you have auth middleware if needed here)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;