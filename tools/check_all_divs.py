import re

def check_file(filename):
    print(f"=== Checking {filename} ===")
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
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
    print(f"Total unclosed divs: {len(stack)}")
    for s in stack[:10]:
        print(f"  Unclosed: line {s[0]} ({s[1]})")

check_file('index.html')
check_file('home.html')
