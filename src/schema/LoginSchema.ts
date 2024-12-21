import { z } from "zod";

export const PasswordValidationSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character"
  );

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email").min(1),
  password: PasswordValidationSchema,
});

export type LoginValues = z.infer<typeof LoginSchema>;