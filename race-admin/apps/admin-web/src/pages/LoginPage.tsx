import { LoginForm } from '@/components/auth/login-form';
import { RaceLogo } from '@/components/layout/race-logo';
import { BRAND } from '@race/constants';

/** Truck + skyline only — cropped from brand reference (excludes logo, headline, form, footer) */
function BrandTruckVisual() {
  return (
    <div className="relative flex min-h-0 w-full flex-1 items-end justify-center overflow-hidden px-4 pb-4">
      <div
        className="login-glow-orb pointer-events-none absolute left-1/4 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#F5A623]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="login-glow-orb pointer-events-none absolute bottom-1/4 right-1/4 h-36 w-36 rounded-full bg-[#F5A623]/10 blur-2xl"
        style={{ animationDelay: '1.5s' }}
        aria-hidden
      />

      <div className="login-truck-wrap relative w-full max-w-[540px]">
        <div className="overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(26,26,46,0.12)]">
          <img
            src="/login-reference.png"
            alt="RACE roadside assistance tow truck"
            className="login-truck-img w-[200%] max-w-none"
            style={{
              clipPath: 'inset(48% 50% 10% 0)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LoginBrandPanel() {
  return (
    <aside className="login-hero-bg relative hidden h-full w-1/2 shrink-0 flex-col overflow-hidden px-10 py-8 xl:px-14 xl:py-10 lg:flex">
      <div className="login-animate-slide-left shrink-0">
        <h2 className="whitespace-nowrap text-[1.05rem] font-extrabold uppercase tracking-tight text-[#1A1A2E] xl:text-[1.25rem]">
          <span className="text-[#F5A623]">24/7</span> Roadside Assistance &amp; Towing Service
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6B7280]">
          Reliable towing and roadside support — managed from one powerful admin dashboard.
        </p>
      </div>

      <BrandTruckVisual />
    </aside>
  );
}

export function LoginPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <LoginBrandPanel />

      <main className="relative flex h-full w-full min-w-0 flex-col bg-white lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="login-glow-orb absolute -right-16 top-20 h-56 w-56 rounded-full bg-[#F5A623]/8 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-6 sm:px-12 md:px-16">
          <div className="w-full max-w-[460px]">
            <div className="login-animate-scale-in mb-10 flex w-full justify-center">
              <RaceLogo width={340} height={136} align="center" className="drop-shadow-sm" />
            </div>

            <div className="login-animate-fade-up login-delay-2">
              <LoginForm />
            </div>
          </div>
        </div>

        <p className="login-animate-fade-in login-delay-4 shrink-0 pb-6 text-center text-xs text-[#9CA3AF]">
          {BRAND.copyright}
        </p>
      </main>
    </div>
  );
}
