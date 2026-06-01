"use client";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import ExerciseLimitConfig from "@/components/settings/ExerciseLimitConfig";
import UserPermission from "@/components/settings/UserPermission";
import Supporters from "@/components/settings/Supporters";
import PatientStatsDashboard from "@/components/settings/PatientStatsDashboard";
import AddUser from "@/components/AddUser";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { getLinkedUsers, LinkedUser } from "@/api/getLinkedUsers";
import DisconnectUser from "@/components/settings/DisconnectUser";
import { useParticipant } from "@/context/practicerContext";
import { NoUser } from "@/assets/images/no-users";
import { useLocation } from "react-router-dom";

const Monitor = () => {
  const { t, i18n } = useTranslation();
  const { selectedParticipant, switchParticipant } = useParticipant();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("practicerProfiles");
  const [patientTab, setPatientTab] = useState<"stats" | "config" | "team">("stats");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentProfile?.role === "admin";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getCurrentProfile();
      setCurrentProfile(profile);

      // Si no es admin, no debería estar aquí, lo redirigimos
      if (profile?.role !== "admin") {
        navigate("/settings");
        return;
      }

      const users = await getLinkedUsers(profile.id);
      setLinkedUsers(users);

      const hasRealSelectedParticipant = selectedParticipant && selectedParticipant.role !== "admin";

      // Check if we were navigated here with addUser intent
      if (location.state?.section === "addUser") {
        setActiveSection("addUser");
      } else if (hasRealSelectedParticipant) {
        setActiveSection("practicerProfiles");
      } else if (users.length > 0) {
        switchParticipant(users[0]);
        setActiveSection("practicerProfiles");
      } else {
        switchParticipant(null);
        setActiveSection("practicerProfiles");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedParticipant, switchParticipant, navigate, location.state]);

  useEffect(() => {
    loadData();
  }, []);

  // Re-check section when location state changes (e.g., "+ Añadir participante" from Navbar)
  useEffect(() => {
    if (location.state?.section === "addUser") {
      setActiveSection("addUser");
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen bg-bggreen overflow-x-hidden">
        <div className="page-padding relative flex-grow flex flex-col items-center justify-center z-[10]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Si no es admin y ya cargó, no renderizamos nada hasta que redirija
  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <MobileNav />

      <main
        id="main-content"
        className="relative flex flex-1 flex-col overflow-x-hidden bg-bggreen min-h-screen"
      >
        <BackgroundDesktop />
        <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-md" />

        <div className="relative flex flex-1 flex-col z-10 p-4 lg:pb-20 lg:px-20 animate-in fade-in zoom-in-95 duration-700">
          {/* SECTION: PRACTICER PROFILES */}
          {activeSection === "practicerProfiles" &&
            (selectedParticipant && linkedUsers.length > 0 ? (
              <div className="max-w-[72rem] mx-auto w-full mt-16 md:mt-24 lg:mt-40">
                <h2 className="font-fraunces text-4xl font-bold text-primary pb-4 lg:pb-8">
                  {t("settings.settingsFor")} {selectedParticipant.fullName}
                </h2>

                {/* Selector de Pestañas */}
                <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-lightgrey max-w-fit mb-8 gap-1 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setPatientTab("stats")}
                    className={`px-5 py-2.5 rounded-full text-lg font-medium transition-all whitespace-nowrap ${
                      patientTab === "stats"
                        ? "bg-primary text-white shadow-sm"
                        : "text-darkgrey hover:bg-gray-200 hover:text-primary"
                    }`}
                  >
                    {i18n.language?.startsWith("es") ? "Evolución Cognitiva" : "Cognitive Evolution"}
                  </button>
                  <button
                    onClick={() => setPatientTab("config")}
                    className={`px-5 py-2.5 rounded-full text-lg font-medium transition-all whitespace-nowrap ${
                      patientTab === "config"
                        ? "bg-primary text-white shadow-sm"
                        : "text-darkgrey hover:bg-gray-200 hover:text-primary"
                    }`}
                  >
                    {i18n.language?.startsWith("es") ? "Plan de Ejercicios" : "Exercise Plan"}
                  </button>
                  <button
                    onClick={() => setPatientTab("team")}
                    className={`px-5 py-2.5 rounded-full text-lg font-medium transition-all whitespace-nowrap ${
                      patientTab === "team"
                        ? "bg-primary text-white shadow-sm"
                        : "text-darkgrey hover:bg-gray-200 hover:text-primary"
                    }`}
                  >
                    {i18n.language?.startsWith("es") ? "Equipo y Cuenta" : "Team & Account"}
                  </button>
                </div>

                <div className="space-y-8">
                  {patientTab === "stats" && (
                    <div className="animate-in fade-in duration-300">
                      <PatientStatsDashboard userId={selectedParticipant.id} />
                    </div>
                  )}

                  {patientTab === "config" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <ExerciseLimitConfig userId={selectedParticipant.id} />
                      <UserPermission user={selectedParticipant} />
                    </div>
                  )}

                  {patientTab === "team" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <Supporters
                        selectedUser={selectedParticipant}
                        currentProfile={currentProfile}
                      />
                      {isAdmin && (
                        <DisconnectUser
                          adminId={currentProfile.id}
                          userId={selectedParticipant.id}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center mt-28 mb-14 lg:mt-40 lg:mb-0">
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

          {/* SECTION: ADD USER */}
          {activeSection === "addUser" && isAdmin && (
            <div className="max-w-6xl mx-auto w-full mt-16 md:mt-24 lg:mt-40">
              <h2 className="font-fraunces text-4xl font-bold text-primary pb-4 lg:pb-12">
                {t("buttons.addUser")}
              </h2>
              <AddUser currentAdminId={currentProfile.id} />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Monitor;
