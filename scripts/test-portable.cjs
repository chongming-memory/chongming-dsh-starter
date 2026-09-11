const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const root=path.resolve(process.argv[2]),home=path.resolve(process.argv[3]);
const env={...process.env,CHONGMING_DATA_HOME:home,CHONGMING_PORT:'43241',CHONGMING_NO_OPEN:'1'};
const result={checks:[]};
async function cycle(){const child=cp.spawn('cmd.exe',['/d','/c','start.cmd'],{cwd:root,env,windowsHide:true,stdio:'ignore'});try{
 let ready=false;for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:43241',{signal:AbortSignal.timeout(1000)});if(r.ok){assert((await r.text()).includes('Chongming DSH Starter'));ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,300));}assert(ready,'startup failed');
 assert(!fs.existsSync(path.join(home,'.credentials.yaml')),'unexpected credentials');const state=JSON.parse(fs.readFileSync(path.join(home,'launcher.pid.json')));assert.equal(state.root,root);
 cp.execFileSync(path.join(root,'dsh/node.exe'),[path.join(root,'stop.cjs')],{env,cwd:root,windowsHide:true,stdio:'ignore'});
 for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:43241',{signal:AbortSignal.timeout(500)});}catch{return;}await new Promise(r=>setTimeout(r,100));}throw Error('port still open');
}finally{child.kill();}}
(async()=>{await cycle();result.checks.push('Extracted start.cmd boots with no credentials, correct title, isolated data path; stop closes port');const settings=fs.readFileSync(path.join(home,'settings.yaml'),'utf8');await cycle();assert.equal(fs.readFileSync(path.join(home,'settings.yaml'),'utf8'),settings);result.checks.push('Restart preserves employee settings');result.status='PASS';})().catch(e=>{result.status='FAIL';result.error=e.message;process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.resolve(process.argv[4]),JSON.stringify(result,null,2));console.log(JSON.stringify(result));});

