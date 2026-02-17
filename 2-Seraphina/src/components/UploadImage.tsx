import { UploadIcon } from "@/assets/icons/upload_icon";
import { Label } from "@/components/ui/label";

interface UploadImageProps {
    formData: any;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  }
  
  
  const UploadImage = ({ formData, handleFileChange }: UploadImageProps) => {
    return (
      <div className="animate-in fade-in-50 slide-in-from-right-5 duration-500 flex-1 flex flex-col min-h-0 lg:px-[7.125]">
        <div className="flex items-center gap-2 shrink-0 mb-3">
          <Label htmlFor="image-upload" className="text-2xl md:text-3xl font-medium text-primary">
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
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {formData.image ? (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="absolute inset-0 object-cover w-full h-full rounded-md"
            />
          ) : (
            <>
              <UploadIcon className="text-primary h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20" />
              <button type="button" className="button button-secondary button-sm md:button-md mt-4 lg:mt-6">
                Upload image
              </button>
              <p className="hidden md:block mt-2 text-base lg:text-xl">Or drag and drop your file</p>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default UploadImage;