import pathlib
import re

css_dir = pathlib.Path("css")
total = 0
for f in css_dir.glob("*.css"):
    text = f.read_text(encoding="utf-8")
    new_text, n = re.subn(
        r'https://demo\.lubnalooom\.com/rapidtow/wp-content/uploads/sites/14/2025/11/([^\)\"\']+)',
        r'../images/\1',
        text
    )
    if n > 0:
        f.write_text(new_text, encoding="utf-8")
        print(f"{f.name}: replaced {n} references")
        total += n

print(f"Total CSS replacements: {total}")
