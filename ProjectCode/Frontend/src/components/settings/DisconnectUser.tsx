import { useState } from "react";
import { useTranslation } from "react-i18next";
import { handleDisconnectUser } from "@/api/handleDisconnectUser";

const DisconnectUser = ({ adminId, userId }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-red-50/40 backdrop-blur-xl border border-red-100 shadow-md rounded-3xl p-6 md:p-8 lg:p-10 max-w-[54rem] animate-in fade-in duration-500">
      <h3 className="text-black text-2xl font-bold font-fraunces mb-2">
        {t("settings.disconnectUser.title")}
      </h3>
      <p className="text-darkgrey text-lg pb-6 leading-relaxed">
        {t("settings.disconnectUser.description")}
      </p>
      
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full text-base font-semibold shadow-sm shadow-red-500/20 active:scale-[0.98] transition-all w-fit"
      >
        {t("buttons.disconnectUser")}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Content Box */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 w-[34rem] max-w-[90%] m-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold font-fraunces text-black mb-3">
              {t("settings.disconnectUser.title")}
            </h3>

            <p className="text-darkgrey text-lg leading-relaxed mb-6">
              {t("settings.disconnectUser.warning")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-end w-full">
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full sm:w-auto px-6 py-3 rounded-full text-base font-semibold text-darkgrey border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all flex justify-center items-center"
              >
                {t("buttons.cancel")}
              </button>
              
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-full text-base font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all flex justify-center items-center shadow-sm shadow-red-500/10"
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
