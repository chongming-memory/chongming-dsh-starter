"""Package a pre-scanned portable build, preserving Windows long paths.
Usage: python scripts/package-portable.py <build-directory> <output.zip> <verify-directory>
"""
import hashlib, json, pathlib, sys, zipfile

def long_path(p):
    p=str(pathlib.Path(p).resolve())
    return pathlib.Path('\\\\?\\'+p) if sys.platform=='win32' and not p.startswith('\\\\?\\') else pathlib.Path(p)

root=long_path(sys.argv[1]); output=pathlib.Path(sys.argv[2]).resolve(); verify=long_path(sys.argv[3])
if output.exists() or verify.exists(): raise SystemExit('Use new output and verification paths')
files=sorted(p for p in root.rglob('*') if p.is_file())
required=['start.cmd','dsh/node.exe','dsh/node_modules/@deepseek-ai/dsh/lib/bin.js','dsh/node_modules/@deepseek-ai/dsh-session-telemetry-otel/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId.js']
for rel in required:
    if not (root/rel).is_file(): raise SystemExit('Missing required runtime file: '+rel)
for p in files:
    if '.dshcfg' in p.relative_to(root).parts: raise SystemExit('Runtime data must not ship')
rows=[{'file':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for row in rows:z.write(root/row['file'],'ChongmingDSH/'+row['file'])
with zipfile.ZipFile(output) as z:z.extractall(verify)
for row in rows:
    if hashlib.sha256((verify/'ChongmingDSH'/row['file']).read_bytes()).hexdigest()!=row['sha256']:raise SystemExit('Hash mismatch: '+row['file'])
sha=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(sha+'  '+output.name+'\n',encoding='utf8')
output.with_suffix('.verification.json').write_text(json.dumps({'status':'PASS','files':len(rows),'sha256':sha,'checks':['long-path enumeration','required dependency presence','extracted file hashes']},indent=2),encoding='utf8')
print('PASS',len(rows),sha)
