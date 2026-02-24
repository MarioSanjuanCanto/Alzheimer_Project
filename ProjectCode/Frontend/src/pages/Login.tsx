import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisibilityIcon } from "@/assets/icons/visibility_icon";
import { VisibilityOffIcon } from "@/assets/icons/visibility_off_icon";
import { loginUser } from "@/api/auth";
import { useTranslation } from "react-i18next";
import CloseButton from "@/components/ui/close-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/loginSchema";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inviteToken = params.get("inviteToken");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const hasAuthError = Boolean(loginError);

  const handleLogin = async (data: LoginFormData) => {
    setLoginError(null);

    try {
      await loginUser({
        email: data.email,
        password: data.password,
        inviteToken,
      });
      window.location.href = "/";
    } catch {
      setLoginError(t("validation.login.invalidCredentials"));
    }
  };

  return (
    <div className="page-padding min-h-screen bg-white lg:bg-bggreen flex items-center justify-center">
      <div className="hidden lg:block">
        <BackgroundDesktop />
        {/* blur overlay */}
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-md" />
      </div>

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
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col w-full h-full"
        >
          <div>
            <h1 className="font-fraunces text-4xl md:text-5xl font-bold text-primary text-center pt-10 mb-2">
              {t("auth.signInTitle")}
            </h1>

            <p className="text-darkgrey text-xl font-thin md:font-normal mb-6 text-center">
              {t("auth.signInSubtitle")}
            </p>
            <div>
              <div className="space-y-6">
                {/* EMAIL */}
                <div>
                  <Label
                    htmlFor="email"
                    className={`text-xl text-primary ${
                      errors.email || hasAuthError ? "text-red" : ""
                    }`}
                  >
                    {t("auth.form.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    aria-invalid={!!errors.email || hasAuthError}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email", {
                      onChange: () => setLoginError(null),
                    })}
                    placeholder={t("auth.form.placeholders.email")}
                    className={`mt-2 h-14 rounded-full ${
                      errors.email || hasAuthError
                        ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
                        : ""
                    }`}
                  />

                  {errors.email?.message && (
                    <p id="email-error" className="text-red font-light pt-1">
                      {t(`validation.login.${errors.email.message}`)}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Label
                    htmlFor="password"
                    className={`text-xl text-primary${
                      errors.password || hasAuthError ? "text-red" : ""
                    }`}
                  >
                    {t("auth.form.password")}
                  </Label>

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={!!errors.password || hasAuthError}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password", {
                      onChange: () => setLoginError(null),
                    })}
                    placeholder={t("auth.form.placeholders.password")}
                    className={`mt-2 h-14 pr-12 rounded-full ${
                      errors.password || hasAuthError
                        ? "border-red focus-visible:!ring-red focus-visible:!ring-offset-0"
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
                    className="absolute right-4 top-[3.25rem]"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    ) : (
                      <VisibilityIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>

                  {errors.password?.message && (
                    <p id="password-error" className="text-red font-light pt-1">
                      {t(`validation.login.${errors.password.message}`)}
                    </p>
                  )}
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="text-primary text-xl font-thin inline-block mt-2 hover:underline"
              >
                {t("auth.login.forgotPassword")}
              </Link>
              {/* AUTH ERROR */}
              {loginError && (
                <div className="text-red text-xl text-center mt-4 lg:mt-2">
                  {loginError}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 lg:mt-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-full bg-primary text-white text-xl font-medium disabled:opacity-50"
            >
              {t("buttons.signIn")}
            </button>

            <p className="text-center text-darkgrey mt-1">
              {t("auth.login.noAccountYet")}{" "}
              <Link to="/register" className="text-primary underline">
                {t("auth.login.createOne")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
