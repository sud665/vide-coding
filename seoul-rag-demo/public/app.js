const $=s=>document.querySelector(s);
const districts='강남구 강동구 강북구 강서구 관악구 광진구 구로구 금천구 노원구 도봉구 동대문구 동작구 마포구 서대문구 서초구 성동구 성북구 송파구 양천구 영등포구 용산구 은평구 종로구 중구 중랑구'.split(' ');
for(const district of districts){const o=document.createElement('option');o.value=o.textContent=district;$('#district').append(o);}
for(const b of document.querySelectorAll('[data-query]'))b.addEventListener('click',()=>{$('#query').value=b.dataset.query;$('#query').focus();});
function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
$('#search-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=$('.submit');button.disabled=true;button.textContent='서울의 장면을 찾는 중…';$('.results-panel').setAttribute('aria-busy','true');$('#status').textContent='서울 공공데이터를 조회하고 관련 자료를 찾고 있습니다.';$('#mode').textContent='조회 중';$('#results').replaceChildren();$('#answer').hidden=true;$('#metadata').textContent='';
 try{
  const response=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:$('#query').value,district:$('#district').value,freeOnly:$('#free').checked,includePast:$('#past').checked}),signal:AbortSignal.timeout(65000)});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'검색에 실패했습니다.');
  $('#status').textContent=data.note;$('#mode').textContent=data.mode==='ai'?'AI 답변 + 검색 근거':'검색 근거';
  if(data.answer){$('#answer').hidden=false;$('#answer').textContent=data.answer+'\n\n참조 자료: '+data.sources.map(s=>'#'+s).join(', ');}
  if(!data.records.length)$('#results').append(el('h2','조건에 맞는 결과가 없습니다.'));
  for(const r of data.records){
   const article=el('article',null,'event');const top=el('div',null,'event-top');top.append(el('span',`#${r.id} · ${r.district} · ${r.category}`));if(r.free)top.append(el('span','무료','free-tag'));article.append(top,el('h3',r.title));const dl=el('dl');for(const [label,value] of [['기간',r.date],['장소',r.place],['요금',r.fee || (r.free?'무료':'원문 확인')],['대상',r.audience]]){dl.append(el('dt',label),el('dd',value||'원문 확인'));}const a=el('a','행사 원문 확인 ↗');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';article.append(dl,a);$('#results').append(article);
  }
  $('#metadata').textContent=`전체 ${data.total.toLocaleString()}건 중 ${data.loaded.toLocaleString()}건 검색 · 결과 ${data.records.length}건 · 조회 ${new Date(data.retrievedAt).toLocaleString('ko-KR')} · 서버 캐시 5분`;
 }catch(error){$('#status').textContent=error.name==='TimeoutError'?'응답이 지연되고 있습니다. 다시 검색해 주세요.':error.message;$('#mode').textContent='연결 확인 필요';}
 finally{button.disabled=false;button.textContent='문화행사 찾기 →';$('.results-panel').setAttribute('aria-busy','false');}
});
