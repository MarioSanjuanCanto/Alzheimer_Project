import { z } from "zod";

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "oldPasswordRequired"),
    newPassword: z
      .string()
      .min(1, "newPasswordRequired")
      .min(8, "newPasswordMinLength")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[0-9]/, "passwordNumber"),
    confirmPassword: z.string().min(1, "confirmPasswordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsMustMatch",
    path: ["confirmPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
