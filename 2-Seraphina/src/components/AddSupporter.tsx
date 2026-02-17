import { useState } from "react";
import { handleSupporterInvite } from "@/api/handleInvite";
import { Input } from "@/components/ui/input";
import { Add } from "@/assets/icons/add_icon";
import { Label } from "./ui/label";
import { t } from "i18next";

const AddSupporter = ({ selectedUser, currentProfile, setShowAddAdmin }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex-1 flex flex-col mb-8">
    <div className="flex flex-col">
      <Label
        htmlFor="supporter-email"
        className="sr-only"
      >
        {t("settings.addSupporter.emailLabel")}
      </Label>
    </div>
  
    <div className="flex flex-row gap-4">
      <Input
        id="supporter-email"
        type="email"
        placeholder={t("settings.addSupporter.emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-14 rounded-full w-full"
      />
  
      <button
        type="button"
        onClick={() => {
          handleSupporterInvite(
            email,
            currentProfile.id,
            selectedUser.id
          );
          setShowAddAdmin(false);
        }}
        className="button-primary button-sm truncate w-fit"
      >
        + {t("buttons.addSupporter")}
      </button>
    </div>
  </div>
  );
};

export default AddSupporter;
