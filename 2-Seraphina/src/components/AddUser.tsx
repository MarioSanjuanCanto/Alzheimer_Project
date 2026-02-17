import { useState } from "react";
import { handleUserInvite } from "../api/handleInvite";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { Add } from "@/assets/icons/add_icon";
import { useTranslation } from "react-i18next";

const AddUser = ({ currentAdminId }) => {
  const { t } = useTranslation();
  const [newUserEmail, setInviteUserEmail] = useState("");

  return (
    <div className="w-full w-5xl">
      <div className="flex flex-col">
        <Label
          htmlFor="userEmail"
          className="text-2xl font-semibold"
        >
          {t("settings.addUser.label")}
        </Label>

        <p
          id="add-participant-hint"
          className="text-xl text-black mb-4"
        >
          {t("settings.addUser.description")}
        </p>
      </div>

      <div className="flex w-full gap-4">
        <Input
          id="userEmail"
          type="email"
          aria-describedby="add-participant-hint"
          placeholder={t("settings.addUser.emailPlaceholder")}
          value={newUserEmail}
          onChange={(e) => setInviteUserEmail(e.target.value)}
          className="h-14 flex-1 rounded-full w-[50rem] grow-1 "
        />

        <button
          type="button"
          className="button-primary button-icon button-sm shrink-0"
          onClick={() =>
            handleUserInvite(newUserEmail, currentAdminId)
          }
        >
          <Add className="w-6 h-6" aria-hidden="true" />
          {t("buttons.inviteUser")}
        </button>
      </div>
    </div>
  );
};

export default AddUser;
