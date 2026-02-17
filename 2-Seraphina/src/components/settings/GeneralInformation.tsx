import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";

const GeneralInformation = ({ user }) => {
  const { t } = useTranslation();

  return (
    <form>
      <h3 id="general-info-label" className="text-black text-2xl font-semibold">
        {t("settings.generalInformation.title")}
      </h3>

      <p id="general-info-hint" className="text-black text-xl pb-4 lg:pb-8">
        {t("settings.generalInformation.description")}
      </p>

      <Textarea
        id="description"
        aria-labelledby="general-info-label"
        aria-describedby="general-info-hint"
        placeholder={t("settings.generalInformation.placeholder")}
        className="h-44 py-4 px-4 text-xl text-input font-light rounded-md w-full resize-none mb-4 md:mb-6"
      />

      <div className="flex justify-end">
        <button type="submit" className="button-primary button-sm">
          {t("buttons.saveChanges")}
        </button>
      </div>
    </form>
  );
};

export default GeneralInformation;
