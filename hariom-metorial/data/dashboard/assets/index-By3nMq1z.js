import{l as c}from"./lodash-DTwDN1r0.js";import{n as o}from"./index-D4F7dAoF.js";let d=(e,r)=>{let[s,u]=o.useState(()=>e),t=o.useMemo(()=>c.debounce(u,r),[r]);return o.useEffect(()=>(t(e),()=>t.cancel()),[e,t]),s};export{d as u};
//# sourceMappingURL=index-By3nMq1z.js.map
