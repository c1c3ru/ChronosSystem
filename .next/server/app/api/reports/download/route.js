"use strict";(()=>{var e={};e.id=9561,e.ids=[9561],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},12295:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>m,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h});var o={};r.r(o),r.d(o,{GET:()=>c});var a=r(49303),n=r(88716),s=r(60670),i=r(87070),d=r(75571),l=r(90455),p=r(83493);async function c(e){try{let t=await (0,d.getServerSession)(l.L);if(!t||!["ADMIN","SUPERVISOR"].includes(t.user.role))return i.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let{searchParams:r}=new URL(e.url),o=r.get("format")||"csv",a=parseInt(r.get("period")||"30"),n=r.get("user")||"ALL",s=new Date;s.setDate(s.getDate()-a);let c={};"ALL"!==n&&(c={role:n});let[u,m]=await Promise.all([p._.user.findMany({where:c,select:{id:!0,name:!0,email:!0,role:!0,createdAt:!0}}),p._.attendanceRecord.findMany({where:{timestamp:{gte:s},..."ALL"!==n&&{user:{role:n}}},include:{user:{select:{name:!0,email:!0,role:!0}},machine:{select:{name:!0,location:!0}}},orderBy:{timestamp:"desc"}})]);if("csv"===o)return function(e,t,r){let o=e.map(e=>[new Date(e.timestamp).toLocaleString("pt-BR"),e.user?.name||"N/A",e.user?.email||"N/A",e.user?.role||"N/A","ENTRY"===e.type?"Entrada":"Sa\xedda",e.machine?.name||"N/A",e.machine?.location||"N/A"]),a=["Data/Hora,Usu\xe1rio,Email,Role,Tipo,M\xe1quina,Localiza\xe7\xe3o",...o.map(e=>e.map(e=>`"${e}"`).join(","))].join("\n");return new i.NextResponse("\uFEFF"+a,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="relatorio-ponto-${new Date().toISOString().split("T")[0]}.csv"`}})}(m,0,0);if("pdf"===o)return function(e,t,r){let o=`
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
  `;return new i.NextResponse(o,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="relatorio-ponto-${new Date().toISOString().split("T")[0]}.html"`}})}(m,u,a);return i.NextResponse.json({error:"Formato n\xe3o suportado"},{status:400})}catch(e){return console.error("Erro ao gerar relat\xf3rio:",e),i.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/reports/download/route",pathname:"/api/reports/download",filename:"route",bundlePath:"app/api/reports/download/route"},resolvedPagePath:"/home/deppi/ChronosSystem/app/api/reports/download/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:m,staticGenerationAsyncStorage:h,serverHooks:g}=u,x="/api/reports/download/route";function f(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},90455:(e,t,r)=>{r.d(t,{L:()=>s});var o=r(13539),a=r(77234),n=r(83493);let s={adapter:(0,o.N)(n._),providers:[(0,a.Z)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET})],session:{strategy:"jwt"},callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role||"EMPLOYEE",e.sub=t.id),e),session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role),e),async signIn({user:e,account:t,profile:r}){if(t?.provider==="google")try{await n._.user.findUnique({where:{email:e.email}})||await n._.user.create({data:{email:e.email,name:e.name,image:e.image,role:"EMPLOYEE"}})}catch(e){return console.error("Erro ao criar usu\xe1rio:",e),!1}return!0}},pages:{signIn:"/auth/signin",error:"/auth/error"},secret:"chronos-secret-key-2024-production-ready"}},83493:(e,t,r)=>{r.d(t,{_:()=>a});let o=require("@prisma/client"),a=globalThis.prisma??new o.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[9276,5972,8966],()=>r(12295));module.exports=o})();