function n(o){if(typeof o=="string")return o;try{return JSON.stringify(o,null,2)}catch{return String(o)}}function c(o){return`
let __loopCount = 0;
const __checkLoop = () => {
  if (++__loopCount > 1e6) {
    throw new Error("❌ Infinite loop detected");
  }
};

${o.replace(/for\s*\(|while\s*\(|do\s*\{/g,r=>r.startsWith("do")?`${r} __checkLoop();`:`${r}__checkLoop(),`)}
`}self.onmessage=async o=>{const r=o.data;let t=[],s;const a={log:(...e)=>t.push({type:"log",payload:e.map(n)}),warn:(...e)=>t.push({type:"warn",payload:e.map(n)}),error:(...e)=>t.push({type:"error",payload:e.map(n)}),table:e=>t.push({type:"table",payload:n(e)}),clear:()=>{t=[]}};try{s=setTimeout(()=>{throw new Error("⏱ Execution timed out")},2e3);const e=c(r);await new Function("console",`
      return (async () => {
        ${e}
      })();
    `)(a),clearTimeout(s),self.postMessage({logs:t})}catch(e){clearTimeout(s),self.postMessage({logs:[{type:"error",payload:[e.message||e.toString()]}]})}};
