import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const {
    pname,
    brand,
    category,
    description,
    price,
    discount,
    quantity,
    available,
    imageUrl,
    expiryDate,
  } = req.body;

  if (!pname || !price || !quantity || !imageUrl || !category) {
    throw new ApiError(400, "Required fields are missing");
  }

  const existingProduct = await Product.findOne({ pname });

  if (existingProduct) {
    throw new ApiError(409, "Product with the same name already exists");
  }

  const product = await Product.create({
    pname,
    brand,
    category,
    description,
    price,
    discount,
    quantity,
    available: available || quantity,
    imageUrl,
    expiryDate,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;

  const filter = {};

  if (category) filter.category = category.toLowerCase();
  if (search) filter.pname = { $regex: search, $options: "i" };
  if (minPrice || maxPrice)
    filter.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };

  let query = Product.find(filter);

  // sorting logic
  if (sort === "price_asc") query = query.sort({ price: 1 });
  else if (sort === "price_desc") query = query.sort({ price: -1 });
  else if (sort === "latest") query = query.sort({ createdAt: -1 });

  const products = await query.exec();

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const updates = req.body;

  const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!category) {
    throw new ApiError(400, "Category is required");
  }
  
  const products = await Product.find({ category: category });

  if (!products.length) {
    throw new ApiError(404, "No products found for this category");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched by category"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
