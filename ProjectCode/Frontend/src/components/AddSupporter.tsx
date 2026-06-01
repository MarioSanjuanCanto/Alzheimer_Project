import { useState } from "react";
import { handleSupporterInvite } from "@/api/handleInvite";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "react-i18next";

const AddSupporter = ({ selectedUser, currentProfile, setShowAddAdmin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  return (
    <div className="flex-1 flex flex-col p-5 bg-gray-50/80 border border-gray-100 rounded-2xl animate-in slide-in-from-top-4 duration-300">
      <Label
        htmlFor="supporter-email"
        className="text-black font-semibold text-lg mb-3"
      >
        {t("settings.addSupporter.emailLabel") || "Introduce su dirección de correo electrónico"}
      </Label>
    
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          id="supporter-email"
          type="email"
          placeholder={t("settings.addSupporter.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-13 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-black px-5 rounded-full w-full shadow-sm text-base"
        />
    
        <div className="flex gap-2 sm:w-auto w-full">
          <button
            type="button"
            onClick={() => {
              if (!email.trim()) return;
              handleSupporterInvite(
                email,
                currentProfile.id,
                selectedUser.id
              );
              setShowAddAdmin(false);
            }}
            className="button-primary px-6 h-13 rounded-full text-base font-semibold whitespace-nowrap active:scale-[0.98] transition-all flex-1 sm:flex-none justify-center flex items-center"
          >
            + {t("buttons.addSupporter")}
          </button>
          
          <button
            type="button"
            onClick={() => setShowAddAdmin(false)}
            className="px-5 h-13 rounded-full text-base font-semibold text-darkgrey border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all flex-1 sm:flex-none justify-center flex items-center"
          >
            {t("buttons.cancel") || "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupporter;
