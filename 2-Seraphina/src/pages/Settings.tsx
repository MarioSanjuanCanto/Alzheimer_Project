"use client";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import GeneralInformation from "@/components/settings/GeneralInformation";
import UserPermission from "@/components/settings/UserPermission";
import Supporters from "@/components/settings/Supporters";
import MyProfileSettings from "@/components/settings/MyProfileSettings";
import AddUser from "@/components/AddUser";
import BackButton from "@/components/ui/back-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { getLinkedUsers, LinkedUser } from "@/api/getLinkedUsers"; // Ensure path is correct
import DisconnectUser from "@/components/settings/DisconnectUser";
import { useParticipant } from "@/context/practicerContext";
import { NoUser } from "@/assets/images/no-users";

const Settings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { selectedParticipant, switchParticipant } = useParticipant();

  const [activeSection, setActiveSection] = useState("myProfile");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentProfile?.role === "admin";
  // 1. Unified Data Loader
  // Inside Settings.tsx -> loadData function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getCurrentProfile();
      setCurrentProfile(profile);

      if (profile?.role === "admin") {
        const users = await getLinkedUsers(profile.id);
        setLinkedUsers(users);

        if (location.state?.section === "addUser") {
          setActiveSection("addUser");
        } else if (location.state?.user) {
          switchParticipant(location.state.user);
          setActiveSection("practicerProfiles");
        }
        // THIS IS THE KEY: If we have a saved participant,
        // ensure the sidebar switches to that section automatically
        else if (selectedParticipant) {
          setActiveSection("practicerProfiles");
        } else if (users.length > 0) {
          switchParticipant(users[0]);
          setActiveSection("practicerProfiles");
        }
      } else {
        switchParticipant(profile);
        setActiveSection("myProfile");
      }
    } finally {
      setLoading(false);
    }
  }, [location.state, selectedParticipant, switchParticipant]);

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen bg-white overflow-x-hidden">
        <div className="page-padding relative flex-grow flex flex-col items-center justify-center z-[10]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="page-padding flex flex-row min-h-screen">
      <h1 className="sr-only">Settings</h1>
      <SettingsSidebar
        currentProfile={currentProfile}
        selectedParticipant={selectedParticipant}
        activeSection={activeSection}
        onSelectParticipant={(user) => {
          switchParticipant(user);
          setActiveSection("practicerProfiles");
        }}
        onSelectMyProfile={() => setActiveSection("myProfile")}
        onAddUser={() => setActiveSection("addUser")}
      />

      <div className="page-padding flex flex-col lg:mx-auto pt-20 lg:pt-28 z-10 animate-in fade-in-50 slide-in-from-right-5 duration-500">
        <div className="block lg:hidden">
          <BackButton />
        </div>

        {/* SECTION: PRACTICER PROFILES */}
        {activeSection === "practicerProfiles" &&
          (selectedParticipant && linkedUsers.length > 0 ? (
            <div className="max-w-[72rem]">
              <div>
                <h2 className="font-fraunces text-4xl font-bold text-primary pb-4 lg:pb-8 lg:mt-0">
                  {t("settings.settingsFor")} {selectedParticipant.fullName}
                </h2>
                <div className="divide-y divide-lightgrey">
                  <div className="py-8 lg:py-10 first:pt-0">
                    <Supporters
                      selectedUser={selectedParticipant}
                      currentProfile={currentProfile}
                    />
                  </div>
                  <div className="py-8 lg:py-10">
                    <UserPermission user={selectedParticipant} />
                  </div>
                  {isAdmin && (
                    <div className="pt-8 lg:py-10">
                      <DisconnectUser
                        adminId={currentProfile.id}
                        userId={selectedParticipant.id}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* NoUser only shows if section is active but no participant is selected/exists */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center mt-28 mb-14 lg:mt-0 lg:mb-0">
              <NoUser className="h-auto w-full max-w-[15rem] mb-8" />
              <p className="text-xl font-medium text-gray-600 mb-6">
                {t("settings.noParticipantsLinked") ||
                  "You don't have a Participant linked to your account yet"}
              </p>
              <button
                onClick={() => setActiveSection("addUser")}
                className="button-sm button-primary px-8 py-3"
              >
                + {t("buttons.addUser")}
              </button>
            </div>
          ))}

        {/* SECTION: MY PROFILE */}
        {activeSection === "myProfile" && (
          <div className="">
            <h2 className="font-fraunces text-4xl font-bold text-primary pb-4 lg:pb-8 mt-28 lg:mt-0">
              {t("settings.personalInformation.title")}
            </h2>
            <div className="mb-14 lg:mb-0">
              <MyProfileSettings currentProfile={currentProfile} />
            </div>
          </div>
        )}

        {/* SECTION: ADD USER */}
        {activeSection === "addUser" && isAdmin && (
          <div className="max-w-6xl">
            <h2 className="mt-28 lg:mt-0 font-fraunces text-4xl font-bold text-primary pb-4 lg:pb-12">
              {t("buttons.addUser")}
            </h2>
            <AddUser currentAdminId={currentProfile.id} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Settings;
