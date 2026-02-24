import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import ChangePassword from "./ChangePassword";
import BackButton from "../ui/back-button";
import { useTranslation } from "react-i18next";
import { updateAdminProfile } from "@/api/handleUpdateAdminProfile";
import DeleteAccount from "./DeleteAccount";
import { useForm } from "react-hook-form";
import { myProfileSchema } from "@/schemas/myProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";

const MyProfileSettings = ({ currentProfile }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(currentProfile.fullName);
  const [email, setEmail] = useState(currentProfile.email);
  const [saving, setSaving] = useState(false);
  const [emailChangePending, setEmailChangePending] = useState(
    currentProfile.email !== currentProfile.authEmail
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(myProfileSchema),
    defaultValues: {
      fullName: currentProfile.fullName,
      email: currentProfile.email,
    },
  });

  const onSubmit = async (data) => {
    await updateAdminProfile({
      adminId: currentProfile.id,
      ...data,
    });

    if (data.email !== currentProfile.authEmail) {
      setEmailChangePending(true);
    }
  };

  const handleCancelEmailChange = async () => {
    try {
      setSaving(true);

      await updateAdminProfile({
        adminId: currentProfile.id,
        fullName: currentProfile.fullName,
        email: currentProfile.authEmail,
      });

      reset({
        fullName: currentProfile.fullName,
        email: currentProfile.authEmail,
      });

      setEmailChangePending(false);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel email change.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="block lg:hidden">
        <BackButton />
      </div>
      {/* Main Container with Dividers */}
      <div className="divide-y divide-lightgrey">
        {/* SECTION 1: Personal Information Form */}
        <div className="py-8 lg:py-10 first:pt-0">
          <h3 className="text-black text-2xl font-semibold pb-6">
            {t("settings.personalInformation.personalInformation")}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-6">
              {/* Full Name Field */}
              <div>
                <Label
                  htmlFor="fullName"
                  className={`text-xl text-primary ${
                    errors.fullName ? "text-red" : ""
                  }`}
                >
                  {t("auth.form.fullName")}
                </Label>

                <Input
                  id="fullName"
                  {...register("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                  className={`mt-2 ${
                    errors.fullName ? "border-red focus-visible:!ring-red" : ""
                  }`}
                />

                {errors.fullName?.message && (
                  <p id="fullName-error" className="pt-2 font-light text-red">
                    {t(`validation.myProfile.${errors.fullName.message}`)}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className={`text-xl font-semibold ${
                    errors.email ? "text-red" : ""
                  }`}
                >
                  {t("auth.form.email")}
                </Label>

                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`mt-2 ${
                    errors.email ? "border-red ring-1 ring-red" : ""
                  }`}
                />

                {errors.email?.message && (
                  <p id="email-error" className="pt-2 font-light text-red">
                    {t(`validation.myProfile.${errors.email.message}`)}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || emailChangePending}
              className={`mt-6 button-sm ${
                emailChangePending ? "button-disabled" : "button-primary"
              }`}
            >
              {isSubmitting
                ? t("buttons.saving")
                : emailChangePending
                ? t("settings.personalInformation.emailPending")
                : t("buttons.saveChanges")}
            </button>

            {emailChangePending && (
              <div className="mt-4 rounded-xl bg-orange/10 p-4">
                <p className="text-xl text-orange">
                  {t("settings.personalInformation.emailChangedDirections")}
                </p>

                <button
                  type="button"
                  onClick={handleCancelEmailChange}
                  disabled={saving}
                  className="mt-2 text-lg text-primary underline disabled:opacity-50"
                >
                  {t("buttons.cancelEmailChange")}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* SECTION 2: Change Password */}
        <div className="py-10">
          <ChangePassword
            currentProfile={currentProfile}
            disabled={emailChangePending}
          />
        </div>

        {/* SECTION 3: Delete Account */}
        <div>
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
};

export default MyProfileSettings;
