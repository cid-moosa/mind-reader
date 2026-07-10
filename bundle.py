import os

def bundle():
    split_dir = 'split'
    
    # Paths
    html_path = os.path.join(split_dir, 'index.html')
    css_path = os.path.join(split_dir, 'style.css')
    js_path = os.path.join(split_dir, 'script.js')
    out_path = 'index.html'
    
    if not (os.path.exists(html_path) and os.path.exists(css_path) and os.path.exists(js_path)):
        print("Error: Could not find split development files.")
        return

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
        
    with open(js_path, 'r', encoding='utf-8') as f:
        js = f.read()
        
    # Replace CSS stylesheet link
    css_tag = '<link rel="stylesheet" href="style.css" />'
    css_inline = f"<style>\n{css}\n</style>"
    if css_tag in html:
        html = html.replace(css_tag, css_inline)
    else:
        # Try alternative whitespace
        html = html.replace('<link rel="stylesheet" href="style.css"/>', css_inline)
    
    # Replace JS script tag
    js_tag = '<script src="script.js"></script>'
    js_inline = f"<script>\n{js}\n</script>"
    if js_tag in html:
        html = html.replace(js_tag, js_inline)
    else:
        html = html.replace('<script src="script.js"></script>', js_inline)
        
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
        
    print(f"Bundled successfully into {out_path}!")

if __name__ == '__main__':
    bundle()
