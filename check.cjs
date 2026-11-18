const fs=require('fs'),path=require('path'),vm=require('vm');
require('./analyzer-check.cjs');
const nodes=new Map();
const node=()=>({innerHTML:'',textContent:'',style:{},dataset:{},classList:{toggle(){}},value:'',checked:false,showModal(){},close(){}});
const sandbox={window:{scrollTo(){}},document:{querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return[]}},localStorage:{getItem(){return null},setItem(){}},crypto:require('crypto').webcrypto,setTimeout(){},console,confirm(){return true}};
vm.createContext(sandbox);
for(const file of ['analyzer.js','app.js','review.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'dist',file),'utf8'),sandbox);
vm.runInContext(`
if(parseQuestions('question,answer\\n"Why, exactly?","An answer"','csv')[0].question!=='Why, exactly?')throw Error('CSV quoting');
if(parseQuestions('Q: Example?\\nA: Answer','notes').length!==1)throw Error('Q&A import');
let rejected=false;try{parseQuestions('[{"question":"Missing answer"}]','json')}catch{rejected=true}if(!rejected)throw Error('JSON validation');
sample();if(db.questions.length!==4)throw Error('Sample generation');
const before=db.questions.length;
reviewMaterial({id:'test-import',title:'Force',type:'NOTES',date:Date.now(),text:'Name: Student\\nF = ma'});
if(db.questions.length!==before)throw Error('Review must not auto-save');
if(reviewState.items.length!==2)throw Error('Formula preview');
for(let i=0;i<reviewState.items.length;i++){document.querySelector('[data-include="'+i+'"]').checked=true;document.querySelector('[data-question="'+i+'"]').value=reviewState.items[i].question;document.querySelector('[data-answer="'+i+'"]').value=reviewState.items[i].answer;}
document.querySelector('[data-answer="0"]').value='';document.querySelector('#saveReview').onclick();
if(db.questions.length!==before)throw Error('Missing answers must block save');
document.querySelector('[data-answer="0"]').value='F = ma';document.querySelector('[data-include="1"]').checked=false;document.querySelector('#saveReview').onclick();
if(db.questions.length!==before+1)throw Error('Excluded item was saved');
generate('test-import');if(reviewState.items.some(q=>q.question==='What is the formula for Newton’s second law?'))throw Error('Duplicate generation');
document.querySelector('#closeReview').onclick();
document.querySelector('#studyMaterial').value=db.materials[0].id;document.querySelector('#studyCount').value='5';document.querySelector('#studyMode').value='quiz';start();reveal();rate(true);while(session){reveal();rate(false)}
if(db.sessions.length!==1||db.sessions[0].total!==4||db.sessions[0].correct!==1)throw Error('Session score');
if(db.questions.filter(q=>q.missed).length!==3)throw Error('Missed question tracking');
`,sandbox);
console.log('Passed: structured imports, review-before-save, missing-answer validation, exclusion, duplicates, quiz scoring, missed questions.');
