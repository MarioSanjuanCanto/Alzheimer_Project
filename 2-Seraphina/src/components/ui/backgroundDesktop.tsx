import { LineRightDesktop } from "@/assets/shapes/LineRightDesktop";
import { LineLeftDesktop } from "@/assets/shapes/LineLeftDesktop";
import { LineTopTablet } from "@/assets/shapes/LineTopTablet";
import { LineBottomTablet } from "@/assets/shapes/LineBottomTablet";
import { LineTopMobile } from "@/assets/shapes/LineTopMobile";
import { LineBottomMobile } from "@/assets/shapes/LineBottomMobile";

export default function BackgroundDesktop() {
  return (
    <div className="lg:block absolute inset-0 min-h-screen w-screen z-0 bg-bggreen overflow-hidden">
      <LineTopMobile className="md:hidden w-full absolute aspect-[375/140] -top-[clamp(1rem,1vh,2rem)]" />
      <LineBottomMobile className="md:hidden absolute -bottom-[clamp(3rem,3vh,3rem)] w-full aspect-[390/220] " />
      <LineTopTablet
        className="hidden md:block lg:hidden absolute w-full -top-[clamp(1rem,1vh,1rem)]"
      />
      <LineBottomTablet
        className="hidden md:block lg:hidden absolute w-full -bottom-[clamp(6rem,4vh,6rem)]"
      />
      <LineLeftDesktop
        className="hidden lg:block absolute lg:top-0 lg:-left-72 xl:top-0 xl:-left-60 2xl:top-0 2xl:-left-14 z-0"
      />
      <LineRightDesktop className="hidden lg:block absolute right-0 bottom-0 z-0" />
    </div>
  );
}
