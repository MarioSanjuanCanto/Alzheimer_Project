import Navbar from "../Navbar";
import { StepIndicator } from "../StepIndicator";
import { ImageStep } from "./ImageStep";
import { TextStep } from "./TextStep";
import { AudioStep } from "./AudioStep";
import { FormNavigation } from "./FormNavigation";
import { useMemoryForm } from "./UseMemoryForm";
import MobileNav from "../MobileNav";
import { useTranslation } from "react-i18next";
import BackgroundDesktop from "../ui/backgroundDesktop";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseButton from "../ui/close-button";

export const MemoryForm = ({memory}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    currentStep,
    totalSteps,
    formData,
    updateFormData,
    handleFileChange,
    handleNext,
    handleBack,
    handleSubmit,
    audioUrl,
    recording,
    startRecording,
    stopRecording,
    deleteRecording,
    errors,
  } = useMemoryForm();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const profile = await getCurrentProfile();

        if (profile && profile.allow_memory_creation === false) {
          navigate("/view");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        navigate("/view"); // Safety redirect on error
      }
    };

    checkAccess();
  }, [navigate]);

  // SPINNER UI
  if (loading) {
    return (
      <div className="relative flex flex-col h-screen bg-bggreen overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-md" />
        <div className="page-padding relative flex-grow flex flex-col items-center justify-center z-[10]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="relative min-h-screen flex flex-col overflow-hidden bg-bggreen">
      <BackgroundDesktop />
      {/* Glassmorphism Overlay */}
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full z-0 bg-white/10 backdrop-blur-lg" />
      <MobileNav />

      <div className="lg:page-padding z-40 flex justify-center items-center h-full lg:h-[calc(100vh-6rem)] lg:mt-12">
        <div
          className="
            relative
            bg-white lg:rounded-md
            w-full lg:max-w-2xl
            h-screen lg:h-[calc(100vh-4rem)]
            lg:max-h-[45rem]
            lg:min-h-[35rem]
            overflow-y-auto
            flex flex-col
            p-4 md:px-8
          "
        >
          <div className="hidden lg:block">
            <CloseButton back />
          </div>

          <h1 className="mb-4 lg:mb-8 !mt-12 lg:mt-0 font-fraunces text-center font-bold text-primary leading-tight text-3xl md:text-4xl">
            {t("create.createNewMemory")}
          </h1>

          <div className="">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          <div className="flex-1 flex flex-col min-h-0 justify-between mt-6">
            {currentStep === 1 && (
              <ImageStep
                formData={formData}
                handleFileChange={handleFileChange}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <TextStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <AudioStep
                formData={formData}
                startRecording={startRecording}
                stopRecording={stopRecording}
                recording={recording}
                deleteRecording={deleteRecording}
                audioUrl={audioUrl}
                updateFormData={updateFormData}
              />
            )}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
