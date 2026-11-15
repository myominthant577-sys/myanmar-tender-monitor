import fs from "node:fs/promises";
import path from "node:path";
export const dynamic = "force-dynamic";
const sources=[{id:"mal",name:"မြန်မာ့အလင်း",url:"https://www.moi.gov.mm/mal/"},{id:"km",name:"ကြေးမုံ",url:"https://www.moi.gov.mm/km/"},{id:"gnlm",name:"The Global New Light of Myanmar",url:"https://www.gnlm.com.mm/"}];
export default async function Home({searchParams}) {
 const params=await searchParams; const filter=params?.source||"all"; const q=(params?.q||"").toLowerCase();
 let data={updated_at:null,issues:[],tenders:[]};
 try { data=JSON.parse(await fs.readFile(path.join(process.cwd(),"data","tenders.json"),"utf8")); } catch {}
 const tenders=(data.tenders||[]).filter(t=>(filter==="all"||t.source===filter)&&JSON.stringify(t).toLowerCase().includes(q));
 const style={border:"1px solid #dfe5ed",borderRadius:14,background:"white",padding:20};
 return <main style={{maxWidth:1100,margin:"auto",padding:"28px 16px"}}>
 <header style={{marginBottom:24}}><div style={{fontSize:13,color:"#536b83",fontWeight:700}}>OFFICIAL NEWSPAPER MONITORING</div><h1 style={{margin:"8px 0",fontSize:32}}>မြန်မာ တင်ဒါစောင့်ကြည့်ရေး</h1><p style={{color:"#536b83"}}>မြန်မာ့အလင်း · ကြေးမုံ · GNLM — မူရင်း PDF အထောက်အထားပါသော ကြော်ငြာများသာ ဖော်ပြသည်။</p></header>
 <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:20}}>
 {[["အတည်ပြု တင်ဒါ",data.tenders?.length||0],["စစ်ဆေးထားသော သတင်းစာ",data.issues?.length||0],["နောက်ဆုံး စစ်ဆေးမှု",data.updated_at?new Date(data.updated_at).toLocaleString("en-GB",{timeZone:"Asia/Yangon"}):"မစစ်ဆေးရသေး"]].map(([a,b])=><div key={a} style={style}><div style={{fontSize:13,color:"#536b83"}}>{a}</div><strong style={{fontSize:24}}>{b}</strong></div>)}</section>
 <form style={{...style,display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}><select name="source" defaultValue={filter} style={{padding:12,flex:1,minWidth:180}}><option value="all">သတင်းစာအားလုံး</option>{sources.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select><input name="q" placeholder="ဌာန / တင်ဒါ / နေရာ ရှာဖွေရန်" defaultValue={q} style={{padding:12,flex:2,minWidth:190}}/><button style={{background:"#164f9e",color:"white",border:0,borderRadius:8,padding:"12px 22px"}}>ရှာဖွေမည်</button></form>
 <section style={style}><h2 style={{marginTop:0}}>တင်ဒါကြော်ငြာများ</h2>{!tenders.length?<p style={{color:"#536b83"}}>အတည်ပြုထားသော တင်ဒါမရှိသေးပါ။ စစ်ဆေးမပြီးသော ကြော်ငြာကို အတည်ပြုပြီးဟု မဖော်ပြပါ။</p>:tenders.map((t,i)=><article key={i} style={{padding:"18px 0",borderTop:"1px solid #e4eaf1"}}><h3>{t.title}</h3><p>{t.department||"ဌာန မဖော်ပြထား"} · {t.issue_date} · စာမျက်နှာ {t.page}</p><p>{t.summary}</p><a href={t.pdf_url} target="_blank" rel="noreferrer">မူရင်း PDF ဖတ်ရန်</a></article>)}</section>
 <section style={{...style,marginTop:20}}><h2 style={{marginTop:0}}>တရားဝင် သတင်းစာများ</h2>{sources.map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></p>)}<p style={{fontSize:13,color:"#536b83"}}>PDF ရရှိခြင်းနှင့် တင်ဒါအတည်ပြုခြင်းသည် မတူပါ။ OCR မသေချာသည့် ကြော်ငြာများကို လူဖြင့် ပြန်လည်စစ်ဆေးရန် လိုအပ်သည်။</p></section>
 </main>;
}