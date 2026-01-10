import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserStorageKey } from "../utils/storage";

const STORAGE_KEY_ONBOARDING = "onboarding_completed";

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const storageKey = getUserStorageKey(STORAGE_KEY_ONBOARDING);
      const onboardingCompleted = localStorage.getItem(storageKey) === "true";
      
      // Only redirect if onboarding is not completed
      // Don't redirect if already on onboarding page
      if (!onboardingCompleted && location.pathname !== "/onboarding") {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  // Don't render children until we've checked onboarding status
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading...</div>
      </div>
    );
  }

  return children;
}

