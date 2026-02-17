import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";
import { handleDisconnectUser } from "@/api/handleDisconnectUser";

const DisconnectUser = ({adminId, userId}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="lg:w-[60rem]">
      <div className="bg-bggreen w-full p-4 md:p-8 rounded-lg">
        <h3 className="text-black text-2xl font-semibold">{t("settings.disconnectUser.title")}</h3>
        <p className="mb-4">{t("settings.disconnectUser.description")}</p>
        <button
          onClick={() => setShowModal(true)}
          className="button-destructive button-sm"
        >
          {t("buttons.disconnectUser")}
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          {/* Modal Content Box */}
          <div className="bg-white rounded-xl p-4 md:p-8 w-[33.938rem] m-4">
            <h3 className="text-2xl font-semibold text-black">
              {t("settings.disconnectUser.title")}
            </h3>

            <p className="text-black text-xl">
              {t("settings.disconnectUser.warning")}
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2 md:pt-6">
              <button onClick={() => setShowModal(false)} className="button-sm">
                {t("buttons.cancel")}
              </button>
              <button
                className="button-sm button-destructive"
                onClick={async () => {
                  try {
                    await handleDisconnectUser({
                      adminId,
                      userId,
                    });

                    setShowModal(false);
                    window.location.reload(); // or refetch users
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
              >
                {t("buttons.disconnectUserConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisconnectUser;
