import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import addressRouter from './routes/address.routes.js';
import orderRouter from "./routes/order.routes.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.static('assets'));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());

// --- API Routes ---
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/order", orderRouter);


app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    if (err.name === 'ValidationError') {
        statusCode = 400; 
        message = 'Validation Failed';
        errors = Object.values(err.errors).map(e => e.message);
    } 
    if (!(err instanceof ApiError) && statusCode === 500) {
        message = "Something went wrong on the server."; 
    }
    console.error("Caught API Error:", err.stack);

    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
    });
});

export { app }; 

