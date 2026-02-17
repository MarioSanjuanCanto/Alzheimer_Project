import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisibilityIcon } from "@/assets/icons/visibility_icon";
import { VisibilityOffIcon } from "@/assets/icons/visibility_off_icon";
import { registerUser } from "../api/auth";
import { useTranslation } from "react-i18next";
import CloseButton from "@/components/ui/close-button";
import { registerSchema, RegisterFormData } from "@/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";

const Register = () => {
  const { t } = useTranslation();
  // Step handling
  const [currentStep, setCurrentStep] = useState(1);
  // Form state
  const [selectedRole, setSelectedRole] = useState<"user" | "admin" | null>(
    null
  );

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inviteToken = params.get("inviteToken");
  const roleFromUrl = params.get("role") as "user" | "admin" | null;
  const isRoleLocked = !!roleFromUrl;
  const [searchParams] = useSearchParams();
  const currentParams = searchParams.toString();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      selectedRole: roleFromUrl || null,
      inviteToken,
    },
  });

  useEffect(() => {
    if (roleFromUrl === "user" || roleFromUrl === "admin") {
      setSelectedRole(roleFromUrl);
      setValue("selectedRole", roleFromUrl, { shouldValidate: true });
    }
  }, [roleFromUrl, setValue]);

  const nextStep = () => {
    setCurrentStep((s) => {
      if (s === 2 && selectedRole !== "admin") {
        return 2;
      }
      return Math.min(s + 1, 3);
    });
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const handleRegister = async (data: RegisterFormData) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await registerUser({
        email: data.email,
        password: data.password,
        selectedRole: data.selectedRole as "user" | "admin",
        full_name: data.fullName,
        inviteToken,
        linkEmail: data.linkEmail,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndContinue = async () => {
    const valid = await trigger([
      "fullName",
      "email",
      "password",
      "confirmPassword",
    ]);

    if (valid) {
      nextStep();
    }
  };

  const canContinue =
    !errors.fullName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  return (
    <section className="page-padding relative min-h-screen bg-white lg:bg-bggreen flex items-center justify-center overflow-x-hidden">
      <div className="hidden lg:block">
        <BackgroundDesktop />
        {/* blur overlay */}
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-md" />
      </div>

      {/* CARD */}
      <div
        className="
        lg:relative
        bg-white lg:rounded-md
        w-full lg:max-w-2xl
        lg:h-[calc(100vh-4rem)]
        lg:max-h-[48rem]
        lg:min-h-[40rem]
        overflow-y-auto
        flex flex-col
        lg:p-8
        "
      >
        <CloseButton to="/" />

        <form
          onSubmit={handleSubmit(handleRegister)}
          className="flex-1 flex flex-col w-full h-full"
        >
          {currentStep === 1 && (
            <div className="flex flex-col h-full flex-1">
              {/* Header */}

              <div>
                <h1 className="font-fraunces text-4xl md:text-5xl font-bold text-primary text-center pt-10 mb-2">
                  {t("auth.createAccountTitle")}
                </h1>

                <p className="text-darkgrey text-xl font-thin md:font-normal mb-6 text-center">
                  {t("auth.welcomeChooseRole")}
                </p>
              </div>

              {/* Role selection – this grows */}

              <div className="flex flex-col flex-1 justify-center gap-4">
                {/* USER BUTTON */}

                <button
                  type="button"
                  disabled={isRoleLocked}
                  onClick={() => {
                    setSelectedRole("user");

                    setValue("selectedRole", "user", { shouldValidate: true });
                  }}
                  className={`flex-1 p-6 rounded-2xl border-2 transition text-center ${
                    selectedRole === "user"
                      ? "bg-bggreen border-bggreen"
                      : `border-gray-300 ${
                          !isRoleLocked ? "hover:border-primary" : ""
                        }`
                  } ${
                    isRoleLocked && selectedRole !== "user"
                      ? "opacity-40 grayscale cursor-not-allowed"
                      : ""
                  }`}
                >
                  <h2 className="text-xl md:text-2xl lg:text-xl font-semibold md:font-medium mb-1">
                    {t("auth.userAccount.title")}
                  </h2>

                  <p className="text-md md:text-xl font-light text-darkgray">
                    {t("auth.userAccount.description")}
                  </p>
                </button>

                {/* ADMIN BUTTON */}

                <button
                  type="button"
                  disabled={isRoleLocked}
                  onClick={() => {
                    setSelectedRole("admin");

                    setValue("selectedRole", "admin", { shouldValidate: true });
                  }}
                  className={`flex-1 p-6 rounded-2xl border-2 transition text-center ${
                    selectedRole === "admin"
                      ? "bg-bggreen border-bggreen"
                      : `border-gray-300 ${
                          !isRoleLocked ? "hover:border-primary" : ""
                        }`
                  } ${
                    isRoleLocked && selectedRole !== "admin"
                      ? "opacity-40 grayscale cursor-not-allowed"
                      : ""
                  }`}
                >
                  <h2 className="text-xl md:text-2xl lg:text-xl font-semibold md:font-medium mb-1">
                    {t("auth.supporterAccount.title")}
                  </h2>

                  <p className="text-md md:text-xl font-light text-darkgray">
                    {t("auth.supporterAccount.description")}
                  </p>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!selectedRole}
                  className="w-full button-primary mt-6 button-sm disabled:opacity-50"
                >
                  {t("buttons.continue")}
                </button>

                <p className="flex flex-col md:flex-row gap-2 justify-center text-center text-darkgrey mt-1">
                  {t("auth.alreadyHaveAccount")}

                  <Link
                    to={`/login${currentParams ? `?${currentParams}` : ""}`}
                    className="text-primary underline"
                  >
                    {t("buttons.signIn")}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 — ACCOUNT DETAILS */}

          {currentStep === 2 && (
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="lg:hidden mb-4">
                <h1 className="font-fraunces text-4xl md:text-5xl font-bold text-primary text-center pt-10">
                  {t("auth.createAccountTitle")}
                </h1>
              </div>

              {/* FORM FIELDS */}
              <div className="space-y-4 my-auto">
                {/* Full name */}
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
                    aria-invalid={!!errors.fullName}
                    aria-describedby={
                      errors.fullName ? "fullName-error" : undefined
                    }
                    placeholder={t("auth.form.placeholders.fullName")}
                    className={`mt-2 h-14 pr-12 rounded-full${
                      errors.fullName
                        ? "border-red focus-visible:!ring-red"
                        : ""
                    }`}
                  />

                  {errors.fullName?.message && (
                    <p
                      id="fullName-error"
                      className="text-red font-light pt-1 text-xl"
                    >
                      {t(`validation.register.${errors.fullName.message}`)}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className={`text-xl text-primary ${
                      errors.email ? "text-red" : ""
                    }`}
                  >
                    {t("auth.form.email")}
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    placeholder={t("auth.form.placeholders.email")}
                    className={`mt-2 h-14 pr-12 rounded-full${
                      errors.email ? "border-red focus-visible:!ring-red" : ""
                    }`}
                  />

                  {errors.email?.message && (
                    <p
                      id="email-error"
                      className="text-red font-light pt-1 text-xl"
                    >
                      {t(`validation.register.${errors.email.message}`)}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Label
                    htmlFor="password"
                    className={`text-xl text-primary ${
                      errors.password ? "text-red" : ""
                    }`}
                  >
                    {t("auth.form.password")}
                  </Label>

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    placeholder={t("auth.form.placeholders.password")}
                    className={`mt-2 h-14 pr-12 rounded-full ${
                      errors.password
                        ? "border-red focus-visible:!ring-red"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? t("auth.form.hidePassword")
                        : t("auth.form.showPassword")
                    }
                    className="absolute right-4 top-[3.25rem] text-gray-500"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon
                        aria-hidden="true"
                        className="h-6 w-6"
                      />
                    ) : (
                      <VisibilityIcon aria-hidden="true" className="h-6 w-6" />
                    )}
                  </button>

                  {errors.password?.message && (
                    <p
                      id="password-error"
                      className="text-red font-light pt-1 text-xl"
                    >
                      {t(`validation.register.${errors.password.message}`)}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <Label
                    htmlFor="confirmPassword"
                    className={`text-xl text-primary ${
                      errors.confirmPassword ? "text-red" : ""
                    }`}
                  >
                    {t("auth.form.confirmPassword")}
                  </Label>

                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    placeholder={t("auth.form.placeholders.confirmPassword")}
                    className={`mt-2 h-14 pr-12 rounded-full ${
                      errors.confirmPassword
                        ? "border-red focus-visible:!ring-red"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? t("auth.form.hideConfirmPassword")
                        : t("auth.form.showConfirmPassword")
                    }
                    className="absolute right-4 top-[3.25rem] text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon
                        aria-hidden="true"
                        className="h-6 w-6"
                      />
                    ) : (
                      <VisibilityIcon aria-hidden="true" className="h-6 w-6" />
                    )}
                  </button>

                  {errors.confirmPassword?.message && (
                    <p
                      id="confirmPassword-error"
                      className="text-red font-light pt-1 text-xl"
                    >
                      {t(
                        `validation.register.${errors.confirmPassword.message}`
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* BUTTONS — visually hidden but space preserved */}
              <div
                className={`
                  flex gap-4 mt-8
                  transition-all duration-300 ease-out
                  ${
                    canContinue
                      ? "opacity-100 translate-y-0 max-h-40"
                      : "opacity-0 -translate-y-2 max-h-0 pointer-events-none"
                  }
                `}
                aria-hidden={!canContinue}
              >
                <button
                  type="button"
                  onClick={prevStep}
                  tabIndex={canContinue ? 0 : -1}
                  className="w-1/2 button-sm button-invisible bg-lightgrey lg:bg-none"
                >
                  {t("buttons.back")}
                </button>

                <button
                  type={selectedRole === "admin" ? "button" : "submit"}
                  onClick={
                    selectedRole === "admin" ? validateAndContinue : undefined
                  }
                  disabled={isSubmitting}
                  tabIndex={canContinue ? 0 : -1}
                  className="w-1/2 button-primary button-sm"
                >
                  {isSubmitting
                    ? t("buttons.submitting")
                    : selectedRole === "admin"
                    ? t("buttons.continue")
                    : t("buttons.createAccount")}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — LINK SUPPORT PERSON */}
          {currentStep === 3 && selectedRole === "admin" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col justify-center space-y-8">
                <div className="flex flex-col items-center space-y-1">
                  <h1
                    id="link-support-title"
                    className="font-fraunces text-primary font-bold text-4xl text-center"
                  >
                    {t("auth.linkSupportPerson.title")}
                  </h1>
                  <span className="text-xl font-light text-primary/70">
                    ({t("auth.linkSupportPerson.optional")})
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col ">
                    <Label htmlFor="linkEmail" className="text-xl text-primary">
                      {t("auth.linkSupportPerson.emailLabel")}
                    </Label>
                    <span className="text-xl font-thin text-darkgrey">
                      {t("auth.linkSupportPerson.emailHint")}
                    </span>
                  </div>
                  <Input
                    id="linkEmail"
                    type="email"
                    {...register("linkEmail")}
                    aria-labelledby="link-support-title"
                    placeholder={t("auth.linkSupportPerson.emailPlaceholder")}
                    className="h-14 rounded-full"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 button-invisible button-sm bg-lightgrey lg:bg-none"
                >
                  {t("buttons.back")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 button-primary button-sm ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting
                    ? t("buttons.creatingAccount")
                    : t("buttons.createAccount")}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Register;
