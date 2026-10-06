import re

with open('index.html', 'r', encoding='utf-8') as f:
    curr = f.readlines()

stack = []
for idx, line in enumerate(curr[:290]):
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
                if idx+1 >= 270:
                    print(f"Line {idx+1} closes {popped}")
            else:
                print(f"Line {idx+1} underflow")

print("Remaining open tags at line 282 in CURR:")
for s in stack:
    print(s)
