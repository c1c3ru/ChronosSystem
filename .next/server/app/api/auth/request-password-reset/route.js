"use strict";(()=>{var e={};e.id=168,e.ids=[168],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},24377:(e,s,r)=>{r.r(s),r.d(s,{originalPathname:()=>b,patchFetch:()=>y,requestAsyncStorage:()=>f,routeModule:()=>g,serverHooks:()=>S,staticGenerationAsyncStorage:()=>v});var t={};r.r(t),r.d(t,{POST:()=>h});var a=r(49303),o=r(88716),i=r(60670),n=r(87070),p=r(83493),d=r(36119),u=r(84770),l=r.n(u),c=r(91585),m=r(26033);let x=c.Ry({email:c.Z_().email("Email inv\xe1lido")});async function h(e){try{let s=await e.json(),{email:r}=x.parse(s),t=await p._.user.findUnique({where:{email:r},select:{id:!0,email:!0,name:!0,password:!0}});if(!t||!t.password)return n.NextResponse.json({success:!0,message:"Se o email estiver cadastrado, voc\xea receber\xe1 um link para redefinir sua senha em poucos minutos."});await p._.passwordResetToken.updateMany({where:{userId:t.id,used:!1},data:{used:!0,usedAt:new Date}});let a=l().randomBytes(32).toString("hex"),o=new Date;o.setHours(o.getHours()+1);let i=await p._.passwordResetToken.create({data:{token:a,userId:t.id,expires:o}}),u=`http://localhost:3000/auth/reset-password?token=${i.token}`;return await d.y.sendPasswordResetEmail({userName:t.name||"Usu\xe1rio",userEmail:t.email,resetUrl:u,expiresAt:o,reason:"Solicitado pelo pr\xf3prio usu\xe1rio via tela de login."}),await p._.auditLog.create({data:{userId:t.id,action:"SELF_SERVICE_PASSWORD_RESET_REQUESTED",resource:"USER_PASSWORD",details:`Reset de senha solicitado pelo pr\xf3prio usu\xe1rio (email: ${t.email}).`}}),n.NextResponse.json({success:!0,message:"Se o email estiver cadastrado, voc\xea receber\xe1 um link para redefinir sua senha em poucos minutos."})}catch(e){if(e instanceof m.jm)return n.NextResponse.json({error:"Dados inv\xe1lidos",details:e.errors},{status:400});return n.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let g=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/auth/request-password-reset/route",pathname:"/api/auth/request-password-reset",filename:"route",bundlePath:"app/api/auth/request-password-reset/route"},resolvedPagePath:"/home/deppi/ChronosSystem/app/api/auth/request-password-reset/route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:f,staticGenerationAsyncStorage:v,serverHooks:S}=g,b="/api/auth/request-password-reset/route";function y(){return(0,i.patchFetch)({serverHooks:S,staticGenerationAsyncStorage:v})}},36119:(e,s,r)=>{r.d(s,{y:()=>o});var t=r(55245);class a{constructor(){this.transporter=null,this.initializeTransporter()}static getInstance(){return a.instance||(a.instance=new a),a.instance}initializeTransporter(){try{let e={host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},tls:{rejectUnauthorized:!1}};if(!process.env.SMTP_USER||!process.env.SMTP_PASS){this.createTestAccount();return}this.transporter=t.createTransport(e),this.transporter?.verify((e,s)=>{})}catch(e){}}async createTestAccount(){try{let e=await t.createTestAccount();this.transporter=t.createTransport({host:"smtp.ethereal.email",port:587,secure:!1,auth:{user:e.user,pass:e.pass}})}catch(e){}}async sendEmail(e){try{if(!this.transporter)return!1;let s={from:`"Chronos System" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:e.to,subject:e.subject,text:e.text,html:e.html};return(await this.transporter.sendMail(s)).previewURL,!0}catch(e){return!1}}async sendPasswordResetEmail(e){let s=this.generatePasswordResetHTML(e),r=this.generatePasswordResetText(e);return await this.sendEmail({to:e.userEmail,subject:"Reset de Senha - Chronos System",html:s,text:r})}async sendMassPasswordResetNotification(e,s,r){let t=`Reset de Senha em Massa - ${s} usu\xe1rios`,a=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Reset de Senha em Massa</h2>
        <p>Um reset de senha em massa foi executado no sistema Chronos.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Usu\xe1rios afetados:</strong> ${s}</p>
          <p><strong>Motivo:</strong> ${r}</p>
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
      
      Usu\xe1rios afetados: ${s}
      Motivo: ${r}
      Data/Hora: ${new Date().toLocaleString("pt-BR")}
      
      Todos os usu\xe1rios afetados devem receber instru\xe7\xf5es para redefinir suas senhas.
    `;return await this.sendEmail({to:e,subject:t,html:a,text:o})}generatePasswordResetHTML(e){let s=Math.ceil((e.expiresAt.getTime()-Date.now())/36e5);return`
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
            <strong>⏰ Este link expira em ${s} hora(s).</strong>
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
    `}generatePasswordResetText(e){let s=Math.ceil((e.expiresAt.getTime()-Date.now())/36e5);return`
      Chronos System - Reset de Senha
      
      Ol\xe1 ${e.userName},
      
      Foi solicitado um reset de senha para sua conta no sistema Chronos.
      
      ${e.reason?`Motivo: ${e.reason}
`:""}
      
      Para redefinir sua senha, acesse o link abaixo:
      ${e.resetUrl}
      
      ⏰ Este link expira em ${s} hora(s).
      
      ⚠️ Importante: Se voc\xea n\xe3o solicitou este reset, ignore este email. 
      Sua senha atual permanecer\xe1 inalterada.
      
      ---
      Este \xe9 um email autom\xe1tico do sistema Chronos. N\xe3o responda a este email.
    `}}let o=a.getInstance()},83493:(e,s,r)=>{r.d(s,{_:()=>a});let t=require("@prisma/client"),a=globalThis.prisma??new t.PrismaClient}};var s=require("../../../../webpack-runtime.js");s.C(e);var r=e=>s(s.s=e),t=s.X(0,[9276,5972,1585,5245],()=>r(24377));module.exports=t})();