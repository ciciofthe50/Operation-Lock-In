const assert=require('node:assert/strict');const {analyze}=require('./dist/analyzer.js');
let result=analyze(`Practice Test
Name: __________
Directions: Answer all questions.
Show all your work.
1. What is the SI unit of force?
A. Joule
B. Newton
C. Watt
2. Calculate the net force on an object
with mass 2 kg and acceleration 3 m/s².
Answer: 6 N
Page 1
Answer Key
1. B`);
assert.equal(result.candidates.length,2);assert.equal(result.candidates[0].answer,'B. Newton');assert.match(result.candidates[1].question,/with mass/);assert.equal(result.candidates[1].answer,'6 N');assert(!result.candidates.some(q=>/Name:|Directions:|Show all|Page 1/.test(q.question)));
result=analyze('Formula sheet\nNewton’s second law\nF = ma\nV = IR\nK = ½mv²','formulas');
assert.equal(result.candidates.length,6);assert(result.candidates.some(q=>q.kind==='application'&&q.answer.includes('12 N')));assert(result.candidates.some(q=>q.answer.includes('12 V')));assert(result.candidates.some(q=>q.answer.includes('9 J')));
result=analyze('F = ma\nF = ma','formulas');assert.equal(result.candidates.length,2);
result=analyze('Unknown equation\nx = yz','formulas');assert.equal(result.candidates.length,2);assert.equal(result.candidates[1].answer,'');assert(!result.candidates.some(q=>q.kind==='application'));
result=analyze('Q: What is inertia?\nA: Resistance to changes in motion.\nDate: tomorrow');assert.equal(result.candidates.length,1);assert.equal(result.candidates[0].answer,'Resistance to changes in motion.');
assert.equal(analyze('1. What is energy?\nStudent ID: 123').candidates[0].answer,'');
assert.equal(analyze('Name: Jane\nPage 3\nShow your work\nCopyright 2026\nA very long instruction paragraph with no question to answer.').candidates.length,0);
result=analyze('Momentum: mass multiplied by velocity.');assert.equal(result.candidates[0].question,'What is Momentum?');
assert.equal(analyze('F = ma','questions').candidates.length,0);
assert.equal(analyze('What is a force?','formulas').candidates.length,0);
assert.equal(analyze('What is a force?\nWhat is a force?').candidates.length,1);
console.log('Passed: question boundaries, wrapped prompts, choices, answer keys, header filtering, known formula applications, duplicate detection, unknown formulas, missing answers, document modes, definitions.');
