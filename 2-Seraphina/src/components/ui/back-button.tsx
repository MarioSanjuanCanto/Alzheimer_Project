import { ArrowLeft } from "@/assets/icons/arrow_left_icon";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BackButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 left-4 md:top-8 md:left-8 button-tertiary button-icon button-sm"
    >
      <ArrowLeft className="w-5 h-5" />
      {t("buttons.back")}
    </button>
  );
};

export default BackButton;
