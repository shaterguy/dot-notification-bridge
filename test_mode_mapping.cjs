const fs=require('fs'),vm=require('vm'),assert=require('assert');
const raw=fs.readFileSync(process.argv[2]||'dot_notify_user_signal_dev6.js','utf8');
function run(input,pending='') { const g={DotUserNotifyPending:pending},sent=[];
class X{open(){}setRequestHeader(){}send(b){sent.push(JSON.parse(b));this.status=200;this.responseText=JSON.stringify({ok:true,channel:'CHANNEL_ID_REPLACE_BEFORE_USE',ts:'1000000000.123456'});this.onload();}}
vm.runInNewContext(raw,{...input,global:n=>g[n]||'',setGlobal:(n,v)=>g[n]=v,secret_dir:'/data/user/0/net.dinglisch.android.taskerm/no_backup',readFile:()=> 'xoxp-SYNTHETIC-NOT-A-REAL-TOKEN-000000',XMLHttpRequest:X,Date,Math,exit:()=>{}});return {g,sent};}
let n=0;function test(name,fn){fn();console.log('PASS '+name);n++;}
for(const input of [{par:['retry']},{par1:'retry'},{par1:'retry',par:['retry']},{par1:'%par1',par:['retry']}]){
test('retry empty '+JSON.stringify(input),()=>{const r=run(input);assert.equal(r.sent.length,0);assert.equal(r.g.DotUserNotifyStatus,'idle');});
test('retry preserves pending '+JSON.stringify(input),()=>{const r=run(input,'oldbatch-123');assert.equal(r.sent.length,1);assert.equal(r.sent[0].text,'DOT_NOTIFY_SAVED_V1 batch=oldbatch-123');});}
for(const input of [{par:['enqueue']},{par1:'enqueue'},{par1:'enqueue',par:['enqueue']},{},{par1:''},{par:[]},{par1:'%par1'}])test('enqueue/manual '+JSON.stringify(input),()=>assert.equal(run(input).sent.length,1));
for(const input of [{par1:'retry',par:['enqueue']},{par1:'enqueue',par:['retry']},{par1:'invalid'},{par:['invalid']},{par1:'retry',par:['invalid']},{par:null},{par:'retry'},{par:{0:'retry'}}])test('invalid/conflict '+JSON.stringify(input),()=>{const r=run(input,'oldbatch-123');assert.equal(r.sent.length,0);assert.equal(r.g.DotUserNotifyPending,'oldbatch-123');assert(['invalid_mode','mode_conflict'].includes(r.g.DotUserNotifyStatus));});
console.log(n+' mode mapping tests passed; mock only');
