const fs=require('fs'),vm=require('vm'),assert=require('assert');
const FAKE='xoxp-SYNTHETIC-NOT-A-REAL-TOKEN-000000';
const raw=fs.readFileSync(__dirname+'/dot_notify_user_signal.js','utf8');
function run({mode='retry',pending='',configured=true,response=JSON.stringify({ok:true,channel:'CHANNEL_ID_REPLACE_BEFORE_USE',ts:'1000000000.123456'}),http=200,event='load',throwSend=false,newer=false,blocked=false,secretDir='/data/user/0/net.dinglisch.android.taskerm/no_backup',setupEntry='xoxp-SYNTHETIC-NOT-A-REAL-TOKEN-000000',omitPar1=false}={}){
 const g={DotUserNotifyPending:pending,DotUserNotifyBlocked:blocked?'1':''},sent=[],writes=[];let exits=0;
 class X {open(m,u,a){assert.equal(m,'POST');assert.equal(a,true);assert.equal(u,'https://slack.com/api/chat.postMessage');}setRequestHeader(k,v){if(k==='Content-Type')assert.equal(v,'application/json; charset=utf-8');else {assert.equal(k,'Authorization');assert.equal(v,'Bearer '+FAKE);}}send(body){if(throwSend)throw Error('redacted');sent.push(JSON.parse(body));this.status=http;this.responseText=response;if(newer)g.DotUserNotifyPending='newerbatch-123';this['on'+event]();}}
 const c={global:n=>g[n]||'',setGlobal:(n,v)=>g[n]=v,par1:mode,secret_dir:secretDir,readFile:()=>configured?'xoxp-SYNTHETIC-NOT-A-REAL-TOKEN-000000':'',writeFile:(p,v)=>{writes.push([p,v]);return true;},prompt:()=>setupEntry,XMLHttpRequest:X,exit:()=>exits++,Date,Math};
 if(omitPar1)delete c.par1;
 vm.runInNewContext(raw,c);
 assert.equal(exits,1); return {g,sent,writes};
}
let cases=0;function test(name,fn){fn();console.log('PASS '+name);cases++;}
test('idle retry sends nothing',()=>assert.equal(run().sent.length,0));
test('placeholder fails closed and keeps pending',()=>{const r=run({mode:'enqueue',configured:false});assert.equal(r.sent.length,0);assert.equal(r.g.DotUserNotifyStatus,'setup_required');assert(r.g.DotUserNotifyPending);});
test('enqueue sends only literal prefix and opaque batch',()=>{const r=run({mode:'enqueue'});assert.deepEqual(Object.keys(r.sent[0]),['channel','text']);assert(/^DOT_NOTIFY_SAVED_V1 batch=[a-z0-9-]+$/.test(r.sent[0].text));assert.equal(r.g.DotUserNotifyPending,'');});
test('retry preserves batch identity',()=>assert.equal(run({pending:'pending-123'}).sent[0].text,'DOT_NOTIFY_SAVED_V1 batch=pending-123'));
for(const spec of [{http:500},{http:200,response:'not_ok'},{event:'error'},{event:'timeout'},{event:'abort'},{throwSend:true}])test('failed send retains pending '+JSON.stringify(spec),()=>{const r=run({pending:'pending-123',...spec});assert.equal(r.g.DotUserNotifyPending,'pending-123');assert.equal(r.g.DotUserNotifyStatus,'retry_pending');});
test('ack never clears newer pending batch',()=>assert.equal(run({pending:'pending-123',newer:true}).g.DotUserNotifyPending,'newerbatch-123'));
test('invalid mode rejected',()=>assert.equal(run({mode:'unknown'}).g.DotUserNotifyStatus,'invalid_mode'));
test('invalid batch rejected without network',()=>assert.equal(run({pending:'sensitive contents !'}).sent.length,0));
test('new upload supersedes unacked signal with fresh batch',()=>{const r=run({mode:'enqueue',pending:'pending-123',http:500});assert.notEqual(r.g.DotUserNotifyPending,'pending-123');assert.equal(r.g.DotUserNotifyStatus,'retry_pending');});
test('permanent 403 blocks until setup repair',()=>{const r=run({pending:'pending-123',http:403});assert.equal(r.g.DotUserNotifyBlocked,'1');assert.equal(r.g.DotUserNotifyStatus,'settings_required');});
test('blocked settings do not retry',()=>assert.equal(run({pending:'pending-123',blocked:true}).sent.length,0));
test('429 retains retry eligibility',()=>assert.equal(run({pending:'pending-123',http:429}).g.DotUserNotifyBlocked,''));
test('shared storage path rejected',()=>assert.equal(run({mode:'setup',secretDir:'/sdcard'}).writes.length,0));
test('setup writes secret only to private no_backup file',()=>{const r=run({mode:'setup'});assert.equal(r.writes.length,1);assert(!JSON.stringify(r.g).includes(FAKE));assert.equal(r.writes[0][0],'/data/user/0/net.dinglisch.android.taskerm/no_backup/dot_notify_user_token.txt');assert.equal(r.sent.length,0);});
test('setup cancellation changes no secret',()=>assert.equal(run({mode:'setup',setupEntry:null}).writes.length,0));
test('manual Play no parameter sends exactly one content-free signal',()=>{const r=run({omitPar1:true});assert.equal(r.sent.length,1);assert.equal(r.g.DotUserNotifyStatus,'slack_accepted');});
test('manual Play empty parameter sends exactly one signal',()=>assert.equal(run({mode:''}).sent.length,1));
test('manual Play unresolved parameter sends exactly one signal',()=>assert.equal(run({mode:'%par1'}).sent.length,1));
for(const error of ['invalid_auth','token_revoked','token_expired','account_inactive','missing_scope','not_allowed_token_type','channel_not_found','not_in_channel','is_archived','no_permission','restricted_action'])test('API permanent '+error,()=>{const r=run({pending:'pending-123',response:JSON.stringify({ok:false,error})});assert.equal(r.g.DotUserNotifyBlocked,'1');assert.equal(r.g.DotUserNotifyPending,'pending-123');});
for(const response of [null,[],true,'string',{ok:true,channel:'OTHER',ts:'123.456'},{ok:true,channel:'CHANNEL_ID_REPLACE_BEFORE_USE'},{ok:false,error:'ratelimited'},{ok:false,error:'internal_error'}])test('malformed/transient API ack retains pending '+JSON.stringify(response),()=>{const r=run({pending:'pending-123',response:JSON.stringify(response)});assert.equal(r.g.DotUserNotifyPending,'pending-123');assert.equal(r.g.DotUserNotifyBlocked,'');});
test('bot token rejected locally',()=>assert.equal(run({mode:'setup',setupEntry:'xoxb-SYNTHETIC-NOT-A-REAL-TOKEN-000000'}).writes.length,0));
test('header injection rejected locally',()=>assert.equal(run({mode:'setup',setupEntry:FAKE+'\r\nInjected:1'}).writes.length,0));
test('missing private path preserves pending',()=>{const r=run({mode:'enqueue',secretDir:''});assert(r.g.DotUserNotifyPending);assert.equal(r.sent.length,0);});
console.log(cases+' behavior tests passed. Mock only; Android import/network/E2E NOT tested.');
