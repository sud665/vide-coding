import {search} from '../lib/service.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST') return res.status(405).json({error:'POST 요청을 사용해 주세요.'});
 try {const result=await search(typeof req.body==='string'?JSON.parse(req.body):req.body);return res.status(result.status).json(result.body);}catch(e){return res.status(502).json({error:e.message.startsWith('서울')?e.message:'요청을 처리하지 못했습니다. 다시 시도해 주세요.'});}
}
