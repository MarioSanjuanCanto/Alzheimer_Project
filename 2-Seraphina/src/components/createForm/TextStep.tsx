import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";

export const TextStep = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in-50 slide-in-from-right-5 duration-500">
      {/* TITLE */}
      <div className="flex items-center shrink-0">
        <Label
          htmlFor="title"
          className={`text-xl md:text-2xl lg:text-xl text-primary ${
            errors?.title ? "text-red" : "text-primary lg:text-black"
          }`}
        >
          {t("create.fields.title")}
        </Label>
      </div>

      <p
        id="title-hint"
        className="shrink-0 pb-2 text-xl font-light text-darkgrey"
      >
        {t("create.fields.titleHint")}
      </p>

      <Input
        id="title"
        aria-describedby={`title-hint${errors?.title ? " title-error" : ""}`}
        aria-invalid={Boolean(errors?.title)}
        placeholder={t("create.fields.titlePlaceholder")}
        value={formData.title}
        onChange={(e) => updateFormData("title", e.target.value)}
        className={`h-14 w-full shrink-0 rounded-full px-4 py-4 text-xl font-light
        ${
          errors?.title
            ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
            : ""
        }
      `}
      />

      {errors?.title && (
        <p id="title-error" role="alert" className="mt-2 font-light text-red">
          {t(`validation.memoryForm.${errors.title}`)}
        </p>
      )}

      {/* DESCRIPTION */}
      <div className="mt-8 flex items-center shrink-0">
        <Label
          htmlFor="description"
          className={`text-xl md:text-2xl lg:text-xl text-primary ${
            errors?.description ? "text-red" : "text-primary lg:text-black"
          }`}
        >
          {t("create.fields.description")}
        </Label>
      </div>

      <p
        id="description-hint"
        className="mb-2 shrink-0 text-xl font-light text-darkgrey"
      >
        {t("create.fields.descriptionHint")}
      </p>

      <Textarea
        id="description"
        aria-describedby={`description-hint${
          errors?.description ? " description-error" : ""
        }`}
        aria-invalid={Boolean(errors?.description)}
        placeholder={t("create.fields.descriptionPlaceholder")}
        value={formData.description}
        onChange={(e) => updateFormData("description", e.target.value)}
        className={`min-h-0 w-full flex-1 resize-none rounded-md px-4 py-4 text-xl font-light text-input
        ${
          errors?.description
            ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
            : ""
        }
      `}
      />

      {errors?.description && (
        <p
          id="description-error"
          role="alert"
          className="mt-2 font-light text-red"
        >
          {t(`validation.memoryForm.${errors.description}`)}
        </p>
      )}
    </div>
  );
};
