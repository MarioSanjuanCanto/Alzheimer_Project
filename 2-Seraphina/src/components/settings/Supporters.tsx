import { AccountFilled } from "@/assets/icons/account_filled_icon";
import { useTranslation } from "react-i18next";
import AddSupporter from "../AddSupporter";
import { fetchSupporters, Supporter } from "@/api/fetchSupporters";
import { Add } from "@/assets/icons/add_icon";
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
    <div>
      {/* Header row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h3 className="text-black text-2xl font-semibold">
            {t("settings.supporters.title")}
          </h3>
          <p className="text-black text-xl pb-4 lg:pb-8">
            {t("settings.supporters.description")}
          </p>
        </div>

        {/* Desktop button */}
        {!showAddAdmin && (
          <button
            className="button-primary button-sm hidden md:block truncate w-fit"
            onClick={() => setShowAddAdmin(true)}
          >
            + {t("buttons.addSupporter")}
          </button>
        )}
      </div>

      {showAddAdmin && (
        <AddSupporter
          selectedUser={selectedUser}
          currentProfile={currentProfile}
          setShowAddAdmin={setShowAddAdmin}
        />
      )}

      {/* Supporter list */}
      <ul className="flex flex-col gap-6 md:ml-12 lg:ml-0">
        {/* Current profile */}
        <li className="flex items-center gap-6">
          <div className="p-4 bg-lightgrey rounded-full">
            <AccountFilled className="w-6 h-6" />
          </div>
          <div>
            <p>You</p>
            <p>{currentProfile.email}</p>
          </div>
        </li>

        {/* Linked supporters */}
        {supporters.length > 0 && (
          <>
            {supporters.map((supporter) => (
              <li key={supporter.id} className="flex items-center gap-6">
                <div className="p-4 bg-lightgrey rounded-full">
                  <AccountFilled className="w-6 h-6" />
                </div>
                <div>
                  <p>{supporter.fullName}</p>
                  <p>{supporter.email}</p>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>

      {/* Mobile button */}
      <div className="mt-8 flex justify-end md:hidden">
        <button className="button-primary button-sm w-fit">
          + {t("buttons.addSupporter")}
        </button>
      </div>
    </div>
  );
};

export default Supporters;
