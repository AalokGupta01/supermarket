import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        recipientName: {
            type: String,
            required: true,
            trim: true,
        },
        mobileNumber: {
            type: String, 
            required: true,
            trim: true,
        },
        streetAddress: {
            type: String,
            required: true,
            trim: true,
        },
        apartment: {
            type: String,
            trim: true,
            default: null,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String, 
            required: true,
            trim: true,
        },
        
        isDefault: {
            type: Boolean,
            default: false,
        },
        
    },
    {
        timestamps: true
    }
);

export const Address = mongoose.model("Address", addressSchema);