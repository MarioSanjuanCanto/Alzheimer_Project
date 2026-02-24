import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VisibilityIcon } from "@/assets/icons/visibility_icon";
import { VisibilityOffIcon } from "@/assets/icons/visibility_off_icon";
import { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";

interface AccountDetailsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  isValid: boolean;
  prevStep: () => void;
  nextStep: () => void;
  isSubmitting: boolean;
  selectedRole: string | null;
}

export const AccountDetails = ({ register, errors, isValid, prevStep, nextStep, isSubmitting, selectedRole }: AccountDetailsProps) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="lg:hidden mb-6">
        <h1 className="font-fraunces text-4xl font-bold text-primary text-center">{t("auth.createAccountTitle")}</h1>
      </div>

      <div className="space-y-6 my-auto">
        {/* Full Name */}
        <div>
          <Label className={`text-xl text-primary ${errors.fullName ? "text-red" : ""}`}>{t("auth.form.fullName")}</Label>
          <Input {...register("fullName")} placeholder={t("auth.form.placeholders.fullName")} className={`mt-2 ${errors.fullName ? "border-red" : ""}`} />
          {errors.fullName && <p className="text-red pt-2 text-sm">{t(`validation.register.${errors.fullName.message}`)}</p>}
        </div>

        {/* Email */}
        <div>
          <Label className={`text-xl text-primary ${errors.email ? "text-red" : ""}`}>{t("auth.form.email")}</Label>
          <Input type="email" {...register("email")} placeholder={t("auth.form.placeholders.email")} className={`mt-2 ${errors.email ? "border-red" : ""}`} />
          {errors.email && <p className="text-red pt-2 text-sm">{t(`validation.register.${errors.email.message}`)}</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <Label className={`text-xl text-primary ${errors.password ? "text-red" : ""}`}>{t("auth.form.password")}</Label>
          <Input type={showPass ? "text" : "password"} {...register("password")} className="mt-2 h-14 pr-12 rounded-full" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[3.25rem] text-gray-500">
            {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Label className={`text-xl text-primary ${errors.confirmPassword ? "text-red" : ""}`}>{t("auth.form.confirmPassword")}</Label>
          <Input type={showConfirm ? "text" : "password"} {...register("confirmPassword")} className="mt-2 pr-12" />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-[3.25rem] text-gray-500">
            {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
      </div>

      {isValid && (
        <div className="flex gap-4 pt-8 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button type="button" onClick={prevStep} className="w-1/2 button-sm border rounded-full py-3">{t("buttons.back")}</button>
          <button type={selectedRole === "admin" ? "button" : "submit"} onClick={selectedRole === "admin" ? nextStep : undefined} className="w-1/2 button-primary button-sm">
            {isSubmitting ? t("buttons.submitting") : selectedRole === "admin" ? t("buttons.continue") : t("buttons.createAccount")}
          </button>
        </div>
      )}
    </div>
  );
};