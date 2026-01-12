import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import OnboardingGuard from "./components/OnboardingGuard";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <OnboardingGuard>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/individual" element={<Individual />} />
                    <Route path="/business" element={<LLC />} />
                    <Route path="/expense-tracking" element={<ExpenseTracking />} />
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
  );
}

export default App;
