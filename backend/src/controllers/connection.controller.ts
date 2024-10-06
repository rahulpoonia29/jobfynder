import { Request, Response } from "express";
import { sendConnectionAcceptedEmail } from "../emails/emailHandlers";
import prismaClient from "../prisma/prismaClient";
import { User } from "@prisma/client";
// import ConnectionRequest from "../models/connectionRequest.model";
// import Notification from "../models/notification.model";

export const sendConnectionRequest = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const senderId = (req.user as User).id;

		if (senderId.toString() === userId) {
			res.status(400).json({
				message: "You can't send a request to yourself",
			});
			return;
		}

		const user = await prismaClient.prisma.user.findUnique({
			where: {
				id: senderId,
			},
			select: {
				connections: true,
			},
		});

		if (!user) {
			res.status(401).json({ message: "User not found" });
			return;
		}

		if (
			user.connections.some(
				(connection) => (connection.connectedUserId = userId)
			)
		) {
			res.status(400).json({ message: "You are already connected" });
			return;
		}

		const existingRequest =
			await prismaClient.prisma.connectionRequest.findUnique({
				where: {
					senderId_receiverId: {
						senderId: senderId,
						receiverId: userId,
					},
					status: "PENDING",
				},
			});

		if (existingRequest) {
			res.status(400).json({
				message: "A connection request already exists",
			});
			return;
		}

		const newRequest = await prismaClient.prisma.connectionRequest.create({
			data: {
				senderId: senderId,
				receiverId: userId,
				status: "PENDING",
			},
		});

		res.status(201).json({
			message: "Connection request sent successfully",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

export const acceptConnectionRequest = async (req: Request, res: Response) => {
	try {
		const { requestId } = req.params;
		const userId = (req.user as User).id;

		const request = await prismaClient.prisma.connectionRequest.findUnique({
			where: {
				id: requestId,
				receiverId: userId,
				status: "PENDING",
			},
			select: {
				senderId: true,
				receiverId: true,
				sender: {
					select: {
						email: true,
						name: true,
					},
				},
				receiver: {
					select: {
						name: true,
						username: true,
					},
				},
			},
		});

		if (!request) {
			res.status(404).json({ message: "Connection request not found" });
			return;
		}

		// Update the status of the connection request
		await prismaClient.prisma.connectionRequest.update({
			where: {
				id: requestId,
				receiverId: userId,
				status: "PENDING",
			},
			data: {
				status: "ACCEPTED",
			},
		});

		// Create the connection
		await prismaClient.prisma.connection.create({
			data: {
				userId: request.senderId,
				connectedUserId: userId,
			},
		});

		res.json({ message: "Connection accepted successfully" });

		const senderEmail = request.sender.email;
		const senderName = request.sender.name;
		const recipientName = request.receiver.name;
		const profileUrl =
			process.env.CLIENT_URL + "/profile/" + request.receiver.username;

		try {
			await sendConnectionAcceptedEmail(
				senderEmail,
				senderName,
				recipientName,
				profileUrl
			);
		} catch (error) {
			console.error("Error in sendConnectionAcceptedEmail:", error);
		}
	} catch (error) {
		console.error("Error in acceptConnectionRequest controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const rejectConnectionRequest = async (req: Request, res: Response) => {
	try {
		const { requestId } = req.params;
		const userId = (req.user as User).id;

		const request = await prismaClient.prisma.connectionRequest.findUnique({
			where: {
				id: requestId,
				receiverId: userId,
				status: "PENDING",
			},
		});

		if (!request) {
			res.status(404).json({
				message: "Connection request not found or already processed",
			});
			return;
		}

		await prismaClient.prisma.connectionRequest.update({
			where: {
				id: requestId,
			},
			data: {
				status: "REJECTED",
			},
		});

		res.json({ message: "Connection request rejected" });
	} catch (error) {
		console.error("Error in rejectConnectionRequest controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getConnectionRequests = async (req: Request, res: Response) => {
	try {
		const userId = (req.user as User).id;

		const requests = await prismaClient.prisma.connectionRequest.findMany({
			where: {
				receiverId: userId,
				status: "PENDING",
			},
			select: {
				id: true,
				sender: {
					select: {
						id: true,
						name: true,
						username: true,
						profilePicture: true,
						headline: true,
						connections: true,
					},
				},
			},
		});

		res.json(requests);
	} catch (error) {
		console.error("Error in getConnectionRequests controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getUserConnections = async (req: Request, res: Response) => {
	try {
		const userId = (req.user as User).id;

		const user = await prismaClient.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				connections: {
					select: {
						connectedUser: {
							select: {
								id: true,
								name: true,
								username: true,
								profilePicture: true,
								headline: true,
								connections: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const connections = user.connections.map(
			(connection) => connection.connectedUser
		);

		res.json(connections);
	} catch (error) {
		console.error("Error in getUserConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const removeConnection = async (req: Request, res: Response) => {
	try {
		const myId = (req.user as User).id;
		const { userId } = req.params;

		// Remove the connection from the current user
		await prismaClient.prisma.connection.deleteMany({
			where: {
				OR: [
					{
						userId: myId,
						connectedUserId: userId,
					},
					{
						userId: userId,
						connectedUserId: myId,
					},
				],
			},
		});

		res.json({ message: "Connection removed successfully" });
	} catch (error) {
		console.error("Error in removeConnection controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getConnectionStatus = async (req: Request, res: Response) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = (req.user as User).id;

		// Check if the users are already connected
		const connection = await prismaClient.prisma.connection.findFirst({
			where: {
				OR: [
					{ userId: currentUserId, connectedUserId: targetUserId },
					{ userId: targetUserId, connectedUserId: currentUserId },
				],
			},
		});

		if (connection) {
			res.json({ status: "connected" });
			return;
		}

		// Check if there is a pending connection request
		const pendingRequest =
			await prismaClient.prisma.connectionRequest.findFirst({
				where: {
					OR: [
						{
							senderId: currentUserId,
							receiverId: targetUserId,
							status: "PENDING",
						},
						{
							senderId: targetUserId,
							receiverId: currentUserId,
							status: "PENDING",
						},
					],
				},
			});

		if (pendingRequest) {
			if (pendingRequest.senderId === currentUserId) {
				res.json({ status: "pending" });
				return;
			} else {
				res.json({
					status: "received",
					requestId: pendingRequest.id,
				});
				return;
			}
		}

		// If no connection or pending request found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.error("Error in getConnectionStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
