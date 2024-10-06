import { mailtrapClient, sender } from "../lib/mailtrap";
import {
	createCommentNotificationEmailTemplate,
	createConnectionAcceptedEmailTemplate,
	createWelcomeEmailTemplate,
} from "./emailTemplates";

export const sendWelcomeEmail = async (
	email: string,
	name: string,
	profileUrl: string
) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Welcome to UnLinked",
			html: createWelcomeEmailTemplate(name, profileUrl),
			category: "welcome",
		});

		console.log("Welcome Email sent succesffully", response);
	} catch (error) {
		throw error;
	}
};

export const sendCommentNotificationEmail = async (
	recipientEmail: string,
	recipientName: string,
	commenterName: string,
	postUrl: string,
	commentContent: string
) => {
	const recipient = [{ email: recipientEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "New Comment on Your Post",
			html: createCommentNotificationEmailTemplate(
				recipientName,
				commenterName,
				postUrl,
				commentContent
			),
			category: "comment_notification",
		});
		console.log("Comment Notification Email sent successfully", response);
	} catch (error) {
		throw error;
	}
};

export const sendConnectionAcceptedEmail = async (
	senderEmail: string,
	senderName: string,
	recipientName: string,
	profileUrl: string
) => {
	const recipient = [{ email: senderEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: `${recipientName} accepted your connection request`,
			html: createConnectionAcceptedEmailTemplate(
				senderName,
				recipientName,
				profileUrl
			),
			category: "connection_accepted",
		});
		console.log("Connection Accepted Email sent successfully", response);
	} catch (error) {
		console.log("Error sending Connection Accepted Email", error);
	}
};
