import { Label } from "@/components/ui/label";
import { UploadIcon } from "@/assets/icons/upload_icon";
import { Delete } from "@/assets/icons/delete_icon";
import { useTranslation } from "react-i18next";

export const ImageStep = ({
  formData,
  handleFileChange,
  updateFormData,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in-50 slide-in-from-right-5 duration-500 flex flex-1 flex-col">
      <Label
        htmlFor="image-upload"
        className={`text-xl md:text-2xl lg:text-xl text-primary ${
          errors.image ? "text-red" : ""
        }`}
      >
        {t("create.fields.image")}
      </Label>

      <p
        id="image-hint"
        className="pb-3 text-xl font-light text-darkgrey"
      >
        {t("create.fields.imageHint")}
      </p>

      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className="sr-only"
        aria-describedby={
          errors?.image ? "image-error image-hint" : "image-hint"
        }
        aria-invalid={Boolean(errors?.image)}
        onChange={(e) => handleFileChange(e, "image")}
      />

      {/* Custom upload area */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t("create.fields.uploadImage")}
        onClick={() => document.getElementById("image-upload")?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("image-upload")?.click();
          }
        }}
        className={`relative flex min-h-0 w-full flex-1 cursor-pointer flex-col items-center justify-center
      rounded-md border-2 border-dashed bg-bgwhite transition
      ${errors?.image ? "border-red" : "border-black/30 hover:border-primary"}`}
      >
        {formData.image ? (
          <img
            src={
              formData.image instanceof File
                ? URL.createObjectURL(formData.image)
                : formData.image
            }
            alt=""
            className="absolute inset-0 h-full w-full rounded-md object-cover"
          />
        ) : (
          <>
            <UploadIcon
              className="h-12 w-12 md:h-auto md:w-24 lg:w-12 text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">{t("create.fields.uploadImage")}</span>
            <button
              type="button"
              className="mt-4 button button-secondary py-1 px-3 text-xl"
              aria-hidden="true"
              tabIndex={-1}
            >
              {t("create.fields.uploadImage")}
            </button>
          </>
        )}
      </div>

      {errors?.image && (
        <p id="image-error" className="mt-1 text-xl font-light text-red">
          {t(`validation.memoryForm.${errors.image}`)}
        </p>
      )}

      {formData.image && (
        <div className="mt-4 flex items-center justify-between rounded-sm bg-bggreen px-6 py-2 font-semibold text-primary">
          <span>{formData.image.name || t("create.fields.uploadedImage")}</span>
          <button
            type="button"
            aria-label={t("create.fields.removeImage")}
            onClick={(e) => {
              e.stopPropagation();
              updateFormData("image", null);
            }}
          >
            <Delete className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
