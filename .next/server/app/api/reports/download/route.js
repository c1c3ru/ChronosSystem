"use strict";(()=>{var e={};e.id=9561,e.ids=[9561],e.modules={98432:e=>{e.exports=require("bcryptjs")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},12295:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>y,requestAsyncStorage:()=>h,routeModule:()=>c,serverHooks:()=>f,staticGenerationAsyncStorage:()=>g});var o={};r.r(o),r.d(o,{GET:()=>u,dynamic:()=>m});var a=r(49303),i=r(88716),n=r(60670),s=r(87070),l=r(75571),p=r(90455),d=r(83493);let m="force-dynamic";async function u(e){try{let t=await (0,l.getServerSession)(p.L);if(!t||!["ADMIN","SUPERVISOR"].includes(t.user.role))return s.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let{searchParams:r}=new URL(e.url),o=r.get("format")||"csv",a=parseInt(r.get("period")||"30"),i=r.get("user")||"ALL",n=new Date;n.setDate(n.getDate()-a);let m={};"ALL"!==i&&(m={role:i});let[u,c]=await Promise.all([d._.user.findMany({where:m,select:{id:!0,name:!0,email:!0,role:!0,createdAt:!0}}),d._.attendanceRecord.findMany({where:{timestamp:{gte:n},..."ALL"!==i&&{user:{role:i}}},include:{user:{select:{name:!0,email:!0,role:!0}},machine:{select:{name:!0,location:!0}}},orderBy:{timestamp:"desc"}})]);if("csv"===o)return function(e,t,r){let o=e.map(e=>[new Date(e.timestamp).toLocaleString("pt-BR"),e.user?.name||"N/A",e.user?.email||"N/A",e.user?.role||"N/A","ENTRY"===e.type?"Entrada":"Sa\xedda",e.machine?.name||"N/A",e.machine?.location||"N/A"]),a=["Data/Hora,Usu\xe1rio,Email,Role,Tipo,M\xe1quina,Localiza\xe7\xe3o",...o.map(e=>e.map(e=>`"${e}"`).join(","))].join("\n");return new s.NextResponse("\uFEFF"+a,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="relatorio-ponto-${new Date().toISOString().split("T")[0]}.csv"`}})}(c,0,0);if("pdf"===o)return function(e,t,r){let o=`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relat\xf3rio de Ponto - Chronos System</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                font-size: 12px;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 2px solid #22c55e;
                padding-bottom: 20px;
            }
            .header h1 { 
                color: #22c55e; 
                margin: 0;
                font-size: 24px;
            }
            .header p { 
                color: #666; 
                margin: 5px 0;
            }
            .summary {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .summary h3 {
                margin-top: 0;
                color: #333;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
            }
            th { 
                background-color: #22c55e; 
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) { 
                background-color: #f9f9f9; 
            }
            .entry { color: #22c55e; font-weight: bold; }
            .exit { color: #ef4444; font-weight: bold; }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 10px;
                border-top: 1px solid #ddd;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Chronos System</h1>
            <p>Relat\xf3rio de Registros de Ponto</p>
            <p>Per\xedodo: \xdaltimos ${r} dias | Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div class="summary">
            <h3>Resumo</h3>
            <p><strong>Total de Usu\xe1rios:</strong> ${t.length}</p>
            <p><strong>Total de Registros:</strong> ${e.length}</p>
            <p><strong>Registros de Entrada:</strong> ${e.filter(e=>"ENTRY"===e.type).length}</p>
            <p><strong>Registros de Sa\xedda:</strong> ${e.filter(e=>"EXIT"===e.type).length}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Usu\xe1rio</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tipo</th>
                    <th>M\xe1quina</th>
                    <th>Localiza\xe7\xe3o</th>
                </tr>
            </thead>
            <tbody>
                ${e.map(e=>`
                    <tr>
                        <td>${new Date(e.timestamp).toLocaleString("pt-BR")}</td>
                        <td>${e.user?.name||"N/A"}</td>
                        <td>${e.user?.email||"N/A"}</td>
                        <td>${e.user?.role||"N/A"}</td>
                        <td class="${e.type.toLowerCase()}">
                            ${"ENTRY"===e.type?"Entrada":"Sa\xedda"}
                        </td>
                        <td>${e.machine?.name||"N/A"}</td>
                        <td>${e.machine?.location||"N/A"}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <div class="footer">
            <p>Relat\xf3rio gerado automaticamente pelo Chronos System</p>
            <p>\xa9 ${new Date().getFullYear()} - Sistema de Registro de Ponto Eletr\xf4nico</p>
        </div>
    </body>
    </html>
  `;return new s.NextResponse(o,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="relatorio-ponto-${new Date().toISOString().split("T")[0]}.html"`}})}(c,u,a);return s.NextResponse.json({error:"Formato n\xe3o suportado"},{status:400})}catch(e){return s.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/reports/download/route",pathname:"/api/reports/download",filename:"route",bundlePath:"app/api/reports/download/route"},resolvedPagePath:"/home/deppi/ChronosSystem/app/api/reports/download/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:h,staticGenerationAsyncStorage:g,serverHooks:f}=c,x="/api/reports/download/route";function y(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:g})}},90455:(e,t,r)=>{r.d(t,{L:()=>m});var o=r(13539),a=r(77234),i=r(53797),n=r(98432),s=r.n(n),l=r(83493);let p=process.env.GOOGLE_CLIENT_ID,d=process.env.GOOGLE_CLIENT_SECRET,m={adapter:(0,o.N)(l._),debug:!1,providers:[(0,i.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;try{let t=await l._.user.findUnique({where:{email:e.email}});if(!t||!t.password||!await s().compare(e.password,t.password))return null;return{id:t.id,email:t.email,name:t.name,role:t.role,profileComplete:t.profileComplete,image:t.image}}catch(e){return null}}}),(0,a.Z)({clientId:p,clientSecret:d,allowDangerousEmailAccountLinking:!0})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin",error:"/auth/error"},callbacks:{async jwt({token:e,user:t,account:r,trigger:o}){if((t||"update"===o)&&(t&&(e.role=t.role,e.sub=t.id,e.profileComplete=t.profileComplete),e.sub)){let t=await l._.user.findUnique({where:{id:e.sub},select:{role:!0,profileComplete:!0,name:!0,email:!0}});t&&(e.role=t.role,e.profileComplete=t.profileComplete,e.name=t.name,e.email=t.email)}return e},session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role,e.user.profileComplete=t.profileComplete),e),async signIn({user:e,account:t,profile:r}){if(t?.provider==="google")try{let t=await l._.user.findUnique({where:{email:e.email},select:{id:!0,email:!0,name:!0,role:!0,profileComplete:!0,image:!0}});if(t)e.id=t.id,e.role=t.role,e.profileComplete=t.profileComplete,e.name=t.name||e.name,e.image=t.image||e.image;else{let t=await l._.user.create({data:{email:e.email,name:e.name||"Usu\xe1rio",image:e.image,role:"EMPLOYEE",profileComplete:!1}});e.id=t.id,e.role=t.role,e.profileComplete=t.profileComplete}}catch(e){return!1}return!0},redirect:async({url:e,baseUrl:t})=>e.includes("/api/auth/callback/")?`${t}/`:e.startsWith("/")?`${t}${e}`:new URL(e).origin===t?e:t},secret:"test-secret-key-for-development"}},83493:(e,t,r)=>{r.d(t,{_:()=>a});let o=require("@prisma/client"),a=globalThis.prisma??new o.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[9276,5972,1083],()=>r(12295));module.exports=o})();