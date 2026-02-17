import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InviteUserProps {
  prevStep: () => void;
  isSubmitting: boolean;
}

export const InviteUser = ({ prevStep, isSubmitting }: InviteUserProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <p className="font-fraunces text-center text-primary font-bold text-3xl mb-6">
          {t("auth.linkSupportPerson.title")}
        </p>
        <div className="space-y-2">
          <Label className="text-primary text-xl">{t("auth.linkSupportPerson.emailLabel")}</Label>
          <Input type="email" placeholder={t("auth.linkSupportPerson.emailPlaceholder")} className="h-14 rounded-full" />
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button type="button" onClick={prevStep} className="w-1/2 button button-sm">{t("buttons.back")}</button>
        <button type="submit" disabled={isSubmitting} className="w-1/2 button-primary">
          {isSubmitting ? t("buttons.creatingAccount") : t("buttons.createAccount")}
        </button>
      </div>
    </div>
  );
};