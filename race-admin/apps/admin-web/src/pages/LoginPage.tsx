import { LoginForm } from '@/components/auth/login-form';
import { RaceLogo } from '@/components/layout/race-logo';

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — brand & hero (matches reference mockup) */}
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#F4F5F7] px-10 py-10 xl:px-14 lg:flex">
        <div className="relative z-10">
          <RaceLogo width={168} height={76} />
          <h2 className="mt-10 max-w-md text-[1.75rem] font-extrabold uppercase leading-snug tracking-tight text-[#1A1A2E] xl:text-3xl">
            <span className="text-[#F5A623]">24/7</span> Roadside Assistance Platform
          </h2>
        </div>

        <div className="relative z-10 mt-8 flex flex-1 items-end justify-center">
          <div className="relative w-full max-w-2xl overflow-hidden">
            <img
              src="/login-hero.png"
              alt="RACE roadside assistance tow truck"
              className="h-auto w-[200%] max-w-none object-cover object-left"
              style={{ clipPath: 'inset(18% 48% 0 0)' }}
            />
          </div>
        </div>

        <p className="relative z-10 mt-8 text-center text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} RACE Service. All rights reserved.
        </p>
      </section>

      {/* Right — login form */}
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 lg:w-[480px] lg:max-w-[45%] lg:flex-none xl:w-[520px]">
        <div className="mb-10">
          <RaceLogo width={150} height={68} className="mx-auto items-center" />
        </div>

        <LoginForm />

        <p className="mt-12 hidden text-center text-xs text-[#9CA3AF] lg:block">
          © {new Date().getFullYear()} RACE Service. All rights reserved.
        </p>
      </section>
    </div>
  );
}
