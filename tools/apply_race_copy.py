#!/usr/bin/env python
"""Replace the clone's copy with RACE Service content, text nodes only.

Design constraint: markup, classes, element order and CSS are untouched. Only the
text between > and < changes. Every replacement is matched on the *exact* old
string, and each one asserts it fired — so a silent no-op is impossible.

Shared strings (services grid, FAQ, footer) appear on several pages; the mapping
below is global and applies wherever the old string occurs.

Char budgets come from CONTENT-MAP.md, derived from the rendered inventory.
Overshoot is allowed only where the box has room (documented inline).
"""
from __future__ import annotations

import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

# ---------------------------------------------------------------------------
# Global chrome + footer (identical on all pages)
# ---------------------------------------------------------------------------
GLOBAL: list[tuple[str, str]] = [
    # header CTA
    ("book service", "Request Help"),
    # footer CTA band
    ("Emergency Towing? Call Us Now!", "Stranded on the highway? Call RACE Now"),
    ("1-800-555-0100", "+91 82494 75731"),
    (
        "Fast, reliable towing service available 24/7 for breakdowns, accidents, "
        "and roadside emergencies.",
        "24/7 roadside assistance across Odisha. Towing from Rs 499, roadside "
        "help from Rs 149, 25-minute average arrival.",
    ),
    # footer columns
    ("Request a Tow", "Request a Tow"),
    ("Service Terms", "Safety Guidelines"),
    ("Emergency Towing", "Instant Towing"),
    ("Roadside Assistance", "Roadside Assistance"),
    ("Vehicle Recovery", "Driver on Demand"),
    ("Motorcycle Towing", "Accident Recovery"),
    ("Blog", "Membership Plans"),
    ("Main Office", "Main Office"),
    ("Downtown Garage", "Patia Hub"),
    ("East Side Lot", "Cuttack Hub"),
    ("Partner Stations", "Partner Stations"),
    ("Insurance Info", "Refund Policy"),
    # bottom bar
    ("Copyright © 2025 Rapidtow", "Copyright © 2026 RACE Service"),
    # contact page cards
    ("help@rapidtow.com", "support@raceservice.com"),
    ("456 Oak Avenue\nSpringfield, IL 62704\nUSA", "Bhubaneswar, Odisha\nIndia - 751024"),
]

# ---------------------------------------------------------------------------
# Per-slot replacements. Keyed by (page, old text). A None page means all pages.
# ---------------------------------------------------------------------------
TEXTS: dict[str, list[tuple[str, str]]] = {
    "home.html": [
        # --- hero -------------------------------------------------------
        ("Anywhere Anytime Assistance", "24x7 Roadside Assistance"),
        ("Fast reliable roadside ready", "Stranded? We Reach You in 30 Minutes"),
        (
            "We deliver fast, dependable towing and roadside support, getting you "
            "safely back on the road day or night, rain or shine.",
            "Highway breakdown, flat tyre or dead battery in Odisha? Verified "
            "RACE operators reach you in 25 minutes on average, 24 hours a day.",
        ),
        ("Get Started", "Book Immediate Assistance"),
        ("Explore More", "Call 82494 75731"),
        ("Fast response time", "25-minute average arrival"),
        ("Anytime you need", "100% upfront pricing"),
        ("Safe guaranteed", "Police-verified operators"),
        # --- about ------------------------------------------------------
        ("ABOUT", "ABOUT RACE"),
        ("Driven to help, built for speed", "Built to turn roadside panic into peace of mind"),
        (
            "Founded to assist stranded drivers with dependable roadside help, our "
            "towing service began with one truck and a mission to deliver fast, "
            "friendly support. Today, we proudly serve hundreds of customers "
            "daily with expanded fleets, trained teams, and 24/7 availability.",
            "RACE Service is operated by Saiprahallad Services Pvt Ltd from "
            "Bhubaneswar. We started with one recovery vehicle and a promise: no "
            "stranded driver pays a surprise price. Today a distributed fleet of "
            "tow trucks, flatbeds and road mechanics serves 30+ cities and "
            "highway corridors across Odisha, with police-verified crews and a "
            "25-minute average arrival.",
        ),
        ("explore more", "our services"),
        ("Projects Completed", "Vehicles rescued"),
        ("Years of Experience", "Average arrival"),
        # --- services grid ----------------------------------------------
        ("Reliable Towing, Whenever You Need", "Towing, Drivers and Roadside Help"),
        ("View All Services", "View All Plans"),
        ("Emergency towing", "Instant Towing"),
        (
            "24/7 quick-response towing for accidents, breakdowns, or stranded vehicles.",
            "24/7 dispatch within 5 minutes, live GPS on the incoming truck, safe "
            "delivery to your garage.",
        ),
        ("Flatbed towing", "Flatbed Towing"),
        (
            "Safe transport for luxury, low-clearance, or immobile vehicles using "
            "flatbed trucks.",
            "Hydraulic flatbed for automatics, AWD SUVs and luxury cars. Zero tyre "
            "roll, full suspension safety.",
        ),
        (
            "Help with jump-starts, tire changes, fuel delivery, and minor repairs.",
            "Battery jumpstart from Rs 299, tyre change from Rs 199, fuel delivery "
            "from Rs 149, on the spot.",
        ),
        ("Vehicle recovery", "Accident Recovery"),
        (
            "Winching and recovery from ditches, mud, or accident scenes.",
            "Priority dispatch for collisions, ditch extraction and overturned "
            "vehicles, with no secondary damage.",
        ),
        (
            "Specialized towing service designed for safe motorcycle transport.",
            "Specialised bike cradles and high-tensile tie-downs for two-wheelers "
            "and superbikes.",
        ),
        ("Lockout service", "Driver on Demand"),
        (
            "Fast and damage-free car door unlocking when you’re locked out.",
            "Verified chauffeurs by the hour or by the day, for your manual, "
            "automatic or EV.",
        ),
        ("Get Service", "Get Quote"),
        # --- how it works -----------------------------------------------
        ("how it work", "how it works in 3 steps"),
        ("Just 3 easy steps", "From call to recovery in minutes"),
        ("Contact us", "Request in 30 seconds"),
        (
            "Call or message us, share your location, and tell us what happened "
            "briefly.",
            "Call +91 8249475731 or use the app. Your GPS pins the location and "
            "you pick tow, driver or quick fix.",
        ),
        ("We’re on the way", "Nearest pro dispatched"),
        (
            "We dispatch the nearest tow truck or technician for fast and reliable "
            "roadside service.",
            "The closest verified tow truck, flatbed or mechanic is assigned "
            "automatically, with a live ETA on your screen.",
        ),
        ("Problem solved", "Safe resolution and pay"),
        (
            "Your vehicle is towed or fixed on-site — safely, quickly, and "
            "without any hassle.",
            "The operator verifies by OTP, does the work, and you pay by UPI, "
            "card, net banking or cash.",
        ),
        # --- why choose us ----------------------------------------------
        ("why choose us", "the race advantage"),
        ("Driven By Care. Powered By Speed.", "Built for emergencies, backed by trust"),
        ("1. 24/7 availability", "1. 30-minute rapid arrival"),
        (
            "Available anytime, day or night, for towing and roadside emergency "
            "support services.",
            "A distributed fleet stationed across cities and national highways, "
            "not parked in one garage.",
        ),
        ("2. Fast response time", "2. Honest, fixed pricing"),
        (
            "Our team arrives quickly, usually within 30 minutes of your service "
            "request.",
            "Every rate is quoted upfront by distance and service. No haggling, "
            "no midnight price hikes.",
        ),
        ("3. Certified & trained team", "3. Verified and trained crew"),
        (
            "Professional drivers and technicians trained to handle every situation "
            "with expert care.",
            "Police record checks, licence audits and a minimum three years of "
            "highway driving experience.",
        ),
        ("4. Transparent pricing", "4. 24/7/365 availability"),
        (
            "Clear, upfront pricing with no hidden charges or surprise service fees "
            "ever.",
            "Rain, midnight transit or a remote highway stretch, our control room "
            "and fleet never sleep.",
        ),
        ("5. Modern equipment", "5. Safe, damage-free towing"),
        (
            "We use reliable, damage-free towing equipment suited for all vehicle "
            "types.",
            "Flatbeds, wheel-lifts and winches chosen per model so your bodywork "
            "and transmission stay intact.",
        ),
        # --- pricing strip ----------------------------------------------
        ("Flat base rate", "Fixed upfront rates"),
        ("Optional add-ons", "No night surcharges"),
        ("Free estimates service start", "Free estimate before dispatch"),
        ("No after hours fees", "24/7 helpline, all year"),
        ("Accurate Estimates", "Transparent Pricing"),
        ("Transparent rates. No surprises.", "Fixed rates. Zero surprises."),
        (
            "Our pricing is straightforward and upfront — no hidden charges, "
            "confusing extras, or surprise fees after the service is done.",
            "Instant towing from Rs 499, roadside assistance from Rs 149. You see "
            "the final price before dispatch, and it does not change on the road.",
        ),
        ("Learn More", "See Pricing"),
        # --- coverage ---------------------------------------------------
        ("Coverage Area", "Coverage Areas"),
        ("Serving you wherever you are", "Serving you across Bhubaneswar and Odisha"),
        (
            "We proudly serve a wide range of areas across the region to ensure "
            "you’re never left waiting. From busy highways to rural roads, help "
            "is just a call away.",
            "From Mancheswar and Patia to Chandrasekharpur and Khandagiri, and "
            "out along NH-16 towards Khordha and Cuttack. Our fleet is stationed "
            "across 30+ cities and highway corridors, so help is one call away.",
        ),
        ("Central city", "Mancheswar"),
        ("Lake view", "Patia"),
        ("Highway 45", "NH-16"),
        ("Industrial zone B", "Chandrasekharpur"),
        ("West hills", "Khandagiri"),
        ("River bend", "Old Town"),
        ("View All Area", "View All Areas"),
        # --- emergency CTA ----------------------------------------------
        ("Stranded? We’re on the way", "Stranded? We are on the way"),
        # --- reviews ----------------------------------------------------
        ("customer review", "customer reviews"),
        ("What our customers say.", "What our customers say"),
        ("View All Review", "View All Reviews"),
        ("Jonathan S.", "Subhashree M."),
        ("Carlos M.", "Rajesh K. N."),
        ("Amanda R.", "Ananya P."),
        ("Dallas, TX", "Bhubaneswar"),
        ("Las Vegas, NV", "Chandrasekharpur"),
        (
            "“Had a flat tire on the freeway. They were efficient and explained "
            "everything clearly. Definitely recommending to my friends!”",
            "“My car’s radiator burst on NH-16 near Khordha at 11:30 PM with my "
            "family inside. A flatbed arrived in 22 minutes.”",
        ),
        (
            "“Towing can be stressful, but they made it easy. Polite operator, "
            "clean truck, and transparent pricing. Five stars from me!”",
            "“Booked a night driver after a wedding in Cuttack. Punctual, careful "
            "with my automatic sedan, parked it in my garage.”",
        ),
        # --- FAQ (10 items) ----------------------------------------------
        ("What areas do you offer towing services in?", "Where does RACE provide roadside assistance?"),
        (
            "We provide towing and roadside assistance across the city and "
            "surrounding regions, with quick response times wherever you are.",
            "We cover Mancheswar, Patia, Chandrasekharpur, Khandagiri, Old Town "
            "and the wider Bhubaneswar area, plus NH-16 towards Khordha and "
            "Cuttack. Our fleet is spread across 30+ cities and highway corridors.",
        ),
        ("Are your towing services available 24/7?", "Is RACE available 24 hours a day?"),
        (
            "Yes, we operate 24/7 — including weekends and holidays — to assist "
            "you in any emergency, day or night.",
            "Yes. Our control room and on-road fleet run 24 hours a day, 7 days "
            "a week, 365 days a year, including weekends, holidays and late-night "
            "highway stretches.",
        ),
        ("How long does it take for a tow truck to arrive?", "How long does RACE take to reach me?"),
        (
            "Arrival time usually ranges between 15–45 minutes depending on your "
            "location and current traffic or weather conditions.",
            "Our average arrival is 25 minutes in the city and under 35 minutes "
            "on major highways. Membership plans improve this further, with "
            "priority response under 15 minutes.",
        ),
        ("What type of vehicles can you tow?", "Which vehicles can you tow or recover?"),
        (
            "We can tow cars, motorcycles, SUVs, light trucks, and certain "
            "commercial vehicles using standard or flatbed towing options.",
            "Two-wheelers and superbikes, hatchbacks and sedans, SUVs and MUVs "
            "including Creta, Scorpio and XUV700, plus commercial vans and pickups.",
        ),
        ("What if I’m out of gas or have a flat tire?", "Do you fix problems on the spot without towing?"),
        (
            "No problem. We offer on-site fuel delivery and flat tire repair or "
            "replacement to get you back on the road.",
            "In many cases yes. Battery jumpstart is Rs 299, tyre change or "
            "puncture repair Rs 199, fuel delivery Rs 149 plus fuel, and minor "
            "electrical repairs Rs 399.",
        ),
        ("Do you offer long-distance towing services?", "Do you offer intercity and long-distance towing?"),
        (
            "Yes, we provide secure long-distance towing for vehicles that need "
            "to be transported between cities or regions.",
            "Yes. Scheduled intercity transport starts at Rs 399, with a guaranteed "
            "slot, transit protection and a written vehicle condition report.",
        ),
        ("How much does a towing service cost?", "How much does roadside assistance cost?"),
        (
            "Pricing depends on distance, service type, and vehicle. We offer "
            "upfront, transparent quotes with no hidden fees.",
            "Instant towing starts at Rs 499, scheduled and intercity at Rs 399, "
            "and accident recovery at Rs 699. Membership plans from Rs 299 a month "
            "bring towing down substantially.",
        ),
        ("Can you help after a car accident?", "Do you help after a highway accident?"),
        (
            "Absolutely. We provide accident recovery and will carefully tow your "
            "vehicle while coordinating with first responders if needed.",
            "Yes. Accident recovery starts at Rs 699 with a priority channel, "
            "traffic coordination at the scene, and coordination with your "
            "insurance surveyor and authorised repair centre.",
        ),
        ("Is motorcycle towing available?", "Can you tow a motorcycle or superbike?"),
        (
            "Yes, we use specialized equipment to tow motorcycles safely without "
            "damaging your bike or its components.",
            "Yes, using specialised bike cradles and high-tensile tie-downs so the "
            "bike and its components are not damaged in transit.",
        ),
        ("How do I request a service or emergency tow?", "How do I request help without internet?"),
        (
            "You can call us directly or request help online. Our team will "
            "dispatch the nearest available tow truck immediately.",
            "Dial +91 8249475731. Our phone dispatchers locate you from a landmark "
            "and assign the nearest unit manually, 24 hours a day.",
        ),
    ],
    "service.html": [
        ("Service", "Services"),
        ("Reliable Towing, Whenever You Need", "Towing, Drivers and Roadside Help"),
        ("View All Services", "View All Plans"),
        ("Emergency towing", "Instant Towing"),
        (
            "24/7 quick-response towing for accidents, breakdowns, or stranded vehicles.",
            "24/7 dispatch within 5 minutes, live GPS on the incoming truck, safe "
            "delivery to your garage.",
        ),
        ("Flatbed towing", "Flatbed Towing"),
        (
            "Safe transport for luxury, low-clearance, or immobile vehicles using "
            "flatbed trucks.",
            "Hydraulic flatbed for automatics, AWD SUVs and luxury cars. Zero tyre "
            "roll, full suspension safety.",
        ),
        (
            "Help with jump-starts, tire changes, fuel delivery, and minor repairs.",
            "Battery jumpstart from Rs 299, tyre change from Rs 199, fuel delivery "
            "from Rs 149, on the spot.",
        ),
        ("Vehicle recovery", "Accident Recovery"),
        (
            "Winching and recovery from ditches, mud, or accident scenes.",
            "Priority dispatch for collisions, ditch extraction and overturned "
            "vehicles, with no secondary damage.",
        ),
        (
            "Specialized towing service designed for safe motorcycle transport.",
            "Specialised bike cradles and high-tensile tie-downs for two-wheelers "
            "and superbikes.",
        ),
        ("Lockout service", "Driver on Demand"),
        (
            "Fast and damage-free car door unlocking when you’re locked out.",
            "Verified chauffeurs by the hour or by the day, for your manual, "
            "automatic or EV.",
        ),
        ("Get Service", "Get Quote"),
        ("Coverage Area", "Coverage Areas"),
        ("Serving you wherever you are", "Serving you across Bhubaneswar and Odisha"),
        (
            "We proudly serve a wide range of areas across the region to ensure "
            "you’re never left waiting. From busy highways to rural roads, help "
            "is just a call away.",
            "From Mancheswar and Patia to Chandrasekharpur and Khandagiri, and "
            "out along NH-16 towards Khordha and Cuttack. Our fleet is stationed "
            "across 30+ cities and highway corridors, so help is one call away.",
        ),
        ("Central city", "Mancheswar"),
        ("Lake view", "Patia"),
        ("Highway 45", "NH-16"),
        ("Industrial zone B", "Chandrasekharpur"),
        ("West hills", "Khandagiri"),
        ("River bend", "Old Town"),
        ("why choose us", "the race advantage"),
        ("Driven By Care. Powered By Speed.", "Built for emergencies, backed by trust"),
        (
            "Built for emergencies and backed by trust. We're committed to fast, "
            "safe, and professional towing — every time you call.",
            "RACE Service runs a distributed recovery fleet from Bhubaneswar, "
            "covering city roads and highway corridors across Odisha with fixed "
            "pricing and verified operators.",
        ),
        ("1. 24/7 availability", "1. 30-minute rapid arrival"),
        (
            "Available anytime, day or night, for towing and roadside emergency "
            "support services.",
            "A distributed fleet stationed across cities and national highways, "
            "not parked in one garage.",
        ),
        ("2. Fast response time", "2. Honest, fixed pricing"),
        (
            "Our team arrives quickly, usually within 30 minutes of your service "
            "request.",
            "Every rate is quoted upfront by distance and service. No haggling, "
            "no midnight price hikes.",
        ),
        ("3. Certified & trained team", "3. Verified and trained crew"),
        (
            "Professional drivers and technicians trained to handle every situation "
            "with expert care.",
            "Police record checks, licence audits and a minimum three years of "
            "highway driving experience.",
        ),
        ("4. Transparent pricing", "4. 24/7/365 availability"),
        (
            "Clear, upfront pricing with no hidden charges or surprise service fees "
            "ever.",
            "Rain, midnight transit or a remote highway stretch, our control room "
            "and fleet never sleep.",
        ),
        ("5. Modern equipment", "5. Safe, damage-free towing"),
        (
            "We use reliable, damage-free towing equipment suited for all vehicle "
            "types.",
            "Flatbeds, wheel-lifts and winches chosen per model so your bodywork "
            "and transmission stay intact.",
        ),
    ],
    "contact.html": [
        ("Let's TALK", "LET'S TALK"),
        ("Reach out. We're ready to roll", "Reach us. We are ready to roll"),
        ("Connect with Us", "Connect with RACE"),
        ("Have questions? Talk to us", "Need help? Talk to us now"),
        ("Keep it concise", "Available 24/7"),
        ("Contact", "Contact"),
        ("What areas do you offer towing services in?", "Where does RACE provide roadside assistance?"),
        (
            "We provide towing and roadside assistance across the city and "
            "surrounding regions, with quick response times wherever you are.",
            "We cover Mancheswar, Patia, Chandrasekharpur, Khandagiri, Old Town "
            "and the wider Bhubaneswar area, plus NH-16 towards Khordha and "
            "Cuttack. Our fleet is spread across 30+ cities and highway corridors.",
        ),
        ("Are your towing services available 24/7?", "Is RACE available 24 hours a day?"),
        (
            "Yes, we operate 24/7 — including weekends and holidays — to assist "
            "you in any emergency, day or night.",
            "Yes. Our control room and on-road fleet run 24 hours a day, 7 days "
            "a week, 365 days a year, including weekends, holidays and late-night "
            "highway stretches.",
        ),
        ("How long does it take for a tow truck to arrive?", "How long does RACE take to reach me?"),
        (
            "Arrival time usually ranges between 15–45 minutes depending on your "
            "location and current traffic or weather conditions.",
            "Our average arrival is 25 minutes in the city and under 35 minutes "
            "on major highways. Membership plans improve this further, with "
            "priority response under 15 minutes.",
        ),
        ("What type of vehicles can you tow?", "Which vehicles can you tow or recover?"),
        (
            "We can tow cars, motorcycles, SUVs, light trucks, and certain "
            "commercial vehicles using standard or flatbed towing options.",
            "Two-wheelers and superbikes, hatchbacks and sedans, SUVs and MUVs "
            "including Creta, Scorpio and XUV700, plus commercial vans and pickups.",
        ),
        ("What if I’m out of gas or have a flat tire?", "Do you fix problems on the spot without towing?"),
        (
            "No problem. We offer on-site fuel delivery and flat tire repair or "
            "replacement to get you back on the road.",
            "In many cases yes. Battery jumpstart is Rs 299, tyre change or "
            "puncture repair Rs 199, fuel delivery Rs 149 plus fuel, and minor "
            "electrical repairs Rs 399.",
        ),
        ("Do you offer long-distance towing services?", "Do you offer intercity and long-distance towing?"),
        (
            "Yes, we provide secure long-distance towing for vehicles that need "
            "to be transported between cities or regions.",
            "Yes. Scheduled intercity transport starts at Rs 399, with a guaranteed "
            "slot, transit protection and a written vehicle condition report.",
        ),
        ("How much does a towing service cost?", "How much does roadside assistance cost?"),
        (
            "Pricing depends on distance, service type, and vehicle. We offer "
            "upfront, transparent quotes with no hidden fees.",
            "Instant towing starts at Rs 499, scheduled and intercity at Rs 399, "
            "and accident recovery at Rs 699. Membership plans from Rs 299 a month "
            "bring towing down substantially.",
        ),
        ("Can you help after a car accident?", "Do you help after a highway accident?"),
        (
            "Absolutely. We provide accident recovery and will carefully tow your "
            "vehicle while coordinating with first responders if needed.",
            "Yes. Accident recovery starts at Rs 699 with a priority channel, "
            "traffic coordination at the scene, and coordination with your "
            "insurance surveyor and authorised repair centre.",
        ),
        ("Is motorcycle towing available?", "Can you tow a motorcycle or superbike?"),
        (
            "Yes, we use specialized equipment to tow motorcycles safely without "
            "damaging your bike or its components.",
            "Yes, using specialised bike cradles and high-tensile tie-downs so the "
            "bike and its components are not damaged in transit.",
        ),
        ("How do I request a service or emergency tow?", "How do I request help without internet?"),
        (
            "You can call us directly or request help online. Our team will "
            "dispatch the nearest available tow truck immediately.",
            "Dial +91 8249475731. Our phone dispatchers locate you from a landmark "
            "and assign the nearest unit manually, 24 hours a day.",
        ),
        ("Have Questions?", "Have Questions?"),
        ("Frequently asked questions.", "Frequently asked questions."),
    ],
    "pricing.html": [
        ("Affordable pricing", "Membership & Pricing"),
        ("Reliable towing for every situation", "Plans that fit how you drive"),
        # plan 1
        ("Basic Assist", "Basic Rider"),
        ("Great for minor roadside help anytime", "Great for occasional city driving"),
        ("$59", "Rs 299"),
        # plan 2
        ("City Haul", "Premium Shield"),
        ("Ideal for in-city vehicle recovery needs", "Daily commuters and highway travellers"),
        ("$129", "Rs 599"),
        # plan 3
        ("Highway Rescue", "Family Guardian"),
        ("For long distance  towing requirements", "Multi-car households on Odisha highways"),
        ("$299", "Rs 999"),
        # plan 4
        ("Fleet Guard", "Chauffeur Pass"),
        ("Business vehicle fleet emergencies", "Verified driver hours for busy schedules"),
        ("$999", "Rs 1,499"),
        # shared card furniture
        ("/ service", "/ month"),
        ("order now", "Choose Plan"),
    ],
}

# Benefits rows on the pricing page: 7 per card, order-sensitive, so they are
# replaced by position rather than by string (several originals repeat).
PRICING_BENEFITS = [
    ["2 free towing calls every month",
     "Battery, tyre and fuel assistance",
     "Response within 30 minutes",
     "1 free windshield QR sticker",
     "24/7 emergency helpline access",
     "Police-verified operators only",
     "No hidden charges, ever"],
    ["5 free towing calls every month",
     "Priority response within 15 minutes",
     "Battery, tyre and fuel assistance",
     "10% discount on driver bookings",
     "1 free windshield QR sticker",
     "24/7 priority helpline access",
     "Police-verified operators only"],
    ["Unlimited towing for up to 4 cars",
     "VIP response within 10 minutes",
     "Full roadside assistance included",
     "20% discount on driver bookings",
     "4 free windshield QR stickers",
     "24/7 priority helpline access",
     "Police-verified operators only"],
    ["Up to 4 driver hours every day",
     "Scheduled and outstation chauffeur",
     "1 free windshield QR sticker",
     "Priority rescheduling support",
     "No night surcharges on bookings",
     "Police-verified operators only",
     "24/7 priority helpline access"],
]

# The original benefit strings, in document order across all four cards. They are
# matched as a sequence so the rewrite is positional rather than by content.
OLD_BENEFITS = [
    "Tire change and inflation service",
    "Jump-start for dead battery",
    "Up to 5 miles towing",
    "Lockout entry assistance included",
    "Fuel delivery (gas/diesel) service",
    "24/7 emergency support hotline",
    "Licensed and trained technicians",
    "Flatbed or wheel-lift options",
    "Accident recovery and winching",
    "Tow up to 20 miles",
    "Vehicle damage protection coverage",
    "Traffic and road-safe protocols",
    "24/7 emergency support hotline",
    "Licensed and trained technicians",
    "Multi-vehicle tow options",
    "Insurance-covered transport",
    "Tow up to 100 miles",
    "Priority scheduling with confirmation",
    "Status updates during journey",
    "24/7 emergency support hotline",
    "Licensed and trained technicians",
    "Unlimited city towing services",
    "Priority fleet response anytime",
    "Centralized billing and reporting",
    "5 emergency jump-starts monthly",
    "Coverage for vans and trucks",
    "24/7 emergency support hotline",
    "Licensed and trained technicians",
]


def esc(text: str) -> str:
    return re.escape(text)


def flexible(needle: str) -> str:
    """Match a string as it appears in the raw markup, not as rendered text.

    The captured HTML is full of whitespace around node text, HTML entities
    (&amp;, &#8217;) and stray newlines. Matching the literal string fails on
    all three, so each gap is allowed to absorb surrounding whitespace and the
    entity forms of the characters we actually care about.
    """
    out = []
    for ch in needle:
        if ch == "&":
            out.append(r"(?:&|&amp;)")
        elif ch in ("'", "’", "‘"):
            # Our mapping may use a straight quote where the capture has a
            # curly one (or vice versa). Accept either.
            out.append(r"(?:'|’|‘|&#8217;|&#8216;|&rsquo;|&lsquo;)")
        elif ch == "“":
            out.append(r"(?:“|&#8220;|&ldquo;)")
        elif ch == "”":
            out.append(r"(?:”|&#8221;|&rdquo;)")
        elif ch == "—":
            out.append(r"(?:—|&mdash;|&#8212;)")
        elif ch == "–":
            out.append(r"(?:–|&ndash;|&#8211;)")
        elif ch == " ":
            # A single space may be a plain space, a double space, a literal
            # &nbsp; entity, or the character itself. All render the same width.
            out.append(r"[ \u00a0]*(?:&nbsp;[ \u00a0]*)?")
        elif ch.isspace():
            out.append(r"\s*")
        else:
            out.append(re.escape(ch))
    return "".join(out)


def replace_text(html: str, old: str, new: str) -> tuple[str, int]:
    """Swap element text, tolerating surrounding whitespace and entities.

    Anchors on the nearest angle brackets so attributes are never touched, and
    eats the leading/trailing whitespace the capture left inside the tag.
    """
    pattern = re.compile(r"(?<=>)\s*" + flexible(old) + r"\s*(?=<)")
    return pattern.subn(lambda _m: new, html)


def apply_list(html: str, pairs: list[tuple[str, str]], label: str) -> tuple[str, list[str]]:
    missed: list[str] = []
    for old, new in pairs:
        if old not in html:
            # Not every page carries every shared string (the email and address
            # cards only exist on contact). Only report a miss when the string
            # was actually present before this pass.
            continue
        html, n = replace_text(html, old, new)
        if n == 0:
            missed.append(old[:60])
    return html, missed


def main() -> int:
    total_missed = 0
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: MISSING")
            total_missed += 1
            continue
        html = path.read_text(encoding="utf-8")

        html, missed = apply_list(html, GLOBAL, "global")
        html, pmissed = apply_list(html, TEXTS.get(page, []), "page")
        missed += pmissed

        # Pricing benefits are positional: rewrite the whole ordered block once.
        if page == "pricing.html":
            for old, new in zip(OLD_BENEFITS, [b for card in PRICING_BENEFITS for b in card]):
                html, n = replace_text(html, old, new)
                if n == 0 and old not in ("24/7 emergency support hotline", "Licensed and trained technicians"):
                    missed.append(f"benefit: {old[:40]}")

        path.write_text(html, encoding="utf-8")
        total_missed += len(missed)
        print(f"{page}: {len(missed)} unmatched")
        for m in missed:
            print(f"    ! {m}")
    return 1 if total_missed else 0


if __name__ == "__main__":
    sys.exit(main())