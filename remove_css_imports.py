import os
import re

# المسار الأساسي
base_path = r'D:\madina-al-ataa\madina-al-ataa\src\components'

# الملفات المستهدفة
files_to_fix = [
    r'tabs\DailyTasksTab.jsx',
    r'tabs\CityMapTab.jsx',
    r'tabs\CityExplorationTab.jsx',
    r'tabs\ProfileTab_REFACTORED.jsx',
]

def remove_css_imports(file_path):
    """إزالة سطر import للملفات CSS"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # إزالة السطور التي تحتوي على import ... .css
        lines = content.split('\n')
        new_lines = [line for line in lines if not re.search(r'import\s+[\'"].*\.css[\'"]', line)]
        
        new_content = '\n'.join(new_lines)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f'✅ تم تنظيف: {os.path.basename(file_path)}')
        return True
    except Exception as e:
        print(f'❌ خطأ في: {file_path} - {e}')
        return False

# معالجة الملفات
print('🚀 بدء تنظيف ملفات CSS...\n')
success_count = 0

for file_rel_path in files_to_fix:
    full_path = os.path.join(base_path, file_rel_path)
    if os.path.exists(full_path):
        if remove_css_imports(full_path):
            success_count += 1
    else:
        print(f'⚠️  الملف غير موجود: {file_rel_path}')

print(f'\n✨ اكتمل! تم تنظيف {success_count} من {len(files_to_fix)} ملفات')
