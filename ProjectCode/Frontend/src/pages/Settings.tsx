"use client";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import MyProfileSettings from "@/components/settings/MyProfileSettings";
import BackButton from "@/components/ui/back-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { useParticipant } from "@/context/practicerContext";

const Settings = () => {
  const { t } = useTranslation();
  const { selectedParticipant, switchParticipant } = useParticipant();

  const [activeSection, setActiveSection] = useState("myProfile");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getCurrentProfile();
      setCurrentProfile(profile);
      switchParticipant(profile);
      setActiveSection("myProfile");
    } finally {
      setLoading(false);
    }
  }, [switchParticipant]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        onSelectParticipant={() => {}}
        onSelectMyProfile={() => setActiveSection("myProfile")}
        onAddUser={() => {}}
      />

      <div className="page-padding flex flex-col lg:ml-10 lg:mr-auto pt-20 lg:pt-28 z-10 animate-in fade-in-50 slide-in-from-right-5 duration-500">
        <div className="block lg:hidden">
          <BackButton />
        </div>

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
      </div>
    </main>
  );
};

export default Settings;
