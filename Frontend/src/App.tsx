import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import HealthRecords from "./pages/patient/HealthRecords";
import AccessRequests from "./pages/patient/AccessRequests";
import SharedAccess from "./pages/patient/SharedAccess";
import ActivityLogs from "./pages/patient/ActivityLogs";
import InsurancePage from "./pages/patient/Insurance";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import RequestAccess from "./pages/doctor/RequestAccess";
import AuthorizedPatients from "./pages/doctor/AuthorizedPatients";
import PatientRecordsView from "./pages/doctor/PatientRecordsView";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Patient Routes */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/records"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <HealthRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/access-requests"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <AccessRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/shared-access"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <SharedAccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/activity"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/insurance"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <InsurancePage />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/request-access"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <RequestAccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <AuthorizedPatients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/records"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <PatientRecordsView />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
