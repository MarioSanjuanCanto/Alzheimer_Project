"use client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import LogoutButton from "./ui/logout-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { getLinkedUsers, LinkedUser } from "@/api/getLinkedUsers";
import { useParticipant } from "@/context/practicerContext";
import { useTranslation } from "react-i18next";
import { ChevronDown, Users } from "lucide-react";

interface NavbarProps {
  forceMinimized?: boolean;
}

const Navbar = ({ forceMinimized = false }: NavbarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedParticipant, switchParticipant } = useParticipant();

  // Logic: acts as menu button if on /create OR if parent component forces it (like in memory detail)
  const isMinimizedMode = location.pathname === "/create" || forceMinimized;

  const [hidden, setHidden] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user-profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State 'open' controls if the menu is expanded or just the small button
  const [open, setOpen] = useState(!isMinimizedMode);

  // Sync open state when the mode changes (e.g., clicking into a memory)
  useEffect(() => {
    setOpen(!isMinimizedMode);
  }, [isMinimizedMode]);

  const isLoggedIn = !!profile;
  const isAdmin = profile?.role === "admin";
  const canCreate = profile?.allow_memory_creation !== false;
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    getCurrentProfile().then((freshProfile) => {
      setProfile(freshProfile);
      localStorage.setItem("user-profile", JSON.stringify(freshProfile));

      // If admin, fetch linked users for the dropdown
      if (freshProfile?.role === "admin") {
        getLinkedUsers(freshProfile.id).then((users) => {
          setLinkedUsers(users);
          // Auto-select first user if none selected
          if (!selectedParticipant && users.length > 0) {
            switchParticipant(users[0]);
          }
        });
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll logic (optional, keep your existing logic here if needed)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 60) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkBase =
    "relative text-2xl font-normal text-primary transition-colors duration-300";
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${navLinkBase}
     ${isActive ? "font-normal" : ""}
     after:absolute after:left-0 after:-bottom-1
     after:h-[2px] after:w-full after:origin-left
     after:scale-x-0 after:bg-primary
     after:transition-transform after:duration-500
     hover:after:scale-x-100
     ${isActive ? "after:scale-x-100" : ""}
     active:scale-95`;

  return (
    <nav
      aria-label="Primary navigation"
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      className={`
            fixed
            top-6
            right-8
            lg:right-20
            z-50
            hidden
            lg:block
            transition-transform
            duration-700
            ease-out
            ${hidden && !hasFocus ? "-translate-y-32" : "translate-y-0"}
          `}
    >
      <div className="bg-white rounded-full h-20 flex items-center overflow-visible px-8 ml-auto justify-center transition-all duration-700 ease-out">
        {/* Nav Links Container */}
        <div className="flex items-center gap-14 whitespace-nowrap transition-all duration-500 ease-out">
          <NavLink to="/" className={navLinkClass}>
            {t("navigation.home")}
          </NavLink>

          <NavLink to="/view" className={navLinkClass}>
            {t("navigation.memories")}
          </NavLink>

          <NavLink to="/exercises-overview" className={navLinkClass}>
            {t("navigation.practice")}
          </NavLink>

          {isAdmin && (
            <NavLink to="/monitor" className={navLinkClass}>
              {t("navigation.monitor", "Monitorización")}
            </NavLink>
          )}

          <NavLink to="/settings" className={navLinkClass}>
            {t("navigation.settings")}
          </NavLink>

          {/* Patient Selector Dropdown — solo para admins */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary/20 transition-all duration-300 text-lg font-medium"
              >
                <Users className="w-5 h-5" />
                <span className="max-w-[10rem] truncate">
                  {selectedParticipant && selectedParticipant.role !== "admin"
                    ? selectedParticipant.fullName
                    : t("navigation.noneSelected", "Ninguno seleccionado")}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-lightgrey py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                  <p className="px-4 py-2 text-sm font-semibold text-darkgrey uppercase tracking-wider">
                    {t("settings.sidebar.practicerProfiles", "Pacientes")}
                  </p>
                  {linkedUsers.length === 0 ? (
                    <div className="px-4 py-3 text-darkgrey text-base">
                      {t("loading", "Cargando...")}
                    </div>
                  ) : (
                    linkedUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchParticipant(user);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-lg transition-all duration-200 flex items-center gap-3 ${
                          selectedParticipant?.id === user.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-black hover:bg-gray-100 hover:text-primary"
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className="truncate">{user.fullName}</span>
                      </button>
                    ))
                  )}
                  <div className="border-t border-lightgrey mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/monitor", { state: { section: "addUser" } });
                      }}
                      className="w-full text-left px-4 py-3 text-lg text-primary font-medium hover:bg-primary/5 transition-all duration-200"
                    >
                      + {t("buttons.addUser", "Añadir participante")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
