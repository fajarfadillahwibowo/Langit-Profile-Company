import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadFiles, CHUNK_BYTES } from './deliveryUploader.mjs';

test('200 files, transient failures, lost finalize ACK and rerun never duplicate accepted files', async () => {
    const jobs = Array.from({length:200}, (_,i) => ({id:`file-${i}`, file:new Blob(['original']), name:`${i}.jpg`}));
    const accepted = new Set(); let calls=0; let lost=true;
    const send = async (url, body) => {
        calls++;
        if (calls === 2) throw {response:{status:503}};
        const id = url.split('/')[5];
        if (url.endsWith('/complete')) { accepted.add(id); if (lost) {lost=false; throw new Error('lost ACK');} return {complete:true, photo_id:id,total_photos:accepted.size}; }
        if (url.endsWith('/chunks')) return {accepted:true};
        return {complete:accepted.has(id),photo_id:id,received:[],total_photos:accepted.size};
    };
    const progress=[];
    const result = await uploadFiles({deliveryId:1,jobs,send,hash:async()=> 'hash',sleep:async()=>{},onProgress:p=>progress.push(p)});
    assert.equal(result.accepted,200); assert.equal(accepted.size,200); assert.equal(result.failed,0);
    assert.equal(progress.at(-1).percent,100);
    await uploadFiles({deliveryId:1,jobs,send,hash:async()=> 'hash'});
    assert.equal(accepted.size,200);
});
test('large originals sliced to 8MiB; permanent errors stay pending, cancellation never completes', async () => {
    const sizes=[]; const job={id:'large',name:'large.jpg',file:new Blob([new Uint8Array(101*1024*1024)])};
    const result = await uploadFiles({deliveryId:1,jobs:[job],hash:async()=> 'hash',send:async(url,body)=> {
        if(url.endsWith('/chunks')) {sizes.push(body.get('chunk').size);return {accepted:true};}
        if(url.endsWith('/complete')) throw {response:{status:422},message:'invalid'};
        return {received:[],complete:false};
    }});
    assert.equal(sizes.length,13);assert.ok(sizes.every(s=>s<=CHUNK_BYTES));assert.equal(result.failed,1);assert.equal(result.accepted,0);assert.equal(job.done,undefined);
    const controller=new AbortController();controller.abort();
    const cancelled=await uploadFiles({deliveryId:1,jobs:[job],signal:controller.signal,send:async()=>assert.fail('cancelled request')});
    assert.equal(cancelled.cancelled,true);assert.equal(cancelled.accepted,0);
});
