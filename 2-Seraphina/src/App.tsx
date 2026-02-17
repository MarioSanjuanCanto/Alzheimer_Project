import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import View from "./pages/View";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MyProfileSettings from "./components/settings/MyProfileSettings";
import ExercisesOverview from "./pages/ExercisesOverview";
import { MemoryForm } from "./components/createForm/MemoryForm";
import Practice from "./pages/Practice";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import { ParticipantProvider } from "./context/practicerContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ParticipantProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] bg-white px-4 py-2 rounded-md shadow"
            >
              Skip to main content
            </a>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<MemoryForm />} />
              <Route path="/view" element={<View />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/my-profile-settings"
                element={<MyProfileSettings currentProfile={undefined} />}
              />
              <Route
                path="/exercises-overview"
                element={<ExercisesOverview />}
              />
              <Route path="/edit/:id" element={<MemoryForm />} />
              <Route path="/practice/:memoryId" element={<Practice />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ParticipantProvider>
  );
};

export default App;
