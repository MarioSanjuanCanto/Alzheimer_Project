("use client");
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Account } from "@/assets/icons/account_icon";
import { AccountFilled } from "@/assets/icons/account_filled_icon";
import LanguageSwitch from "./languageSwitch";
import { Add } from "@/assets/icons/add_icon";
import BackButton from "../ui/back-button";
import { getLinkedUsers } from "@/api/getLinkedUsers";

const SettingsSidebar = ({
  currentProfile,
  selectedParticipant,
  onSelectParticipant,
  onSelectMyProfile,
  activeSection,
  onAddUser,
}) => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const isAdmin = currentProfile?.role === "admin";

  useEffect(() => {
    if (!currentProfile || !isAdmin) return;

    const loadUsersForAdmin = async () => {
      const linkedUsers = await getLinkedUsers(currentProfile.id);
      setUsers(linkedUsers);
    };

    loadUsersForAdmin();
  }, [currentProfile, isAdmin]);


  return (
    <aside>
      <nav
        aria-label="Settings navigation"
        className="hidden lg:block bg-white h-screen sticky top-0"
      >
        <BackButton />

        <div className="lg:w-[21rem] space-y-10 h-screen pt-28 px-10 border-r border-lightgrey overflow-y-auto">


          {/* General Settings Section */}
          <div className="space-y-4">
            <p className="uppercase text-xl font-normal text-darkgrey">
              {t("settings.sidebar.general")}
            </p>

            <ul className="flex flex-col gap-2">
              <li
                onClick={onSelectMyProfile}
                className={`
                flex items-center gap-2 text-2xl px-4 py-3 rounded-full cursor-pointer transition-all
                ${
                  activeSection === "myProfile"
                    ? "bg-primary/15 text-primary font-semibold"
                    : "hover:bg-lightgrey hover:text-primary"
                }
              `}
              >
                <AccountFilled className="w-7 h-6" />
                {isAdmin
                  ? t("settings.sidebar.myProfile")
                  : currentProfile?.fullName}
              </li>
             <LanguageSwitch />
            </ul>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
