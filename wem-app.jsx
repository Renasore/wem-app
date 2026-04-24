import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ── SUPABASE ──────────────────────────────────────────────────
const SUPA_URL = "https://pupxongflgpzocpddblg.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cHhvbmdmbGdwem9jcGRkYmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODg3NDIsImV4cCI6MjA5MjI2NDc0Mn0.ynHLTBzheyOSRAaNOhOCTKdoJ8Qikz0kEFlYH-e-Qbo";

async function sbGet() {
  const r = await fetch(`${SUPA_URL}/rest/v1/wem_data?id=eq.main&select=students,visitors`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
  });
  const d = await r.json();
  return { students: d?.[0]?.students || [], visitors: d?.[0]?.visitors || [] };
}
async function sbSet(students, visitors) {
  await fetch(`${SUPA_URL}/rest/v1/wem_data?id=eq.main`, {
    method: "PATCH",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ students, visitors, updated_at: new Date().toISOString() })
  });
}

// ── DADOS ─────────────────────────────────────────────────────
const MODULES = [
  { name: "Módulo 01 · Colagem",               tasks: ["Marchetaria","Prateleira em Pet","Fórmica 1","Circunf. em Pet"] },
  { name: "Módulo 02 · Máquinas Estacionárias", tasks: ["TC1","TC2","Gav. Int","Fórmica 2","Escaninho","Encaixe de Espiga","Cavilhas","TC3","Caixinha em MDF","Esq. e Molduras"] },
  { name: "Módulo 03 · Orçamentos",             tasks: ["Armarinho","Corr. Simples","Gaveteiro","Portas de Correr","Banquinho"] },
  { name: "Módulo Extra",                       tasks: ["Proj. Pessoal"] },
];
const ALL_TASKS = [];
MODULES.forEach(mod => mod.tasks.forEach(n => ALL_TASKS.push({ number: ALL_TASKS.length + 1, name: n, module: mod.name })));

const TURMAS = [
  { id: "tf1", label: "TF1 · Terça Manhã", cap: 8 },
  { id: "tf2", label: "TF2 · Terça Tarde",  cap: 8 },
  { id: "sab", label: "Sábado",             cap: 8 },
];

const EXTRA_COSTS = { "Escaninho":20, "Encaixe de Espiga":20, "Caixinha em MDF":20, "Armarinho":40, "Gaveteiro":100, "Banquinho":100 };
const PRECO       = { pacote: 500, avulsa: 150 };
const LOCK_REASONS = ["Viagem","Problemas pessoais","Questão financeira","Não informou","Outro"];
const MONTHS      = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const TS = {
  presenca:  { icon: "✅", label: "Presença",  color: "#38a048", bg: "#0e2814", bd: "#1e5020" },
  reposicao: { icon: "🔄", label: "Reposição", color: "#5ab030", bg: "#1a2a10", bd: "#2a5018" },
  falta:     { icon: "❌", label: "Falta",     color: "#e05050", bg: "#3a0808", bd: "#7a1818" },
};

const C = {
  bg:"#17130e", card:"#221c14", card2:"#2a2218", border:"#3a2e1e",
  amber:"#d4891c", amberL:"#f0a830", gold:"#b87820",
  green:"#1e5c28", red:"#7a1818",
  text:"#ede5d5", muted:"#8a7860", dim:"#5a4e3a", warn:"#b05a08",
};

const ORIGENS    = ["Instagram","Indicação","Google","Passou na frente","Outro"];
const VIS_STATUS = {
  novo:      { label:"NOVO",      color:"#60a0e8", bg:"#0e1a2e", bd:"#1e3a6a" },
  contatado: { label:"CONTATADO", color:"#f0a830", bg:"#2a1e06", bd:"#b87820" },
  confirmou: { label:"CONFIRMOU", color:"#38a048", bg:"#0e2814", bd:"#1e5020" },
  desistiu:  { label:"DESISTIU",  color:"#e05050", bg:"#3a0808", bd:"#7a1818" },
};

const MSG_PACOTE = "REGRAS GERAIS DO CURSO DE MARCENARIA DA WAGNON MÓVEIS (WEM)\n(ATT FEV 26)\n\nPACOTE DE 4 AULAS\n\n1.1 - Nesse modo, o aluno garante vaga em uma das turmas;\n1.2 - O pagamento é feito de 4 em 4 aulas consecutivas (não é mensal);\n1.3 - No caso de falta o aluno tem direito à reposição, mas em uma turma diferente, desde que tenha vaga;\n\n2 - REGRAS DE FALTAS\n\nAtualmente, o WEM disponibiliza do recurso de reposição de aula, em caso de falta, para os alunos do pacote de 4 aulas. Mas atenção!\n\n2.1 - O fato de o aluno faltar, não lhe dará mais 'uma semana' para pagar. O pagamento será feito independente de o aluno vir ou não. Cabe ao aluno marcar o dia de reposição da aula perdida, mas em outra turma diferente da sua;\n2.2 - Após a quarta aula do pacote, o aluno terá que fazer a renovação do pagamento, que lhe dará direito a mais 4 aulas e assim por diante;\n2.3 - Caso o aluno falte nesse período de 'troca de ficha', será considerado trancamento do curso, mesmo que ele esteja disposto a retornar na semana seguinte. Com isso, ele perderá a exclusividade da vaga, correndo risco de ter que esperar nova vaga para voltar;\n   2.3.1 - Quando o aluno retornar ao curso, começará pela última tarefa que parou;\n2.4 - Se o aluno trancar o curso, com intenção de voltar posteriormente, ele ainda terá um mês corrido para repor as aulas que perdeu. A reposição é sempre em outra turma, desde que tenha vaga. Caso ele não reponha, terá perdido as aulas;\n2.5 - Caso o aluno possua mais de 4 faltas ao longo do curso, sem repor nenhuma delas, ele será colocado no sistema de aula avulsa automaticamente. A partir de então, terá 1 mês corrido para repor as aulas perdidas, em qualquer turma, desde que tenha vaga. Caso ele não reponha, terá perdido as aulas;\n\n3 - CASOS EXTRAS\n\n3.1 - Só haverá abono de aula para os casos em que o curso não oferecer aula (ex. feriados ou algum evento excepcional na localidade que impeça ao curso de funcionar);\n\n4 - PERGUNTAS FREQUENTES\n\n1 - O curso possui 20 tarefas. Quantas aulas demora para terminar o curso?\nR: Vai depender da capacidade de aprendizado do aluno. Aulas é diferente de tarefas. A maioria dos alunos termina as 20 tarefas em 28 aulas. Algumas tarefas demoram 3, 4 aulas para terminar. Há tarefas que demoram meia aula. Quem terminar as tarefas mais rápido, terminará o curso antes e renovará a ficha menos vezes (consequentemente, pagará menos). Quem demorar mais, pagará mais, por pagar um número maior de renovações.\n\n2 - Vou precisar me ausentar do curso por mais de 1 mês, sendo que deixei o exercício sem finalizar. Quando voltar, posso continuar nele?\nR: Não. Todos os exercícios serão descartados após um mês. Com isso o aluno não precisará começar o curso do zero, mas terá que fazer aquele exercício novamente.\n\n3 - Posso migrar de um modo para o outro (pacote de 4 aulas para aula avulsa, ou vice e versa) durante o curso?\nR: Sim. Sem problemas. Logo que a próxima ficha iniciar, é possível.\n\n4 - Não quero levar os exercícios para casa. Terei que pagar pelo gasto extra de alguns exercícios?\nR: Sim. O gasto extra é pelo consumo extra de material. O aluno decide se quer levar o exercício ou não. Caso o aluno não possa / não queira levar os exercícios, eles ficarão armazenados no armário por um mês. Depois disso, por questões de organização do espaço, os exercícios serão descartados.";

const MSG_AVULSA = "REGRAS GERAIS DO CURSO DE MARCENARIA DA WAGNON MÓVEIS (WEM)\n(ATT FEV 26)\n\n1 - PAGAMENTO POR AULA (AULA AVULSA)\n\n1.1 - Não tem garantia de vaga em uma das turmas. Será necessário verificar se há vaga antes de assistir a aula;\n1.2 - O pagamento é feito antecipadamente de aula em aula (consultar valores vigentes);\n1.3 - O pagamento é calculado da seguinte forma: valor do pacote de 4 aulas / 4 + um acréscimo (para que o aluno da aula avulsa não possua vantagem sobre o aluno do pacote de 4 aulas);\n1.4 - Não recebe falta; tem a liberdade de frequentar qualquer turma, desde que haja vaga;\n\n2 - PERGUNTAS FREQUENTES\n\n1 - O curso possui 20 tarefas. Quantas aulas demora para terminar o curso?\nR: Vai depender da capacidade de aprendizado do aluno. Aulas é diferente de tarefas. A maioria dos alunos termina as 20 tarefas em 28 aulas. Algumas tarefas demoram 3, 4 aulas para terminar. Há tarefas que demoram meia aula. Quem terminar as tarefas mais rápido, terminará o curso antes e renovará a ficha menos vezes (consequentemente, pagará menos). Quem demorar mais, pagará mais, por pagar um número maior de renovações.\n\n2 - Vou precisar me ausentar do curso por mais de 1 mês, sendo que deixei o exercício sem finalizar. Quando voltar, posso continuar nele?\nR: Não. Todos os exercícios serão descartados após um mês. Com isso o aluno não precisará começar o curso do zero, mas terá que fazer aquele exercício novamente.\n\n3 - Posso migrar de um modo para o outro (pacote de 4 aulas para aula avulsa, ou vice e versa) durante o curso?\nR: Sim. Sem problemas. Logo que a próxima ficha iniciar, é possível.";

// ── UTILS ─────────────────────────────────────────────────────
const fmtD   = (iso) => { try { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; } catch(e) { return "—"; } };
const toIso  = (br)  => { try { const [d,m,y] = br.split("/");  return `${y}-${m}-${d}`; } catch(e) { return "2000-01-01"; } };
const todBR  = ()    => new Date().toLocaleDateString("pt-BR");
const todISO = ()    => new Date().toISOString().split("T")[0];
const uid    = ()    => Date.now() + Math.random();
const pBR    = (br)  => { if (!br) return null; const p = br.split("/"); return { d:+p[0], m:+p[1], y:+p[2] }; };
const inM    = (br, m, y) => { const p = pBR(br); return p && p.m === m && p.y === y; };
const inY    = (br, y)    => { const p = pBR(br); return p && p.y === y; };
const waLink = (phone, msg) => { const n = phone.replace(/[^0-9]/g,""), full = n.startsWith("55") ? n : "55"+n; return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`; };

// ── FACTORY ───────────────────────────────────────────────────
const mkSt = (name, mode, turma, phone="") => ({
  id: uid(), name, mode, turma, phone, status: "active",
  entryDate: todBR(), lockDate: null, lockReason: null, conclusionDate: null,
  fichaUsed: 0, fichaNum: 1, needsRenewal: false,
  totalClasses: 0, totalFaltas: 0, pendingReposicoes: 0, taskIndex: 0,
  taskCompletions: {}, classLog: [], extraPayments: {}, renewalLog: [], avulsaLog: [],
});

// ── ESTILOS ───────────────────────────────────────────────────
const S = {
  page: { fontFamily:"'Georgia',serif", background:C.bg, minHeight:"100vh", color:C.text, maxWidth:430, margin:"0 auto" },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:12 },
  lbl:  { fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:8, display:"block" },
  inp:  { width:"100%", background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:16, outline:"none", boxSizing:"border-box", display:"block" },
  btn:  (bg, col="#fff") => ({ background:bg, color:col, border:"none", borderRadius:10, padding:"13px 0", fontSize:15, fontWeight:"bold", cursor:"pointer", flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }),
};

// ── SUBCOMPONENTES (todos fora do WEMApp) ─────────────────────
function Toast({ toast }) {
  const BG = { ok:"#1e5c28", err:"#7a1818", warn:"#7a4208", info:"#1e3a5c" };
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:88, left:"50%", transform:"translateX(-50%)", background:BG[toast.type]||"#333", color:"#fff", padding:"10px 22px", borderRadius:22, fontSize:14, whiteSpace:"nowrap", zIndex:999, boxShadow:"0 4px 24px rgba(0,0,0,.6)" }}>
      {toast.msg}
    </div>
  );
}

function Hdr({ title, onBack, right }) {
  return (
    <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.amberL, fontSize:24, cursor:"pointer", lineHeight:1, padding:0 }}>‹</button>
      <span style={{ fontSize:16, fontWeight:"bold", color:C.amberL, flex:1 }}>{title}</span>
      {right}
    </div>
  );
}

function CC({ title, children }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:12 }}>
      {title && <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:12 }}>{title}</div>}
      {children}
    </div>
  );
}

function SR({ items }) {
  return (
    <div style={{ display:"flex", gap:10, marginBottom:12 }}>
      {items.map(({ label, value, color, sub }) => (
        <div key={label} style={{ flex:1, background:C.card2, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
          <div style={{ fontSize:22, fontWeight:"bold", color:color||C.amberL, lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{sub}</div>}
          <div style={{ fontSize:10, color:C.muted, marginTop:4, letterSpacing:1 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function WEMApp() {
  const [students,      setStudents]      = useState([]);
  const [visitors,      setVisitors]      = useState([]);
  const [screen,        setScreen]        = useState("list");
  const [selId,         setSelId]         = useState(null);
  const [toast,         setToast]         = useState(null);
  const [form,          setForm]          = useState({ name:"", phone:"", mode:"pacote", turma:"tf1" });
  const [visForm,       setVisForm]       = useState({ name:"", phone:"", mode:"pacote", turma:"", origem:"", obs:"" });
  const [visScreen,     setVisScreen]     = useState(false);
  const [visSelId,      setVisSelId]      = useState(null);
  const [visConfirmDel, setVisConfirmDel] = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(false);
  const [migrateConf,   setMigrateConf]   = useState(false);
  const [taskPicker,    setTaskPicker]    = useState(null);
  const [lockPicker,    setLockPicker]    = useState(false);
  const [editDate,      setEditDate]      = useState(null);
  const [editTaskDate,  setEditTaskDate]  = useState(null);
  const [editExtra,     setEditExtra]     = useState(null);
  const [editRenDate,   setEditRenDate]   = useState(null);
  const [editAvDate,    setEditAvDate]    = useState(null);
  const [dashFilter,    setDashFilter]    = useState("all");
  const [dashTab,       setDashTab]       = useState("financeiro");
  const [showNotif,     setShowNotif]     = useState(false);
  const [waScreen,      setWaScreen]      = useState(false);
  const [waSelected,    setWaSelected]    = useState([]);
  const [waMsg,         setWaMsg]         = useState("");
  const [dbStatus,      setDbStatus]      = useState("loading");
  const saveTimer = useRef(null);

  const sel  = students.find(s => s.id === selId);
  const task = sel && sel.taskIndex < 20 ? ALL_TASKS[sel.taskIndex] : null;

  // Carregar do Supabase
  useEffect(() => {
    sbGet().then(d => {
      if (d.students.length > 0) setStudents(d.students);
      if (d.visitors.length > 0) setVisitors(d.visitors);
      setDbStatus("ok");
    }).catch(() => setDbStatus("error"));
  }, []);

  // Salvar no Supabase com debounce
  useEffect(() => {
    if (dbStatus !== "ok") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sbSet(students, visitors).catch(() => setDbStatus("error"));
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [students, visitors, dbStatus]);

  // ── HELPERS ───────────────────────────────────────────────────
  const showMsg = (txt, type="ok") => { setToast({ msg:txt, type }); setTimeout(() => setToast(null), 3000); };
  const upd     = (id, fn) => setStudents(p => p.map(s => s.id === id ? fn(s) : s));
  const goList  = () => { setScreen("list"); setConfirmDel(false); setMigrateConf(false); setTaskPicker(null); setLockPicker(false); };

  const calcRec  = (s) => {
    const rv = (s.renewalLog||[]).filter(r => r.paid).reduce((a,r) => a+r.value, 0);
    const av = (s.avulsaLog||[]).filter(a => a.paid).reduce((a,r) => a+r.value, 0);
    const ex = Object.entries(s.extraPayments||{}).reduce((a,[n,ep]) => a+(ep.paid?EXTRA_COSTS[n]||0:0), 0);
    return rv + av + ex;
  };
  const calcPend = (s) => {
    const rv = (s.renewalLog||[]).filter(r => !r.paid).reduce((a,r) => a+r.value, 0);
    const av = (s.avulsaLog||[]).filter(a => !a.paid).reduce((a,r) => a+r.value, 0);
    const ex = Object.entries(s.extraPayments||{}).reduce((a,[n,ep]) => a+(!ep.paid?EXTRA_COSTS[n]||0:0), 0);
    return rv + av + ex;
  };

  // ── AÇÕES ─────────────────────────────────────────────────────
  function openPicker(type) {
    if (!sel) return;
    if (sel.status === "trancado") { showMsg("Aluno trancado.", "err"); return; }
    if (type === "reposicao" && sel.pendingReposicoes <= 0) { showMsg("Sem reposições pendentes.", "info"); return; }
    setTaskPicker({ type, selected: sel.taskIndex < 20 ? [sel.taskIndex] : [] });
  }

  function confirmAula() {
    if (!taskPicker || taskPicker.selected.length === 0) { showMsg("Selecione ao menos uma tarefa.", "warn"); return; }
    const { type, selected } = taskPicker;
    const sorted   = [...selected].sort((a,b) => a-b);
    const maxTask  = sorted[sorted.length-1];
    upd(sel.id, s => {
      const entry = { id:uid(), date:todBR(), type, tasks:sorted.map(i => ({ taskIndex:i, taskName:ALL_TASKS[i]?.name||"—" })) };
      const comps = { ...s.taskCompletions };
      sorted.forEach(i => { if (!comps[i]) comps[i] = todBR(); });
      const newIdx  = Math.max(s.taskIndex, maxTask+1);
      const nowDone = newIdx >= 20 && s.taskIndex < 20;
      if (type === "reposicao") {
        let done = false;
        const log = s.classLog.map(e => { if (!done && e.type==="falta" && !e.reposta) { done=true; return {...e,reposta:true}; } return e; });
        return { ...s, pendingReposicoes:s.pendingReposicoes-1, totalFaltas:s.totalFaltas-1, totalClasses:s.totalClasses+1, taskIndex:newIdx, taskCompletions:comps, conclusionDate:nowDone?todBR():s.conclusionDate, classLog:[entry,...log] };
      }
      if (s.mode !== "pacote") {
        const av = { id:uid(), date:todBR(), value:PRECO.avulsa, paid:false, paidDate:null, entryId:entry.id };
        return { ...s, totalClasses:s.totalClasses+1, taskIndex:newIdx, taskCompletions:comps, conclusionDate:nowDone?todBR():s.conclusionDate, classLog:[entry,...s.classLog], avulsaLog:[...(s.avulsaLog||[]),av] };
      }
      if (s.needsRenewal) return { ...s, fichaUsed:1, needsRenewal:false, totalClasses:s.totalClasses+1, taskIndex:newIdx, taskCompletions:comps, conclusionDate:nowDone?todBR():s.conclusionDate, classLog:[entry,...s.classLog] };
      const nf = s.fichaUsed + 1;
      return { ...s, fichaUsed:nf, needsRenewal:nf>=4, totalClasses:s.totalClasses+1, taskIndex:newIdx, taskCompletions:comps, conclusionDate:nowDone?todBR():s.conclusionDate, classLog:[entry,...s.classLog] };
    });
    showMsg(`${type === "presenca" ? "Presença" : "Reposição"} registrada ✓`);
    setTaskPicker(null);
  }

  function doFalta() {
    if (!sel) return;
    if (sel.mode === "avulsa") { showMsg("Avulso não recebe falta.", "info"); return; }
    if (sel.status === "trancado") { showMsg("Aluno trancado.", "err"); return; }
    let txt = "Falta registrada — reposição pendente", tp = "warn";
    upd(sel.id, s => {
      const entry = { id:uid(), date:todBR(), type:"falta", tasks:[{ taskIndex:s.taskIndex, taskName:ALL_TASKS[s.taskIndex]?.name||"—" }] };
      if (s.needsRenewal) { txt="⚠️ TRANCAMENTO — falta na troca de ficha!"; tp="err"; return { ...s, status:"trancado", lockDate:todBR(), lockReason:"Falta na troca de ficha", totalFaltas:s.totalFaltas+1, pendingReposicoes:s.pendingReposicoes+1, classLog:[entry,...s.classLog] }; }
      const nf=s.fichaUsed+1, nF=s.totalFaltas+1, nP=s.pendingReposicoes+1;
      if (nP>=5) { txt="⚠️ 5 reposições pendentes — somente reposição disponível"; tp="err"; }
      return { ...s, fichaUsed:nf, needsRenewal:nf>=4, totalFaltas:nF, pendingReposicoes:nP, classLog:[entry,...s.classLog] };
    });
    showMsg(txt, tp);
  }

  function doRenovar() {
    if (!sel || !sel.needsRenewal) return;
    upd(sel.id, s => {
      const r = { id:uid(), date:todBR(), mode:s.mode, value:PRECO[s.mode], paid:false, paidDate:null };
      return { ...s, fichaUsed:0, fichaNum:(s.fichaNum||1)+1, needsRenewal:false, renewalLog:[...(s.renewalLog||[]),r] };
    });
    showMsg("Ficha renovada! ✓");
  }

  function doTrancar(reason) { upd(sel.id, s => ({...s, status:"trancado", lockDate:todBR(), lockReason:reason})); setLockPicker(false); showMsg("Curso trancado", "warn"); }
  function doDesbloq()       { if (sel) { upd(sel.id, s => ({...s, status:"active", fichaUsed:0, needsRenewal:false, lockDate:null, lockReason:null})); showMsg("Desbloqueado ✓"); } }
  function doMigrar()        { if (!sel) return; const nm = sel.mode==="pacote"?"avulsa":"pacote"; upd(sel.id, s => ({...s, mode:nm, fichaUsed:0, needsRenewal:false})); setMigrateConf(false); showMsg(`Migrado para ${nm==="pacote"?"Pacote":"Avulso"} ✓`); }

  function doSetTask(idx) {
    upd(selId, s => { const c = {...s.taskCompletions}; for (let i=s.taskIndex; i<idx; i++) if (!c[i]) c[i]=todBR(); return {...s, taskIndex:idx, taskCompletions:c}; });
    setScreen("student"); showMsg("Tarefa atualizada ✓");
  }

  function doAdd() {
    if (!form.name.trim()) return;
    const s = mkSt(form.name.trim(), form.mode, form.turma, form.phone.trim());
    if (form.mode === "pacote") s.renewalLog = [{ id:uid(), date:todBR(), mode:"pacote", value:PRECO.pacote, paid:false, paidDate:null }];
    setStudents(p => [...p, s]);
    setForm({ name:"", phone:"", mode:"pacote", turma:"tf1" });
    setScreen("list");
    showMsg("Aluno adicionado! ✓");
  }

  function doAddVisitor() {
    if (!visForm.name.trim()) { showMsg("Digite o nome", "warn"); return; }
    const v = { id:uid(), name:visForm.name.trim(), phone:visForm.phone.trim(), mode:visForm.mode, turma:visForm.turma, origem:visForm.origem, obs:visForm.obs, status:"novo", date:todBR() };
    setVisitors(p => [v, ...p]);
    setVisForm({ name:"", phone:"", mode:"pacote", turma:"", origem:"", obs:"" });
    setVisScreen(false);
    showMsg("Visitante cadastrado! ✓");
    if (v.phone) {
      const msg = v.mode === "pacote" ? MSG_PACOTE : MSG_AVULSA;
      setTimeout(() => window.open(waLink(v.phone, msg), "_blank"), 800);
    }
  }

  function doConvertVisitor(vid) {
    const v = visitors.find(x => x.id === vid);
    if (!v) return;
    const s = mkSt(v.name, v.mode, v.turma||"tf1", v.phone);
    if (v.mode === "pacote") s.renewalLog = [{ id:uid(), date:todBR(), mode:"pacote", value:PRECO.pacote, paid:false, paidDate:null }];
    setStudents(p => [...p, s]);
    setVisitors(p => p.map(x => x.id===vid ? {...x, status:"confirmou"} : x));
    setVisSelId(null);
    showMsg(`${v.name} convertido em aluno! ✓`);
  }

  const doDel       = () => { setStudents(p => p.filter(s => s.id!==selId)); setConfirmDel(false); setScreen("list"); };
  const doUpdDate   = (eid, iso) => { upd(selId, s => ({...s, classLog:s.classLog.map(e => e.id===eid ? {...e,date:fmtD(iso)} : e)})); setEditDate(null); showMsg("Data atualizada ✓"); };
  const doUpdTDate  = (i, iso)   => { upd(selId, s => ({...s, taskCompletions:{...s.taskCompletions,[i]:fmtD(iso)}})); setEditTaskDate(null); showMsg("Data atualizada ✓"); };
  const doExtraPaid = (n, paid, iso) => { upd(selId, s => ({...s, extraPayments:{...s.extraPayments,[n]:{paid,date:paid?fmtD(iso):null}}})); setEditExtra(null); showMsg(paid?"Pago ✓":"Pendente", paid?"ok":"warn"); };
  const doRenPaid   = (rid, paid)    => { upd(selId, s => ({...s, renewalLog:s.renewalLog.map(r => r.id===rid?{...r,paid,paidDate:paid?todBR():null}:r)})); showMsg(paid?"Pago ✓":"Pendente"); };
  const doRenDate   = (rid, iso)     => { upd(selId, s => ({...s, renewalLog:s.renewalLog.map(r => r.id===rid?{...r,paidDate:fmtD(iso)}:r)})); setEditRenDate(null); showMsg("Data atualizada ✓"); };
  const doAvPaid    = (aid, paid, iso) => { upd(selId, s => ({...s, avulsaLog:(s.avulsaLog||[]).map(a => a.id===aid?{...a,paid,paidDate:paid?fmtD(iso):null}:a)})); setEditAvDate(null); showMsg(paid?"Pago ✓":"Pendente"); };

  function doExport() {
    const d = JSON.stringify({ students, visitors, exportedAt:todBR(), version:2 }, null, 2);
    const b = new Blob([d], { type:"application/json" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href=u; a.download=`wem-backup-${todISO()}.json`; a.click();
    URL.revokeObjectURL(u);
    showMsg("Backup exportado ✓");
  }

  function doImport(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (!p.students || !Array.isArray(p.students)) throw new Error();
        setStudents(p.students);
        if (p.visitors) setVisitors(p.visitors);
        showMsg(`${p.students.length} alunos importados ✓`);
      } catch { showMsg("Arquivo inválido", "err"); }
    };
    r.readAsText(f);
    e.target.value = "";
  }

  function sendWaBulk() {
    if (!waMsg.trim()) { showMsg("Digite uma mensagem", "warn"); return; }
    const targets = waSelected.length > 0
      ? students.filter(s => waSelected.includes(s.id) && s.phone)
      : students.filter(s => s.status==="active" && s.phone);
    if (targets.length === 0) { showMsg("Nenhum aluno com celular", "warn"); return; }
    targets.forEach((s, i) => setTimeout(() => window.open(waLink(s.phone, waMsg), "_blank"), i*600));
    setWaScreen(false); setWaMsg(""); setWaSelected([]);
    showMsg(`WhatsApp aberto para ${targets.length} aluno(s)`);
  }

  const getAlerts = () => {
    const a = [];
    students.forEach(s => {
      const t = TURMAS.find(t => t.id===s.turma)?.label?.split(" · ")[0]||"";
      if (s.status === "trancado")
        a.push({ icon:"🔒", color:"#e05050", msg:`${s.name} — trancado`, sub:s.lockDate?`Desde ${s.lockDate}`:"", id:s.id });
      else if (s.needsRenewal && s.mode==="pacote")
        a.push({ icon:"⚠️", color:C.warn, msg:`${s.name} — renovar ficha`, sub:t, id:s.id });
      else if (s.pendingReposicoes >= 2)
        a.push({ icon:"🔄", color:C.amberL, msg:`${s.name} — ${s.pendingReposicoes} reposições`, sub:t, id:s.id });
      const p = calcPend(s);
      if (p > 0 && s.status !== "trancado")
        a.push({ icon:"💰", color:"#e05050", msg:`${s.name} — R$ ${p} em aberto`, sub:t, id:s.id });
    });
    return a;
  };

  // PDF
  const pdfCSS = () => `<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;background:#fff;color:#1a1a1a;padding:24px;font-size:13px}h1{font-size:22px;margin-bottom:4px}h2{font-size:15px;margin:20px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px;text-transform:uppercase;letter-spacing:1px;color:#333}.sub{font-size:11px;color:#666;margin-bottom:16px}.sf{display:flex;gap:12px;margin-bottom:14px}.sc{flex:1;border:1px solid #ddd;border-radius:8px;padding:10px 8px;text-align:center}.sv{font-size:20px;font-weight:bold}.sl{font-size:10px;color:#888;margin-top:3px;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin-bottom:10px}th{background:#f5f5f5;text-align:left;padding:6px 8px;font-size:11px;color:#666;border-bottom:2px solid #ddd}td{padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:12px}.g{color:#1a7a30}.r{color:#c0392b}.a{color:#b07010}.m{color:#888}.pb{position:fixed;top:16px;right:16px;background:#b07010;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;cursor:pointer;font-weight:bold}@media print{.pb{display:none}}</style>`;
  function openPDF(html) { const w = window.open("","_blank"); if (!w) { showMsg("Permita pop-ups","warn"); return; } w.document.write(html); w.document.close(); }

  function pdfStudent() {
    if (!sel) return;
    const s = sel, turma = TURMAS.find(t => t.id===s.turma)?.label||"—", rec=calcRec(s), pend=calcPend(s);
    const rows = ALL_TASKS.map(t => {
      const done=t.number-1<s.taskIndex, cur=t.number-1===s.taskIndex, cd=s.taskCompletions[t.number-1]||"", ex=EXTRA_COSTS[t.name], ep=s.extraPayments?.[t.name];
      return `<tr><td>${t.number}</td><td>${t.name}${ex?` <span class="${ep?.paid?"g":"r"}">R$${ex}</span>`:""}</td><td class="${done?"g":cur?"a":"m"}">${done?"Conc.":cur?"Atual":"—"}</td><td>${cd}</td></tr>`;
    }).join("");
    const log = s.classLog.slice(0,50).map(e => {
      const ts = TS[e.type]||TS.falta;
      return `<tr><td>${e.date}</td><td>${ts.label}</td><td>${e.tasks?.map(tk=>`#${tk.taskIndex+1} ${tk.taskName}`).join(", ")||"—"}</td></tr>`;
    }).join("");
    openPDF(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${s.name}</title>${pdfCSS()}</head><body><button class="pb" onclick="window.print()">Salvar PDF</button><h1>${s.name}</h1><p class="sub">${turma} · ${s.mode==="pacote"?"Pacote":"Avulso"} · Entrada: ${s.entryDate||"—"}</p><h2>Financeiro</h2><div class="sf"><div class="sc"><div class="sv g">R$ ${rec}</div><div class="sl">Recebido</div></div><div class="sc"><div class="sv r">R$ ${pend}</div><div class="sl">Pendente</div></div><div class="sc"><div class="sv a">R$ ${rec+pend}</div><div class="sl">Total</div></div></div><h2>Progresso — ${s.taskIndex}/20</h2><table><tr><th>#</th><th>Tarefa</th><th>Status</th><th>Data</th></tr>${rows}</table><h2>Frequência</h2><div class="sf"><div class="sc"><div class="sv g">${s.totalClasses}</div><div class="sl">Aulas</div></div><div class="sc"><div class="sv r">${s.totalFaltas}</div><div class="sl">Faltas</div></div><div class="sc"><div class="sv a">${s.pendingReposicoes}</div><div class="sl">A Repor</div></div></div><h2>Registro</h2><table><tr><th>Data</th><th>Tipo</th><th>Tarefas</th></tr>${log}</table></body></html>`);
  }

  function pdfMonthly() {
    const now=new Date(), m=now.getMonth()+1, y=now.getFullYear(), mn=MONTHS[now.getMonth()];
    let recM=0, pendM=0;
    students.forEach(s => {
      (s.renewalLog||[]).forEach(r => { if(r.paid&&inM(r.paidDate,m,y))recM+=r.value; if(!r.paid)pendM+=r.value; });
      (s.avulsaLog||[]).forEach(a => { if(a.paid&&inM(a.paidDate,m,y))recM+=a.value; if(!a.paid)pendM+=a.value; });
      Object.entries(s.extraPayments||{}).forEach(([n,ep]) => { if(ep.paid&&inM(ep.date,m,y))recM+=EXTRA_COSTS[n]||0; if(!ep.paid)pendM+=EXTRA_COSTS[n]||0; });
    });
    const ativos=students.filter(s=>s.status==="active"), trancados=students.filter(s=>s.status==="trancado");
    const tRows = TURMAS.map(t => { const al=ativos.filter(s=>s.turma===t.id),f=al.reduce((a,s)=>a+s.totalFaltas,0);let rec=0;al.forEach(s=>rec+=calcRec(s));return`<tr><td>${t.label}</td><td>${al.length}/${t.cap}</td><td>${f}</td><td class="g">R$ ${rec}</td></tr>`; }).join("");
    const aRows = ativos.map(s => { const turma=TURMAS.find(t=>t.id===s.turma)?.label?.split(" · ")[0]||"",task=s.taskIndex<20?`#${s.taskIndex+1} ${ALL_TASKS[s.taskIndex]?.name||""}`:"Concluído",pend=calcPend(s);return`<tr><td>${s.name}</td><td>${turma}</td><td>${s.mode==="pacote"?"Pacote":"Avulso"}</td><td>${task}</td><td class="${s.totalFaltas>0?"r":"g"}">${s.totalFaltas}${s.pendingReposicoes>0?` (${s.pendingReposicoes})`:""}</td><td class="${pend>0?"r":"g"}">${pend>0?`R$ ${pend}`:"✓"}</td></tr>`; }).join("");
    openPDF(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório ${mn}/${y}</title>${pdfCSS()}</head><body><button class="pb" onclick="window.print()">Salvar PDF</button><h1>Relatório ${mn}/${y}</h1><p class="sub">WEM · Gerado em ${todBR()}</p><h2>Financeiro do Mês</h2><div class="sf"><div class="sc"><div class="sv g">R$ ${recM}</div><div class="sl">Recebido</div></div><div class="sc"><div class="sv r">R$ ${pendM}</div><div class="sl">Inadimplência</div></div><div class="sc"><div class="sv">${ativos.length}</div><div class="sl">Ativos</div></div><div class="sc"><div class="sv r">${trancados.length}</div><div class="sl">Trancados</div></div></div><h2>Turmas</h2><table><tr><th>Turma</th><th>Vagas</th><th>Faltas</th><th>Receita</th></tr>${tRows}</table><h2>Alunos Ativos</h2><table><tr><th>Nome</th><th>Turma</th><th>Modo</th><th>Tarefa</th><th>Faltas</th><th>Pendente</th></tr>${aRows}</table></body></html>`);
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: ADD
  // ════════════════════════════════════════════════════════════
  if (screen === "add") return (
    <div style={S.page}>
      <Hdr title="Novo Aluno" onBack={() => setScreen("list")} />
      <div style={{ padding:16 }}>
        <div style={S.card}>
          <span style={S.lbl}>NOME DO ALUNO</span>
          <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Nome completo..." style={S.inp} />
          <div style={{ height:14 }} />
          <span style={S.lbl}>CELULAR</span>
          <input value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))} placeholder="(00) 00000-0000" inputMode="numeric" style={S.inp} />
          <div style={{ height:14 }} />
          <span style={S.lbl}>MODALIDADE</span>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {[["pacote","📦 Pacote 4 Aulas"],["avulsa","🎫 Aula Avulsa"]].map(([m,lb]) => (
              <button key={m} onClick={() => setForm(f => ({...f, mode:m, turma:m==="avulsa"?"":f.turma||"tf1"}))}
                style={{ flex:1, padding:"13px 0", borderRadius:10, border:`1px solid ${form.mode===m?C.amber:C.border}`, background:form.mode===m?"#2a1e06":C.card2, color:form.mode===m?C.amberL:C.muted, fontWeight:"bold", fontSize:13, cursor:"pointer" }}>
                {lb}
              </button>
            ))}
          </div>
          <span style={{ ...S.lbl, opacity:form.mode==="avulsa"?0.4:1 }}>TURMA</span>
          <div style={{ display:"flex", gap:8, opacity:form.mode==="avulsa"?0.4:1, pointerEvents:form.mode==="avulsa"?"none":"auto" }}>
            {TURMAS.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({...f, turma:t.id}))}
                style={{ flex:1, padding:"11px 4px", borderRadius:10, border:`1px solid ${form.turma===t.id?C.amber:C.border}`, background:form.turma===t.id?"#2a1e06":C.card2, color:form.turma===t.id?C.amberL:C.muted, fontWeight:"bold", fontSize:12, cursor:"pointer", lineHeight:1.3 }}>
                {t.label}
              </button>
            ))}
          </div>
          {form.mode === "avulsa" && <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>Avulso não pertence a turma fixa</div>}
        </div>
        <button onClick={doAdd} style={{ width:"100%", background:C.amber, color:"#17130e", border:"none", borderRadius:12, padding:"15px 0", fontSize:16, fontWeight:"bold", cursor:"pointer" }}>
          Adicionar Aluno
        </button>
      </div>
      <Toast toast={toast} />
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: TASKS
  // ════════════════════════════════════════════════════════════
  if (screen === "tasks" && sel) return (
    <div style={S.page}>
      <Hdr title={`Tarefa — ${sel.name}`} onBack={() => setScreen("student")} />
      <div style={{ padding:16, paddingBottom:32 }}>
        {MODULES.map(mod => (
          <div key={mod.name} style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:C.amber, fontWeight:"bold", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{mod.name}</div>
            {mod.tasks.map(tn => {
              const idx = ALL_TASKS.findIndex(t => t.name===tn && t.module===mod.name);
              const t = ALL_TASKS[idx];
              const done = idx < sel.taskIndex, cur = idx === sel.taskIndex;
              return (
                <button key={tn} onClick={() => doSetTask(idx)} style={{ display:"flex", alignItems:"center", width:"100%", background:cur?"#2a1e06":C.card, border:`1px solid ${cur?C.amber:C.border}`, borderRadius:10, padding:"11px 14px", marginBottom:6, cursor:"pointer", gap:10, boxSizing:"border-box" }}>
                  <span style={{ fontSize:12, color:done?"#38a048":C.muted, minWidth:24, textAlign:"right" }}>{done ? "✓" : `#${t.number}`}</span>
                  <span style={{ color:cur?C.amberL:done?C.muted:C.text, fontWeight:cur?"bold":"normal", fontSize:15, flex:1, textAlign:"left" }}>{t.name}</span>
                  {cur && <span style={{ color:C.amber, fontSize:12 }}>◀ atual</span>}
                  {done && sel.taskCompletions[idx] && <span style={{ color:"#38a048", fontSize:11 }}>{sel.taskCompletions[idx]}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Toast toast={toast} />
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: HISTORY
  // ════════════════════════════════════════════════════════════
  if (screen === "history" && sel) {
    const faltas   = sel.classLog.filter(e => e.type === "falta");
    const extRec   = Object.entries(sel.extraPayments||{}).reduce((a,[n,ep]) => a+(ep.paid?EXTRA_COSTS[n]||0:0), 0);
    const extPend  = Object.entries(sel.extraPayments||{}).reduce((a,[n,ep]) => a+(!ep.paid?EXTRA_COSTS[n]||0:0), 0);
    const renRec   = (sel.renewalLog||[]).filter(r => r.paid).reduce((a,r) => a+r.value, 0);
    const renPend  = (sel.renewalLog||[]).filter(r => !r.paid).reduce((a,r) => a+r.value, 0);
    const avRec    = (sel.avulsaLog||[]).filter(a => a.paid).reduce((a,r) => a+r.value, 0);
    const avPend   = (sel.avulsaLog||[]).filter(a => !a.paid).reduce((a,r) => a+r.value, 0);
    return (
      <div style={S.page}>
        <Hdr title={`Histórico — ${sel.name}`} onBack={() => setScreen("student")}
          right={<button onClick={pdfStudent} style={{ background:"#2a1e06", border:`1px solid ${C.gold}`, color:C.amberL, borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontWeight:"bold" }}>📄 PDF</button>} />
        <div style={{ padding:16, paddingBottom:40 }}>

          <div style={{ ...S.card, border:`1px solid ${C.gold}` }}>
            <div style={{ fontSize:11, color:C.amber, letterSpacing:1.5, marginBottom:12 }}>RESUMO FINANCEIRO</div>
            <div style={{ display:"flex", gap:10, marginBottom:8 }}>
              {[["RECEBIDO",extRec+renRec+avRec,"#38a048","#0e2814"],["PENDENTE",extPend+renPend+avPend,C.warn,"#2d1806"],["TOTAL",extRec+renRec+avRec+extPend+renPend+avPend,C.amberL,C.card2]].map(([l,v,col,bg]) => (
                <div key={l} style={{ flex:1, background:bg, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:"bold", color:col }}>R$ {v}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.dim, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              {sel.mode==="pacote" ? `Renovações: R$ ${renRec} rec. / R$ ${renPend} pend.` : `Avulsas: R$ ${avRec} rec. / R$ ${avPend} pend.`} · Extras: R$ {extRec} rec. / R$ {extPend} pend.
            </div>
          </div>

          <div style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:11, color:C.muted, letterSpacing:1.5 }}>REGISTRO DE FALTAS</span>
              <span style={{ fontSize:14, fontWeight:"bold", color:"#e05050" }}>{sel.totalFaltas} falta{sel.totalFaltas!==1?"s":""}</span>
            </div>
            {faltas.length === 0
              ? <div style={{ color:C.dim, fontSize:13, textAlign:"center" }}>Nenhuma falta</div>
              : faltas.map((f, i) => (
                <div key={f.id} style={{ display:"flex", alignItems:"center", gap:8, background:f.reposta?"#0e1f0e":"#3a0808", border:`1px solid ${f.reposta?"#2a5c2a":"#7a1818"}`, borderRadius:8, padding:"7px 12px", marginBottom:4 }}>
                  <span style={{ fontSize:16 }}>{f.reposta ? "🔄" : "❌"}</span>
                  <div style={{ flex:1, fontSize:12 }}><span style={{ color:f.reposta?"#5ab030":"#e05050", fontWeight:"bold" }}>Falta {i+1}</span><span style={{ color:C.muted, marginLeft:8 }}>{f.date}</span></div>
                  <span style={{ fontSize:10, background:f.reposta?"#1a3a1a":"#2d1806", color:f.reposta?"#5ab030":C.warn, border:`1px solid ${f.reposta?"#2a5c2a":C.warn}`, borderRadius:4, padding:"2px 7px", fontWeight:"bold" }}>{f.reposta?"REPOSTA":"PENDENTE"}</span>
                </div>
              ))
            }
            {sel.pendingReposicoes > 0 && <div style={{ marginTop:8, fontSize:12, color:C.warn }}>⚠️ {sel.pendingReposicoes} reposição{sel.pendingReposicoes!==1?"ões":""} pendente{sel.pendingReposicoes!==1?"s":""}</div>}
          </div>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:10 }}>QUADRO DE TAREFAS</div>
            {MODULES.map(mod => {
              const mTasks = ALL_TASKS.filter(t => t.module === mod.name);
              return (
                <div key={mod.name} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
                  <div style={{ background:"#2a1e06", borderBottom:`1px solid ${C.border}`, padding:"9px 14px", fontSize:11, color:C.amber, fontWeight:"bold" }}>{mod.name.toUpperCase()}</div>
                  {mTasks.map(t => {
                    const done = t.number-1 < sel.taskIndex, cur = t.number-1 === sel.taskIndex;
                    const cDate = sel.taskCompletions[t.number-1];
                    const ex = EXTRA_COSTS[t.name], ep = sel.extraPayments?.[t.name];
                    const isEdTask = editTaskDate?.taskIdx === t.number-1;
                    const isEdEx   = editExtra?.taskName === t.name;
                    const aulas = sel.classLog.filter(e => e.type!=="falta" && e.tasks?.some(tk => tk.taskIndex===t.number-1));
                    return (
                      <div key={t.number} style={{ padding:"11px 14px", borderBottom:`1px solid ${C.border}`, background:cur?"#241a08":"transparent" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <div style={{ width:24, height:24, borderRadius:12, flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, background:done?C.green:cur?C.amber:C.card2, border:`1px solid ${done?"#2d6a30":cur?C.gold:C.border}` }}>{done?"✓":cur?"→":""}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:6, marginBottom:4 }}>
                              <span style={{ fontSize:14, color:done?C.text:cur?C.amberL:C.muted, fontWeight:done||cur?"bold":"normal" }}>#{t.number} · {t.name}</span>
                              {cur && <span style={{ fontSize:10, color:C.amber, border:`1px solid ${C.gold}`, borderRadius:4, padding:"1px 5px" }}>atual</span>}
                              {ex && (
                                <button onClick={() => ep?.paid ? doExtraPaid(t.name,false,null) : setEditExtra({taskName:t.name,dateValue:todISO()})}
                                  style={{ fontSize:10, padding:"2px 8px", borderRadius:12, border:`1px solid ${ep?.paid?"#2a5c2a":C.warn}`, background:ep?.paid?"#0e2814":"#2d1806", color:ep?.paid?"#5ab030":C.warn, cursor:"pointer", fontWeight:"bold" }}>
                                  💰 R$ {ex} {ep?.paid ? "✓ "+ep.date : "pendente"}
                                </button>
                              )}
                              {done && (
                                <button onClick={() => setEditTaskDate(isEdTask ? null : {taskIdx:t.number-1, value:cDate?toIso(cDate):todISO()})}
                                  style={{ fontSize:10, padding:"2px 8px", borderRadius:6, border:`1px solid ${isEdTask?C.amber:"#2d6a30"}`, background:isEdTask?C.amber:"none", color:isEdTask?"#17130e":"#38a048", cursor:"pointer", fontWeight:"bold" }}>
                                  {isEdTask ? "cancelar" : cDate ? "✓ "+cDate : "✏️ sem data"}
                                </button>
                              )}
                            </div>
                            {isEdTask && (
                              <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                                <input type="date" value={editTaskDate.value} onChange={e => setEditTaskDate(ed => ({...ed, value:e.target.value}))} style={{ flex:1, background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:14, outline:"none", colorScheme:"dark" }} />
                                <button onClick={() => doUpdTDate(t.number-1, editTaskDate.value)} style={{ background:C.amber, border:"none", color:"#17130e", borderRadius:8, padding:"8px 14px", fontWeight:"bold", cursor:"pointer" }}>Salvar</button>
                              </div>
                            )}
                            {isEdEx && (
                              <div style={{ background:"#2d1806", border:`1px solid ${C.warn}`, borderRadius:8, padding:10, marginBottom:6 }}>
                                <div style={{ fontSize:11, color:C.warn, marginBottom:6 }}>Data pagamento · R$ {ex}</div>
                                <div style={{ display:"flex", gap:8 }}>
                                  <input type="date" value={editExtra.dateValue} onChange={e => setEditExtra(ed => ({...ed, dateValue:e.target.value}))} style={{ flex:1, background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:14, outline:"none", colorScheme:"dark" }} />
                                  <button onClick={() => doExtraPaid(t.name, true, editExtra.dateValue)} style={{ background:C.green, border:"none", color:"#fff", borderRadius:8, padding:"8px 14px", fontWeight:"bold", cursor:"pointer" }}>Pago</button>
                                  <button onClick={() => setEditExtra(null)} style={{ background:C.card2, border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"8px 10px", cursor:"pointer" }}>×</button>
                                </div>
                              </div>
                            )}
                            {aulas.length > 0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:2 }}>
                                {aulas.map(e => { const ts = TS[e.type]||TS.falta; return <span key={e.id} style={{ fontSize:10, background:ts.bg, color:ts.color, border:`1px solid ${ts.bd}`, borderRadius:4, padding:"2px 6px" }}>{ts.icon} {e.date}</span>; })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {sel.mode === "pacote" && (sel.renewalLog||[]).length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:10 }}>RENOVAÇÕES</div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                {sel.renewalLog.map((r, i) => {
                  const isEd = editRenDate?.renewalId === r.id;
                  return (
                    <div key={r.id} style={{ padding:"12px 14px", borderBottom:i<sel.renewalLog.length-1?`1px solid ${C.border}`:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:18 }}>🧾</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:14, fontWeight:"bold", color:C.text }}>Renovação #{i+1}</span>
                            <span style={{ fontSize:14, fontWeight:"bold", color:C.amberL }}>R$ {r.value}</span>
                          </div>
                          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{r.date}</div>
                          {r.paid && r.paidDate && (
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                              <span style={{ fontSize:11, color:"#38a048" }}>Pago em {r.paidDate}</span>
                              <button onClick={() => setEditRenDate(isEd ? null : {renewalId:r.id, value:toIso(r.paidDate)})} style={{ background:isEd?C.amber:"none", border:`1px solid ${isEd?C.amber:"#2d6a30"}`, color:isEd?"#17130e":"#38a048", borderRadius:5, padding:"1px 7px", fontSize:10, cursor:"pointer", fontWeight:"bold" }}>{isEd?"cancelar":"✏️"}</button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => doRenPaid(r.id, !r.paid)} style={{ fontSize:11, padding:"6px 10px", borderRadius:8, border:`1px solid ${r.paid?"#2a5c2a":C.warn}`, background:r.paid?"#0e2814":"#2d1806", color:r.paid?"#5ab030":C.warn, cursor:"pointer", fontWeight:"bold" }}>{r.paid?"✓ Pago":"Pendente"}</button>
                      </div>
                      {isEd && (
                        <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:28 }}>
                          <input type="date" value={editRenDate.value} onChange={e => setEditRenDate(ed => ({...ed, value:e.target.value}))} style={{ flex:1, background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:15, outline:"none", colorScheme:"dark" }} />
                          <button onClick={() => doRenDate(r.id, editRenDate.value)} style={{ background:C.amber, border:"none", color:"#17130e", borderRadius:8, padding:"9px 18px", fontWeight:"bold", cursor:"pointer" }}>Salvar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sel.mode === "avulsa" && (sel.avulsaLog||[]).length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:10 }}>PAGAMENTOS — AULAS AVULSAS</div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                {sel.avulsaLog.map((a, i) => {
                  const isEd  = editAvDate?.avulsaId === a.id;
                  const entry = sel.classLog.find(e => e.id === a.entryId);
                  return (
                    <div key={a.id} style={{ padding:"12px 14px", borderBottom:i<sel.avulsaLog.length-1?`1px solid ${C.border}`:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:18 }}>🎫</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:14, fontWeight:"bold", color:C.text }}>Aula #{i+1}</span>
                            <span style={{ fontSize:14, fontWeight:"bold", color:C.amberL }}>R$ {a.value}</span>
                          </div>
                          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{a.date}</div>
                          {entry?.tasks && <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>{entry.tasks.map(tk => <span key={tk.taskIndex} style={{ fontSize:10, background:C.card2, color:C.muted, border:`1px solid ${C.border}`, borderRadius:4, padding:"2px 6px" }}>#{tk.taskIndex+1} · {tk.taskName}</span>)}</div>}
                          {a.paid && a.paidDate && (
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                              <span style={{ fontSize:11, color:"#38a048" }}>Pago em {a.paidDate}</span>
                              <button onClick={() => setEditAvDate(isEd ? null : {avulsaId:a.id, value:toIso(a.paidDate)})} style={{ background:isEd?C.amber:"none", border:`1px solid ${isEd?C.amber:"#2d6a30"}`, color:isEd?"#17130e":"#38a048", borderRadius:5, padding:"1px 7px", fontSize:10, cursor:"pointer", fontWeight:"bold" }}>{isEd?"cancelar":"✏️"}</button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => { if (!a.paid) setEditAvDate({avulsaId:a.id, value:todISO()}); else doAvPaid(a.id,false,null); }} style={{ fontSize:11, padding:"6px 10px", borderRadius:8, border:`1px solid ${a.paid?"#2a5c2a":C.warn}`, background:a.paid?"#0e2814":"#2d1806", color:a.paid?"#5ab030":C.warn, cursor:"pointer", fontWeight:"bold" }}>{a.paid?"✓ Pago":"Pendente"}</button>
                      </div>
                      {isEd && (
                        <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:28 }}>
                          <input type="date" value={editAvDate.value} onChange={e => setEditAvDate(ed => ({...ed, value:e.target.value}))} style={{ flex:1, background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:15, outline:"none", colorScheme:"dark" }} />
                          <button onClick={() => doAvPaid(a.id, true, editAvDate.value)} style={{ background:C.amber, border:"none", color:"#17130e", borderRadius:8, padding:"9px 18px", fontWeight:"bold", cursor:"pointer" }}>Salvar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:10 }}>REGISTRO DE AULAS ({sel.classLog.length})</div>
            {sel.classLog.length === 0
              ? <div style={{ ...S.card, textAlign:"center", color:C.dim, fontSize:13 }}>Nenhuma aula</div>
              : (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                  {sel.classLog.map((entry, i) => {
                    const ts  = TS[entry.type] || TS.falta;
                    const isEd = editDate?.entryId === entry.id;
                    return (
                      <div key={entry.id} style={{ padding:"11px 14px", borderBottom:i<sel.classLog.length-1?`1px solid ${C.border}`:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:18 }}>{ts.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <span style={{ fontSize:14, color:ts.color, fontWeight:"bold" }}>{ts.label}</span>
                              <button onClick={() => setEditDate(isEd ? null : {entryId:entry.id, value:entry.date?toIso(entry.date):todISO()})} style={{ background:isEd?C.amber:"none", border:`1px solid ${isEd?C.amber:C.border}`, color:isEd?"#17130e":C.muted, borderRadius:6, padding:"3px 9px", fontSize:11, cursor:"pointer" }}>
                                {isEd ? "cancelar" : "✏️ "+entry.date}
                              </button>
                            </div>
                            {entry.type !== "falta" && entry.tasks && <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>{entry.tasks.map(tk => <span key={tk.taskIndex} style={{ fontSize:11, background:C.card2, color:C.muted, border:`1px solid ${C.border}`, borderRadius:4, padding:"2px 7px" }}>#{tk.taskIndex+1} · {tk.taskName}</span>)}</div>}
                          </div>
                        </div>
                        {isEd && (
                          <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:28 }}>
                            <input type="date" value={editDate.value} onChange={e => setEditDate(ed => ({...ed, value:e.target.value}))} style={{ flex:1, background:C.card2, border:`1px solid ${C.amber}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:15, outline:"none", colorScheme:"dark" }} />
                            <button onClick={() => doUpdDate(entry.id, editDate.value)} style={{ background:C.amber, border:"none", color:"#17130e", borderRadius:8, padding:"9px 18px", fontWeight:"bold", cursor:"pointer" }}>Salvar</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: DASHBOARD
  // ════════════════════════════════════════════════════════════
  if (screen === "dashboard") {
    const now=new Date(), curM=now.getMonth()+1, curY=now.getFullYear();
    const fil = dashFilter==="all" ? students : students.filter(s => s.turma===dashFilter);
    const last6 = Array.from({length:6}, (_,i) => { const d=new Date(curY,now.getMonth()-5+i,1); return {m:d.getMonth()+1,y:d.getFullYear(),label:MONTHS[d.getMonth()]}; });
    const byM = last6.map(({m,y,label}) => { let v=0; fil.forEach(s => { (s.renewalLog||[]).forEach(r => { if(r.paid&&inM(r.paidDate,m,y))v+=r.value; }); (s.avulsaLog||[]).forEach(a => { if(a.paid&&inM(a.paidDate,m,y))v+=a.value; }); Object.entries(s.extraPayments||{}).forEach(([n,ep]) => { if(ep.paid&&inM(ep.date,m,y))v+=EXTRA_COSTS[n]||0; }); }); return {label,val:v}; });
    let recM=0,recY=0,pendAll=0,srcRen=0,srcAv=0,srcEx=0;
    fil.forEach(s => {
      (s.renewalLog||[]).forEach(r => { if(r.paid){if(inM(r.paidDate,curM,curY))recM+=r.value;if(inY(r.paidDate,curY)){recY+=r.value;srcRen+=r.value;}}else pendAll+=r.value; });
      (s.avulsaLog||[]).forEach(a => { if(a.paid){if(inM(a.paidDate,curM,curY))recM+=a.value;if(inY(a.paidDate,curY)){recY+=a.value;srcAv+=a.value;}}else pendAll+=a.value; });
      Object.entries(s.extraPayments||{}).forEach(([n,ep]) => { if(ep.paid){if(inM(ep.date,curM,curY))recM+=EXTRA_COSTS[n]||0;if(inY(ep.date,curY)){recY+=EXTRA_COSTS[n]||0;srcEx+=EXTRA_COSTS[n]||0;}}else pendAll+=EXTRA_COSTS[n]||0; });
    });
    const srcData = [{name:"Renovações",value:srcRen,color:C.amberL},{name:"Avulsas",value:srcAv,color:"#5ab030"},{name:"Extras",value:srcEx,color:"#a0a0e8"}].filter(d => d.value>0);
    const tickets = fil.filter(s => calcRec(s)>0).map(s => calcRec(s));
    const avgTicket = tickets.length>0 ? Math.round(tickets.reduce((a,b)=>a+b,0)/tickets.length) : 0;
    const ativos=fil.filter(s=>s.status==="active").length, trancados=fil.filter(s=>s.status==="trancado").length, concluidos=fil.filter(s=>s.taskIndex>=20).length;
    const statusData = [{name:"Andamento",value:ativos-concluidos,color:"#38a048"},{name:"Trancados",value:trancados,color:"#e05050"},{name:"Concluídos",value:concluidos,color:C.amberL}].filter(d=>d.value>0);
    const modoData  = [{label:"Pacote",val:fil.filter(s=>s.mode==="pacote").length,fill:C.amberL},{label:"Avulso",val:fil.filter(s=>s.mode==="avulsa").length,fill:"#a0a0e8"}];
    const modProg   = MODULES.map(mod => { const tc=mod.tasks.length,fi=ALL_TASKS.findIndex(t=>t.module===mod.name); const done=fil.reduce((acc,s)=>{ let d=0; for(let i=fi;i<fi+tc;i++) if(s.taskIndex>i)d++; return acc+d; },0); const total=fil.length*tc; return {label:mod.name.split("·")[1]?.trim()||mod.name,pct:total>0?Math.round((done/total)*100):0}; });
    const lockR = {}; fil.filter(s=>s.status==="trancado"&&s.lockReason).forEach(s=>{lockR[s.lockReason]=(lockR[s.lockReason]||0)+1;});
    const lockData  = Object.entries(lockR).sort((a,b)=>b[1]-a[1]).map(([r,n])=>({label:r,val:n}));
    const atencao   = fil.filter(s=>s.status==="active"&&(s.pendingReposicoes>=2||s.needsRenewal));
    const tStats    = TURMAS.map(t=>{const al=fil.filter(s=>s.turma===t.id&&s.status==="active");let rec=0;al.forEach(s=>rec+=calcRec(s));return{...t,label:t.label.split(" · ")[0],ativos:al.length,faltas:al.reduce((a,s)=>a+s.totalFaltas,0),rec};});
    const inadimpl  = fil.filter(s=>calcPend(s)>0).map(s=>({...s,pend:calcPend(s)}));
    const TB = ({id,lbl}) => <button onClick={()=>setDashTab(id)} style={{flex:1,padding:"10px 0",fontSize:12,fontWeight:"bold",cursor:"pointer",border:"none",borderRadius:8,background:dashTab===id?C.amber:C.card2,color:dashTab===id?"#17130e":C.muted}}>{lbl}</button>;
    const tt = {background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.text};
    return (
      <div style={S.page}>
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setScreen("list")} style={{background:"none",border:"none",color:C.amberL,fontSize:24,cursor:"pointer",lineHeight:1,padding:0}}>‹</button>
          <span style={{fontSize:16,fontWeight:"bold",color:C.amberL,flex:1}}>📊 Dashboard</span>
          <button onClick={pdfMonthly} style={{background:"#2a1e06",border:`1px solid ${C.gold}`,color:C.amberL,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>📄 Rel. Mensal</button>
        </div>
        <div style={{padding:16,paddingBottom:40}}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["all","Todos"],...TURMAS.map(t=>[t.id,t.label.split(" · ")[0]])].map(([id,lb])=>(
              <button key={id} onClick={()=>setDashFilter(id)} style={{flex:1,padding:"8px 0",fontSize:11,fontWeight:"bold",cursor:"pointer",border:`1px solid ${dashFilter===id?C.amber:C.border}`,borderRadius:8,background:dashFilter===id?"#2a1e06":C.card2,color:dashFilter===id?C.amberL:C.muted}}>{lb}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <TB id="financeiro" lbl="💰 Financeiro" /><TB id="alunos" lbl="👥 Alunos" /><TB id="turmas" lbl="📅 Turmas" />
          </div>
          {dashTab==="financeiro" && (
            <div>
              <SR items={[{label:"ESTE MÊS",value:`R$ ${recM}`,color:"#38a048"},{label:"ESTE ANO",value:`R$ ${recY}`,color:C.amberL},{label:"TICKET MÉDIO",value:`R$ ${avgTicket}`,color:C.amber}]} />
              <CC title="FATURAMENTO MENSAL (R$)">
                <ResponsiveContainer width="100%" height={160}><BarChart data={byM} margin={{top:0,right:0,left:-20,bottom:0}}><XAxis dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} formatter={v=>[`R$ ${v}`,"Recebido"]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="val" fill={C.amber} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
              </CC>
              {srcData.length>0 && (
                <CC title="RECEITA POR FONTE (ANO)">
                  <div style={{display:"flex",alignItems:"center"}}>
                    <ResponsiveContainer width="50%" height={140}><PieChart><Pie data={srcData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>{srcData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={tt} formatter={v=>[`R$ ${v}`,""]}/></PieChart></ResponsiveContainer>
                    <div style={{flex:1}}>{srcData.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:10,height:10,borderRadius:5,background:d.color,flexShrink:0}}/><div><div style={{fontSize:12,color:C.text}}>{d.name}</div><div style={{fontSize:12,fontWeight:"bold",color:d.color}}>R$ {d.value}</div></div></div>)}</div>
                  </div>
                </CC>
              )}
              <CC title={`INADIMPLÊNCIA — R$ ${pendAll}`}>
                {inadimpl.length===0 ? <div style={{fontSize:13,color:"#38a048",textAlign:"center"}}>✓ Nenhuma pendência</div> : inadimpl.map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div><div style={{fontSize:14,color:C.text,fontWeight:"bold"}}>{s.name}</div><div style={{fontSize:11,color:C.muted}}>{TURMAS.find(t=>t.id===s.turma)?.label?.split(" · ")[0]||""}</div></div>
                    <span style={{fontSize:14,fontWeight:"bold",color:"#e05050"}}>R$ {s.pend}</span>
                  </div>
                ))}
              </CC>
            </div>
          )}
          {dashTab==="alunos" && (
            <div>
              <SR items={[{label:"ATIVOS",value:ativos,color:"#38a048"},{label:"TRANCADOS",value:trancados,color:"#e05050"},{label:"CONCLUÍDOS",value:concluidos,color:C.amberL}]} />
              {statusData.length>0 && (
                <CC title="SITUAÇÃO">
                  <div style={{display:"flex",alignItems:"center"}}>
                    <ResponsiveContainer width="50%" height={140}><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>{statusData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={tt}/></PieChart></ResponsiveContainer>
                    <div style={{flex:1}}>{statusData.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:10,height:10,borderRadius:5,background:d.color,flexShrink:0}}/><div><div style={{fontSize:12,color:C.text}}>{d.name}</div><div style={{fontSize:14,fontWeight:"bold",color:d.color}}>{d.value}</div></div></div>)}</div>
                  </div>
                </CC>
              )}
              <CC title="MODALIDADE"><ResponsiveContainer width="100%" height={100}><BarChart data={modoData} layout="vertical" margin={{top:0,right:20,left:10,bottom:0}}><XAxis type="number" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/><YAxis type="category" dataKey="label" tick={{fill:C.muted,fontSize:12}} axisLine={false} tickLine={false} width={50}/><Tooltip contentStyle={tt} formatter={v=>[`${v} aluno${v!==1?"s":""}`,""]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="val" radius={[0,4,4,0]}>{modoData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar></BarChart></ResponsiveContainer></CC>
              <CC title="PROGRESSO POR MÓDULO (%)"><ResponsiveContainer width="100%" height={140}><BarChart data={modProg} margin={{top:0,right:0,left:-20,bottom:0}}><XAxis dataKey="label" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} formatter={v=>[`${v}%`,"Concluído"]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="pct" fill="#5ab030" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CC>
              {atencao.length>0 && <CC title="⚠️ PRECISAM DE ATENÇÃO">{atencao.map(s=><button key={s.id} onClick={()=>{setSelId(s.id);setScreen("student");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:6,cursor:"pointer",boxSizing:"border-box"}}><div><div style={{fontSize:14,color:C.text,fontWeight:"bold"}}>{s.name}</div><div style={{fontSize:11,color:C.muted}}>{TURMAS.find(t=>t.id===s.turma)?.label?.split(" · ")[0]||""}</div></div><div>{s.needsRenewal&&<div style={{fontSize:11,color:C.warn,fontWeight:"bold"}}>RENOVAR</div>}{s.pendingReposicoes>=2&&<div style={{fontSize:11,color:"#e05050"}}>{s.pendingReposicoes} repos.</div>}</div></button>)}</CC>}
              {lockData.length>0 && <CC title="MOTIVOS DE TRANCAMENTO"><ResponsiveContainer width="100%" height={Math.max(80,lockData.length*40)}><BarChart data={lockData} layout="vertical" margin={{top:0,right:20,left:10,bottom:0}}><XAxis type="number" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/><YAxis type="category" dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} width={110}/><Tooltip contentStyle={tt} formatter={v=>[`${v} aluno${v!==1?"s":""}`,""]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="val" fill="#e05050" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></CC>}
            </div>
          )}
          {dashTab==="turmas" && (
            <div>
              <CC title="OCUPAÇÃO POR TURMA"><ResponsiveContainer width="100%" height={130}><BarChart data={tStats.map(t=>({label:t.label,ativos:t.ativos,livres:Math.max(0,t.cap-t.ativos)}))} margin={{top:0,right:0,left:-20,bottom:0}}><XAxis dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="ativos" stackId="a" fill={C.amber} name="Ativos"/><Bar dataKey="livres" stackId="a" fill={C.card2} name="Vagas livres" radius={[4,4,0,0]}/><Legend wrapperStyle={{fontSize:11,color:C.muted}}/></BarChart></ResponsiveContainer></CC>
              <CC title="RECEITA POR TURMA (R$)"><ResponsiveContainer width="100%" height={120}><BarChart data={tStats.map(t=>({label:t.label,val:t.rec}))} margin={{top:0,right:0,left:-20,bottom:0}}><XAxis dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} formatter={v=>[`R$ ${v}`,""]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="val" fill="#38a048" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CC>
              <CC title="FALTAS POR TURMA"><ResponsiveContainer width="100%" height={120}><BarChart data={tStats.map(t=>({label:t.label,val:t.faltas}))} margin={{top:0,right:0,left:-20,bottom:0}}><XAxis dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} formatter={v=>[`${v} falta${v!==1?"s":""}`,""]} cursor={{fill:"rgba(255,255,255,0.05)"}}/><Bar dataKey="val" fill="#e05050" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CC>
              {tStats.map(t => (
                <CC key={t.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:15,fontWeight:"bold",color:C.amberL}}>{t.label}</span>
                    <span style={{fontSize:11,color:t.ativos>=t.cap?"#e05050":"#38a048",fontWeight:"bold",border:`1px solid ${t.ativos>=t.cap?"#7a1818":"#1e5020"}`,borderRadius:6,padding:"2px 8px",background:t.ativos>=t.cap?"#3a0808":"#0e2814"}}>{t.ativos}/{t.cap} vagas</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:C.card2,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",borderRadius:4,background:t.ativos>=t.cap?"#e05050":C.amber,width:`${Math.min((t.ativos/t.cap)*100,100)}%`}}/></div>
                  <div style={{fontSize:13,color:"#38a048",marginBottom:8}}>R$ {t.rec} receita · {t.faltas} falta{t.faltas!==1?"s":""}</div>
                  {fil.filter(s=>s.turma===t.id&&s.status==="active").map(s=>(
                    <button key={s.id} onClick={()=>{setSelId(s.id);setScreen("student");}} style={{display:"flex",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",borderTop:`1px solid ${C.border}`,padding:"7px 0",cursor:"pointer"}}>
                      <span style={{fontSize:13,color:C.text}}>{s.name}</span>
                      <span style={{fontSize:11,color:s.needsRenewal?C.warn:s.pendingReposicoes>0?"#e05050":C.muted}}>{s.needsRenewal?"RENOVAR":s.pendingReposicoes>0?`${s.pendingReposicoes} repos.`:`${s.totalClasses} aulas`}</span>
                    </button>
                  ))}
                </CC>
              ))}
            </div>
          )}
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: WHATSAPP
  // ════════════════════════════════════════════════════════════
  if (waScreen) {
    const MSGS = [
      { label:"🚫 Sem aula hoje",    texto:"Olá! Não haverá aula hoje. Wagnon Móveis 🪵" },
      { label:"📅 Sem aula amanhã",  texto:"Olá! Não haverá aula amanhã. Wagnon Móveis 🪵" },
      { label:"🎉 Feriado",          texto:"Olá! Em razão do feriado não haverá aula. Wagnon Móveis 🪵" },
      { label:"💰 Renovação",        texto:"Olá! Sua renovação de ficha está pendente. Wagnon Móveis 🪵" },
      { label:"📋 Recado livre",     texto:"" },
    ];
    const comTel = students.filter(s => s.phone && s.status==="active");
    const semTel = students.filter(s => !s.phone && s.status==="active");
    const allSel = waSelected.length === 0;
    return (
      <div style={S.page}>
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setWaScreen(false)} style={{background:"none",border:"none",color:C.amberL,fontSize:24,cursor:"pointer",lineHeight:1,padding:0}}>‹</button>
          <span style={{fontSize:16,fontWeight:"bold",color:"#38c048",flex:1}}>💬 WhatsApp em Massa</span>
        </div>
        <div style={{padding:16,paddingBottom:40}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:8}}>MENSAGEM</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {MSGS.map(m => <button key={m.label} onClick={()=>setWaMsg(m.texto)} style={{fontSize:12,padding:"6px 12px",borderRadius:20,border:`1px solid ${waMsg===m.texto?"#38c048":C.border}`,background:waMsg===m.texto?"#0a3a1a":C.card2,color:waMsg===m.texto?"#38c048":C.muted,cursor:"pointer",fontWeight:"bold"}}>{m.label}</button>)}
          </div>
          <textarea value={waMsg} onChange={e=>setWaMsg(e.target.value)} placeholder="Digite ou edite a mensagem..." rows={4}
            style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"Georgia,serif"}} />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,marginBottom:8}}>
            <span style={{fontSize:11,color:C.muted,letterSpacing:1.5}}>DESTINATÁRIOS</span>
            <button onClick={()=>setWaSelected([])} style={{fontSize:11,color:allSel?"#38c048":C.muted,background:"none",border:"none",cursor:"pointer",fontWeight:"bold"}}>{allSel?"✓ Todos":"Selecionar todos"}</button>
          </div>
          {comTel.length===0
            ? <div style={{...S.card,textAlign:"center",color:C.dim,fontSize:13}}>Nenhum aluno com celular</div>
            : <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                {comTel.map((s,i) => {
                  const sel2 = allSel || waSelected.includes(s.id);
                  const tS   = TURMAS.find(t=>t.id===s.turma)?.label?.split(" · ")[0]||"";
                  return (
                    <button key={s.id} onClick={()=>setWaSelected(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p,s.id])}
                      style={{display:"flex",alignItems:"center",width:"100%",background:sel2?"#0a2a0a":"transparent",border:"none",borderBottom:i<comTel.length-1?`1px solid ${C.border}`:"none",padding:"11px 14px",cursor:"pointer",gap:10,boxSizing:"border-box"}}>
                      <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${sel2?"#38c048":C.border}`,background:sel2?"#38c048":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel2&&<span style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>✓</span>}</div>
                      <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:14,color:C.text,fontWeight:"bold"}}>{s.name}</div><div style={{fontSize:11,color:C.muted}}>{tS} · {s.phone}</div></div>
                    </button>
                  );
                })}
              </div>
          }
          {semTel.length>0 && <div style={{fontSize:11,color:C.dim,marginBottom:16}}>⚠️ Sem celular: {semTel.map(s=>s.name).join(", ")}</div>}
          <button onClick={sendWaBulk} style={{width:"100%",background:"#1a6a2a",border:"none",color:"#fff",borderRadius:12,padding:"15px 0",fontSize:16,fontWeight:"bold",cursor:"pointer"}}>
            💬 Enviar para {allSel?comTel.length:waSelected.filter(id=>comTel.find(s=>s.id===id)).length} aluno{(allSel?comTel.length:waSelected.length)!==1?"s":""}
          </button>
          <p style={{fontSize:11,color:C.dim,textAlign:"center",marginTop:8}}>O WhatsApp abre uma conversa por vez. Confirme em cada uma.</p>
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: VISITANTES - ADD
  // ════════════════════════════════════════════════════════════
  if (visScreen === "add") return (
    <div style={S.page}>
      <Hdr title="Novo Visitante" onBack={() => setVisScreen(false)} />
      <div style={{ padding:16 }}>
        <div style={S.card}>
          <span style={S.lbl}>NOME</span>
          <input value={visForm.name} onChange={e=>setVisForm(f=>({...f,name:e.target.value}))} placeholder="Nome completo..." style={S.inp} />
          <div style={{height:14}}/>
          <span style={S.lbl}>CELULAR</span>
          <input value={visForm.phone} onChange={e=>setVisForm(f=>({...f,phone:e.target.value}))} placeholder="(00) 00000-0000" inputMode="numeric" style={S.inp} />
          <div style={{height:14}}/>
          <span style={S.lbl}>MODALIDADE DE INTERESSE</span>
          <div style={{display:"flex",gap:10,marginBottom:6}}>
            {[["pacote","📦 Pacote 4 Aulas"],["avulsa","🎫 Aula Avulsa"]].map(([m,lb]) => (
              <button key={m} onClick={()=>setVisForm(f=>({...f,mode:m}))}
                style={{flex:1,padding:"13px 0",borderRadius:10,border:`1px solid ${visForm.mode===m?C.amber:C.border}`,background:visForm.mode===m?"#2a1e06":C.card2,color:visForm.mode===m?C.amberL:C.muted,fontWeight:"bold",fontSize:13,cursor:"pointer"}}>
                {lb}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:C.dim,marginBottom:14}}>
            As regras da modalidade serão enviadas por WhatsApp 📲
          </div>
          <span style={S.lbl}>HORÁRIO PREFERIDO</span>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[...TURMAS.map(t=>[t.id,t.label.split(" · ")[0]]),["","Indiferente"]].map(([id,lb]) => (
              <button key={id} onClick={()=>setVisForm(f=>({...f,turma:id}))}
                style={{flex:1,padding:"10px 4px",borderRadius:10,border:`1px solid ${visForm.turma===id?C.amber:C.border}`,background:visForm.turma===id?"#2a1e06":C.card2,color:visForm.turma===id?C.amberL:C.muted,fontWeight:"bold",fontSize:11,cursor:"pointer",lineHeight:1.3}}>
                {lb}
              </button>
            ))}
          </div>
          <span style={S.lbl}>COMO CONHECEU</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {ORIGENS.map(o => (
              <button key={o} onClick={()=>setVisForm(f=>({...f,origem:o}))}
                style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${visForm.origem===o?C.amber:C.border}`,background:visForm.origem===o?"#2a1e06":C.card2,color:visForm.origem===o?C.amberL:C.muted,fontWeight:"bold",fontSize:12,cursor:"pointer"}}>
                {o}
              </button>
            ))}
          </div>
          <span style={S.lbl}>OBSERVAÇÕES</span>
          <textarea value={visForm.obs} onChange={e=>setVisForm(f=>({...f,obs:e.target.value}))} placeholder="Informações adicionais..." rows={3}
            style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",color:C.text,fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}} />
        </div>
        <button onClick={doAddVisitor} style={{width:"100%",background:"#1a6a2a",border:"none",color:"#fff",borderRadius:12,padding:"15px 0",fontSize:16,fontWeight:"bold",cursor:"pointer",marginBottom:10}}>
          Cadastrar + Enviar Regras 📲
        </button>
        {!visForm.phone && <div style={{fontSize:11,color:C.dim,textAlign:"center"}}>⚠️ Sem celular: as regras não serão enviadas</div>}
      </div>
      <Toast toast={toast} />
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: VISITANTES - LIST
  // ════════════════════════════════════════════════════════════
  if (visScreen === "list") return (
    <div style={S.page}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>{setVisScreen(false);setVisSelId(null);}} style={{background:"none",border:"none",color:C.amberL,fontSize:24,cursor:"pointer",lineHeight:1,padding:0}}>‹</button>
        <span style={{fontSize:16,fontWeight:"bold",color:"#60a0e8",flex:1}}>👤 Visitantes ({visitors.length})</span>
        <button onClick={()=>setVisScreen("add")} style={{background:"#1a6a2a",border:"none",color:"#fff",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:"bold",cursor:"pointer"}}>+ Novo</button>
      </div>
      <div style={{padding:16,paddingBottom:40}}>
        {visitors.length === 0
          ? <div style={{textAlign:"center",padding:"64px 20px",color:C.muted}}><div style={{fontSize:48,marginBottom:14}}>🙋</div><div style={{fontSize:17,color:C.text,marginBottom:6}}>Nenhum visitante</div><div style={{fontSize:13}}>Toque em + Novo para cadastrar</div></div>
          : visitors.map(v => {
              const vs    = VIS_STATUS[v.status] || VIS_STATUS.novo;
              const isOpen = visSelId === v.id;
              return (
                <div key={v.id} style={{background:C.card,border:`1px solid ${isOpen?"#60a0e8":C.border}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                  <button onClick={()=>setVisSelId(isOpen?null:v.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"transparent",border:"none",padding:"14px 16px",cursor:"pointer",textAlign:"left",boxSizing:"border-box"}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:"bold",color:C.text}}>{v.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:3}}>
                        {v.mode==="pacote"?"📦 Pacote":"🎫 Avulso"}{v.turma?" · "+TURMAS.find(t=>t.id===v.turma)?.label?.split(" · ")[0]:""}{v.origem?" · "+v.origem:""} · {v.date}
                      </div>
                    </div>
                    <span style={{fontSize:10,fontWeight:"bold",color:vs.color,background:vs.bg,border:`1px solid ${vs.bd}`,borderRadius:6,padding:"3px 8px",flexShrink:0}}>{vs.label}</span>
                  </button>
                  {isOpen && (
                    <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 16px",background:C.card2}}>
                      {v.phone && <div style={{fontSize:13,color:C.muted,marginBottom:8}}>📱 {v.phone}</div>}
                      {v.obs   && <div style={{fontSize:13,color:C.muted,marginBottom:10,fontStyle:"italic"}}>"{v.obs}"</div>}
                      <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:8}}>STATUS</div>
                      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                        {Object.entries(VIS_STATUS).map(([k,vs2]) => (
                          <button key={k} onClick={()=>setVisitors(p=>p.map(x=>x.id===v.id?{...x,status:k}:x))}
                            style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${v.status===k?vs2.color:C.border}`,background:v.status===k?vs2.bg:C.card,color:v.status===k?vs2.color:C.muted,fontWeight:"bold",fontSize:11,cursor:"pointer"}}>
                            {vs2.label}
                          </button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        {v.phone && (
                          <button onClick={()=>{ const msg = v.mode==="pacote"?MSG_PACOTE:MSG_AVULSA; window.open(waLink(v.phone,msg),"_blank"); }}
                            style={{flex:1,background:"#0a3a1a",border:"1px solid #1a6a2a",color:"#38c048",borderRadius:8,padding:"10px 0",fontSize:13,fontWeight:"bold",cursor:"pointer"}}>
                            💬 Reenviar Regras
                          </button>
                        )}
                        {v.status !== "confirmou" && (
                          <button onClick={()=>doConvertVisitor(v.id)}
                            style={{flex:1,background:"#2a1e06",border:`1px solid ${C.gold}`,color:C.amberL,borderRadius:8,padding:"10px 0",fontSize:13,fontWeight:"bold",cursor:"pointer"}}>
                            🎓 Converter em Aluno
                          </button>
                        )}
                      </div>
                      {visConfirmDel === v.id
                        ? <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>setVisConfirmDel(false)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"9px 0",cursor:"pointer"}}>Cancelar</button>
                            <button onClick={()=>{setVisitors(p=>p.filter(x=>x.id!==v.id));setVisSelId(null);setVisConfirmDel(false);showMsg("Removido");}} style={{flex:1,background:"#8b2020",border:"none",color:"#fff",borderRadius:8,padding:"9px 0",cursor:"pointer",fontWeight:"bold"}}>Remover</button>
                          </div>
                        : <button onClick={()=>setVisConfirmDel(v.id)} style={{display:"block",width:"100%",background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",padding:"8px 0",textDecoration:"underline"}}>Remover visitante</button>
                      }
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>
      <Toast toast={toast} />
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: STUDENT
  // ════════════════════════════════════════════════════════════
  if (screen === "student" && sel) {
    const turmaLabel = TURMAS.find(t => t.id===sel.turma)?.label||"";
    return (
      <div style={S.page}>
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={goList} style={{background:"none",border:"none",color:C.amberL,fontSize:24,cursor:"pointer",lineHeight:1,padding:0}}>‹</button>
          <span style={{fontSize:17,fontWeight:"bold",color:C.text,flex:1}}>{sel.name}</span>
          {sel.phone && <a href={waLink(sel.phone,`Olá, ${sel.name}!`)} target="_blank" rel="noreferrer" style={{background:"#0a3a1a",border:"1px solid #1a6a2a",color:"#38c048",borderRadius:8,padding:"6px 10px",fontSize:18,lineHeight:1,textDecoration:"none"}}>💬</a>}
          <button onClick={()=>setScreen("history")} style={{background:"#2a1e06",border:`1px solid ${C.gold}`,color:C.amberL,borderRadius:8,padding:"6px 12px",fontSize:13,cursor:"pointer",fontWeight:"bold"}}>📋 Histórico</button>
        </div>
        <div style={{padding:16,paddingBottom:32}}>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:10}}>
            {turmaLabel && <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:"bold",background:"#1a1a2e",color:"#a0a0e8",border:"1px solid #3a3a6a"}}>🗓 {turmaLabel}</span>}
            {sel.phone   && <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:"bold",background:"#0e1a2e",color:"#60a0e8",border:"1px solid #1e3a6a"}}>📱 {sel.phone}</span>}
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:"bold",background:sel.mode==="pacote"?"#0e2814":"#2a1e06",color:sel.mode==="pacote"?"#38a048":C.amberL,border:`1px solid ${sel.mode==="pacote"?"#1e5020":"#5a3e10"}`}}>{sel.mode==="pacote"?"📦 Pacote":"🎫 Avulso"}</span>
          </div>

          {sel.status === "trancado" && (
            <div style={{background:"#3a0808",border:"1px solid #8b2020",borderRadius:10,padding:"11px 14px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:"#e05050",fontWeight:"bold",fontSize:14}}>🔒 CURSO TRANCADO</div>{sel.lockDate&&<div style={{fontSize:11,color:"#a06060",marginTop:2}}>Desde {sel.lockDate}{sel.lockReason?" · "+sel.lockReason:""}</div>}</div>
                <button onClick={doDesbloq} style={{background:"#8b2020",border:"none",color:"#fff",borderRadius:8,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:"bold"}}>Desbloquear</button>
              </div>
            </div>
          )}
          {sel.needsRenewal && sel.status==="active" && sel.mode==="pacote" && (
            <div style={{background:"#2d1806",border:`1px solid ${C.warn}`,borderRadius:10,padding:"11px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{color:C.warn,fontWeight:"bold",fontSize:14}}>⚠️ RENOVAÇÃO PENDENTE</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>Falta agora = trancamento</div></div>
              <button onClick={doRenovar} style={{background:C.warn,border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:"bold"}}>Renovar</button>
            </div>
          )}
          {sel.status==="active" && !sel.needsRenewal && (
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
              <button onClick={()=>setLockPicker(true)} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>🔒 Trancar curso</button>
            </div>
          )}
          {lockPicker && (
            <div style={{background:"#2d1a1a",border:"1px solid #8b2020",borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontSize:13,color:"#e05050",fontWeight:"bold",marginBottom:10}}>Motivo do trancamento</div>
              {LOCK_REASONS.map(r => <button key={r} onClick={()=>doTrancar(r)} style={{display:"block",width:"100%",background:C.card2,border:`1px solid ${C.border}`,color:C.text,borderRadius:8,padding:"10px 14px",marginBottom:6,cursor:"pointer",textAlign:"left",fontSize:14,boxSizing:"border-box"}}>{r}</button>)}
              <button onClick={()=>setLockPicker(false)} style={{width:"100%",background:"none",border:"none",color:C.muted,padding:"6px 0",cursor:"pointer",fontSize:13}}>Cancelar</button>
            </div>
          )}

          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[["AULAS",sel.totalClasses,"#38a048"],["FALTAS",sel.totalFaltas,"#e05050"],["A REPOR",sel.pendingReposicoes,C.amberL]].map(([l,v,col]) => (
              <div key={l} style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:"bold",color:col,lineHeight:1}}>{v}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:5,letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>

          {sel.mode==="pacote" && (
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div><span style={{fontSize:11,color:C.muted,letterSpacing:1.5}}>FICHA ATUAL</span><span style={{fontSize:13,fontWeight:"bold",color:C.amberL,marginLeft:8}}>#{sel.fichaNum||1}</span></div>
                <span style={{fontSize:14,color:C.amberL,fontWeight:"bold"}}>{sel.fichaUsed} / 4</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[0,1,2,3].map(i => <div key={i} style={{flex:1,height:12,borderRadius:6,background:i<sel.fichaUsed?`linear-gradient(to right,${C.amber},${C.amberL})`:C.card2,border:`1px solid ${i<sel.fichaUsed?C.gold:C.border}`}}/>)}
              </div>
            </div>
          )}

          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:C.muted,letterSpacing:1.5}}>PROGRESSO</span>
              <span style={{fontSize:12,color:C.amberL}}>{sel.taskIndex}/20</span>
            </div>
            <div style={{height:8,borderRadius:4,background:C.card2,marginBottom:14,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:4,background:`linear-gradient(to right,${C.amber},${C.amberL})`,width:`${(sel.taskIndex/20)*100}%`}}/>
            </div>
            {sel.taskIndex>=20
              ? <div style={{textAlign:"center",color:C.amberL,fontWeight:"bold",fontSize:16}}>🎓 CURSO CONCLUÍDO!</div>
              : task && (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div><div style={{fontSize:11,color:C.muted}}>{task.module}</div><div style={{fontSize:17,fontWeight:"bold",color:C.text,marginTop:3}}>#{task.number} · {task.name}</div></div>
                  <button onClick={()=>setScreen("tasks")} style={{background:"none",border:`1px solid ${C.border}`,color:C.amberL,borderRadius:8,padding:"7px 12px",fontSize:13,cursor:"pointer"}}>Alterar ▾</button>
                </div>
              )
            }
          </div>

          <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:8}}>REGISTRAR</div>
          {(() => {
            const bloqueado  = sel.status==="trancado";
            const temRep     = sel.pendingReposicoes > 0;
            const rep5plus   = sel.pendingReposicoes >= 5;
            // 0 rep  → tudo aceso inclusive Migrar
            // 1-4 rep → Presença, Falta, Reposição acesos; Migrar apagado
            // 5+ rep  → APENAS Reposição acesa
            const podePresenca = !bloqueado && !rep5plus;
            const podeFalta    = !bloqueado && !rep5plus && sel.mode!=="avulsa";
            const podeRep      = !bloqueado && temRep;
            const podeMigrar   = !bloqueado && !temRep;
            return (
              <>
                {rep5plus && (
                  <div style={{background:"#3a0808",border:"1px solid #7a1818",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#e05050"}}>
                    ⚠️ {sel.pendingReposicoes} reposições pendentes — faça ao menos uma para liberar os demais botões
                  </div>
                )}
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <button onClick={()=>podePresenca&&openPicker("presenca")} disabled={!podePresenca}
                    style={{...S.btn(podePresenca?C.green:"#1c1c1c"),opacity:podePresenca?1:0.3,cursor:podePresenca?"pointer":"not-allowed"}}>✅ Presença</button>
                  <button onClick={()=>podeFalta&&doFalta()} disabled={!podeFalta}
                    style={{...S.btn(podeFalta?C.red:"#1c1c1c"),opacity:podeFalta?1:0.3,cursor:podeFalta?"pointer":"not-allowed"}}>❌ Falta</button>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:12}}>
                  <button onClick={()=>podeRep&&openPicker("reposicao")} disabled={!podeRep}
                    style={{...S.btn(podeRep?"#3a2a08":C.card2,podeRep?C.amberL:C.muted),border:`1px solid ${podeRep?C.gold:C.border}`,opacity:podeRep?1:0.3,cursor:podeRep?"pointer":"not-allowed"}}>
                    🔄 Reposição{temRep?` (${sel.pendingReposicoes})`:""}</button>
                  <button onClick={()=>podeMigrar&&setMigrateConf(true)} disabled={!podeMigrar}
                    style={{...S.btn(podeMigrar?"#1a1a2e":C.card2,podeMigrar?"#a0a0e8":C.muted),border:`1px solid ${podeMigrar?"#3a3a6a":C.border}`,opacity:podeMigrar?1:0.3,cursor:podeMigrar?"pointer":"not-allowed"}}>
                    🔃 Migrar modo</button>
                </div>
              </>
            );
          })()}

          {taskPicker && (
            <div style={{background:C.card,border:`1px solid ${C.amber}`,borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:"bold",color:taskPicker.type==="presenca"?"#38a048":C.amberL}}>
                  {taskPicker.type==="presenca"?"✅ Tarefas desta presença":"🔄 Tarefas desta reposição"}
                </span>
                <span style={{fontSize:11,color:C.muted}}>{taskPicker.selected.length} selecionada{taskPicker.selected.length!==1?"s":""}</span>
              </div>
              <div style={{maxHeight:220,overflowY:"auto",marginBottom:10}}>
                {ALL_TASKS.map((t,idx) => {
                  const s2   = taskPicker.selected.includes(idx);
                  const past = idx < sel.taskIndex && !s2;
                  return (
                    <button key={idx} onClick={()=>setTaskPicker(p=>({...p,selected:s2?p.selected.filter(i=>i!==idx):[...p.selected,idx]}))}
                      style={{display:"flex",alignItems:"center",width:"100%",background:s2?"#2a1e06":"transparent",border:`1px solid ${s2?C.amber:"transparent"}`,borderRadius:8,padding:"8px 10px",marginBottom:3,cursor:"pointer",gap:8,boxSizing:"border-box",opacity:past?0.4:1}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${s2?C.amber:C.border}`,background:s2?C.amber:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s2&&<span style={{color:"#17130e",fontSize:12,fontWeight:"bold"}}>✓</span>}</div>
                      <span style={{fontSize:12,color:C.muted,minWidth:20}}>#{t.number}</span>
                      <span style={{fontSize:14,color:s2?C.amberL:past?C.dim:C.text,flex:1,textAlign:"left"}}>{t.name}</span>
                      {idx===sel.taskIndex && <span style={{fontSize:10,color:C.amber,border:`1px solid ${C.gold}`,borderRadius:3,padding:"1px 4px"}}>atual</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setTaskPicker(null)} style={{...S.btn(C.card2,C.muted),flex:"none",padding:"11px 16px",border:`1px solid ${C.border}`}}>Cancelar</button>
                <button onClick={confirmAula} style={{...S.btn(taskPicker.type==="presenca"?C.green:"#3a2a08",taskPicker.type==="presenca"?"#fff":C.amberL),border:`1px solid ${taskPicker.type==="presenca"?"#2d6a30":C.gold}`}}>Confirmar</button>
              </div>
            </div>
          )}

          {migrateConf && (
            <div style={{background:"#1a1a2e",border:"1px solid #3a3a6a",borderRadius:10,padding:14,marginBottom:14,textAlign:"center"}}>
              <div style={{color:"#a0a0e8",marginBottom:10,fontSize:14}}>Migrar para <strong>{sel.mode==="pacote"?"Aula Avulsa":"Pacote 4 Aulas"}</strong>?</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setMigrateConf(false)} style={{...S.btn(C.card2,C.muted),border:`1px solid ${C.border}`}}>Cancelar</button>
                <button onClick={doMigrar} style={S.btn("#3a3a8b","#c0c0ff")}>Confirmar</button>
              </div>
            </div>
          )}

          {confirmDel
            ? <div style={{background:"#3a0808",border:"1px solid #8b2020",borderRadius:10,padding:14,textAlign:"center"}}>
                <div style={{color:"#e05050",marginBottom:10,fontSize:14}}>Remover <strong>{sel.name}</strong>?</div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setConfirmDel(false)} style={{...S.btn(C.card2,C.muted),border:`1px solid ${C.border}`}}>Cancelar</button>
                  <button onClick={doDel} style={S.btn("#8b2020")}>Remover</button>
                </div>
              </div>
            : <button onClick={()=>setConfirmDel(true)} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",width:"100%",padding:"8px 0",textDecoration:"underline"}}>Remover aluno</button>
          }
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: LIST
  // ════════════════════════════════════════════════════════════
  const alerts = getAlerts();
  return (
    <div style={S.page}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"16px 16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,color:C.amber,letterSpacing:2.5,marginBottom:3}}>WAGNON MÓVEIS</div>
            <div style={{fontSize:22,fontWeight:"bold",color:C.text}}>Curso de Marcenaria</div>
            <div style={{fontSize:13,color:C.muted,marginTop:2}}>{students.length} aluno{students.length!==1?"s":""} · {students.filter(s=>s.status==="active").length} ativo{students.filter(s=>s.status==="active").length!==1?"s":""}</div>
          </div>
          {alerts.length>0 && (
            <button onClick={()=>setShowNotif(v=>!v)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:4,marginTop:4}}>
              <span style={{fontSize:22}}>🔔</span>
              <span style={{position:"absolute",top:0,right:0,background:"#e05050",color:"#fff",borderRadius:10,fontSize:10,fontWeight:"bold",padding:"1px 5px"}}>{alerts.length}</span>
            </button>
          )}
        </div>
      </div>

      {showNotif && alerts.length>0 && (
        <div style={{background:"#1a1208",borderBottom:`1px solid ${C.border}`,padding:"10px 16px"}}>
          <div style={{fontSize:11,color:C.amber,letterSpacing:1.5,marginBottom:8}}>ALERTAS</div>
          {alerts.map((a,i) => (
            <button key={i} onClick={()=>{if(a.id){setSelId(a.id);setScreen("student");setShowNotif(false);}}} style={{display:"flex",alignItems:"flex-start",width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",marginBottom:6,cursor:"pointer",gap:10,boxSizing:"border-box",textAlign:"left"}}>
              <span style={{fontSize:16,flexShrink:0}}>{a.icon}</span>
              <div><div style={{fontSize:13,color:a.color,fontWeight:"bold"}}>{a.msg}</div>{a.sub&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{a.sub}</div>}</div>
            </button>
          ))}
        </div>
      )}

      <div style={{padding:16,paddingBottom:150}}>
        {students.length===0
          ? <div style={{textAlign:"center",padding:"64px 20px",color:C.muted}}><div style={{fontSize:48,marginBottom:14}}>🪵</div><div style={{fontSize:17,marginBottom:6,color:C.text}}>Nenhum aluno cadastrado</div><div style={{fontSize:13}}>Toque em + para adicionar</div></div>
          : students.map(st => {
              const t      = st.taskIndex<20 ? ALL_TASKS[st.taskIndex] : null;
              const sCol   = st.status==="trancado"?"#e05050":st.needsRenewal?C.warn:st.pendingReposicoes>0?C.amberL:"#38a048";
              const sLbl   = st.status==="trancado"?"TRANCADO":st.needsRenewal?"RENOVAR":st.pendingReposicoes>0?`${st.pendingReposicoes} A REPOR`:"ATIVO";
              const tShort = TURMAS.find(tr=>tr.id===st.turma)?.label?.split(" · ")[0]||"";
              return (
                <button key={st.id} onClick={()=>{setSelId(st.id);setScreen("student");setConfirmDel(false);setMigrateConf(false);}} style={{display:"block",width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,cursor:"pointer",textAlign:"left",boxSizing:"border-box"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <span style={{fontSize:17,fontWeight:"bold",color:C.text}}>{st.name}</span>
                    <span style={{fontSize:11,color:sCol,fontWeight:"bold"}}>{sLbl}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:C.muted}}>{t?`#${t.number} · ${t.name}`:"🎓 Concluído"}</span>
                    <span style={{fontSize:11,color:C.dim}}>{tShort} · {st.mode==="pacote"?"Pacote":"Avulso"} · {st.totalClasses} aulas</span>
                  </div>
                  {st.mode==="pacote" && <div style={{display:"flex",gap:5,marginTop:9}}>{[0,1,2,3].map(i=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<st.fichaUsed?C.amber:C.card2}}/>)}</div>}
                </button>
              );
            })
        }
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.card,borderTop:`1px solid ${C.border}`,padding:"10px 14px",display:"flex",flexDirection:"column",gap:8,boxSizing:"border-box"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setScreen("dashboard")} style={{flex:1,background:"#2a1e06",border:`1px solid ${C.gold}`,borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:"bold",color:C.amberL,cursor:"pointer"}}>📊 Dashboard</button>
          <button onClick={()=>setVisScreen("list")} style={{flex:1,background:"#0e1a2e",border:"1px solid #1e3a6a",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:"bold",color:"#60a0e8",cursor:"pointer"}}>
            👤 Visitantes{visitors.filter(v=>v.status==="novo").length>0?` (${visitors.filter(v=>v.status==="novo").length})`:""}
          </button>
          <button onClick={()=>{setWaScreen(true);setWaSelected([]);setWaMsg("");}} style={{flex:1,background:"#0a3a1a",border:"1px solid #1a6a2a",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:"bold",color:"#38c048",cursor:"pointer"}}>💬 WhatsApp</button>
          <button onClick={()=>setScreen("add")} style={{width:48,height:48,borderRadius:24,background:C.amber,border:"none",color:"#17130e",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>+</button>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <label style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:"bold",color:C.muted,cursor:"pointer",textAlign:"center",display:"block"}}>
            📥 Importar<input type="file" accept=".json" onChange={doImport} style={{display:"none"}}/>
          </label>
          <button onClick={doExport} style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:"bold",color:C.muted,cursor:"pointer"}}>📤 Exportar</button>
          <div style={{display:"flex",alignItems:"center",gap:5,flex:1,justifyContent:"center"}}>
            <div style={{width:8,height:8,borderRadius:4,background:dbStatus==="ok"?"#38a048":dbStatus==="loading"?C.amber:"#e05050",flexShrink:0}}/>
            <span style={{fontSize:10,color:C.dim}}>{dbStatus==="ok"?"Sincronizado":dbStatus==="loading"?"Carregando...":"Sem conexão"}</span>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
