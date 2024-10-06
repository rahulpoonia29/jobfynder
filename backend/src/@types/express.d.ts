import { User, Connection } from "@prisma/client";

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}
