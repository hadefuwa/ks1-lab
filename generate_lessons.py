import os
import re

base_file = r"c:\Users\Hamed\Documents\Primary-App\lessons\lesson95\index.html"
with open(base_file, "r", encoding="utf-8") as f:
    text = f.read()

configs = [
    (96, "2", "20", "6", "['total', 'addend2']", "false"),
    (97, "3", "20", "6", "['total', 'addend1']", "true"),
    (98, "4", "50", "8", "['total', 'addend1']", "false"),
    (99, "5", "100", "8", "['total', 'addend2']", "false"),
    (100, "6", "100", "10", "['total', 'addend1']", "true"),
]

for lessonId, title_num, maxSum, qCount, missingParts, randomize in configs:
    # replacements
    new_text = text.replace("<title>Lesson 95: Word Problems 1</title>", f"<title>Lesson {lessonId}: Word Problems {title_num}</title>")
    
    # replace CONFIG block using regex for safety
    new_text = re.sub(r'lessonId: 95', f'lessonId: {lessonId}', new_text)
    new_text = re.sub(r'maxSum: 10', f'maxSum: {maxSum}', new_text)
    new_text = re.sub(r'questionCount: 5', f'questionCount: {qCount}', new_text)
    new_text = re.sub(r"missingParts: \['total', 'addend1'\]", f'missingParts: {missingParts}', new_text)
    new_text = re.sub(r'randomizeMissing: false', f'randomizeMissing: {randomize}', new_text)
    
    # directory
    out_dir = rf"c:\Users\Hamed\Documents\Primary-App\lessons\lesson{lessonId}"
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(new_text)

print("Created lessons 96 to 100")
