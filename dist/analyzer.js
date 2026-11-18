(function(root){
  'use strict';
  const compact=s=>s.replace(/\s+/g,' ').trim();
  const noise=s=>/^(?:page\s+\d+|\d+\s*(?:of|\/)\s*\d+|name\s*:|date\s*:|student(?:\s+id)?\s*:|course\s*:|instructor\s*:|copyright|all rights reserved|https?:\/\/|directions?\s*:|instructions?\s*:|answer\s+(?:all|each|the following)|show\s+(?:all|your)\s+work|choose\s+(?:the|one)|circle\s+(?:the|one)|time\s+(?:limit|allowed)|total\s+points|formula\s+sheet\b|reference\s+sheet\b|practice\s+(?:test|quiz)\b)/i.test(s)||/^\d+$/.test(s);
  const prompt=s=>/\?/.test(s)||/^(?:what|why|how|when|where|which|who|calculate|compute|find|determine|solve|explain|describe|define|compare|identify|state|evaluate|simplify|derive|prove|convert|a\s+\w+.*\b(?:find|calculate|determine))\b/i.test(s);
  function normalizedFormula(s){return s.toLowerCase().replace(/[×·⋅*\s]/g,'').replace(/²/g,'^2').replace(/³/g,'^3').replace(/½/g,'1/2').replace(/δ/g,'Δ')}
  const known=[
    {match:['f=ma','Σf=ma'],name:'Newton’s second law',equation:'F = ma',variables:'F: net force (N); m: mass (kg); a: acceleration (m/s²).',question:'A 3 kg object accelerates at 4 m/s². What net force acts on it?',answer:'F = ma = 3 × 4 = 12 N.'},
    {match:['v=ir'],name:'Ohm’s law',equation:'V = IR',variables:'V: voltage (V); I: current (A); R: resistance (Ω).',question:'A 6 Ω resistor carries a current of 2 A. What is the voltage across it?',answer:'V = IR = 2 × 6 = 12 V.'},
    {match:['p=mv'],name:'Momentum',equation:'p = mv',variables:'p: momentum (kg·m/s); m: mass (kg); v: velocity (m/s).',question:'A 2 kg object moves at 3 m/s. What is its momentum?',answer:'p = mv = 2 × 3 = 6 kg·m/s in the direction of motion.'},
    {match:['w=mg','fg=mg'],name:'Weight near Earth’s surface',equation:'W = mg',variables:'W: weight (N); m: mass (kg); g: gravitational acceleration (m/s²).',question:'What is the weight of a 5 kg object? Use g = 9.8 m/s².',answer:'W = mg = 5 × 9.8 = 49 N downward.'},
    {match:['ke=1/2mv^2','k=1/2mv^2','ke=(1/2)mv^2','k=(1/2)mv^2'],name:'Kinetic energy',equation:'K = ½mv²',variables:'K: kinetic energy (J); m: mass (kg); v: speed (m/s).',question:'A 2 kg object moves at 3 m/s. What is its kinetic energy?',answer:'K = ½mv² = ½ × 2 × 3² = 9 J.'},
    {match:['ρ=m/v','rho=m/v'],name:'Density',equation:'ρ = m/V',variables:'ρ: density; m: mass; V: volume. Use consistent units.',question:'An object has a mass of 20 g and a volume of 5 cm³. What is its density?',answer:'ρ = m/V = 20/5 = 4 g/cm³.'},
    {match:['a=πr^2','a=pir^2'],name:'Area of a circle',equation:'A = πr²',variables:'A: area; r: radius. Area units are the square of the radius units.',question:'What is the area of a circle with radius 3 cm? Give an exact answer.',answer:'A = πr² = π × 3² = 9π cm².'}
  ];
  function analyze(text,mode='auto'){
    const lines=text.replace(/\r\n?/g,'\n').replace(/([?])\s+(?=\d+[.)]\s)/g,'$1\n').split('\n').map(compact).filter(Boolean);
    const candidates=[],ignored=[];let current=null,inKey=false,key=new Map(),heading='';
    const add=q=>{if(q.question&&q.question.length<1600&&!candidates.some(x=>x.question.toLowerCase()===q.question.toLowerCase()))candidates.push({...q,include:true})};
    function finish(){if(!current)return;let q=current;current=null;if(!prompt(q.question)){ignored.push(q.question);return}let answer=q.answer||key.get(q.number)||'';if(/^[A-H]$/i.test(answer)&&q.options?.length){const option=q.options.find(o=>o.letter===answer.toUpperCase());if(option)answer=answer.toUpperCase()+'. '+option.text}add({kind:'question',question:q.question+(q.options?.length?'\n'+q.options.map(o=>o.letter+'. '+o.text).join('\n'):''),answer,source:q.source,number:q.number})}
    // Read explicit answer keys without interpreting them as prompts.
    for(const line of lines){if(/^(?:answer\s*key|answers)\s*:?$/i.test(line)){inKey=true;continue}if(inKey){for(const m of line.matchAll(/(?:^|\s)(\d+)[.)\-:]\s*([A-H])(?=\s|$|[,;])/gi))key.set(m[1],m[2].toUpperCase())}}
    inKey=false;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(/^(?:answer\s*key|answers)\s*:?$/i.test(line)){finish();inKey=true;continue}if(inKey){ignored.push(line);continue}
      if(noise(line)){finish();ignored.push(line);continue}
      const start=line.match(/^(?:(?:question\s*)?(\d+)[.)\:]\s+|Q\s*:\s*)(.+)$/i);
      const ans=line.match(/^(?:A|Ans|Answer|Solution)\s*:\s*(.+)$/i);
      if(ans&&current){current.answer=ans[1];continue}
      const opt=line.match(/^\(?([A-Ha-h])[.)]\s*(.+)$/);
      if(opt&&current){current.options||=[];current.options.push({letter:opt[1].toUpperCase(),text:opt[2]});continue}
      if(start&&mode!=='formulas'){finish();current={number:start[1],question:start[2],source:line,options:[]};continue}
      if(prompt(line)&&mode!=='formulas'){finish();current={question:line,source:line,options:[]};continue}
      // Formula candidates must be short equations, not prose containing an equals sign.
      const equation=line.match(/^(?:([A-Za-z][A-Za-z ’'–-]{2,60})\s*:\s*)?([A-Za-zΑ-ωΣΔ][A-Za-zΑ-ωΣΔ0-9_()²³^]*\s*=\s*[A-Za-zΑ-ωΣΔ0-9+\-*/×÷·⋅^²³½π().{}\s]+)$/);
      if(equation&&mode!=='questions'){
        finish();let formula=compact(equation[2]),n=normalizedFormula(formula),fact=known.find(f=>f.match.includes(n));let name=equation[1]||fact?.name||heading||'this formula';
        add({kind:'formula',question:`What is the formula for ${name}?`,answer:formula+(fact?'\n'+fact.variables:''),source:line});
        if(fact)add({kind:'application',question:fact.question,answer:fact.answer,source:line});
        else add({kind:'formula',question:`In ${formula}, what does each symbol represent, and when is this formula applicable?`,answer:'',source:line});
        continue;
      }
      if(current){
        // Only join clear wrapped text, options, or a short answer continuation.
        if(current.answer&&/^[a-z(]/.test(line)){current.answer+=' '+line;continue}
        if(current.options?.length&&/^[a-z(]/.test(line)){current.options.at(-1).text+=' '+line;continue}
        if(!current.question.endsWith('?')&&!current.options?.length&&line.length>20&&!/^[A-Z\s\d:–-]+$/.test(line)&&!line.includes('=')){current.question+=' '+line;continue}
        finish();
      }
      if(mode!=='questions'&&mode!=='formulas'){
        const definition=line.match(/^([A-Za-z][A-Za-z ’'()/-]{1,70})\s*(?::|\s[–—]\s|\bis defined as\b|\bmeans\b)\s*(.{12,400})$/i);
        if(definition&&!noise(definition[1])){add({kind:'definition',question:`What is ${definition[1].trim()}?`,answer:definition[2],source:line});continue}
      }
      if(line.length<80&&!/[.!?=]$/.test(line))heading=line;ignored.push(line);
    }
    finish();return{candidates,ignored};
  }
  const api={analyze,normalizedFormula};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.StudyAnalyzer=api;
})(typeof globalThis!=='undefined'?globalThis:this);
