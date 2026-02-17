import { z } from "zod";

export const createMemorySchema = z.object({
  image: z.union([z.instanceof(File), z.string().min(1)], {
    errorMap: () => ({ message: "imageRequired" }),
  }),

  title: z
    .string()
    .trim()
    .min(1, "titleRequired")
    .min(3, "titleMinLength")
    .max(60, "titleMaxLength"),

  description: z
    .string()
    .trim()
    .min(1, "descriptionRequired")
    .min(10, "descriptionMinLength")
    .max(2489, "descriptionMaxLength"),

  audio: z.any().optional(),
});

export const imageStepSchema = createMemorySchema.pick({
  image: true,
});

export const textStepSchema = createMemorySchema.pick({
  title: true,
  description: true,
});

export type MemoryFormData = z.infer<typeof createMemorySchema>;
