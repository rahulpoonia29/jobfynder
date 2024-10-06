import { Request, Response } from "express";
import cloudinary from "../lib/cloudinary";
import prismaClient from "../prisma/prismaClient";

export const getSuggestedConnections = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const currentUser = await prismaClient.prisma.user.findUnique({
			where: {
				id: req.user.id,
			},
			select: {
				connections: true,
			},
		});

		if (!currentUser) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const suggestedUser = await prismaClient.prisma.user.findMany({
			where: {
				id: {
					not: req.user.id,
					notIn: currentUser.connections.map(
						(connection) => connection.id
					),
				},
			},
			select: {
				name: true,
				username: true,
				profilePicture: true,
				headline: true,
			},
			take: 3,
		});

		res.json(suggestedUser);
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPublicProfile = async (req: Request, res: Response) => {
	try {
		const user = await prismaClient.prisma.user.findUnique({
			where: {
				username: req.params.username,
			},

			// TODO: Define all fields required in the forntend and only send them
			// select: {
			// 	id:true,
			// 	name:true,
			// 	username:true,
			// 	email:true,
			// 	password: false,
			// },
		});

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req: Request, res: Response) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
		];

		const data = req.body;

		const updatedData = allowedFields.reduce(
			(acc: { [key: string]: any }, field) => {
				if (data[field]) {
					acc[field] = data[field];
				}
				return acc;
			},
			{}
		);

		if (Object.keys(updatedData).length === 0) {
			res.status(400).json({ message: "No fields to update" });
			return;
		}

		if (updatedData.profilePicture) {
			const result = await cloudinary.uploader.upload(
				updatedData.profilePicture
			);
			updatedData.profilePicture = result.secure_url;
		}

		if (updatedData.bannerImg) {
			const result = await cloudinary.uploader.upload(
				updatedData.bannerImg
			);
			updatedData.bannerImg = result.secure_url;
		}

		const user = await prismaClient.prisma.user.update({
			where: {
				id: (req.user as { [key: string]: any }).id,
			},
			data: updatedData,
			select: {
				id: true,
				password: false,
			},
		});

		res.status(200).json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
