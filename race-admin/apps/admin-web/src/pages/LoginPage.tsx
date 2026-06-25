import { LoginForm } from '@/components/auth/login-form';
import { RaceLogo } from '@/components/layout/race-logo';
import { BRAND } from '@race/constants';

/** Truck + skyline only — cropped from brand reference (excludes logo, headline, form, footer) */
function BrandTruckVisual() {
  return (
    <div className="flex min-h-0 w-full flex-1 items-end justify-center overflow-hidden px-4 pb-2">
      <div className="relative w-full max-w-[520px] overflow-hidden">
        <img
          src="/login-reference.png"
          alt="RACE roadside assistance tow truck"
          className="w-[200%] max-w-none"
          style={{
            clipPath: 'inset(48% 50% 10% 0)',
            transform: 'translateY(-4%)',
          }}
        />
      </div>
    </div>
  );
}

function LoginBrandPanel() {
  return (
    <aside className="hidden h-full w-1/2 shrink-0 flex-col bg-white px-10 py-8 xl:px-14 xl:py-10 lg:flex">
      <div className="shrink-0">
        <RaceLogo width={200} height={80} />
        <h2 className="mt-8 whitespace-nowrap text-[1.05rem] font-extrabold uppercase tracking-tight text-[#1A1A2E] xl:text-[1.2rem]">
          <span className="text-[#F5A623]">24/7</span> Roadside Assistance &amp; Towing Service
        </h2>
      </div>

      <BrandTruckVisual />
    </aside>
  );
}

export function LoginPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <LoginBrandPanel />

      <main className="flex h-full w-full min-w-0 flex-col bg-white lg:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-6 sm:px-12 md:px-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-7 flex justify-center">
              <RaceLogo width={184} height={76} />
            </div>
            <LoginForm />
          </div>
        </div>

        <p className="shrink-0 pb-6 text-center text-xs text-[#9CA3AF]">{BRAND.copyright}</p>
      </main>
    </div>
  );
}
