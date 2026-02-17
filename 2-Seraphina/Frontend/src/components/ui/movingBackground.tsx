export default function MovingBackground() {
    return (
        <>
            <div className="absolute inset-0 bg-white/30 z-10 backdrop-blur-2xl overflow-hidden">
            </div>
            {/* <div className="absolute top-[-5rem] left-[-5rem] w-[25rem] h-[25rem] bg-[#112A1F]/40 rounded-full animate-drift-erratic"></div>
            <div className="absolute -top-[10rem] right-[7rem] w-[30rem] h-[30rem] bg-[#2D6A4F]/70 rounded-full animate-drift-slow"></div>
            <div className="absolute bottom-[-10rem] left-1/4 w-[30rem] h-[30rem] bg-[#40916C]/70 rounded-full animate-drift-erratic"></div>
            <div className="absolute top-1/2 left-[5rem] w-[10rem] h-[10rem] bg-[#40916C]/70 rounded-full animate-drift"></div>
            <div className="absolute -bottom-[5rem] right-[5rem] w-[25rem] h-[25rem] bg-[#0B2B1F]/70 rounded-full animate-drift-diagonal"></div> */}
            <div className="absolute bottom-1/2 left-1/3 w-[20rem] h-[20rem] bg-[#1B4332]/30 rounded-full animate-drift-fast"></div>
            <div className="absolute bottom-[-5rem] right-1/3 w-[10rem] h-[10rem] bg-[#1B4332]/40 rounded-full animate-drift"></div>
            <div className="hidden lg:block">
                <div className="absolute top-[-8rem] left-[10rem] w-[15rem] h-[15rem] bg-[#2D6A4F]/50 rounded-full animate-drift-slow"></div>
                <div className="absolute top-[10rem] right-[12rem] w-[20rem] h-[20rem] bg-[#40916C]/40 rounded-full animate-drift-erratic"></div>
                <div className="absolute bottom-[-12rem] left-[5rem] w-[25rem] h-[25rem] bg-[#40916C]/60 rounded-full animate-drift-diagonal"></div>
                <div className="absolute top-[20rem] left-[20rem] w-[12rem] h-[12rem] bg-[#112A1F]/30 rounded-full animate-drift-fast"></div>
                <div className="absolute bottom-[5rem] right-[10rem] w-[18rem] h-[18rem] bg-[#0B2B1F]/50 rounded-full animate-drift"></div>
                <div className="absolute top-[5rem] right-[5rem] w-[14rem] h-[14rem] bg-[#2D6A4F]/30 rounded-full animate-drift-slow"></div>
                {/* <div className="absolute bottom-[5rem] left-[15rem] w-[40rem] h-[40rem] bg-[#1B4332]/40 rounded-full animate-drift-erratic"></div> */}
                <div className="absolute top-[-12rem] left-[14rem] w-[15rem] h-[15rem] bg-[#2D6A4F]/50 rounded-full animate-drift-slow"></div>
                <div className="absolute top-[1rem] right-[12rem] w-[20rem] h-[20rem] bg-[#40916C]/40 rounded-full animate-drift-erratic"></div>
                <div className="absolute bottom-[-6rem] left-[10rem] w-[25rem] h-[25rem] bg-[#40916C]/60 rounded-full animate-drift-diagonal"></div>
                <div className="absolute top-[2rem] left-[20rem] w-[60rem] h-[60rem] bg-[#40916C]/30 rounded-full animate-drift-fast"></div>
                <div className="absolute bottom-[12rem] right-[15rem] w-[18rem] h-[18rem] bg-[#40916C]/50 rounded-full animate-drift"></div>
                <div className="absolute top-[8rem] right-[8rem] w-[14rem] h-[14rem] bg-[#2D6A4F]/30 rounded-full animate-drift-slow"></div>
                <div className="absolute bottom-[10rem] left-[10rem] w-[16rem] h-[16rem] bg-[#40916C]/40 rounded-full animate-drift-erratic"></div>
            </div>
        </>
    )
}