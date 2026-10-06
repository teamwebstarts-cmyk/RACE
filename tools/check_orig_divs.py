import re
import subprocess

def check_orig():
    print("=== Checking 5b9c6fb:index.html ===")
    text = subprocess.check_output(['git', 'show', '5b9c6fb:index.html'], text=True, encoding='utf-8')
    lines = text.splitlines()
    stack = []
    for idx, line in enumerate(lines):
        tokens = re.findall(r'<div[^>]*>|</div>', line)
        for t in tokens:
            if t.startswith('<div'):
                m_id = re.search(r'data-id="([^"]+)"', t)
                m_cl = re.search(r'class="([^"]+)"', t)
                name = m_id.group(1) if m_id else (m_cl.group(1).split()[0] if m_cl else 'div')
                stack.append((idx+1, name))
            elif t == '</div>':
                if stack:
                    popped = stack.pop()
                else:
                    print(f"ERROR: Underflow at line {idx+1}")
    print(f"Total unclosed divs in 5b9c6fb: {len(stack)}")
    for s in stack[:10]:
        print(f"  Unclosed: line {s[0]} ({s[1]})")

check_orig()
