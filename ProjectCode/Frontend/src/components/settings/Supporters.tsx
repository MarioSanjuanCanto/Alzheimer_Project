import { AccountFilled } from "@/assets/icons/account_filled_icon";
import { useTranslation } from "react-i18next";
import AddSupporter from "../AddSupporter";
import { fetchSupporters, Supporter } from "@/api/fetchSupporters";
import { useEffect, useState } from "react";

const Supporters = ({ currentProfile, selectedUser }) => {
  const { t } = useTranslation();
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    if (!selectedUser?.id) return;

    fetchSupporters(selectedUser.id).then(setSupporters);
  }, [selectedUser]);

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-3xl p-6 md:p-8 lg:p-10 max-w-[54rem] animate-in fade-in duration-500">
      {/* Header row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-black text-2xl font-bold font-fraunces mb-2">
            {t("settings.supporters.title")}
          </h3>
          <p className="text-darkgrey text-lg pb-2 leading-relaxed">
            {t("settings.supporters.description")}
          </p>
        </div>

        {/* Desktop button */}
        {!showAddAdmin && (
          <button
            className="button-primary px-5 py-2.5 rounded-full text-lg font-medium transition-all duration-200 hidden md:block whitespace-nowrap active:scale-[0.98]"
            onClick={() => setShowAddAdmin(true)}
          >
            + {t("buttons.addSupporter")}
          </button>
        )}
      </div>

      {showAddAdmin && (
        <div className="mb-8">
          <AddSupporter
            selectedUser={selectedUser}
            currentProfile={currentProfile}
            setShowAddAdmin={setShowAddAdmin}
          />
        </div>
      )}

      {/* Supporter list grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current profile */}
        <li className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm transition-all hover:shadow-md duration-300">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <AccountFilled className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-black text-lg truncate">You</p>
            <p className="text-darkgrey text-sm truncate">{currentProfile.email}</p>
          </div>
        </li>

        {/* Linked supporters */}
        {supporters.length > 0 && (
          <>
            {supporters.map((supporter) => (
              <li key={supporter.id} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm transition-all hover:shadow-md duration-300">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <AccountFilled className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-lg truncate">{supporter.fullName}</p>
                  <p className="text-darkgrey text-sm truncate">{supporter.email}</p>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>

      {/* Mobile button */}
      {!showAddAdmin && (
        <div className="mt-6 flex justify-end md:hidden">
          <button
            onClick={() => setShowAddAdmin(true)}
            className="button-primary px-5 py-2.5 rounded-full text-lg font-medium transition-all duration-200 w-full active:scale-[0.98]"
          >
            + {t("buttons.addSupporter")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Supporters;
