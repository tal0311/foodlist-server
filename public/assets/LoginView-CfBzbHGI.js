import{e as i,H as d,u as p,c,d as s,D as n,E as a,n as m,o as _}from"./index-B-AM4y06.js";const w={class:"login-container"},v=s("h1",null,"Login",-1),f=s("button",null,"Login",-1),U={__name:"LoginView",setup(g){const e=i({username:"tal0311",password:"1234"}),r=d(),l=p();async function u(){await r.login(e.value),l.push("/account")}return(h,o)=>(_(),c("section",w,[v,s("form",{onSubmit:m(u,["prevent"])},[n(s("input",{type:"text","onUpdate:modelValue":o[0]||(o[0]=t=>e.value.username=t),placeholder:"Username"},null,512),[[a,e.value.username]]),n(s("input",{type:"password","onUpdate:modelValue":o[1]||(o[1]=t=>e.value.password=t),placeholder:"Password"},null,512),[[a,e.value.password]]),f],32)]))}};export{U as default};
