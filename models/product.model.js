import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
    {
        pname: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            lowercase: true,
            minlength: [2, "Product name must be at least 2 characters long"],
            maxlength: [100, "Product name too long"],
        },

        brand: {
            type: String,
            trim: true,
            lowercase: true,
            default: "generic",
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            enum: [
                "Bakery",
                "Dairy",
                "Beverages",
                "Vegetables",
                "Fruits",
                "Dry Fruits",
                "Snacks",
                "Grains & Pulses",
                "Frozen",
                "Household",
                "Personal care",
                "Others"
            ],
            default: "others",
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },

        discount: {
            type: Number,
            default: 0, // percentage discount
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
        },

        available: {
            type: Number,
            default: 0,
        },

        imageUrl: {
            type: String,
            required: [true, "Product image URL is required"],
        },

        expiryDate: {
            type: Date,
        },

        ratings: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);


//
// 🔹 Middleware — update 'available' automatically
//
ProductSchema.pre("save", function (next) {
    if (this.available > this.quantity) {
        this.available = 0;
    }
    next();
});


export const Product = mongoose.model("Product", ProductSchema);
