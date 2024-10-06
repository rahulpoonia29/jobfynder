import { Address, MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
if (!TOKEN) {
	throw new Error("Mailtrap token not found");
}

export const mailtrapClient = new MailtrapClient({
	token: TOKEN,
});

export const sender = {
	email: process.env.EMAIL_FROM as Address["email"],
	name: process.env.EMAIL_FROM_NAME as Address["name"],
};
