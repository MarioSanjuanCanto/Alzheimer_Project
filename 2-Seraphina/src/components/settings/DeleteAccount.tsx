import { useState } from "react";
import { useTranslation } from "react-i18next";
import {handleDeleteAccount} from "@/api/handleDeleteAccount";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  function handleDeleteAccount() {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="bg-bggreen rounded-lg p-4 md:p-8 mt-10">
      {/* Section Header */}
      <h3 className="text-black text-2xl font-semibold">
        {t("settings.security.title")}
      </h3>

      <p className="text-xl text-black mb-4">
        {t("settings.security.description")}
      </p>

      {/* Delete button (opens modal) */}
      <button
        className="button-sm button-destructive"
        onClick={() => setShowModal(true)}
      >
        {t("buttons.deleteAccount")}
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          {/* Modal Content Box */}
          <div className="bg-white rounded-xl p-4 md:p-8 w-[33.938rem] m-4">
            <h3 className="text-2xl font-semibold text-black">
              {t("settings.security.title")}
            </h3>

            <p className="text-black text-xl">
              {t("settings.security.warning")}
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2 md:pt-6">
              <button onClick={() => setShowModal(false)} className="button-sm">{t("buttons.cancel")}</button>
              <button
                className="button-sm button-destructive"
                onClick={async () => {
                  try {
                    await handleDeleteAccount();
                    navigate("/"); // or create a //goodbye page
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
              >
                {t("buttons.deleteAccountConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
