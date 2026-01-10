import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import Individual from "./pages/Individual";
import LLC from "./pages/LLC";
import ExpenseTracking from "./pages/ExpenseTracking";
import ComplianceNotes from "./pages/ComplianceNotes";
import Onboarding from "./pages/Onboarding";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingGuard from "./components/OnboardingGuard";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
        <OnboardingGuard>
          <Routes>
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/individual"
                    element={
                      <ProtectedRoute>
                        <Individual />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/business"
                    element={
                      <ProtectedRoute>
                        <LLC />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expense-tracking"
                    element={
                      <ProtectedRoute>
                        <ExpenseTracking />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/compliance-notes" element={<ComplianceNotes />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </OnboardingGuard>
      </BrowserRouter>
      </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
