import UserModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../util/asyncHandler.util.js";

export async function authMiddleware(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, "No Auth Token")
        }
        const token = authHeader.split(" ")[1];

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(payload.id);
        if (!user) {
            throw new ApiError(401, "User not found")
        }
        req.user = payload;
        next();
    } catch (error) {
        next(error)
    }
}