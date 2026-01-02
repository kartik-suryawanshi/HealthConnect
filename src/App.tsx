import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import HealthRecords from "./pages/patient/HealthRecords";
import AccessRequests from "./pages/patient/AccessRequests";
import SharedAccess from "./pages/patient/SharedAccess";
import ActivityLogs from "./pages/patient/ActivityLogs";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import RequestAccess from "./pages/doctor/RequestAccess";
import AuthorizedPatients from "./pages/doctor/AuthorizedPatients";
import PatientRecordsView from "./pages/doctor/PatientRecordsView";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Patient Routes */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/records" element={<HealthRecords />} />
            <Route path="/patient/access-requests" element={<AccessRequests />} />
            <Route path="/patient/shared-access" element={<SharedAccess />} />
            <Route path="/patient/activity" element={<ActivityLogs />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/request-access" element={<RequestAccess />} />
            <Route path="/doctor/patients" element={<AuthorizedPatients />} />
            <Route path="/doctor/records" element={<PatientRecordsView />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
