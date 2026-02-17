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
          {/* Only show "Participant Profiles" list to ADMINS */}
          {isAdmin && (
            <div>
              <div className="space-y-4">
                <p className="uppercase text-xl font-normal text-darkgrey">
                  {t("settings.sidebar.practicerProfiles")}
                </p>

                <ul className="flex flex-col gap-2">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => onSelectParticipant(user)}
                      className={`
                      flex flex-row items-center gap-2 text-2xl px-4 py-3 rounded-full cursor-pointer transition-all
                      ${
                        selectedParticipant?.id === user.id &&
                        activeSection === "practicerProfiles"
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-black hover:bg-lightgrey hover:text-primary"
                      }
                    `}
                    >
                      <Account className="w-7 h-6" />
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[11.25rem]">
                        {user.fullName}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onAddUser}
                className={`button-primary button-sm w-full ${users.length === 0 ? "mt-0" : "mt-6"}`}
              >
                + {t("buttons.addUser")}
              </button>
            </div>
          )}

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
