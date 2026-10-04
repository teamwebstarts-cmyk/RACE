# Gates: Wizard hero lift and stepper-title gap

OWNS: customer application/src/screens/onboarding/ProfileWizardScreen.tsx, customer application/src/components/onboarding/ProfileSetupChrome.tsx

Scope: Lift step 1–3 hero SVGs above the overlapping card without moving title copy; add space between the 1-2-3 stepper and the title on all three steps.

- [x] G1: Customer app TypeScript passes
  CHECK: npx tsc --noEmit && echo tsc_ok
  EXPECT: tsc_ok
  CWD: .
  EVIDENCE: automatic-evidence=v1; definition-sha256=8db859b868d2090366353bbfaaa8aaebab393c36d2eb60995b5c027af5ee7a88; exit=0; EXPECT=matched; output-sha256=fb8c1e822431bfe4cbbd8ed9ef59223b42b1138f1552f311b2ae027de4774183; output-bytes=7; shell=/bin/sh; cwd=/workspaces/RACE/customer application; path=03f354de2adf/41 entries

- [x] G2: Hero is lifted more and copy sits below the stepper with extra padding
  CHECK: node -e "const fs=require('fs');const w=fs.readFileSync('src/screens/onboarding/ProfileWizardScreen.tsx','utf8');const c=fs.readFileSync('src/components/onboarding/ProfileSetupChrome.tsx','utf8');const lift=Number((w.match(/WIZARD_HERO_LIFT = (\\d+)/)||[])[1]);const copyH=Number((w.match(/WIZARD_COPY_BLOCK_HEIGHT = (\\d+)/)||[])[1]);const pad=(w.match(/paddingTop:\\s*(\\d+)\\s*\\*\\s*scale/)||[])[1];const padN=Number(pad);const stepGap=/marginBottom:\\s*1[2-9]\\s*\\*\\s*scale|marginBottom:\\s*[2-9]\\d\\s*\\*\\s*scale/.test(c);if(!(lift>=26))process.exit(1);if(!(copyH>=96))process.exit(1);if(!(padN>=14))process.exit(1);if(!stepGap)process.exit(1);process.stdout.write('wizard spacing check passed\\n');"
  EXPECT: wizard spacing check passed
  CWD: .
  EVIDENCE: automatic-evidence=v1; definition-sha256=11133e9770b726a052305e563bb86755fdc5b325d1d53dd38fb050b5b7fc0013; exit=0; EXPECT=matched; output-sha256=7d85a78d592c946731da41e63a2844f3b5e3940e3063d38a5df666d7e9e69871; output-bytes=28; shell=/bin/sh; cwd=/workspaces/RACE/customer application; path=03f354de2adf/41 entries
