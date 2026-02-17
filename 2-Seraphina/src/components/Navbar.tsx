"use client";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutButton from "./ui/logout-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  forceMinimized?: boolean;
}

const Navbar = ({ forceMinimized = false }: NavbarProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Logic: acts as menu button if on /create OR if parent component forces it (like in memory detail)
  const isMinimizedMode = location.pathname === "/create" || forceMinimized;

  const [hidden, setHidden] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user-profile");
    return saved ? JSON.parse(saved) : null;
  });

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
    });
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
      <div className="bg-white rounded-full h-20 flex items-center overflow-hidden px-8 ml-auto justify-center transition-all duration-700 ease-out">
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
    

          <NavLink to="/settings" className={navLinkClass}>
            {t("navigation.settings")}
          </NavLink>

          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
