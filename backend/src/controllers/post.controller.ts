import { Request, Response } from "express";
import { sendCommentNotificationEmail } from "../emails/emailHandlers";
import cloudinary from "../lib/cloudinary";
import prismaClient from "../prisma/prismaClient";
import { User } from "@prisma/client";

export const getFeedPosts = async (req: Request, res: Response) => {
	try {
		const user = req.user as User;

		const updatedUser = await prismaClient.prisma.user.findUniqueOrThrow({
			where: {
				id: user.id,
			},
			select: {
				connections: true,
			},
		});

		const posts = await prismaClient.prisma.post.findMany({
			where: {
				authorId: {
					in: [
						...updatedUser.connections.map((conn) => conn.id),
						user.id,
					], // Include user's connections and user themselves
				},
			},
			include: {
				author: {
					select: {
						name: true,
						username: true,
						profilePicture: true,
						headline: true,
					},
				},
				comments: {
					include: {
						user: {
							select: {
								name: true,
								profilePicture: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		res.status(200).json(posts);
	} catch (error) {
		console.error("Error in getFeedPosts controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
export const createPost = async (req: Request, res: Response) => {
	try {
		const { content, image } = req.body;
		const user = req.user as any;
		let imageUrl = null;

		if (image) {
			const imgResult = await cloudinary.uploader.upload(image);
			imageUrl = imgResult.secure_url;
		}

		const newPost = await prismaClient.prisma.post.create({
			data: {
				authorId: user.id,
				content,
				image: imageUrl,
			},
		});

		res.status(201).json(newPost);
	} catch (error) {
		console.error("Error in createPost controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deletePost = async (req: Request, res: Response) => {
	try {
		const postId = req.params.id;
		const userId = (req.user as User).id;

		const post = await prismaClient.prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			res.status(404).json({ message: "Post not found" });
			return;
		}

		if (post.authorId !== userId) {
			res.status(403).json({
				message: "You are not authorized to delete this post",
			});
			return;
		}

		if (post.image) {
			await cloudinary.uploader.destroy(
				post.image.split("/").pop()?.split(".")[0] as string
			);
		}

		await prismaClient.prisma.post.delete({
			where: { id: postId },
		});

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error: any) {
		console.log("Error in delete post controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPostById = async (req: Request, res: Response) => {
	try {
		const postId = req.params.id;
		const post = await prismaClient.prisma.post.findUnique({
			where: { id: postId },
			include: {
				author: {
					select: {
						name: true,
						username: true,
						profilePicture: true,
						headline: true,
					},
				},
				comments: {
					include: {
						user: {
							select: {
								name: true,
								profilePicture: true,
								username: true,
								headline: true,
							},
						},
					},
				},
			},
		});

		res.status(200).json(post);
	} catch (error) {
		console.error("Error in getPostById controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const createComment = async (req: Request, res: Response) => {
	try {
		const postId = req.params.id;
		const { content } = req.body;
		const user = req.user as any;

		const post = await prismaClient.prisma.post.update({
			where: { id: postId },
			data: {
				comments: {
					create: {
						userId: user.id,
						content,
					},
				},
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						username: true,
						headline: true,
						profilePicture: true,
					},
				},
				comments: {
					include: {
						user: {
							select: {
								name: true,
								profilePicture: true,
							},
						},
					},
				},
			},
		});

		if (post.author.id !== user.id) {
			const newNotification =
				await prismaClient.prisma.notification.create({
					data: {
						recipientId: post.author.id,
						type: "COMMENT",
						relatedUserId: user.id,
						relatedPostId: postId,
					},
				});

			try {
				const postUrl = process.env.CLIENT_URL + "/post/" + postId;
				await sendCommentNotificationEmail(
					post.author.email,
					post.author.name,
					user.name,
					postUrl,
					content
				);
			} catch (error) {
				console.log(
					"Error in sending comment notification email:",
					error
				);
			}
		}

		res.status(200).json(post);
	} catch (error) {
		console.error("Error in createComment controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const likePost = async (req: Request, res: Response) => {
	try {
		const postId = req.params.id;
		const userId = (req.user as User).id;

		const post = await prismaClient.prisma.post.findUnique({
			where: { id: postId },
			include: {
				likes: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!post) {
			res.status(404).json({ message: "Post not found" });
			return;
		}

		const isLiked = post.likes.some((like) => like.id === userId);

		if (isLiked) {
			await prismaClient.prisma.post.update({
				where: {
					id: postId,
				},
				data: {
					likes: {
						disconnect: {
							id: userId,
						},
					},
				},
			});
		} else {
			await prismaClient.prisma.post.update({
				where: {
					id: postId,
				},
				data: {
					likes: {
						connect: {
							id: userId,
						},
					},
				},
			});

			if (post.authorId !== userId) {
				await prismaClient.prisma.notification.create({
					data: {
						recipientId: post.authorId,
						type: "LIKE",
						relatedUserId: userId,
						relatedPostId: postId,
					},
				});
			}
		}

		const updatedPost = await prismaClient.prisma.post.findUnique({
			where: { id: postId },
			include: {
				likes: true,
			},
		});

		res.status(200).json(updatedPost);
	} catch (error) {
		console.error("Error in likePost controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
