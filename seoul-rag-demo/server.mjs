import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {search} from './lib/service.mjs';
const assets={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
http.createServer(async(req,res)=>{
 const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/search'){
  if(req.method!=='POST')return send(405,{error:'POST 요청이 필요합니다.'});
  let body='';try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096)return send(413,{error:'요청이 너무 큽니다.'});}let input;try{input=JSON.parse(body);}catch{return send(400,{error:'올바른 JSON을 전송해 주세요.'});}const result=await search(input);return send(result.status,result.body);}catch(e){return send(502,{error:e.message.startsWith('서울')?e.message:'요청 처리에 실패했습니다.'});}
 }
 const asset=assets[path];if(!asset){res.writeHead(404);return res.end('Not found');}
 try{const file=await readFile(new URL(`./public/${asset[0]}`,import.meta.url));res.writeHead(200,{'Content-Type':`${asset[1]}; charset=utf-8`,'X-Content-Type-Options':'nosniff'});res.end(file);}catch{res.writeHead(500);res.end('Unable to load page');}
}).listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log(`Seoul demo: http://localhost:${process.env.PORT||3001}`));
