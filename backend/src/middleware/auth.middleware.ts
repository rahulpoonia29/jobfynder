import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prismaClient from "../prisma/prismaClient";

export const protectRoute = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token = req.cookies["jwt-token"];
		if (!token) {
			res.status(401).json({
				message: "Unauthorized - No Token Provided",
			});
			return;
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			res.status(500).json({
				message: "Internal server error - JWT secret not configured",
			});
			return;
		}

		const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
		if (!decoded) {
			res.status(401).json({ message: "Unauthorized - Invalid Token" });
			return;
		}

		const user = await prismaClient.prisma.user.findUnique({
			where: {
				id: decoded.userId,
			},
		});

		if (!user) {
			res.status(401).json({ message: "User not found" });
			return;
		}

		req.user = user;
		next();
	} catch (error: any) {
		console.log("Error in protectRoute middleware:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
