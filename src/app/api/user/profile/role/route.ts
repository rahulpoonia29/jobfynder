import prisma from "@/lib/prisma";
import { authenticateUser } from "@/server/authenticateUser";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@/server/handle-route-response";
import handleRoute from "@/server/handleRoutes";
import { UserRole } from "@prisma/client";
import { z } from "zod";

export async function POST(req: Request) {
  handleRoute(async () => {
    const session = await authenticateUser();

    const requestData = await req.json();
    const { role } = z
      .object({
        role: z.nativeEnum(UserRole),
      })
      .parse(requestData);

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
        email: session.user.email as string,
      },
      data: { role },
    });

    if (!user) {
      return sendErrorResponse({
        message: "User not found",
      });
    }

    return sendSuccessResponse({
      message: "User role updated successfully",
    });
  });
}
