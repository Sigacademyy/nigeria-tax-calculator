import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserStorageKey } from "../utils/storage";

const STORAGE_KEY_ONBOARDING = "onboarding_completed";

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storageKey = getUserStorageKey(STORAGE_KEY_ONBOARDING);
    const onboardingCompleted = localStorage.getItem(storageKey) === "true";
    
    // Only redirect if onboarding is not completed
    // Don't redirect if already on onboarding page
    if (!onboardingCompleted && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate, location.pathname]);

  return children;
}

