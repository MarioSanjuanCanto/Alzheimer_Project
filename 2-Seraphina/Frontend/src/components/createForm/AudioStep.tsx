import { Label } from "../ui/label";
import { Mic } from "@/assets/icons/mic_icon";
import { Delete } from "@/assets/icons/delete_icon";
import { Stop } from "@/assets/icons/stop_icon";
import AudioPlayer from "react-h5-audio-player";
import { useTranslation } from "react-i18next";
import "react-h5-audio-player/lib/styles.css";

export const AudioStep = ({
  formData,
  updateFormData,
  startRecording,
  deleteRecording,
  audioUrl,
  recording,
  stopRecording,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="animate-in fade-in-50 slide-in-from-right-5 duration-500 flex min-h-0 flex-1 flex-col"
      role="group"
      aria-labelledby="audio-label"
      aria-describedby="audio-hint"
    >
      {/* Title */}
      <Label htmlFor="audio-upload" className="text-xl md:text-2xl lg:text-xl text-primary">
        {t("create.fields.audio")}
      </Label>

      <p
        id="audio-hint"
        className="shrink-0 text-xl font-light text-black"
      >
        {t("create.fields.recordAudio")}
      </p>

      {/* Audio preview */}
      {audioUrl && (
        <div className="relative mt-4 w-full shrink-0">
          <button
            type="button"
            onClick={deleteRecording}
            aria-label={t("create.fields.deleteRecording")}
            className="absolute top-2 right-4 z-10"
          >
          </button>

          <AudioPlayer
            src={audioUrl}
            className="relative w-full"
            customVolumeControls={[]}
            showJumpControls={false}
            showDownloadProgress={false}
            customAdditionalControls={[]}
            style={{
              backgroundColor: "#EAF5EE",
              borderRadius: "12px",
              boxShadow: "none",
              width: "100%",
            }}
          />
          {/* Button doesnt work here */}
          <Delete className="absolute bottom-4 right-4 h-8 w-8 text-primary z-999" aria-hidden="true" />
        </div>
      )}

      {/* Recording area */}
      <div className="mt-4 flex flex-1 items-center justify-center rounded-md bg-lightgrey">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            {!recording ? (
              <>
                <div className="relative flex flex-col h-20 w-full items-center justify-center">
                  <span
                    className="absolute h-20 w-20 rounded-full bg-primary/50"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={startRecording}
                    aria-label={t("create.fields.startRecording")}
                    className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-primary"
                  >
                    <Mic className="h-10 w-10 text-white" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xl text-primary w-40 text-center">
                  {t("create.fields.startRecording")}
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopRecording}
                  aria-label={t("create.fields.stopRecording")}
                  className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-red-500"
                >
                  <Stop className="h-10 w-10 text-white" aria-hidden="true" />
                </button>
                <p className="text-xl text-primary w-40 text-center">
                  {t("create.fields.stopRecording")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
