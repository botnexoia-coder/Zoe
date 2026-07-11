#!/usr/bin/env python3
# Regenera public/videos/testimonios/manifest.json con TODOS los videos que haya (cualquier nombre)
import os, json
d="public/videos/testimonios"
exts=('.mp4','.mov','.webm','.m4v')
files=sorted([f for f in os.listdir(d) if f.lower().endswith(exts)])
json.dump(files, open(os.path.join(d,"manifest.json"),"w",encoding="utf-8"), ensure_ascii=False)
print("manifest.json ->", files)
