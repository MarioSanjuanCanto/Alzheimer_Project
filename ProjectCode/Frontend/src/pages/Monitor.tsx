"use client";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import MonitorSidebar from "@/components/monitor/MonitorSidebar";
import ExerciseLimitConfig from "@/components/settings/ExerciseLimitConfig";
import UserPermission from "@/components/settings/UserPermission";
import Supporters from "@/components/settings/Supporters";
import PatientStatsDashboard from "@/components/settings/PatientStatsDashboard";
import AddUser from "@/components/AddUser";
import BackButton from "@/components/ui/back-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { getLinkedUsers, LinkedUser } from "@/api/getLinkedUsers";
import DisconnectUser from "@/components/settings/DisconnectUser";
import { useParticipant } from "@/context/practicerContext";
import { NoUser } from "@/assets/images/no-users";

const Monitor = () => {
  const { t, i18n } = useTranslation();
  const { selectedParticipant, switchParticipant } = useParticipant();
  const navigate = useNavigate();

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

      // Si hay paciente seleccionado guardado en el contexto
      if (selectedParticipant) {
        setActiveSection("practicerProfiles");
      } else if (users.length > 0) {
        switchParticipant(users[0]);
        setActiveSection("practicerProfiles");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedParticipant, switchParticipant, navigate]);

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

  // Si no es admin y ya cargó, no renderizamos nada hasta que redirija
  if (!isAdmin) return null;

  return (
    <main id="main-content" className="page-padding flex flex-row min-h-screen">
      <h1 className="sr-only">Monitorización</h1>
      
      <MonitorSidebar
        currentProfile={currentProfile}
        selectedParticipant={selectedParticipant}
        activeSection={activeSection}
        onSelectParticipant={(user) => {
          switchParticipant(user);
          setActiveSection("practicerProfiles");
          setPatientTab("stats");
        }}
        onAddUser={() => setActiveSection("addUser")}
      />

      <div className="page-padding flex flex-col lg:ml-10 lg:mr-auto pt-20 lg:pt-28 z-10 animate-in fade-in-50 slide-in-from-right-5 duration-500 w-full">
        <div className="block lg:hidden mb-4">
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

                <div className="divide-y divide-lightgrey">
                  {patientTab === "stats" && (
                    <div className="py-4 first:pt-0 animate-in fade-in duration-300">
                      <PatientStatsDashboard userId={selectedParticipant.id} />
                    </div>
                  )}

                  {patientTab === "config" && (
                    <div className="space-y-10 divide-y divide-lightgrey py-4 first:pt-0 animate-in fade-in duration-300">
                      <div className="pb-10 first:pt-0">
                        <ExerciseLimitConfig userId={selectedParticipant.id} />
                      </div>
                      <div className="pt-10">
                        <UserPermission user={selectedParticipant} />
                      </div>
                    </div>
                  )}

                  {patientTab === "team" && (
                    <div className="space-y-10 divide-y divide-lightgrey py-4 first:pt-0 animate-in fade-in duration-300">
                      <div className="pb-10 first:pt-0">
                        <Supporters
                          selectedUser={selectedParticipant}
                          currentProfile={currentProfile}
                        />
                      </div>
                      {isAdmin && (
                        <div className="pt-10">
                          <DisconnectUser
                            adminId={currentProfile.id}
                            userId={selectedParticipant.id}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
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

export default Monitor;
