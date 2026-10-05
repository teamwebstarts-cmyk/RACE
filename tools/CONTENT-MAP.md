# RACE Service — Content Replacement Map (v1, ready to apply)

Target: 4 cloned pages (home, service, contact, pricing).
Constraint: text-only replacement. Layout, CSS, markup structure unchanged.
Char budgets from `_text_inventory.json` (home 5,458 / service 2,197 / contact ~3.4k / pricing ~4.6k).

Facts locked to the client skill rules. Prices in ₹. Phone +91 8249475731.
Cities are real Bhubaneswar/Odisha localities per the SEO research, never invented.

---

## GLOBAL CHROME (identical on all 4 pages, 53 chars)

| Slot | Old | New | chars |
|---|---|---|---|
| skip link | Skip to content | Skip to content | 15 |
| nav 1 | home | Home | 4 |
| nav 2 | service | Service | 7 |
| nav 3 | pricing | Pricing | 7 |
| nav 4 | contact | Contact | 7 |
| offcanvas close | X | X | 1 |
| header CTA | book service | Request Help | 12 |

Nav labels capitalised: the clone's lowercase is a US-template artefact, not a
design constraint, and title-case matches the breadcrumb slots which are already
title-case.

---

## A1. HERO (248 chars / 8 strings)

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | Anywhere Anytime Assistance (27) | 24x7 Roadside Assistance, Odisha | 34 |
| H1 | Fast reliable roadside ready (28) | Stranded? We Reach You in 30 Minutes | 37 |
| para | We deliver fast, dependable... (121) | Highway breakdown, flat tyre or dead battery in Odisha? Verified RACE operators reach you in 25 minutes on average, 24 hours a day. | 129 |
| btn1 | Get Started (11) | Book Immediate Assistance | 24 |
| btn2 | Explore More (12) | Call 82494 75731 | 15 |
| trust1 | Fast response time (18) | 25-minute average arrival | 25 |
| trust2 | Anytime you need (16) | 100% upfront pricing | 20 |
| trust3 | Safe guaranteed (15) | Police-verified operators | 23 |

H1 is a 4-line 256px box; 37 chars is safe. Eyebrow must stay one line: at 13px
in a ~256px box, 34 chars wraps. Use "24x7 Roadside Assistance" (24 chars) instead.

**Corrected eyebrow:** `24x7 Roadside Assistance` (24)

---

## A2. ABOUT (355 chars / 10 strings)

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | ABOUT (5) | ABOUT RACE | 10 |
| H2 | Driven to help, built for speed (31) | Built to turn roadside panic into peace of mind | 47 |
| para | Founded to assist stranded drivers... (266) | RACE Service is operated by Saiprahallad Services Pvt Ltd from Bhubaneswar. We started with one recovery vehicle and a promise: no stranded driver pays a surprise price. Today a distributed fleet of tow trucks, flatbeds and road mechanics serves 30+ cities and highway corridors across Odisha, with police-verified crews and a 25-minute average arrival. | 291 |
| btn | explore more (12) | our services | 12 |
| counterA num | 0 (1) | 50 | 2 |
| counterA suffix | K (1) | K+ | 2 |
| counterA label | Projects Completed (18) | Vehicles rescued | 16 |
| counterB num | 0 (1) | 25 | 2 |
| counterB suffix | + (1) | min | 3 |
| counterB label | Years of Experience (19) | Average arrival | 15 |

Para target 266; the drafted 291 is 9% over, still 3 lines at 447px. Acceptable.
Counter values are placeholders in the source (Elementor renders the real number);
setting text keeps a sane fallback if the widget fails.

---

## A3. SERVICES GRID (640 chars / 21 strings) — 6 cards

Header: eyebrow `Services` (8) → `Our Services` (12); H2 `Reliable Towing, Whenever You Need` (34) → `Towing, Drivers and Roadside Help` (33); btn `View All Services` (17) → `View All Plans` (14)

| # | Title (was) | New title | Body (was chars) | New body | chars |
|---|---|---|---|---|---|
| 1 | Emergency towing (16) | Instant Towing (14) | 75 | 24/7 dispatch within 5 minutes, live GPS on the incoming truck, safe delivery to your garage. | 96 |
| 2 | Flatbed towing (14) | Flatbed Towing (15) | 84 | Hydraulic flatbed for automatics, AWD SUVs and luxury cars. Zero tyre roll, full suspension safety. | 95 |
| 3 | Roadside assistance (19) | Roadside Assistance (19) | 70 | Battery jumpstart from Rs 299, tyre change from Rs 199, fuel delivery from Rs 149, on the spot. | 91 |
| 4 | Vehicle recovery (16) | Accident Recovery (17) | 60 | Priority dispatch for collisions, ditch extraction and overturned vehicles, with no secondary damage. | 96 |
| 5 | Motorcycle towing (17) | Motorcycle Towing (17) | 66 | Specialised bike cradles and high-tensile tie-downs for two-wheelers and superbikes. | 81 |
| 6 | Lockout service (15) | Driver on Demand (16) | 63 | Verified chauffeurs by the hour or by the day, for your manual, automatic or EV. | 79 |

Body floor is 60 chars (353px box renders 2 lines). All six sit 79–96, safe.
Buttons: `Get Service` (11) ×6 → `Get Quote` (10) ×6.

---

## A4. HOW IT WORKS (317 chars / 11 strings)

RACE's brief has 4 steps; the layout holds 3 cards. Map RACE steps 2–4 into the
three cards and put step 1 in the eyebrow. Do not add a fourth card.

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | how it work (11) | how it works in 3 steps | 22 |
| H2 | Just 3 easy steps (17) | From call to recovery in minutes | 31 |
| step1 title | Contact us (10) | Request in 30 seconds | 21 |
| step1 body | Call or message us... (75) | Call +91 8249475731 or use the app. Your GPS pins the location and you pick tow, driver or quick fix. | 100 |
| step2 title | We're on the way (16) | Nearest pro dispatched | 20 |
| step2 body | We dispatch the nearest tow truck... (87) | The closest verified tow truck, flatbed or mechanic is assigned automatically, with a live ETA on your screen. | 109 |
| step3 title | Problem solved (14) | Safe resolution and pay | 22 |
| step3 body | Your vehicle is towed or fixed on-site... (81) | The operator verifies by OTP, does the work, and you pay by UPI, card, net banking or cash. | 90 |

---

## A5. WHY CHOOSE US (554 chars / 12 strings)

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | why choose us (13) | the race advantage | 17 |
| H2 | Driven By Care. Powered By Speed. (33) | Built for emergencies, backed by trust | 36 |
| 1 title | 1. 24/7 availability (20) | 1. 30-minute rapid arrival | 25 |
| 1 body | Available anytime, day or night... (84) | A distributed fleet stationed across cities and national highways, not parked in one garage. | 91 |
| 2 title | 2. Fast response time (21) | 2. Honest, fixed pricing | 24 |
| 2 body | Our team arrives quickly... (76) | Every rate is quoted upfront by distance and service. No haggling, no midnight price hikes. | 90 |
| 3 title | 3. Certified & trained team (27) | 3. Verified and trained crew | 28 |
| 3 body | Professional drivers and technicians... (88) | Police record checks, licence audits and a minimum three years of highway driving experience. | 92 |
| 4 title | 4. Transparent pricing (22) | 4. 24/7/365 availability | 24 |
| 4 body | Clear, upfront pricing with no hidden... (76) | Rain, midnight transit or a remote highway stretch, our control room and fleet never sleep. | 87 |
| 5 title | 5. Modern equipment (19) | 5. Safe, damage-free towing | 29 |
| 5 body | We use reliable, damage-free towing... (75) | Flatbeds, wheel-lifts and winches chosen per model so your bodywork and transmission stay intact. | 97 |

Titles keep the hard-coded "N. " prefix. Bodies target 75–97; the 672px box holds
2 lines comfortably.

---

## A6. PRICING STRIP (283 chars / 9 strings)

Chips auto-size to text, so keep them similar length to the originals (14–28).

| # | Old (chars) | New | chars |
|---|---|---|---|
| 1 | Flat base rate (14) | Fixed upfront rates | 20 |
| 2 | Distance based towing (21) | Distance based towing | 21 |
| 3 | Optional add-ons (16) | No night surcharges | 19 |
| 4 | Free estimates service start (28) | Free estimate before dispatch | 27 |
| 5 | No after hours fees (19) | 24/7 helpline, all year | 24 |

Block: eyebrow `Accurate Estimates` (18) → `Transparent Pricing` (20); H2 `Transparent rates. No surprises.` (32) → `Fixed rates. Zero surprises.` (27); para (125) → `Instant towing from Rs 499, roadside assistance from Rs 149. You see the final price before dispatch, and it does not change on the road.` (133); btn `Learn More` (10) → `See Pricing` (11)

---

## A7. COVERAGE (276 chars / 10 strings)

Real Bhubaneswar localities and named corridors, per the competitor audit.

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | Coverage Area (13) | Coverage Areas | 14 |
| H2 | Serving you wherever you are (28) | Serving you across Bhubaneswar and Odisha | 42 |
| para | We proudly serve a wide range... (154) | From Mancheswar and Patia to Chandrasekharpur and Khandagiri, and out along NH-16 towards Khordha and Cuttack. Our fleet is stationed across 30+ cities and highway corridors, so help is one call away. | 180 |
| area1 | Central city (12) | Mancheswar | 11 |
| area2 | Lake view (9) | Patia | 5 |
| area3 | Highway 45 (10) | NH-16 | 5 |
| area4 | Industrial zone B (17) | Chandrasekharpur | 17 |
| area5 | West hills (10) | Khandagiri | 10 |
| area6 | River bend (10) | Old Town | 8 |

Names stay within the 73px column. "West hills" was the only 2-line name; all six
new names are 5–17 chars so the row evens out.

---

## A8. EMERGENCY CTA (89 chars / 4 strings)

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | CALL US (7) | CALL US | 7 |
| H2 | Stranded? We're on the way (26) | Stranded? We are on the way | 28 |
| icon item | 1-800-555-0100  (Available 24/7) (32) | +91 82494 75731  (Available 24/7) | 34 |

Keep the double space before the parenthesis so the metric width holds.
"No content is added yet." is an empty MetaForm plugin placeholder. Leave it.

---

## A9. REVIEWS (506 chars / 13 strings)

Use RACE's own scenarios. Flag to the user: these came from the client brief,
so they need consent before publishing.

| Slot | Old (chars) | New | chars |
|---|---|---|---|
| eyebrow | customer review (15) | customer reviews | 16 |
| H2 | What our customers say. (23) | What our customers say | 23 |
| btn ×2 | View All Review (15) | View All Reviews | 16 |
| card1 author | Jonathan S. (11) | Subhashree M. | 12 |
| card1 loc | Dallas, TX (10) | Bhubaneswar | 11 |
| card1 quote | "Had a flat tire on the freeway..." (126) | "My car's radiator burst on NH-16 near Khordha at 11:30 PM with my family inside. A flatbed arrived in 22 minutes." | 118 |
| card2 author | Carlos M. (9) | Rajesh K. N. | 11 |
| card2 loc | Dallas, TX (10) | Cuttack | 7 |
| card2 quote | (duplicate of card1, 126) | "Booked a night driver after a wedding in Cuttack. Punctual, careful with my automatic sedan, parked it in my garage." | 119 |
| card3 author | Amanda R. (9) | Ananya P. | 9 |
| card3 loc | Las Vegas, NV (13) | Chandrasekharpur | 17 |
| card3 quote | "Towing can be stressful..." (124) | "Dead battery outside my office at 8 PM. The technician reached me in 18 minutes, started it in 2. Just Rs 299." | 121 |

Quotes use the source's curly quotes. Both "View All Review" buttons must change
together or the mobile copy desyncs.

---

## A10. FAQ (1,588 chars / 22 strings) — exactly 10 items

Questions phrased as search queries per the competitor pattern. Answers open with
the answer, then the reason (AEO answer-first).

| # | New question | New answer |
|---|---|---|
| 1 | Where does RACE provide roadside assistance in Bhubaneswar? | We cover Mancheswar, Patia, Chandrasekharpur, Khandagiri, Old Town and the wider Bhubaneswar area, plus NH-16 towards Khordha and Cuttack. Our fleet is spread across 30+ cities and highway corridors. |
| 2 | Is RACE available 24 hours a day in Odisha? | Yes. Our control room and on-road fleet run 24 hours a day, 7 days a week, 365 days a year, including weekends, holidays and late-night highway stretches. |
| 3 | How long does it take RACE to reach me? | Our average arrival is 25 minutes in the city and under 35 minutes on major highways. Membership plans improve this further, with priority response under 15 minutes. |
| 4 | Which vehicles can you tow or recover? | Two-wheelers and superbikes, hatchbacks and sedans, SUVs and MUVs including Creta, Scorpio and XUV700, plus commercial vans and pickups. |
| 5 | Do you fix problems on the spot without towing? | In many cases yes. Battery jumpstart is Rs 299, tyre change or puncture repair Rs 199, fuel delivery Rs 149 plus fuel, and minor electrical repairs Rs 399. |
| 6 | Do you offer intercity and long-distance towing? | Yes. Scheduled intercity transport starts at Rs 399, with a guaranteed slot, transit protection and a written vehicle condition report before transit. |
| 7 | How much does roadside assistance cost in Bhubaneswar? | Instant towing starts at Rs 499, scheduled and intercity at Rs 399, and accident recovery at Rs 699. Membership plans from Rs 299 a month bring towing down substantially. |
| 8 | Do you help after a highway accident? | Yes. Accident recovery starts at Rs 699 with a priority channel, traffic coordination at the scene, and coordination with your insurance surveyor and authorised repair centre. |
| 9 | Can you tow a motorcycle or superbike? | Yes, using specialised bike cradles and high-tensile tie-downs so the bike and its components are not damaged in transit. |
| 10 | How do I request RACE assistance without internet? | Dial +91 8249475731. Our phone dispatchers locate you from a landmark and assign the nearest unit manually, 24 hours a day. |

FAQ is byte-identical on home and contact. Edit the source once.

---

## A11. FOOTER (549 chars / 38 strings) — identical on all 4 pages

CTA band:
| Slot | Old | New |
|---|---|---|
| H2 | Emergency Towing? Call Us Now! (30) | Stranded on the highway? Call RACE Now (35) |
| phone H2 | 1-800-555-0100 (14) | +91 82494 75731 (14) |
| para | Fast, reliable towing service available 24/7... (97) | 24/7 roadside assistance across Odisha. Towing from Rs 499, roadside help from Rs 149, 25-minute average arrival. (121) |

Columns (heading + 4 links each):
| Col | New heading | New links |
|---|---|---|
| 1 | Company | About Us / Our Fleet / Service Areas / Careers |
| 2 | Support | Contact Us / Request a Tow / FAQs / Safety Guidelines |
| 3 | Services | Instant Towing / Roadside Assistance / Driver on Demand / Accident Recovery |
| 4 | Resources | Membership Plans / Safety Tips / Towing Guide / Vehicle Checklist |
| 5 | Locations | Main Office / Patia Hub / Cuttack Hub / Partner Stations |
| 6 | Legal | Privacy Policy / Terms of Service / Refund Policy / Accessibility |

Column 3 links run longer than the originals (16–19 chars vs 16–19). "Driver on
Demand" is 16 and "Accident Recovery" is 17, matching the source widths.

Bottom bar:
- `Copyright © 2025 Rapidtow` (25) → `Copyright © 2026 RACE Service` (29)
- Social screen-reader labels stay.

---

## SERVICE PAGE (2,197 chars)

B1 header: H1 `Service` (7) → `Services` (8); breadcrumb `Home` (4) / `Services` (8)
B2/B3: identical to A3 grid.
B4 coverage: identical to A7 minus the "View All Area" button.
B5 why choose us: A5 plus the page-only intro paragraph —
`Built for emergencies and backed by trust...` (120) → `RACE Service runs a distributed recovery fleet from Bhubaneswar, covering city roads and highway corridors across Odisha with fixed pricing and verified operators.` (161)

---

## CONTACT PAGE

Hero: H1 `Contact` (7) → `Contact` (7) · breadcrumb `Home` (4) / `Contact` (7)
Eyebrow `Let's TALK` (10) → `LET'S TALK` (10)
H2 `Reach out. We're ready to roll` (30) → `Reach us. We are ready to roll` (31)
Sub `Connect with Us` (15) → `Connect with RACE` (16)
Sub2 `Have questions? Talk to us` (26) → `Need help? Talk to us now` (24)
Sub3 `Keep it concise` (15) → `Available 24/7` (14)

Three method cards:
| Slot | Old | New |
|---|---|---|
| card1 label | Phone (5) | Phone |
| card1 value | 1-800-555-0100 (14) | +91 82494 75731 (14) |
| card2 label | Email (5) | Email |
| card2 value | help@rapidtow.com (17) | support@raceservice.com (23) |
| card3 label | Address (7) | Office |
| card3 value | 456 Oak Avenue\nSpringfield, IL 62704\nUSA (40) | Bhubaneswar, Odisha\nIndia - 751024 (30) |

FAQ: identical to A10.
Footer: identical to A11.

---

## PRICING PAGE (125 nodes)

Page header: H1 `Pricing` (7) → `Pricing` (7) · breadcrumb `Home` (4) / `Pricing` (7)
Eyebrow `Affordable pricing` (18) → `Membership & Pricing` (21)
H2 `Reliable towing for every situation` (35) → `Plans that fit how you drive` (30)

Four plan cards map to RACE's four membership tiers:

| # | Old | New plan name | New price | New tagline | benefits (7 each, was 7) |
|---|---|---|---|---|---|
| 1 | Basic Assist / $59 | Basic Rider / Rs 299 | | Great for occasional city driving | |
| 2 | City Haul / $129 | Premium Shield / Rs 599 | | Daily commuters and highway travellers | |
| 3 | Highway Rescue / $299 | Family Guardian / Rs 999 | | Multi-car households on Odisha highways | |
| 4 | Fleet Guard / $999 | Chauffeur Pass / Rs 1,499 | | Verified driver hours for busy schedules | |

Card price string `$59` (3) → `Rs 299` (6); `$129` (4) → `Rs 599` (7); `$299` → `Rs 999`; `$999` → `Rs 1,499` (9). The `/ service` suffix (9) → `/ month` (7). `order now` (9) → `Choose Plan` (11).

Benefits — exactly 7 per card, keeping the count:
1. 2 free towing calls every month
2. Battery, tyre and fuel assistance
3. Response within 30 minutes
4. 1 free windshield QR sticker
5. 24/7 emergency helpline access
6. Police-verified operators only
7. No hidden charges, ever

2. 5 free towing calls every month
3. Priority response within 15 minutes
4. Battery, tyre and fuel assistance
5. 10% discount on driver bookings
6. 1 free windshield QR sticker
7. 24/7 priority helpline access

3. Unlimited towing for up to 4 cars
4. VIP response within 10 minutes
5. Full roadside assistance included
6. 20% discount on driver bookings
7. 4 free windshield QR stickers

4. Up to 4 driver hours every day
5. Scheduled and outstation chauffeur
6. 1 free windshield QR sticker
7. Priority rescheduling support

Pricing strip + estimates block: identical to A6.

---

## PLACEHOLDERS TO PURGE (verify none survive)

`1-800-555-0100` · `help@rapidtow.com` · `Rapidtow` · `Copyright © 2025` ·
`456 Oak Avenue` · `Springfield, IL 62704` · `Dallas, TX` · `Las Vegas, NV` ·
`Central city` · `Lake view` · `Highway 45` · `Industrial zone B` ·
`West hills` · `River bend` · `Downtown Garage` · `East Side Lot` ·
`Partner Stations` · `$59` `$129` `$299` `$999`