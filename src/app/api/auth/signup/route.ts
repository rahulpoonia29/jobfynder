import prisma from "@/lib/prisma";
import { AuthCredentialSchema } from "@/schema/AuthCredentialSchema";
import handleRoute from "@/server/handleAPIRoute";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@/server/handleRouteResponse";
import bcrypt from "bcryptjs";

export const POST = handleRoute(async (req) => {
  const requestData = await req.json();

  const data = AuthCredentialSchema.parse(requestData);

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return sendErrorResponse({
      message: "User already exists",
    });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  await prisma.user.create({
    data: {
      email: data.email,
      hashedPassword,
    },
  });

  return sendSuccessResponse({
    message: "User created successfully",
  });
});
