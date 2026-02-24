import { useState } from "react";
import { handleForgotPassword } from "@/api/handleForgotPassword";
import BackgroundDesktop from "../ui/backgroundDesktop";
import { Input } from "../ui/input";
import CloseButton from "../ui/close-button";
import BackButton from "../ui/back-button";
import { Label } from "../ui/label";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    try {
      await handleForgotPassword(email);
      setSent(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (sent) {
    return (
      <div className="h-screen bg-bggreen flex items-center justify-center px-4 overflow-hidden">
        <BackgroundDesktop />
        <div className="hidden lg:block absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-lg" />
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
          <h1 className="font-fraunces text-primary text-4xl text-center">
            Check your email for a password reset link.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white lg:bg-bggreen flex items-center justify-center px-4 overflow-hidden">
      <div className="hidden lg:block">
        <BackgroundDesktop />
      </div>
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-lg" />

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
        <BackButton />
        {/* Text */}
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="font-fraunces text-primary font-bold text-4xl mb-2">
            {t("auth.forgotPassword.title")}
          </h1>

          <p className="text-darkgrey text-xl font-thin md:font-normal mb-6 text-center max-w-[26rem]">
            {t("auth.forgotPassword.description")}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex w-full max-w-md flex-col items-center gap-4"
          noValidate
        >
          <Label htmlFor="reset-email" className="sr-only">
            {t("auth.forgotPassword.placeholder")}
          </Label>

          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.forgotPassword.placeholder")}
            className="w-full h-14 rounded-lg"
          />

          <button type="submit" className="button-primary button-sm">
            {t("buttons.sendReset")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
