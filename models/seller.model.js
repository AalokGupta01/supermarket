import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const sellerSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        storeName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        storeDescription: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        accessToken: {
            type: String
        },
        // Optional: Link to products if you have a Product model
        // products: [{ type: Schema.Types.ObjectId, ref: "Product" }]
    },
    {
        timestamps: true
    }
)

sellerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

sellerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

sellerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            storeName: this.storeName,
            role: "seller"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const Seller = mongoose.model("Seller", sellerSchema)