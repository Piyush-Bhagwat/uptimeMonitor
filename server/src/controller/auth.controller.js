
import UserModel from "../model/user.model.js";
import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";

export const AuthController = {
    register: asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;

        const exisitingUser = await UserModel.findOne({ email });
        if (exisitingUser) {
            throw new ApiError(409, "user already exists");
        }

        const user = await UserModel.create({ name, email, password });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user }
        });
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const token = user.generateToken();

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: { token }
        });
    }),
    getProfile: asyncHandler(async (req, res) => {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        res.status(200).json({
            success: true,
            data: {user}
        });
    })
}