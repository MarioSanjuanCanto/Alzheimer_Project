import { handleResetPassword } from "@/api/handleResetPassword";
import { useState } from "react";
import BackgroundDesktop from "../ui/backgroundDesktop";
import { useNavigate } from "react-router-dom";
import CloseButton from "../ui/close-button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTranslation } from "react-i18next";
import { VisibilityOffIcon } from "@/assets/icons/visibility_off_icon";
import { VisibilityIcon } from "@/assets/icons/visibility_icon";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    try {
      await handleResetPassword(password);
      navigate("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen bg-white lg:bg-bggreen flex items-center justify-center px-4 overflow-hidden">
      <div className="hidden lg:block">
        <BackgroundDesktop />
      </div>
      <section className="hidden lg:block absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-lg" />

      <div
        className="
          lg:relative
          flex flex-col items-center justify-center
          bg-white lg:rounded-md
          w-full lg:max-w-2xl
          lg:h-[calc(100vh-4rem)]
          lg:max-h-[48rem]
          lg:min-h-[40rem]
          flex flex-col
          lg:p-8
        "
      >
        <CloseButton back />
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="font-fraunces text-primary font-bold text-4xl mb-2">
            {t("auth.resetPassword.title")}
          </h1>

          <p className="text-darkgrey text-xl font-thin md:font-normal mb-6 text-center max-w-[26rem]">
            {t("auth.resetPassword.description")}
          </p>
        </div>
        <form
          className="flex w-full max-w-md flex-col items-center gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleReset();
          }}
          noValidate
        >
          <div className="relative">
            <Label htmlFor="new-password" className="sr-only">
              {t("auth.resetPassword.placeholder")}
            </Label>

            <Input
              id="new-password"
              name="new-password"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.resetPassword.placeholder")}
              className="rounded-lg h-14 pr-12"
              autoComplete="new-password"
              spellCheck={false}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t("auth.form.hidePassword")
                  : t("auth.form.showPassword")
              }
              className="absolute inset-y-0 right-4 flex items-center"
            >
              {showPassword ? (
                <VisibilityOffIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <VisibilityIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          <button type="submit" className="button-primary button-sm">
            {t("buttons.resetPassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
