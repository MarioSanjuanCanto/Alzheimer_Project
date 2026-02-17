import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { updatePassword } from "@/api/handleUpdatePassword";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, PasswordFormData } from "@/schemas/myPasswordSchema";
import { useState } from "react";
import { VisibilityOffIcon } from "@/assets/icons/visibility_off_icon";
import { VisibilityIcon } from "@/assets/icons/visibility_icon";

const ChangePassword = ({ currentProfile, disabled }) => {
  const { t } = useTranslation();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await updatePassword(
        currentProfile.email,
        data.oldPassword,
        data.newPassword
      );
      alert(t("settings.security.passwordUpdated"));
      reset();
      setShowPasswordForm(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <section>
      <h3 className="pb-2 text-2xl font-semibold text-black">
        {t("settings.security.changePassword")}
      </h3>

      {!showPasswordForm && (
        <button
          type="button"
          className={`mt-4 button-sm ${
            disabled ? "button-disabled" : "button-primary"
          }`}
          onClick={() => setShowPasswordForm(true)}
          disabled={disabled}
        >
          {t("buttons.changePassword")}
        </button>
      )}

      {!showPasswordForm && disabled && (
        <p className="mt-2 text-xl text-orange">
          {t("settings.personalInformation.emailChangePassword")}
        </p>
      )}

      {showPasswordForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mt-6 space-y-6">
            {/* OLD PASSWORD */}
            <div className="relative">
              <Label
                htmlFor="oldPassword"
                className={`text-xl text-primary ${
                  errors.oldPassword ? "text-red" : ""
                }`}
              >
                {t("auth.form.oldPassword")}
              </Label>

              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                {...register("oldPassword")}
                className={`mt-2 ${
                  errors.oldPassword
                    ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
                    : ""
                }`}
              />

              <button
                type="button"
                aria-label={
                  showOldPassword
                    ? t("accessibility.hidePassword")
                    : t("accessibility.showPassword")
                }
                aria-pressed={showOldPassword}
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-[3.25rem]"
              >
                {showOldPassword ? (
                  <VisibilityOffIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <VisibilityIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              {errors.oldPassword && (
                <p className="mt-2 font-light text-red">
                  {t(`validation.changePassword.${errors.oldPassword.message}`)}
                </p>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div className="relative">
              <Label
                htmlFor="newPassword"
                className={`text-xl text-primary ${
                  errors.newPassword ? "text-red" : ""
                }`}
              >
                {t("auth.form.newPassword")}
              </Label>

              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                className={`mt-2 ${
                  errors.newPassword
                    ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
                    : ""
                }`}
              />

              <button
                type="button"
                aria-label={
                  showNewPassword
                    ? t("accessibility.hidePassword")
                    : t("accessibility.showPassword")
                }
                aria-pressed={showNewPassword}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-[3.25rem]"
              >
                {showNewPassword ? (
                  <VisibilityOffIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <VisibilityIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              {errors.newPassword && (
                <p className="mt-2 font-light text-red">
                  {t(`validation.changePassword.${errors.newPassword.message}`)}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Label
                htmlFor="confirmPassword"
                className={`text-xl font-semibold ${
                  errors.confirmPassword ? "text-red" : ""
                }`}
              >
                {t("auth.form.confirmPassword")}
              </Label>

              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`mt-2 ${
                  errors.confirmPassword
                    ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
                    : ""
                }`}
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? t("accessibility.hidePassword")
                    : t("accessibility.showPassword")
                }
                aria-pressed={showConfirmPassword}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-[3.25rem]"
              >
                {showConfirmPassword ? (
                  <VisibilityOffIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <VisibilityIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              {errors.confirmPassword && (
                <p className="mt-2 font-light text-red">
                  {t(
                    `validation.changePassword.${errors.confirmPassword.message}`
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="mt-8 button-primary button-sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("buttons.saving")
                : t("buttons.changePassword")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ChangePassword;
