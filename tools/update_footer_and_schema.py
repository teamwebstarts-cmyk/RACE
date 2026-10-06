#!/usr/bin/env python
import re

NEW_FOOTER_BODY = """\t\t<div class="elementor-element elementor-element-15491e05 e-con-full e-flex e-con e-child" data-id="15491e05" data-element_type="container" data-e-type="container">
\t\t<div class="elementor-element elementor-element-304f01ba e-con-full e-flex e-con e-child" data-id="304f01ba" data-element_type="container" data-e-type="container">
\t\t\t\t<div class="elementor-element elementor-element-66923955 elementor-widget__width-inherit elementor-widget elementor-widget-heading" data-id="66923955" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
\t\t\t\t\t<h5 class="elementor-heading-title elementor-size-default">Quick Links</h5>\t\t\t\t</div>
\t\t\t\t<div class="elementor-element elementor-element-4fbee450 elementor-widget__width-inherit elementor-mobile-align-start elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="4fbee450" data-element_type="widget" data-e-type="widget" data-widget_type="icon-list.default">
\t\t\t\t\t\t\t<ul class="elementor-icon-list-items">
\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="index.html">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">Home</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="service.html">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">Service</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="pricing.html">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">Pricing</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="contact.html">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">Contact</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t</ul>
\t\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t<div class="elementor-element elementor-element-2352f862 e-con-full e-flex e-con e-child" data-id="2352f862" data-element_type="container" data-e-type="container">
\t\t\t\t<div class="elementor-element elementor-element-2cc5ba51 elementor-widget__width-inherit elementor-widget elementor-widget-heading" data-id="2cc5ba51" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
\t\t\t\t\t<h5 class="elementor-heading-title elementor-size-default">24/7 Support</h5>\t\t\t\t</div>
\t\t\t\t<div class="elementor-element elementor-element-6cf9f2c4 elementor-mobile-align-start elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="6cf9f2c4" data-element_type="widget" data-e-type="widget" data-widget_type="icon-list.default">
\t\t\t\t\t\t\t<ul class="elementor-icon-list-items">
\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="tel:+918249475731">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">+91 82494 75731</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="https://wa.me/918249475731?text=Hi%20RACE%20Service,%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">WhatsApp Support</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="mailto:support@raceservice.in">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">support@raceservice.in</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t\t\t<li class="elementor-icon-list-item">
\t\t\t\t\t\t\t\t\t\t\t<a href="contact.html#contact-details">
\t\t\t\t\t\t\t\t\t\t\t<span class="elementor-icon-list-text">Bhubaneswar, Odisha</span>
\t\t\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t\t</li>
\t\t\t\t\t\t</ul>
\t\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t<div class="elementor-element elementor-element-15340c1c e-con-full e-flex e-con e-child" data-id="15340c1c" data-element_type="container" data-e-type="container">
\t\t\t\t<div class="elementor-element elementor-element-7a6b041b elementor-widget__width-inherit elementor-widget elementor-widget-heading" data-id="7a6b041b" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
\t\t\t\t\t<h5 class="elementor-heading-title elementor-size-default">Download App</h5>\t\t\t\t</div>
\t\t\t\t<div class="elementor-element elementor-widget elementor-widget-text-editor" data-element_type="widget" data-widget_type="text-editor.default">
\t\t\t\t\t\t\t\t\t<p class="race-app-desc">Download the RACE App for instant 24/7 roadside assistance &amp; towing across Odisha.</p>
\t\t\t\t\t\t\t\t\t<a href="https://play.google.com/store/apps/details?id=in.raceservice.app" target="_blank" rel="noopener noreferrer" class="race-playstore-btn" aria-label="Download RACE App on Google Play Store">
\t\t\t\t\t\t\t\t\t\t<svg class="race-playstore-icon" width="26" height="26" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
\t\t\t\t\t\t\t\t\t\t\t<path fill="#4285F4" d="M38.8 11.5c-4.8 5.1-7.5 12.8-7.5 22.3v444.4c0 9.5 2.7 17.2 7.5 22.3l1.3 1.3L271.8 270v-5.6L40.1 10.2l-1.3 1.3z"/>
\t\t\t\t\t\t\t\t\t\t\t<path fill="#FBBC04" d="M350.7 348.9l-78.9-78.9v-5.6l78.9-78.9 1.8 1 93.3 53c26.6 15.1 26.6 39.8 0 54.9l-93.3 53-1.8 1.5z"/>
\t\t\t\t\t\t\t\t\t\t\t<path fill="#EA4335" d="M271.8 264.4L40.1 501.8c7.8 8.2 20.6 9.3 35.1 1.1l275.5-154-78.9-78.9z"/>
\t\t\t\t\t\t\t\t\t\t\t<path fill="#34A853" d="M271.8 264.4l78.9-78.9-275.5-154C60.7 23.2 47.9 24.3 40.1 32.5L271.8 264.4z"/>
\t\t\t\t\t\t\t\t\t\t</svg>
\t\t\t\t\t\t\t\t\t\t<span class="race-playstore-text">
\t\t\t\t\t\t\t\t\t\t\t<span class="race-playstore-sub">GET IT ON</span>
\t\t\t\t\t\t\t\t\t\t\t<span class="race-playstore-title">Google Play</span>
\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t\t</div>
\t\t<div class="elementor-element elementor-element-605aeba1 e-con-full e-flex e-con e-child" data-id="605aeba1" data-element_type="container" data-e-type="container">
\t\t<div class="elementor-element elementor-element-5c2ce888 e-con-full e-flex e-con e-child" data-id="5c2ce888" data-element_type="container" data-e-type="container">
\t\t\t\t<div class="elementor-element elementor-element-7d44cf43 elementor-widget-mobile__width-inherit elementor-widget elementor-widget-text-editor" data-id="7d44cf43" data-element_type="widget" data-e-type="widget" data-widget_type="text-editor.default">
\t\t\t\t\t\t\t\t\t<p>Copyright © 2026 RACE Service</p>\t\t\t\t\t\t\t\t</div>
\t\t\t\t<div class="elementor-element elementor-element-50d26a69 e-grid-align-right e-grid-align-mobile-center elementor-shape-rounded elementor-grid-0 elementor-widget elementor-widget-social-icons" data-id="50d26a69" data-element_type="widget" data-e-type="widget" data-widget_type="social-icons.default">
\t\t\t\t\t\t\t<div class="elementor-social-icons-wrapper elementor-grid" role="list">
\t\t\t\t\t\t\t<span class="elementor-grid-item" role="listitem">
\t\t\t\t\t<a class="elementor-icon elementor-social-icon elementor-social-icon-facebook elementor-repeater-item-db9c314" href="https://raceservice.in" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
\t\t\t\t\t\t<span class="elementor-screen-only">Facebook</span>
\t\t\t\t\t\t<svg aria-hidden="true" class="e-font-icon-svg e-fab-facebook" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>\t\t\t\t\t</a>
\t\t\t\t</span>
\t\t\t\t\t\t\t<span class="elementor-grid-item" role="listitem">
\t\t\t\t\t<a class="elementor-icon elementor-social-icon elementor-social-icon-whatsapp elementor-repeater-item-22f1535" href="https://wa.me/918249475731?text=Hi%20RACE%20Service,%20I%20need%20assistance" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
\t\t\t\t\t\t<span class="elementor-screen-only">Whatsapp</span>
\t\t\t\t\t\t<svg aria-hidden="true" class="e-font-icon-svg e-fab-whatsapp" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>\t\t\t\t\t</a>
\t\t\t\t</span>
\t\t\t\t\t\t\t<span class="elementor-grid-item" role="listitem">
\t\t\t\t\t<a class="elementor-icon elementor-social-icon elementor-social-icon-linkedin elementor-repeater-item-40bca96" href="https://raceservice.in" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
\t\t\t\t\t\t<span class="elementor-screen-only">Linkedin</span>
\t\t\t\t\t\t<svg aria-hidden="true" class="e-font-icon-svg e-fab-linkedin" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>\t\t\t\t\t</a>
\t\t\t\t</span>
\t\t\t\t\t\t\t<span class="elementor-grid-item" role="listitem">
\t\t\t\t\t<a class="elementor-icon elementor-social-icon elementor-social-icon-x-twitter elementor-repeater-item-c9acc57" href="https://raceservice.in" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
\t\t\t\t\t\t<span class="elementor-screen-only">X-twitter</span>
\t\t\t\t\t\t<svg aria-hidden="true" class="e-font-icon-svg e-fab-x-twitter" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>\t\t\t\t\t</a>
\t\t\t\t</span>
\t\t\t\t\t</div>
\t\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t\t</div>"""

FAQ_SCHEMA_1 = '<script type="application/ld+json">{"@context":"https:\\/\\/schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Where does RACE provide roadside assistance?","acceptedAnswer":{"@type":"Answer","text":"We cover Mancheswar, Patia, Chandrasekharpur, Khandagiri, Old Town and the wider Bhubaneswar area, plus NH-16 towards Khordha and Cuttack. Our fleet is spread across 30+ cities and highway corridors."}},{"@type":"Question","name":"Is RACE available 24 hours a day?","acceptedAnswer":{"@type":"Answer","text":"Yes. Our control room and on-road fleet run 24 hours a day, 7 days a week, 365 days a year, including weekends, holidays and late-night highway stretches."}},{"@type":"Question","name":"How long does RACE take to reach me?","acceptedAnswer":{"@type":"Answer","text":"Our average arrival is 25 minutes in the city and under 35 minutes on major highways. Membership plans improve this further, with priority response under 15 minutes."}},{"@type":"Question","name":"Which vehicles can you tow or recover?","acceptedAnswer":{"@type":"Answer","text":"Two-wheelers and superbikes, hatchbacks and sedans, SUVs and MUVs including Creta, Scorpio and XUV700, plus commercial vans and pickups."}},{"@type":"Question","name":"Do you fix problems on the spot without towing?","acceptedAnswer":{"@type":"Answer","text":"In many cases yes. Battery jumpstart is Rs 299, tyre change or puncture repair Rs 199, fuel delivery Rs 149 plus fuel, and minor electrical repairs Rs 399."}}]}</script>'

FAQ_SCHEMA_2 = '<script type="application/ld+json">{"@context":"https:\\/\\/schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Do you offer intercity and long-distance towing?","acceptedAnswer":{"@type":"Answer","text":"Yes. Scheduled intercity transport starts at Rs 399, with a guaranteed slot, transit protection and a written vehicle condition report."}},{"@type":"Question","name":"How much does roadside assistance cost?","acceptedAnswer":{"@type":"Answer","text":"Instant towing starts at Rs 499, scheduled and intercity at Rs 399, and accident recovery at Rs 699. Membership plans from Rs 299 a month bring towing down substantially."}},{"@type":"Question","name":"Do you help after a highway accident?","acceptedAnswer":{"@type":"Answer","text":"Yes. Accident recovery starts at Rs 699 with a priority channel, traffic coordination at the scene, and coordination with your insurance surveyor and authorised repair centre."}},{"@type":"Question","name":"Can you tow a motorcycle or superbike?","acceptedAnswer":{"@type":"Answer","text":"Yes, using specialised bike cradles and high-tensile tie-downs so the bike and its components are not damaged in transit."}},{"@type":"Question","name":"How do I request help without internet?","acceptedAnswer":{"@type":"Answer","text":"Dial +91 8249475731. Our phone dispatchers locate you from a landmark and assign the nearest unit manually, 24 hours a day."}}]}</script>'

OLD_SCHEMA_1_SNIPPET = "What areas do you offer towing services in?"
OLD_SCHEMA_2_SNIPPET = "Do you offer long-distance towing services?"

FOOTER_REGEX = re.compile(
    r'\t*<div class="elementor-element elementor-element-15491e05.*?'
    r'<div class="elementor-element elementor-element-605aeba1.*?'
    r'</div>\s*</div>\s*</div>\s*</div>\s*(?=\t*</div>\s*</div>\s*</footer>)',
    re.DOTALL
)

files = ['index.html', 'home.html', 'service.html', 'pricing.html', 'contact.html']

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update footer
    # Find start: <div class="elementor-element elementor-element-15491e05
    start_tag = '<div class="elementor-element elementor-element-15491e05'
    end_tag = '</footer>'
    idx_start = html.find(start_tag)
    if idx_start == -1:
        print(f"ERROR: {fname} footer start not found!")
        continue

    idx_footer_end = html.find(end_tag, idx_start)
    # The container ends right before </div>\s*</div>\s*</footer>
    # Let's inspect the slice before end_tag
    slice_before_footer = html[idx_start:idx_footer_end]
    # We want to replace from idx_start up to the closing divs before </footer>
    # Find the closing container before </footer>:
    # Notice: </footer> is preceded by </div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t
    # In all files, container 7f7372f8 inner ends with </div>\n</div>\n</footer>
    # Let's use regex matching from start_tag to the closing of 605aeba1:
    m = re.search(r'(<div class="elementor-element elementor-element-15491e05.*?)(?=\t*</div>\s*</div>\s*</footer>)', html, re.DOTALL)
    if not m:
        print(f"ERROR: {fname} footer regex didn't match!")
        continue

    html = html[:m.start(1)] + NEW_FOOTER_BODY + "\n\t\t\t\t\t" + html[m.end(1):]
    print(f"Updated footer in {fname}")

    # 2. Update FAQ JSON-LD if present
    if OLD_SCHEMA_1_SNIPPET in html:
        # replace script block containing OLD_SCHEMA_1_SNIPPET
        html = re.sub(r'<script type="application/ld\+json">\{"@context"[^<]*?' + re.escape(OLD_SCHEMA_1_SNIPPET) + r'[^<]*?</script>', FAQ_SCHEMA_1, html)
        print(f"Updated FAQ Schema 1 in {fname}")

    if OLD_SCHEMA_2_SNIPPET in html:
        html = re.sub(r'<script type="application/ld\+json">\{"@context"[^<]*?' + re.escape(OLD_SCHEMA_2_SNIPPET) + r'[^<]*?</script>', FAQ_SCHEMA_2, html)
        print(f"Updated FAQ Schema 2 in {fname}")

    # 3. Capitalize menu labels in header if present
    html = html.replace('>home</a>', '>Home</a>')
    html = html.replace('>service</a>', '>Service</a>')
    html = html.replace('>pricing</a>', '>Pricing</a>')
    html = html.replace('>contact</a>', '>Contact</a>')

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(html)

print("All files processed successfully.")
