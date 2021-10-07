var p=Object.defineProperty;var g=n=>p(n,"__esModule",{value:!0});var m=(n,r)=>{g(n);for(var e in r)p(n,e,{get:r[e],enumerable:!0})};m(exports,{levelPrefix:()=>a,shape:()=>s,toString:()=>h});function u(n,r){return JSON.stringify(n)===JSON.stringify(r)}function o(n){return JSON.parse(JSON.stringify(n))}function a(n){return[...Array(n*2).keys()].map(r=>" ").join("")}function h(n,r=0){switch(n.kind){case"scalar":return a(r)+n.name;case"array":return a(r)+`Array of
`+h(n.children,r+1);case"object":return a(r)+(`Object with
`+Object.keys(n.children).map(e=>`${a(r+1)}'${e}' of
${h(n.children[e],r+2)}`).join(`,
`));case"varied":return n.children.map(e=>h(e,r)).join(` or
`);case"unknown":return a(r)+"Unknown"}}function S(n,r){let e={kind:"varied",children:n.children.slice()};for(let c of r.children)for(let d of n.children)u(c,d)||e.children.push(c);return e}function j(n,r){let e=Object.keys(n.children),c=Object.keys(r.children),d={kind:"object",children:{}};for(let i=0;i<e.length;i++){let t=e[i];if(c.includes(t)){d.children[t]=f([n.children[t],r.children[t]]).children;continue}d.children[t]={kind:"varied",children:[n.children[t],{kind:"scalar",name:"null"}]}}for(let i=0;i<c.length;i++){let t=c[i];e.includes(t)||(d.children[t]={kind:"varied",children:[r.children[t],{kind:"scalar",name:"null"}]})}return d}function y(n,r){if(!r||n<=r)return[...Array(n).keys()].map((c,d)=>d);let e=[];for(;e.length<r;){let c=Math.floor(Math.random()*(n-1))+1;e.indexOf(c)===-1&&e.push(c)}return e}function f(n,r){let e={kind:"array",children:{kind:"unknown"}};if(!n.length)return e;let c=y(n.length,r||n.length);e.children=n[0];for(let d=0;d<c.length;d++){let i=n[c[d]];if(!u(e.children,i)){if(i.kind==="object"&&e.children.kind==="object"){e.children=j(o(e.children),i);continue}if(i.kind==="array"&&e.children.kind==="array"){e.children=f([o(e.children).children,i.children]);continue}if(i.kind==="varied"&&e.children.kind==="varied"){e.children=S(i,o(e.children));continue}if(i.kind===e.children.kind&&i.kind!=="scalar")throw new Error(`Missing type equality condition for ${i.kind} merge.`);if(e.children.kind==="varied"){let t=[e.children],k=!1;for(;t;){let l=t.pop();if(l.kind==="varied"&&l.children.map(b=>t.push(b)),u(l,i)){k=!0;break}}if(k)continue}e.children={kind:"varied",children:[o(e.children),i]}}}return e}function O(n,r){let e=n.map(c=>s(c,r));return f(e,r)}function A(n,r){let e=Object.keys(n),c=y(e.length,r),d={kind:"object",children:{}};for(let i=0;i<c.length;i++){let t=e[c[i]];d.children[t]=s(n[t],r)}return d}function s(n,r=5e3){try{return Array.isArray(n)?O(n,r):n===null?{kind:"scalar",name:"null"}:typeof n=="object"?A(n,r):typeof n=="number"?{kind:"scalar",name:"number"}:typeof n=="bigint"?{kind:"scalar",name:"bigint"}:typeof n=="undefined"?{kind:"scalar",name:"null"}:typeof n=="boolean"?{kind:"scalar",name:"boolean"}:{kind:"scalar",name:"string"}}catch(e){return console.error(e),{kind:"unknown"}}}0&&(module.exports={levelPrefix,shape,toString});
//# sourceMappingURL=index.js.map
