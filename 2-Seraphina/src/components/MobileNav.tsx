"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Icons
import { LogoutIcon } from "@/assets/icons/logout_icon";
import { Group } from "@/assets/icons/group_icon";
import { Account } from "@/assets/icons/account_icon";
import { ArrowLeft } from "@/assets/icons/arrow_left_icon";
import { Language } from "@/assets/icons/language_icon";

// API
import { getLinkedUsers, LinkedUser } from "@/api/getLinkedUsers";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import LogoutButton from "./ui/logout-button";

const MobileNav = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const [scrolled, setScrolled] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("root");
  const [users, setUsers] = useState<LinkedUser[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Load users and profile for dynamic rendering
  useEffect(() => {
    const loadNavData = async () => {
      try {
        const currentProfile = await getCurrentProfile();
        setProfile(currentProfile);

        if (currentProfile?.role === "admin") {
          const linkedUsers = await getLinkedUsers(currentProfile.id);
          setUsers(linkedUsers);
        }
      } catch (error) {
        console.error("Error loading mobile nav data:", error);
      }
    };
    loadNavData();
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setCurrentScreen("root");
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <nav
      aria-label="Primary navigation"
      className="lg:hidden fixed top-4 right-4 md:top-8 md:right-8 z-50"
    >
      {/* Hamburger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
          py-2 px-4 rounded-lg border-2 text-xl text-primary font-bold transition-colors duration-300
        ${
          scrolled
            ? "bg-white/80 backdrop-blur-md"
            : "bg-transparent border-primary"
        }
      `}
        >
          {t("buttons.menu")}
        </button>
      )}

      {/* Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {currentScreen === "root" && (
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 bg-lightgrey text-primary font-bold px-4 py-2 rounded-full text-xl"
          >
            {t("buttons.close")}
          </button>
        )}

        {/* ROOT SCREEN */}
        {currentScreen === "root" && (
          <div className="flex flex-col pt-24 px-8 space-y-8 text-primary text-3xl font-normal">
            <Link to="/create" onClick={closeMenu}>
              {t("navigation.create")}
            </Link>
            <Link to="/view" onClick={closeMenu}>
              {t("navigation.memories")}
            </Link>
            <Link to="/exercises-overview" onClick={closeMenu}>
              {t("navigation.practice")}
            </Link>
            <Link to="/my-profile-settings" onClick={closeMenu}>
              My Profile
            </Link>

            {/* Participant Profiles as a Main Link (Admin only) */}
            {isAdmin && (
              <div
                onClick={() => {
                  closeMenu();
                  navigate("/settings", {
                    state: { section: "practicerProfiles" },
                  });
                }}
                className="flex flex-row items-center cursor-pointer"
              >
                <span className="flex items-center gap-2 text-3xl text-primary font-normal">
                  {t("navigation.practicerProfiles")}
                </span>
              </div>
            )}

            {/* Language Toggle */}
            <div className="pt-4">
              <div className="flex items-center gap-3 text-xl text-darkgrey mb-4">
                <Language className="w-6 h-6" />
                <span>{t("settings.sidebar.languages")}</span>
              </div>
              <div className="flex gap-4">
                {["en", "es"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`px-6 py-2 rounded-full text-lg border ${
                      currentLang === lang
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-lightgrey text-primary"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button className="button-tertiary button-icon button-sm absolute bottom-8 left-8 right-8">
              <LogoutIcon className="h-5 w-5" />
              {t("buttons.signOut")}
            </button>
          </div>
        )}

        {/* USER PROFILES SCREEN */}
        {currentScreen === "practicerProfiles" && (
          <div className="flex flex-col h-full px-8 pt-24 text-primary">
            <button
              onClick={() => setCurrentScreen("root")}
              className="lg:hidden absolute top-4 left-4 flex flex-row gap-2 items-center bg-bggreen text-black px-4 py-2 rounded-full text-xl font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("buttons.back")}
            </button>

            <div className="space-y-8 text-2xl font-normal overflow-y-auto max-h-[60vh]">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      closeMenu();
                      navigate("/settings", {
                        state: { section: "practicerProfiles", user: user },
                      });
                    }}
                  >
                    <Account className="w-6 h-6" />
                    {user.fullName}
                  </div>
                ))
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    closeMenu();
                    navigate("/settings", {
                      state: { section: "practicerProfiles" },
                    });
                  }}
                >
                  <p className="text-xl text-darkgrey italic">
                    {t("settings.noParticipantLinked")}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                closeMenu();
                navigate("/settings", { state: { section: "addUser" } });
              }}
              className="mt-auto mb-12 button-primary button-sm"
            >
              + {t("buttons.addUser")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
