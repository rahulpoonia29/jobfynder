import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers";
import { Request, Response } from "express";
import prismaClient from "../prisma/prismaClient";

export const signup = async (req: Request, res: Response) => {
	try {
		const { name, username, email, password } = req.body;

		if (!name || !username || !email || !password) {
			res.status(400).json({ message: "All fields are required" });
			return;
		}

		const existingEmail = await prismaClient.prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (existingEmail) {
			res.status(400).json({ message: "Email already exists" });
			return;
		}

		const existingUsername = await prismaClient.prisma.user.findUnique({
			where: {
				username,
			},
		});
		if (existingUsername) {
			res.status(400).json({ message: "Username already exists" });
			return;
		}

		if (password.length < 6) {
			res.status(400).json({
				message: "Password must be at least 6 characters",
			});
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await prismaClient.prisma.user.create({
			data: {
				name,
				username,
				email,
				password: hashedPassword,
			},
		});

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			res.status(500).json({
				message: "Internal server error - JWT secret not configured",
			});
			return;
		}
		const token = jwt.sign({ userId: user.id }, secret, {
			expiresIn: "3d",
		});

		res.cookie("jwt-token", token, {
			httpOnly: true, // prevent XSS attack
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict", // prevent CSRF attacks,
			secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle attacks
		});

		res.status(201).json({ message: "User registered successfully" });

		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

		try {
			await sendWelcomeEmail(user.email, user.name, profileUrl);
		} catch (emailError) {
			console.error("Error sending welcome Email", emailError);
		}
	} catch (error: any) {
		console.log("Error in signup: ", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await prismaClient.prisma.user.findUnique({
			where: {
				username,
			},
		});
		if (!user) {
			res.status(400).json({ message: "Invalid credentials" });
			return;
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(400).json({ message: "Invalid credentials" });
			return;
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			res.status(500).json({
				message: "Internal server error - JWT secret not configured",
			});
			return;
		}

		// Create and send token
		const token = jwt.sign({ userId: user.id }, secret, {
			expiresIn: "3d",
		});
		await res.cookie("jwt-token", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.json({ message: "Logged in successfully" });
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const logout = (req: Request, res: Response) => {
	res.clearCookie("jwt-token");
	res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		res.json(req.user);
	} catch (error) {
		console.error("Error in getCurrentUser controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
