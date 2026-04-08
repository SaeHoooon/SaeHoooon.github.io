import os

base_dir = 'C:/Users/saeho/OneDrive/바탕 화면/computer_architecture'

panels = {
    'L41': 'lec4-1.html',
    'L42': 'lec4-2.html',
}

for pid, fname in panels.items():
    html_path = os.path.join(base_dir, fname)
    js_fname = fname.replace('.html', '.js')
    js_path = os.path.join(base_dir, js_fname)

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('\\', '\\\\')
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')

    js_content = 'window.lectureData=window.lectureData||{};\nwindow.lectureData["' + pid + '"]=`' + content + '`;\n'

    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print('Created ' + js_fname)

print('Done!')
