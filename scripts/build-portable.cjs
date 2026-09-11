#!/usr/bin/env node
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');
const source=path.resolve(process.argv[2]||'');
const out=path.resolve(process.argv[3]||path.join(repo,'output/Chongming-DSH-Starter-0.2.0-win-x64'));
if(!process.argv[2]||!fs.existsSync(path.join(source,'dsh/node.exe')))throw Error('Supply the tested portable baseline, including dsh/node.exe');
if(fs.existsSync(out))throw Error('Output must be a new directory');
for(const f of ['launcher.cjs','relay.cjs','stop.cjs','runtime/codexproxy/node_modules/@lininn/codex-proxy/LICENSE'])if(!fs.existsSync(path.join(source,f)))throw Error('Missing baseline: '+f);
fs.mkdirSync(out,{recursive:true});
const excluded=[];
function copy(src,dest){fs.cpSync(src,dest,{recursive:true,dereference:true,filter:p=>{
 const n=path.basename(p);
 if(/^(?:\.git|\.dshcfg|\.cache|\.env|auth\.json|\.credentials\.yaml)$|\.(?:bak|orig)(?:[-.]|$)|\.(?:db|sqlite|log|tmp)$/.test(n)){excluded.push(path.relative(source,p));return false;}return true;
}});}
for(const f of ['dsh','runtime','templates'])copy(path.join(source,f),path.join(out,f));
function write(f,s){fs.mkdirSync(path.dirname(path.join(out,f)),{recursive:true});fs.writeFileSync(path.join(out,f),s);}
for(const f of ['launcher.cjs','relay.cjs','stop.cjs']){
 const text=fs.readFileSync(path.join(source,f),'utf8').replaceAll('LANWEI','CHONGMING').replaceAll('Lanwei','Chongming').replaceAll('lanwei','chongming').replaceAll('蓝威工作助手','Chongming DSH Starter').replaceAll('员工','用户');
 write(f,text);fs.copyFileSync(path.join(out,f),path.join(repo,'templates',f));
}
write('start.cmd','@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\n"%~dp0dsh\\node.exe" "%~dp0launcher.cjs"\r\nif errorlevel 1 pause\r\n');
write('stop.cmd','@echo off\r\ncd /d "%~dp0"\r\n"%~dp0dsh\\node.exe" "%~dp0stop.cjs"\r\n');
for(const f of ['profile.json','profile.patch.yml'])write('templates/'+f,fs.readFileSync(path.join(out,'templates',f),'utf8').replaceAll('LANWEI','CHONGMING').replaceAll('lanwei','chongming'));
copy(path.join(repo,'branding/default'),path.join(out,'branding'));
copy(path.join(repo,'scripts/apply-brand.cjs'),path.join(out,'tools/apply-brand.cjs'));
write('apply-brand.cmd','@echo off\r\ncd /d "%~dp0"\r\n"%~dp0dsh\\node.exe" tools\\apply-brand.cjs --release "%CD%" --brand branding\r\npause\r\n');
cp.execFileSync(path.join(out,'dsh/node.exe'),[path.join(repo,'scripts/apply-brand.cjs'),'--release',out,'--brand',path.join(out,'branding')],{stdio:'inherit'});
const onboarding='dsh/node_modules/@deepseek-ai/dsh-client-ui-settings-models/lib/client.js';
write(onboarding,fs.readFileSync(path.join(out,onboarding),'utf8').replaceAll('员工试用说明','首次使用说明').replaceAll('欢迎使用蓝威工作助手员工试用版。','欢迎使用 Chongming DSH Starter。').replaceAll('Hub、TeamOS、重明及云端任务联动将在后续版本逐步接入。','本包提供本地 Agent 功能，不包含企业托管服务。'));
for(const f of ['LICENSE','NOTICE'])copy(path.join(repo,f),path.join(out,f));
copy(path.join(repo,'docs/portable-quickstart.zh-CN.md'),path.join(out,'使用说明.md'));
const packages=[];
function inventory(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,d.name);if(d.isDirectory())inventory(p);else if(d.name==='package.json'){
 try{const j=JSON.parse(fs.readFileSync(p));if(j.name&&j.version)packages.push({name:j.name,version:j.version,license:j.license||j.licenses||'SEE PACKAGE LICENSE',path:path.relative(out,path.dirname(p)).replaceAll('\\','/')});}catch{}
 }
}}
inventory(path.join(out,'dsh'));inventory(path.join(out,'runtime'));
write('THIRD-PARTY-PACKAGES.json',JSON.stringify(packages,null,2)+'\n');
write('THIRD-PARTY-NOTICES.md','# Third-party components\n\nThis is an independently packaged distribution, not an official DeepSeek or OpenAI release.\nDSH and codex-proxy retain their MIT licenses; Codex retains its Apache-2.0 license. All dependency license and notice files are retained in their package directories. See THIRD-PARTY-PACKAGES.json for the bundled inventory. Node.js license is supplied as NODE-LICENSE.txt.\n\nModified: launcher, local relay integration, default profile, frontend logo/wordmark/headline and product title. No upstream authorship is claimed.\n');
const manifest={version:'0.2.0',platform:'win32-x64',builtAt:new Date().toISOString(),node:cp.execFileSync(path.join(out,'dsh/node.exe'),['--version'],{encoding:'utf8'}).trim(),basis:'Tested portable DSH 0.1.1-rc.2 baseline; not a reproducible upstream source build',excluded,packages:packages.filter(x=>['@deepseek-ai/dsh','@openai/codex','@lininn/codex-proxy'].includes(x.name))};
write('release-manifest.json',JSON.stringify(manifest,null,2)+'\n');
// Official license files must be staged before packaging; never silently omit them.
for(const f of ['NODE-LICENSE.txt','CODEX-LICENSE.txt','CODEX-NOTICE.txt','LIBVIPS-COPYING.txt','LIBVIPS-THIRD-PARTY-NOTICES.md']){
 const from=path.join(repo,'third-party',f);if(!fs.existsSync(from))throw Error('Missing third-party notice: '+f);copy(from,path.join(out,f));
}
console.log(JSON.stringify({output:out,packages:packages.length}));
