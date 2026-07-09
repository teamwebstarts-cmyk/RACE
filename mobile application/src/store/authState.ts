type OnboardingRequiredSetter = (value: boolean) => void;

let setOnboardingRequiredImpl: OnboardingRequiredSetter | null = null;

export function bindSetOnboardingRequired(setter: OnboardingRequiredSetter): void {
  setOnboardingRequiredImpl = setter;
}

export function setOnboardingRequired(value: boolean): void {
  setOnboardingRequiredImpl?.(value);
}

export function syncOnboardingRequiredFromProfile(_isProfileCompleted: boolean): void {
  // Customer onboarding progress is tracked by customerOnboardingStep, not profile completion.
}
