import re
import os

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract body inner
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
if not body_match:
    print("Could not find body")
    exit(1)

body_content = body_match.group(1)

# Remove script tags
body_content = re.sub(r'<script.*?</script>', '', body_content, flags=re.DOTALL | re.IGNORECASE)

# Conversions
jsx = body_content
jsx = jsx.replace('class="', 'className="')
jsx = jsx.replace('onclick="', 'onClick={() => ')
jsx = re.sub(r'onClick={\(\) => ([^"]+)"', r'onClick={() => \1}', jsx)

# Handle style="width: 65%" -> style={{ width: '65%' }}
def style_repl(match):
    style_str = match.group(1)
    # very naive conversion
    style_str = style_str.replace('width:65%', "width: '65%'")
    style_str = style_str.replace('width:80%', "width: '80%'")
    style_str = style_str.replace('width:42%', "width: '42%'")
    style_str = style_str.replace('width:12%', "width: '12%'")
    style_str = style_str.replace('width:78%', "width: '78%'")
    style_str = style_str.replace('width:30%', "width: '30%'")
    style_str = style_str.replace('width:85%', "width: '85%'")
    style_str = style_str.replace('width:92%', "width: '92%'")
    style_str = style_str.replace('width:60%', "width: '60%'")
    style_str = style_str.replace('width:40%', "width: '40%'")
    style_str = style_str.replace('background-image:radial-gradient(circle at 2px 2px, rgba(255,255,255,.12) 1px, transparent 0); background-size:32px 32px;', "backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.12) 1px, transparent 0)', backgroundSize: '32px 32px'")
    return f'style={{{style_str}}}'

jsx = re.sub(r'style="([^"]+)"', style_repl, jsx)

# Close inputs and imgs
jsx = re.sub(r'(<input[^>]*)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<img[^>]*)(?<!/)>', r'\1 />', jsx)

# SVG attributes
svg_attrs = ['stroke-linecap', 'stroke-linejoin', 'stroke-width']
for attr in svg_attrs:
    camel = ''.join(word.title() if i > 0 else word for i, word in enumerate(attr.split('-')))
    jsx = jsx.replace(f'{attr}=', f'{camel}=')

# Wrap in component
final_code = f"""'use client'

import React, {{ useState, useEffect }} from 'react'

export default function MainApp() {{
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentLang, setCurrentLang] = useState('en')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const navigateTo = (screen: string) => setActiveScreen(screen)
  const toggleTheme = () => document.documentElement.classList.toggle('dark')
  const toggleLangDropdown = () => setLangDropdownOpen(!langDropdownOpen)
  const setLanguage = (lang: string) => {{
    setCurrentLang(lang)
    setLangDropdownOpen(false)
  }}

  return (
    <>
      {jsx}
    </>
  )
}}
"""

# Small manual fixes
final_code = final_code.replace('onClick={() => toggleSidebar()}', 'onClick={toggleSidebar}')
final_code = final_code.replace('onClick={() => toggleTheme()}', 'onClick={toggleTheme}')
final_code = final_code.replace('onClick={() => toggleLangDropdown()}', 'onClick={toggleLangDropdown}')
final_code = final_code.replace("onClick={() => navigateTo('dashboard')}", "onClick={() => navigateTo('dashboard')}")

with open('src/components/MainApp.tsx', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Conversion complete!")
