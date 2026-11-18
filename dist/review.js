let reviewState=null;
function reviewMaterial(material,structured=null){
  reviewState={material,structured,items:[],ignored:[]};
  const legacy=db.questions.filter(q=>q.material===material.id&&q.generated&&!q.generatorVersion).length;
  $('#replaceLegacy').checked=false;$('#legacyOption').hidden=!legacy;
  $('#reviewMode').value='auto';$('#reviewMode').disabled=!!structured;$('#reviewDialog').showModal();refreshAnalysis();
}
function refreshAnalysis(){
  if(!reviewState)return;
  const result=reviewState.structured?{candidates:reviewState.structured.map(q=>({...q,kind:'question',include:true})),ignored:[]}:StudyAnalyzer.analyze(reviewState.material.text,$('#reviewMode').value);
  const existing=db.questions.filter(q=>q.material===reviewState.material.id);
  reviewState.items=result.candidates.filter(q=>!existing.some(x=>x.question===q.question));reviewState.ignored=result.ignored;
  $('#reviewSummary').textContent=`${reviewState.items.length} new items found. ${result.ignored.length} text blocks left out. Only selected items with an answer will be saved.`;
  $('#reviewItems').innerHTML=reviewState.items.map((q,i)=>`<article class="review-item"><label class="review-select"><input type="checkbox" data-include="${i}" checked> ${esc(q.kind)} ${!q.answer?'· Add an answer to use in practice':''}</label><label>Question<textarea rows="3" data-question="${i}">${esc(q.question)}</textarea></label><label>Answer<textarea rows="3" data-answer="${i}" placeholder="No answer found. Add one, or leave this item out.">${esc(q.answer||'')}</textarea></label>${q.source?`<details><summary>Source text</summary><p>${esc(q.source)}</p></details>`:''}</article>`).join('')||'<p>No clear questions or formulas found. Try another document type, or correct the extracted text in the import dialog. Nothing will be invented from unclear text.</p>';
  $('#ignoredText').textContent=result.ignored.join('\n');$('#reviewError').textContent='';
}
$('#reviewMode').onchange=()=>{if(reviewState.items.length&&!confirm('Re-analyze the material? Unsaved edits in this review will be replaced.'))return;refreshAnalysis()};
$('#closeReview').onclick=()=>{$('#reviewDialog').close();reviewState=null};
$('#saveReview').onclick=()=>{
  const selected=[];
  for(let i=0;i<reviewState.items.length;i++){
    if(!$(`[data-include="${i}"]`).checked)continue;
    const question=$(`[data-question="${i}"]`).value.trim(),answer=$(`[data-answer="${i}"]`).value.trim();
    if(!question||!answer){$('#reviewError').textContent='A selected item needs a question and an answer. Add the missing text or uncheck it.';return}
    const q=reviewState.items[i];selected.push({...q,question,answer,id:uid(),material:reviewState.material.id,generated:q.kind!=='question',generatorVersion:2});
  }
  if(!db.materials.some(m=>m.id===reviewState.material.id))db.materials.push(reviewState.material);
  if($('#replaceLegacy').checked)db.questions=db.questions.filter(q=>q.material!==reviewState.material.id||!q.generated||q.generatorVersion);
  db.questions.push(...selected);save();$('#reviewDialog').close();$('#importDialog').close();reviewState=null;go('library');toast(`${selected.length} reviewed questions saved.`);
};
