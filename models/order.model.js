import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
}, { _id: false }); 

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        deliveryAddress: {
            recipientName: { type: String, required: true },
            mobileNumber: { type: String, required: true },
            streetAddress: { type: String, required: true },
            apartment: { type: String, default: null },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: [arrayMinLength, 'Order must contain at least one item']
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingFee: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: ['COD', 'UPI'],
            default: 'COD',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        paymentId: {
            type: String,
            default: null,
        },

        orderStatus: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },

        deliveredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true
    }
);

function arrayMinLength(val) {
    return val.length > 0;
}

export const Order = mongoose.model("Order", orderSchema);