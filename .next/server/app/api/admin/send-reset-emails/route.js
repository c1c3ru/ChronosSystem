"use strict";(()=>{var e={};e.id=610,e.ids=[610],e.modules={53524:e=>{e.exports=require("@prisma/client")},98432:e=>{e.exports=require("bcryptjs")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},86624:e=>{e.exports=require("querystring")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},95067:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>w,patchFetch:()=>E,requestAsyncStorage:()=>y,routeModule:()=>g,serverHooks:()=>b,staticGenerationAsyncStorage:()=>v});var s={};t.r(s),t.d(s,{GET:()=>h,POST:()=>x});var a=t(49303),o=t(88716),i=t(60670),n=t(87070),l=t(75571),u=t(90455),p=t(72331),d=t(36119),c=t(91585),m=t(26033);let f=c.Ry({tokenIds:c.IX(c.Z_()).min(1,"Pelo menos um token deve ser selecionado"),customMessage:c.Z_().optional()});async function x(e){try{let r=await (0,l.getServerSession)(u.L);if(!r||!["ADMIN","SUPERVISOR"].includes(r.user.role))return n.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let t=await e.json(),s=f.parse(t),a=await p._.passwordResetToken.findMany({where:{id:{in:s.tokenIds},used:!1,expires:{gt:new Date}},include:{user:{select:{id:!0,email:!0,name:!0}}}});if(0===a.length)return n.NextResponse.json({error:"Nenhum token v\xe1lido encontrado"},{status:400});let o=[],i=0,c=0;for(let e of a)try{let r=`http://localhost:3000/auth/reset-password?token=${e.token}`;await d.y.sendPasswordResetEmail({userName:e.user.name||"Usu\xe1rio",userEmail:e.user.email,resetUrl:r,expiresAt:e.expires,reason:s.customMessage})?(i++,o.push({userId:e.user.id,email:e.user.email,status:"success"})):(c++,o.push({userId:e.user.id,email:e.user.email,status:"failed",error:"Falha no envio"}))}catch(r){c++,o.push({userId:e.user.id,email:e.user.email,status:"failed",error:r instanceof Error?r.message:"Erro desconhecido"})}return await p._.auditLog.create({data:{userId:r.user.id,action:"SEND_RESET_EMAILS",resource:"PASSWORD_RESET_EMAIL",details:`Emails enviados: ${i} sucessos, ${c} falhas. Tokens: ${s.tokenIds.join(", ")}`}}),n.NextResponse.json({success:!0,message:`Emails processados: ${i} enviados, ${c} falharam`,results:{total:a.length,success:i,failed:c,details:o}})}catch(e){if(e instanceof m.jm)return n.NextResponse.json({error:"Dados inv\xe1lidos",details:e.errors},{status:400});return n.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}async function h(e){try{let e=await (0,l.getServerSession)(u.L);if(!e||!["ADMIN","SUPERVISOR"].includes(e.user.role))return n.NextResponse.json({error:"N\xe3o autorizado"},{status:401});let r=new Date;r.setDate(r.getDate()-30);let t=await p._.auditLog.findMany({where:{action:"SEND_RESET_EMAILS",timestamp:{gte:r}},orderBy:{timestamp:"desc"},take:50,include:{user:{select:{name:!0,email:!0}}}}),s={totalEmailsSent:t.length,last24Hours:t.filter(e=>e.timestamp>=new Date(Date.now()-864e5)).length,last7Days:t.filter(e=>e.timestamp>=new Date(Date.now()-6048e5)).length,recentLogs:t.slice(0,10).map(e=>({id:e.id,timestamp:e.timestamp,details:e.details,sentBy:e.user?.name||"Sistema"}))};return n.NextResponse.json(s)}catch(e){return n.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let g=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/admin/send-reset-emails/route",pathname:"/api/admin/send-reset-emails",filename:"route",bundlePath:"app/api/admin/send-reset-emails/route"},resolvedPagePath:"/home/deppi/ChronosSystem/app/api/admin/send-reset-emails/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:y,staticGenerationAsyncStorage:v,serverHooks:b}=g,w="/api/admin/send-reset-emails/route";function E(){return(0,i.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:v})}},90455:(e,r,t)=>{t.d(r,{L:()=>c});var s=t(13539),a=t(77234),o=t(53797),i=t(98432),n=t.n(i),l=t(72331);let u=process.env.GOOGLE_CLIENT_ID,p=process.env.GOOGLE_CLIENT_SECRET,d=process.env.NEXTAUTH_SECRET;if(!u)throw Error("GOOGLE_CLIENT_ID environment variable is required");if(!p)throw Error("GOOGLE_CLIENT_SECRET environment variable is required");if(!d)throw Error("NEXTAUTH_SECRET environment variable is required");let c={adapter:(0,s.N)(l._),debug:!1,providers:[(0,o.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;try{let r=await l._.user.findUnique({where:{email:e.email}});if(!r||!r.password||!await n().compare(e.password,r.password))return null;return{id:r.id,email:r.email,name:r.name,role:r.role,profileComplete:r.profileComplete,image:r.image}}catch(e){return null}}}),(0,a.Z)({clientId:u,clientSecret:p,allowDangerousEmailAccountLinking:!0,authorization:{params:{prompt:"consent",access_type:"offline",response_type:"code"}}})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin",error:"/auth/error"},callbacks:{async jwt({token:e,user:r,account:t,trigger:s}){if((r||"update"===s)&&(r&&(e.role=r.role,e.sub=r.id,e.profileComplete=r.profileComplete),e.sub)){let r=await l._.user.findUnique({where:{id:e.sub},select:{role:!0,profileComplete:!0,name:!0,email:!0}});r&&(e.role=r.role,e.profileComplete=r.profileComplete,e.name=r.name,e.email=r.email)}return e},session:async({session:e,token:r})=>(r&&(e.user.id=r.sub,e.user.role=r.role,e.user.profileComplete=r.profileComplete),e),async signIn({user:e,account:r,profile:t}){if(r?.provider==="google")try{if(!t?.email_verified)return!1;let r=await l._.user.findUnique({where:{email:e.email},select:{id:!0,email:!0,name:!0,role:!0,profileComplete:!0,image:!0}});if(r)e.id=r.id,e.role=r.role,e.profileComplete=r.profileComplete,e.name=r.name||e.name,e.image=r.image||e.image;else try{let r=await l._.user.create({data:{email:e.email,name:t?.name||e.name||"Usu\xe1rio",image:t?.picture||e.image,role:"EMPLOYEE",profileComplete:!1,createdAt:new Date,updatedAt:new Date}});e.id=r.id,e.role=r.role,e.profileComplete=r.profileComplete,e.name=r.name,e.image=r.image,await l._.auditLog.create({data:{userId:r.id,action:"AUTO_USER_CREATED_GOOGLE",resource:"AUTH",details:`Usu\xe1rio criado automaticamente via Google: ${r.email}`}})}catch(r){try{await l._.auditLog.create({data:{userId:null,action:"FAILED_AUTO_USER_CREATION",resource:"AUTH",details:`Falha ao criar usu\xe1rio automaticamente: ${e.email} - ${r}`}})}catch(e){}return!1}}catch(e){return!1}return!0},async redirect({url:e,baseUrl:r}){if(e.includes("/api/auth/callback/"))return`${r}/`;if(e.startsWith("/"))return`${r}${e}`;try{if(new URL(e).origin===r)return e}catch(e){}return r}},secret:d}},36119:(e,r,t)=>{t.d(r,{y:()=>o});var s=t(55245);class a{constructor(){this.transporter=null,this.initializeTransporter()}static getInstance(){return a.instance||(a.instance=new a),a.instance}initializeTransporter(){try{let e={host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},tls:{rejectUnauthorized:!1}};if(!process.env.SMTP_USER||!process.env.SMTP_PASS){this.createTestAccount();return}this.transporter=s.createTransport(e),this.transporter?.verify((e,r)=>{})}catch(e){}}async createTestAccount(){try{let e=await s.createTestAccount();this.transporter=s.createTransport({host:"smtp.ethereal.email",port:587,secure:!1,auth:{user:e.user,pass:e.pass}})}catch(e){}}async sendEmail(e){try{if(!this.transporter)return!1;let r={from:`"Chronos System" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:e.to,subject:e.subject,text:e.text,html:e.html};return(await this.transporter.sendMail(r)).previewURL,!0}catch(e){return!1}}async sendPasswordResetEmail(e){let r=this.generatePasswordResetHTML(e),t=this.generatePasswordResetText(e);return await this.sendEmail({to:e.userEmail,subject:"Reset de Senha - Chronos System",html:r,text:t})}async sendMassPasswordResetNotification(e,r,t){let s=`Reset de Senha em Massa - ${r} usu\xe1rios`,a=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Reset de Senha em Massa</h2>
        <p>Um reset de senha em massa foi executado no sistema Chronos.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Usu\xe1rios afetados:</strong> ${r}</p>
          <p><strong>Motivo:</strong> ${t}</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString("pt-BR")}</p>
        </div>
        
        <p>Todos os usu\xe1rios afetados devem receber instru\xe7\xf5es para redefinir suas senhas.</p>
        
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Este \xe9 um email autom\xe1tico do sistema Chronos. N\xe3o responda a este email.
        </p>
      </div>
    `,o=`
      Reset de Senha em Massa - Chronos System
      
      Um reset de senha em massa foi executado no sistema.
      
      Usu\xe1rios afetados: ${r}
      Motivo: ${t}
      Data/Hora: ${new Date().toLocaleString("pt-BR")}
      
      Todos os usu\xe1rios afetados devem receber instru\xe7\xf5es para redefinir suas senhas.
    `;return await this.sendEmail({to:e,subject:s,html:a,text:o})}generatePasswordResetHTML(e){let r=Math.ceil((e.expiresAt.getTime()-Date.now())/36e5);return`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #1f2937; margin: 0;">🕐 Chronos System</h1>
        </div>
        
        <div style="padding: 32px 20px;">
          <h2 style="color: #1f2937;">Reset de Senha Solicitado</h2>
          
          <p>Ol\xe1 <strong>${e.userName}</strong>,</p>
          
          <p>Foi solicitado um reset de senha para sua conta no sistema Chronos.</p>
          
          ${e.reason?`
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Motivo:</strong> ${e.reason}</p>
            </div>
          `:""}
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${e.resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>⏰ Este link expira em ${r} hora(s).</strong>
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Se voc\xea n\xe3o conseguir clicar no bot\xe3o, copie e cole o link abaixo no seu navegador:
          </p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 12px;">
            ${e.resetUrl}
          </p>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Se voc\xea n\xe3o solicitou este reset, ignore este email. 
              Sua senha atual permanecer\xe1 inalterada.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Este \xe9 um email autom\xe1tico do sistema Chronos. N\xe3o responda a este email.
          </p>
        </div>
      </div>
    `}generatePasswordResetText(e){let r=Math.ceil((e.expiresAt.getTime()-Date.now())/36e5);return`
      Chronos System - Reset de Senha
      
      Ol\xe1 ${e.userName},
      
      Foi solicitado um reset de senha para sua conta no sistema Chronos.
      
      ${e.reason?`Motivo: ${e.reason}
`:""}
      
      Para redefinir sua senha, acesse o link abaixo:
      ${e.resetUrl}
      
      ⏰ Este link expira em ${r} hora(s).
      
      ⚠️ Importante: Se voc\xea n\xe3o solicitou este reset, ignore este email. 
      Sua senha atual permanecer\xe1 inalterada.
      
      ---
      Este \xe9 um email autom\xe1tico do sistema Chronos. N\xe3o responda a este email.
    `}}let o=a.getInstance()},72331:(e,r,t)=>{t.d(r,{_:()=>a});var s=t(53524);let a=globalThis.prisma??new s.PrismaClient},69955:(e,r)=>{Object.defineProperty(r,"__esModule",{value:!0})},75571:(e,r,t)=>{Object.defineProperty(r,"__esModule",{value:!0});var s={};Object.defineProperty(r,"default",{enumerable:!0,get:function(){return o.default}});var a=t(69955);Object.keys(a).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===a[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return a[e]}}))});var o=function(e,r){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var t=i(void 0);if(t&&t.has(e))return t.get(e);var s={__proto__:null},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if("default"!==o&&({}).hasOwnProperty.call(e,o)){var n=a?Object.getOwnPropertyDescriptor(e,o):null;n&&(n.get||n.set)?Object.defineProperty(s,o,n):s[o]=e[o]}return s.default=e,t&&t.set(e,s),s}(t(45609));function i(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,t=new WeakMap;return(i=function(e){return e?t:r})(e)}Object.keys(o).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in r&&r[e]===o[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return o[e]}}))})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[9276,5972,6575,1585,5245],()=>t(95067));module.exports=s})();