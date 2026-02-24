import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon } from "@/assets/icons/upload_icon";
import { StepIndicator } from "./StepIndicator";
import { ChevronRight } from "@/assets/icons/chevron_right_icon";
import { ChevronLeft } from "@/assets/icons/chevron_left_icon";
import { ArrowRight } from "@/assets/icons/arrow_right_icon";
import { Delete } from "@/assets/icons/delete_icon";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const MultiStepForm = ({handleFileChange, handleBack, handleNext, updateFormData, handleSubmit}) => {
  const location = useLocation();
  const memoryToEdit = location.state?.memory || null;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("");
  const [formData, setFormData] = useState({
    image: memoryToEdit?.image || null,
    title: memoryToEdit?.title || "",
    description: memoryToEdit?.description || "",
    audio: memoryToEdit?.image || null,
  });

  useEffect(() => {
    if (memoryToEdit) {
      setTitle(memoryToEdit.title);
      setDescription(memoryToEdit.description);
      setFilter(memoryToEdit.filter);
    }
  }, [memoryToEdit]);

  return (
    <div className="bg-bgwhite md:bg-bggreen md:pt-40 md:px-8 lg:px-20 h-screen overflow-x-hidden flex flex-col">
      <Navbar />
      <MobileNav />
      <div className="z-40 flex justify-center px-4 md:px-0 flex-1 min-h-0">
        <div className="md:grid md:grid-cols-[1fr_2fr] max-w-[90rem] max-h-[48rem] lg:mb-10 md:bg-bgwhite md:rounded-md w-full md:min-h-0 md:h-full">
          {/* Left Column */}
          <div className="md:bg-primary min-w-[20rem] w-full md:w-auto text-white md:p-6 lg:p-10 flex flex-col md:my-6 lg:my-8 xl:my-10 md:ml-6 lg:ml-8 xl:ml-10 md:rounded-md">
            <div className="relative z-10">
              <h2 className="hidden md:block md:mb-6 lg:mb-10 xl:mb-12 font-medium text-white leading-tight text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                Start creating a new memory
              </h2>
            </div>
            <div className="mt-32 md:mt-0">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}

              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col md:p-6 lg:px-16 lg:py-10 min-h-0">
            {/* Step 1: Upload image */}
            {currentStep === 1 && (
              <div className="animate-in fade-in-50 slide-in-from-right-5 duration-500 flex-1 flex flex-col min-h-0 lg:px-[7.125]">
                <div className="flex items-center gap-2 shrink-0 mb-3">
                  <Label
                    htmlFor="image-upload"
                    className="text-2xl md:text-3xl font-medium text-primary"
                  >
                    Upload image
                  </Label>
                </div>
                <p className="text-xl font-light text-black pb-4 shrink-0">
                  Choose your image (JPG or PNG)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e, "image")}
                />
                <div
                  className="flex-1 flex flex-col items-center justify-center border-2 border-black/30 border-dashed rounded-md w-full min-h-0 relative overflow-hidden cursor-pointer hover:border-primary"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {formData.image ? (
                    <img
                      src={
                        formData.image instanceof File
                          ? URL.createObjectURL(formData.image)
                          : formData.image // already a URL string
                      }
                      alt="Preview"
                      className="absolute inset-0 object-cover w-full h-full rounded-md"
                    />
                  ) : (
                    <>
                      <UploadIcon className="text-primary h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20" />
                      <button
                        type="button"
                        className="button button-secondary button-sm md:button-md mt-4 lg:mt-6"
                      >
                        Upload image
                      </button>
                      <p className="hidden md:block mt-2 text-base lg:text-xl">
                        Or drag and drop your file
                      </p>
                    </>
                  )}
                </div>

                {formData.image && (
                  <div className="w-full bg-bggreen items-center flex gap-4 font-semibold justify-between px-6 py-2 rounded-sm mt-4">
                    <div className="truncate text-primary">
                      {formData.image.name ||
                        formData.image.path ||
                        "Uploaded image"}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData("image", null);
                      }}
                      className="hover:text-red transition-colors"
                    >
                      <Delete className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Add text */}
            {currentStep === 2 && (
              <div className="flex flex-col flex-1 animate-in fade-in-50 slide-in-from-right-5 duration-500 min-h-0">
                <div className="flex items-center gap-2 shrink-0">
                  <Label
                    htmlFor="title"
                    className="text-2xl md:text-3xl font-medium text-primary"
                  >
                    Add title
                  </Label>
                </div>
                <p className="text-xl font-light text-black pb-3 md:pb-4 shrink-0">
                  Add a title (max 55 words)
                </p>
                <Input
                  id="title"
                  placeholder="Write your title here"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className="py-4 px-4 h-14 text-xl font-light rounded-full w-full shrink-0"
                />
                <div className="flex items-center gap-2 mt-6 md:mt-8 lg:mt-12 shrink-0">
                  <Label
                    htmlFor="description"
                    className="text-2xl md:text-3xl font-medium text-primary"
                  >
                    Add description
                  </Label>
                </div>
                <p className="text-xl font-light text-black pb-3 md:pb-4 shrink-0">
                  Add description (max 250 words)
                </p>
                <Textarea
                  id="description"
                  placeholder="Write your text here"
                  className="flex-1 py-4 px-4 text-xl text-input font-light rounded-lg w-full min-h-0 resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                />
              </div>
            )}

            {/* Step 3: Add audio */}
            {currentStep === 3 && (
              <div className="animate-in fade-in-50 slide-in-from-right-5 duration-500 flex-1">
                <div className="text-center py-12 lg:py-16">
                  <p className="text-black text-xl">
                    Add audio functionality would go here
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col justify-between mt-6 md:mt-8 lg:mt-10 mb-6 md:mb-0 gap-3 sm:gap-4 shrink-0">
              <button
                onClick={handleBack}
                className="button button-sm lg:button-md button-icon bg-bggreen"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                Previous step
              </button>
              <button
                onClick={currentStep < totalSteps ? handleNext : handleSubmit}
                className="button button-primary button-sm lg:button-md button-icon"
              >
                {currentStep < totalSteps ? "Next step" : "Submit"}
                {currentStep < totalSteps ? (
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                ) : (
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
