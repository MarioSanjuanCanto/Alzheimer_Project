"use client";
import { Link } from "react-router-dom";
import { NoUser } from "@/assets/images/no-users";
import { useTranslation } from "react-i18next";
import { Info } from "@/assets/icons/information_icon";

interface NoLinkedUserProps {
  onAddUser?: () => void;
}

const NoLinkedUser = ({ onAddUser }: NoLinkedUserProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 lg:mt-8 bg-white/70 backdrop-blur-sm flex-1 flex flex-col items-center justify-center rounded-3xl text-center p-8 border border-white/50 animate-in zoom-in-95 duration-500">

      <NoUser className="h-auto w-full max-w-[18rem] lg:max-w-[14rem] opacity-80" />

      <div className="flex flex-col items-center">
        {/* Relative container for the text so tooltip can anchor to top-right */}
        <div className="relative mb-6 max-w-sm">
          <p className="text-xl font-medium text-gray-700 lg:pl-8 pr-4 md:pr-6 mb-4 lg:mb-0">
            {t("view.noLinkedUsers") ||
              "You are not linked to a participant yet. Please invite a Participant to get started."}
          </p>
          {/* Tooltip positioned at top-right */}
          <div className="group absolute -top-1 -right-0">
            <Info className="w-6 h-6 text-darkgrey cursor-pointer" />

            {/* Tooltip Content */}
            <div className="absolute bottom-full -left-20 lg:left-1/2 -translate-x-1/2 mb-6 lg:mb-3 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-lightgrey scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-bottom z-50 pointer-events-none">
              <h4 className="font-fraunces font-semibold text-primary mb-1">
                {t("view.participantTitle")}
              </h4>
              <p className="text-xs md:text-sm text-darkgrey leading-relaxed text-left">
                {t("view.participantDescription")}
              </p>
              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 right-5 lg:left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-lightgrey rotate-45" />
            </div>
          </div>
        </div>

        <Link
          to="/settings"
          state={{ section: "addUser" }}
          className="button-sm button-primary"
        >
          + {t("buttons.addUser") || "Add Participant"}
        </Link>
      </div>
    </div>
  );
};

export default NoLinkedUser;
