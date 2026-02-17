import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/images/hero-image.png";
import { PlayCircle } from "@/assets/icons/play_circle_icon";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import LoginButton from "@/components/ui/login-button";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { t } from "i18next";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const isLoggedIn = !!profile;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getCurrentProfile();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Global navigation */}
      {isLoggedIn && (
        <>
          <MobileNav />
          <Navbar />
        </>
      )}

      {/* Main content */}
      <main
        id="main-content"
        className="page-padding relative min-h-screen lg:h-screen bg-bggreen flex items-center justify-center overflow-hidden"
      >
        <BackgroundDesktop />
        {/* Mobile blur overlay */}
        <div className=" absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-md" />

        {/* Auth actions for logged-out users */}
        <div className="hidden lg:block absolute top-10 z-40 right-20">
          {!isLoggedIn && (
            <div className="flex flex-row gap-8 items-center">
              <Link
                to="/register"
                className="text-2xl text-primary underline font-normal transition-transform duration-300 ease-out hover:scale-105 inline-block"
              >
                {t("buttons.register")}
              </Link>
              <LoginButton />
            </div>
          )}
        </div>

        {/* Hero content */}
        <div
          className="z-20 grid grid-cols-1 lg:grid-cols-2 md:gap-[2rem]
          lg:mx-[10rem] 2xl:mx-[8rem] items-center"
        >
          {/* Decorative image */}
          <section
            aria-hidden="true"
            className="hidden lg:block lg:relative justify-self-start"
          >
            <img
              src={heroImage}
              alt=""
              className="
                w-full h-auto
                lg:max-h-[34rem] lg:max-w-[25rem]
                2xl:max-h-[43rem] 2xl:max-w-[45rem]
                object-cover rounded-full lg:my-32
                opacity-0
                animate-[fade-up_600ms_ease-out_forwards]
              "
            />
          </section>

          {/* Text and actions */}
          <section className="flex flex-col lg:static top-64 lg:max-w-[35rem] 2xl:max-w-[40rem] justify-self-center">
            <h1 className="font-fraunces-soft mb-2 md:mb-5 text-5xl md:text-6xl lg:text-5xl 2xl:text-6xl text-primary md:leading-tight opacity-0 animate-[float-in_700ms_ease-out_forwards]">
              {t("home.headline")}
            </h1>

            <p className="font-roboto mb-10 text-2xl md:text-3xl lg:text-2xl 2xl:text-4xl font-light opacity-0 animate-[float-in_700ms_ease-out_forwards] [animation-delay:150ms]">
              {t("home.subtitle")}
            </p>

            <div className="flex flex-col items-start sm:flex-row gap-4 md:gap-8 min-h-[3.5rem]">
              {!loading && (
                <div className="flex flex-col items-start sm:flex-row gap-4 md:gap-8">
                  <button
                    className="
                  button-primary button-sm md:button-lg lg:button-md
                  opacity-0
                  animate-[float-in_500ms_ease-out_forwards]
                  [animation-delay:300ms]
                "
                    onClick={() => navigate(profile ? "/create" : "/register")}
                  >
                    {isLoggedIn
                      ? t("buttons.createMemory")
                      : t("buttons.startHere")}
                  </button>

                  <button
                    className="
                  button-secondary button-icon button-sm md:button-lg lg:button-md
                  opacity-0
                  animate-[float-in_500ms_ease-out_forwards]
                  [animation-delay:300ms]
                "
                  >
                    <PlayCircle
                      className="w-6 h-6 md:w-7 lg:h-7"
                      aria-hidden="true"
                    />
                    {t("buttons.viewDemo")}
                  </button>
                </div>
              )}
            </div>
            
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
