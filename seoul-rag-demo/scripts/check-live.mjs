import {loadEvents} from '../lib/service.mjs';
try {const data=await loadEvents();if(!data.rows.length || !data.rows[0].title)throw new Error('No records'); console.log('LIVE_OK',JSON.stringify({loaded:data.rows.length,total:data.total,firstTitle:data.rows[0].title}));}catch(e){console.error(e.message);process.exitCode=1;}
