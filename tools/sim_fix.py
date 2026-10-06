import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''\t\t<div class="elementor-element elementor-element-2bc28565 e-con-full e-flex e-con e-child" data-id="2bc28565" data-element_type="container" data-e-type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
				</div>
				</div>
				</div>
				</div>
				</div>
					</div>
				</div>'''

replacement = '''\t\t<div class="elementor-element elementor-element-2bc28565 e-con-full e-flex e-con e-child" data-id="2bc28565" data-element_type="container" data-e-type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
				</div>
				</div>
				</div>
				</div>
				</div>
					</div>'''

assert target in text, "target not found"
new_text = text.replace(target, replacement)

stack = []
underflows = 0
for idx, line in enumerate(new_text.splitlines()):
    tokens = re.findall(r'<div[^>]*>|</div>', line)
    for t in tokens:
        if t.startswith('<div'):
            m_id = re.search(r'data-id="([^"]+)"', t)
            m_cl = re.search(r'class="([^"]+)"', t)
            name = m_id.group(1) if m_id else (m_cl.group(1).split()[0] if m_cl else 'div')
            stack.append((idx+1, name))
        elif t == '</div>':
            if stack:
                stack.pop()
            else:
                underflows += 1

print("Underflows with 6 closing tags:", underflows)
print("Unclosed tags remaining:", len(stack))
for s in stack:
    print(" ", s)
