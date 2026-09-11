const fs=require('fs'),path=require('path');
const root=__dirname, home=path.resolve(process.env.CHONGMING_DATA_HOME||path.join(root,'.dshcfg'));
(async()=>{try{const p=JSON.parse(fs.readFileSync(path.join(home,'launcher.pid.json')));if(p.root!==root)throw Error('Wrong instance');
 const url=`http://127.0.0.1:${p.relayPort}`;const h=await fetch(url+'/health',{signal:AbortSignal.timeout(2000)}).then(r=>r.json());if(h.instance!==p.instance)throw Error('Stale instance');
 const r=await fetch(url+'/_stop',{method:'POST',headers:{authorization:'Bearer '+p.controlToken},signal:AbortSignal.timeout(2000)});if(!r.ok)throw Error('Stop rejected');console.log('正在停止此Chongming DSH Starter实例。');
}catch{console.log('没有找到属于此发行包的运行实例。');process.exitCode=1;}})();
