import pathlib
import re

html_files = ["index.html", "home.html", "service.html", "pricing.html", "contact.html"]

for name in html_files:
    p = pathlib.Path(name)
    if not p.exists():
        continue
    content = p.read_text(encoding="utf-8")
    
    # Clean restURI in mf
    content = re.sub(
        r'("restURI":\s*)"https:\\/\\/demo\.lubnalooom\.com[^"]*"',
        r'\1""',
        content
    )
    
    # Clean featuredImage in elementorFrontendConfig
    content = re.sub(
        r'("featuredImage":\s*)"https:\\/\\/demo\.lubnalooom\.com[^"]*"',
        r'\1""',
        content
    )
    
    # Clean title with RapidTow
    content = re.sub(
        r'("title":\s*)"[^"]*(?:RapidTow|rapidtow)[^"]*"',
        r'\1"RACE Service"',
        content
    )
    
    # Clean pluginPath in _wpmejsSettings
    content = re.sub(
        r'("pluginPath":\s*)"\\/rapidtow[^"]*"',
        r'\1""',
        content
    )
    
    p.write_text(content, encoding="utf-8")
    print(f"Cleaned {name}")

