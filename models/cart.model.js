import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"]
        },

        priceAtAddition: {
            type: Number,
            required: true
        },

        discountAtAddition: {
            type: Number,
            default: 0
        },

        subtotal: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const CartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [CartItemSchema],

        totalAmount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

//
// 🔹 Auto-calculate subtotal per item
//
CartItemSchema.pre("save", function (next) {
    const price = this.priceAtAddition;
    const discount = this.discountAtAddition;
    const qty = this.quantity;

    const discountedPrice = price - (price * discount) / 100;
    this.subtotal = discountedPrice * qty;

    next();
});

//
// 🔹 Auto-recalculate cart totalAmount
//
CartSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    next();
});

export const Cart = mongoose.model("Cart", CartSchema);
