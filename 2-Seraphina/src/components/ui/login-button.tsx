import { LoginIcon } from "@/assets/icons/login-icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function LoginButton() {
  const { t } = useTranslation();
  return (
    <Link to="/login" className="z-20 bg-white text-2xl text-primary hover:bg-primary/15 button-icon button-sm z-30 transition-transform duration-300 ease-out">
      <LoginIcon className="h-5 w-5" />
      {t("buttons.signIn")}
    </Link>
  );
}
