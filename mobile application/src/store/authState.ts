type OnboardingRequiredSetter = (value: boolean) => void;

let setOnboardingRequiredImpl: OnboardingRequiredSetter | null = null;

export function bindSetOnboardingRequired(setter: OnboardingRequiredSetter): void {
  setOnboardingRequiredImpl = setter;
}

export function setOnboardingRequired(value: boolean): void {
  setOnboardingRequiredImpl?.(value);
}

export function syncOnboardingRequiredFromProfile(isProfileCompleted: boolean): void {
  setOnboardingRequired(!isProfileCompleted);
}
