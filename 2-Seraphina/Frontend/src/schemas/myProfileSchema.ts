import { z } from "zod";

export const myProfileSchema = z.object({
  fullName: z.string().min(1, "fullNameRequired").min(4, "fullNameMinLength").max(50, "fullNameMaxLength"),
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
});

export type MyProfileFormData = z.infer<typeof myProfileSchema>;
