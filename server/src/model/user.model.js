import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true
}
);

userSchema.pre("save", async function () {
    // Don't hash password if it hasn't changed
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);

    return
});

userSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false;
    console.log("Comparing password:", password, "with hash:", this.password);
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function () {
    const payload = {
        id: this._id,
        email: this.email,
        name: this.name
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3h" });
    return token;
}

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
