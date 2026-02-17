import { z } from "zod";

export const registerSchema = z
  .object({
    selectedRole: z.string().optional().nullable(),
    fullName: z
      .string()
      .min(1, "fullNameRequired")
      .min(3, "fullNameMinLenght")
      .max(50, "fullNameMaxLength"),

    email: z
      .string()
      .min(1, "emailRequired")
      .email("emailInvalid")
      .refine((val) => val.split("@"), "emailMisstingAtSymbol"),

    password: z
      .string()
      .min(1, "passwordRequired")
      .min(8, "passwordMinLength")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[0-9]/, "passwordNumber"),

    confirmPassword: z.string().min(1, "confirmPasswordRequired"),

    inviteToken: z.string().optional().nullable(),
    linkEmail: z.string().email().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "passwordsMustMatch",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
