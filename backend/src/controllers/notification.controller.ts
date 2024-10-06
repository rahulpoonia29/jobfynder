import { User } from "@prisma/client";
import { Request, Response } from "express";
import prismaClient from "../prisma/prismaClient";

export const getUserNotifications = async (req: Request, res: Response) => {
	try {
		const userID = (req.user as User).id;

		const notifications = await prismaClient.prisma.notification.findMany({
			where: {
				recipientId: userID,
			},
			select: {
				relatedUser: {
					select: {
						name: true,
						username: true,
						profilePicture: true,
					},
				},
				relatedPost: {
					select: {
						content: true,
						image: true,
					},
				},
				read: true,
				type: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		res.status(200).json(notifications);
	} catch (error) {
		console.error("Error in getUserNotifications controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
	const notificationId = req.params.id;
	try {
		const notification = await prismaClient.prisma.notification.update({
			where: {
				id: notificationId,
			},
			select: { id: true },
			data: {
				read: true,
			},
		});

		res.json(notification);
	} catch (error) {
		console.error("Error in markNotificationAsRead controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteNotification = async (req: Request, res: Response) => {
	const notificationId = req.params.id;

	try {
		await prismaClient.prisma.notification.delete({
			where: {
				id: notificationId,
			},
		});

		res.json({ message: "Notification deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};
