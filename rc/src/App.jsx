import { useState, useEffect } from "react";

const RECORDS_KEY = "abc_records_v2";
const ADMIN_PIN = "1234";

const loadRecords = async () => {
  try { const r = await window.storage.get(RECORDS_KEY, true); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const saveRecords = async (recs) => {
  try { await window.storage.set(RECORDS_KEY, JSON.stringify(recs), true); } catch {}
};

const STEPS = [
  { id: "child", question: "¿Sobre qué niño o niña es este registro?", hint: "Selecciona el perfil o añade uno nuevo", type: "child_select" },
  { id: "date", question: "¿Cuándo ocurrió?", type: "single", options: ["Hoy", "Ayer", "Hace 2 días", "Hace 3 días"] },
  { id: "time_of_day", question: "¿En qué momento del día?", type: "single", options: ["Mañana temprano (antes de las 9h)", "Mañana (9h–12h)", "Mediodía (12h–15h)", "Tarde (15h–18h)", "Noche (18h–21h)", "Noche tarde (después de las 21h)"] },
  { id: "context", question: "¿Dónde estabais?", type: "single", options: ["En casa", "En el colegio o guardería", "En el parque o exterior", "En el coche", "En una tienda o supermercado", "En casa de familiares", "En un restaurante u otro lugar público", "En otro lugar"] },
  { id: "who_present", question: "¿Quién estaba con el niño/a?", hint: "Puedes seleccionar más de uno", type: "multi", options: ["Mamá", "Papá", "Hermano/a", "Abuelo/a", "Tío/a u otro familiar", "Amigos u otros niños", "Cuidador/a o profesor/a", "Estaba solo/a"] },
  { id: "antecedent_what", question: "¿Qué pasó justo antes?", hint: "¿Qué desencadenó la conducta?", type: "single", options: ["Le pedimos que parase o cambiase de actividad", "Le dijimos que no a algo que pedía", "Llegó la hora de una rutina (comer, dormir, deberes…)", "Hubo una interacción con otra persona o niño", "Hubo un cambio inesperado de planes o lugar", "Estaba aburrido/a o sin nada que hacer", "Se le retiró algo (juguete, pantalla, objeto)", "Era una situación nueva o desconocida para él/ella", "No hubo un motivo aparente"] },
  { id: "antecedent_state", question: "¿Cómo parecía estar antes de que ocurriera?", type: "single", options: ["Tranquilo/a y bien", "Un poco inquieto/a o nervioso/a", "Cansado/a o con sueño", "Con hambre o sin haber comido bien", "Ya frustrado/a o molesto/a por algo anterior", "Muy activo/a o excitado/a", "No sé / no me fijé"] },
  { id: "behavior_type", question: "¿Qué hizo exactamente?", hint: "Selecciona todo lo que ocurrió", type: "multi", options: ["Gritó o chilló", "Lloró intensamente", "Se tiró al suelo", "Golpeó o lanzó objetos", "Golpeó a una persona", "Se hizo daño a sí mismo/a", "Insultó o dijo palabrotas", "Se escapó o intentó huir", "Se quedó bloqueado/a sin moverse", "Ignoró completamente lo que se le decía", "Rompió algo", "Otro comportamiento difícil"] },
  { id: "intensity", question: "¿Con qué intensidad ocurrió?", type: "intensity", options: ["Leve", "Moderada", "Intensa", "Muy intensa"] },
  { id: "duration", question: "¿Cuánto duró aproximadamente?", type: "single", options: ["Menos de 1 minuto", "Entre 1 y 5 minutos", "Entre 5 y 15 minutos", "Entre 15 y 30 minutos", "Más de 30 minutos"] },
  { id: "consequence", question: "¿Cómo respondisteis vosotros?", hint: "Puedes seleccionar más de uno", type: "multi", options: ["Le dimos lo que pedía", "No reaccionamos / lo ignoramos", "Le hablamos con calma", "Le pusimos en tiempo fuera (habitación, rincón…)", "Le reñimos o alzamos la voz", "Le consolamos con contacto físico (abrazo, mano…)", "Cambiamos lo que le habíamos pedido", "Le ofrecimos algo diferente para distraerle", "Fuimos firmes y mantuvimos el límite"] },
  { id: "outcome", question: "¿Cómo terminó la situación?", type: "single", options: ["Se calmó rápido y todo volvió a la normalidad", "Se calmó pero quedó de mal humor", "Tardó mucho en calmarse", "No llegó a calmarse del todo antes de dormir", "Acabó durmiendo o agotado/a"] },
];

const C = {
  bg: "#0f0e17", card: "#1a1928", border: "#2a2840",
  accent: "#ff8c42", accentSoft: "rgba(255,140,66,0.12)",
  text: "#fffffe", muted: "#6b697e", green: "#4ecdc4",
  blue: "#a8dadc", pill: "#252436",
};

const intensityData = [
  { label: "Leve", color: "#4ecdc4", bg: "rgba(78,205,196,0.12)", emoji: "🟢" },
  { label: "Moderada", color: "#ffd166", bg: "rgba(255,209,102,0.12)", emoji: "🟡" },
  { label: "Intensa", color: "#ff8c42", bg: "rgba(255,140,66,0.12)", emoji: "🟠" },
  { label: "Muy intensa", color: "#ef476f", bg: "rgba(239,71,111,0.12)", emoji: "🔴" },
];

export default function App() {
  const [mode, setMode] = useState("family");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecords().then(r => { setRecords(r); setLoading(false); }); }, []);

  const handleSaveRecord = async (rec) => {
    const updated = [...records, rec];
    setRecords(updated);
    await saveRecords(updated);
    return updated.length;
  };

  const enterAdmin = () => {
    if (pin === ADMIN_PIN) { setMode("admin"); setPinError(false); setPin(""); }
    else setPinError(true);
  };

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .fade-up { animation: fadeUp 0.38s cubic-bezier(.22,1,.36,1) both; }
        .hov { transition: all 0.18s ease; cursor: pointer; }
        .hov:hover { transform: translateY(-1px); }
      `}</style>

      {mode === "family" && <FamilyView onSave={handleSaveRecord} onAdminClick={() => setMode("admin_gate")} />}

      {mode === "admin_gate" && (
        <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 24, padding: 40, width: "100%", maxWidth: 380, border: `1px solid ${C.border}` }} className="fade-up">
            <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.text, marginBottom: 8 }}>Acceso profesional</p>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Introduce el PIN para acceder al historial y análisis clínico.</p>
            <input type="password" maxLength={6} value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === "Enter" && enterAdmin()}
              placeholder="••••"
              style={{ width: "100%", padding: "16px 20px", borderRadius: 14, border: `1.5px solid ${pinError ? "#ef476f" : C.border}`, background: "#13121f", color: C.text, fontSize: 24, letterSpacing: 10, textAlign: "center", outline: "none", fontFamily: "monospace", marginBottom: 8 }} />
            {pinError && <p style={{ color: "#ef476f", fontSize: 12, textAlign: "center", marginBottom: 12 }}>PIN incorrecto. Inténtalo de nuevo.</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setMode("family")} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={enterAdmin} style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Entrar</button>
            </div>
          </div>
        </div>
      )}

      {mode === "admin" && <AdminView records={records} onBack={() => setMode("family")} />}
    </>
  );
}

function FamilyView({ onSave, onAdminClick }) {
  const [phase, setPhase] = useState("welcome");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [children, setChildren] = useState([]);
  const [newChildInput, setNewChildInput] = useState("");
  const [report, setReport] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const step = STEPS[stepIdx];
  const progress = (stepIdx / STEPS.length) * 100;

  const advance = async (currentAnswers = answers) => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      const record = { ...currentAnswers, id: Date.now(), saved_at: new Date().toISOString() };
      const count = await onSave(record);
      setTotalCount(count);
      if (count % 10 === 0) { setPhase("report"); generateReport(); }
      else setPhase("done");
    }
  };

  const handleSelect = (value) => {
    if (step.type === "multi") {
      const cur = answers[step.id] || [];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      setAnswers(a => ({ ...a, [step.id]: next }));
    } else {
      const updated = { ...answers, [step.id]: value };
      setAnswers(updated);
      setTimeout(() => advance(updated), 260);
    }
  };

  const addChild = (name) => {
    const n = name.trim();
    if (!n) return;
    if (!children.includes(n)) setChildren(c => [...c, n]);
    const updated = { ...answers, child: n };
    setAnswers(updated);
    setNewChildInput("");
    setTimeout(() => advance(updated), 260);
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    const allRecords = await loadRecords();
    const last10 = allRecords.slice(-10);
    const text = last10.map((r, i) =>
      `Registro ${i + 1}: ${r.child} | ${r.date} ${r.time_of_day} | ${r.context} | Presentes: ${[].concat(r.who_present || []).join(", ")}
Antecedente: ${r.antecedent_what} | Estado previo: ${r.antecedent_state}
Conducta: ${[].concat(r.behavior_type || []).join(", ")} (${r.intensity}, ${r.duration})
Consecuencia: ${[].concat(r.consequence || []).join(", ")} | Resultado: ${r.outcome}`
    ).join("\n\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Eres un especialista en conducta infantil. Una familia ha completado 10 registros ABC. Genera un informe breve, cálido y práctico PARA LA FAMILIA (no para un profesional, sin tecnicismos).

REGISTROS:
${text}

El informe debe seguir esta estructura exacta:
1. Una frase de reconocimiento por el esfuerzo de la familia (cálida y sincera)
2. "Lo que hemos observado:" — 2-3 patrones concretos en lenguaje muy sencillo
3. "Lo que parece estar pasando:" — una explicación humana y comprensible de por qué ocurre
4. "Tres cosas que podéis probar esta semana:" — estrategias muy concretas, fáciles de aplicar hoy mismo
5. Una frase final de ánimo

Tono: cercano, empático, sin jerga clínica. Máximo 300 palabras.` }],
        }),
      });
      const data = await res.json();
      setReport(data.content?.map(b => b.text || "").join("") || "No se pudo generar el informe.");
    } catch { setReport("No se pudo generar el informe. Contacta con tu profesional."); }
    setGeneratingReport(false);
  };

  const restart = () => { setPhase("welcome"); setStepIdx(0); setAnswers({}); setReport(""); };

  const S = {
    wrap: { minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 80px" },
    topbar: { width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0 0" },
    logo: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.accent },
    progressWrap: { width: "100%", maxWidth: 520, height: 3, background: C.border, borderRadius: 4, margin: "16px 0 0", overflow: "hidden" },
    progressFill: { height: "100%", background: `linear-gradient(90deg, ${C.accent}, #ff6b9d)`, borderRadius: 4, transition: "width 0.4s ease", width: `${progress}%` },
    content: { width: "100%", maxWidth: 520, marginTop: 52 },
    q: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.text, lineHeight: 1.25, marginBottom: 8 },
    hint: { color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 },
    option: (active) => ({ width: "100%", padding: "15px 20px", borderRadius: 14, border: `1.5px solid ${active ? C.accent : C.border}`, background: active ? C.accentSoft : C.card, color: active ? C.accent : C.text, cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, transition: "all 0.18s", display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontFamily: "'DM Sans', sans-serif" }),
    dot: (active) => ({ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? C.accent : C.muted}`, background: active ? C.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" }),
    nextBtn: { marginTop: 24, width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.accent}, #ff6b9d)`, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    backBtn: { marginTop: 10, width: "100%", padding: "12px 0", borderRadius: 16, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  };

  if (phase === "welcome") return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.logo}>conducta·abc</span>
        <button onClick={onAdminClick} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>🔒 Profesional</button>
      </div>
      <div style={{ ...S.content, textAlign: "center", marginTop: 100 }} className="fade-up">
        <div style={{ width: 72, height: 72, borderRadius: 24, background: C.accentSoft, border: `1px solid rgba(255,140,66,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 34 }}>🌱</div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, color: C.text, marginBottom: 16, lineHeight: 1.15 }}>Registro<br /><em>de hoy</em></h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.85, marginBottom: 44, maxWidth: 340, margin: "0 auto 44px" }}>
          Te haremos unas preguntas sencillas sobre lo que ocurrió. Solo tienes que elegir la opción que mejor encaje.
        </p>
        <button className="hov" onClick={() => setPhase("wizard")} style={{ padding: "16px 52px", borderRadius: 50, border: "none", background: `linear-gradient(135deg, ${C.accent}, #ff6b9d)`, color: "#fff", fontWeight: 600, fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Empezar →
        </button>
      </div>
    </div>
  );

  if (phase === "done") return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.logo}>conducta·abc</span></div>
      <div style={{ ...S.content, textAlign: "center", marginTop: 100 }} className="fade-up">
        <div style={{ fontSize: 60, marginBottom: 24 }}>✅</div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: C.text, marginBottom: 14 }}>¡Guardado!</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.9, maxWidth: 300, margin: "0 auto 44px" }}>Gracias por registrarlo. Cada anotación ayuda a entender mejor la situación.</p>
        <button className="hov" onClick={restart} style={{ padding: "14px 44px", borderRadius: 50, border: "none", background: C.accent, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Hacer otro registro</button>
      </div>
    </div>
  );

  if (phase === "report") return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.logo}>conducta·abc</span></div>
      <div style={{ ...S.content, marginTop: 48 }} className="fade-up">
        <div style={{ background: "linear-gradient(135deg, rgba(255,140,66,0.1), rgba(255,107,157,0.1))", borderRadius: 20, padding: "28px 24px", border: `1px solid rgba(255,140,66,0.2)`, marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>¡10 registros completados!</p>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>Hemos analizado los patrones de estas semanas. Aquí tenéis vuestro informe personalizado.</p>
        </div>

        {generatingReport ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: C.muted, fontSize: 14, animation: "pulse 2s infinite" }}>Analizando los patrones...</p>
          </div>
        ) : (
          <>
            <div style={{ background: C.card, borderRadius: 20, padding: "24px 22px", border: `1px solid ${C.border}` }}>
              {report.split("\n").map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                if (/^\d+\./.test(line) || line.startsWith("**")) return <p key={i} style={{ fontWeight: 700, color: C.accent, fontSize: 15, marginTop: 18, marginBottom: 6 }}>{line.replace(/\*\*/g, "")}</p>;
                if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ color: "#d4d0e8", fontSize: 14, lineHeight: 1.85, paddingLeft: 14, marginBottom: 5 }}>• {line.slice(2)}</p>;
                return <p key={i} style={{ color: "#d4d0e8", fontSize: 14, lineHeight: 1.85, marginBottom: 4 }}>{line}</p>;
              })}
            </div>
            <button className="hov" onClick={restart} style={{ ...S.nextBtn, marginTop: 20 }}>Hacer otro registro</button>
          </>
        )}
      </div>
    </div>
  );

  // WIZARD
  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.logo}>conducta·abc</span>
        <span style={{ color: C.muted, fontSize: 12 }}>{stepIdx + 1} / {STEPS.length}</span>
      </div>
      <div style={S.progressWrap}><div style={S.progressFill} /></div>

      <div style={S.content} className="fade-up" key={stepIdx}>
        <p style={S.q}>{step.question}</p>
        {step.hint && <p style={S.hint}>{step.hint}</p>}
        {!step.hint && <div style={{ marginBottom: 28 }} />}

        {/* CHILD */}
        {step.type === "child_select" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {children.map(c => (
                <button key={c} className="hov" style={S.option(answers.child === c)} onClick={() => { const u = { ...answers, child: c }; setAnswers(u); setTimeout(() => advance(u), 260); }}>
                  <div style={S.dot(answers.child === c)}>{answers.child === c && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}</div>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input value={newChildInput} onChange={e => setNewChildInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addChild(newChildInput)}
                placeholder="Nombre del niño/a…"
                style={{ flex: 1, padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.text, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={() => addChild(newChildInput)} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>+</button>
            </div>
          </>
        )}

        {/* SINGLE */}
        {step.type === "single" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {step.options.map(opt => (
              <button key={opt} className="hov" style={S.option(answers[step.id] === opt)} onClick={() => handleSelect(opt)}>
                <div style={S.dot(answers[step.id] === opt)}>{answers[step.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}</div>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* MULTI */}
        {step.type === "multi" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {step.options.map(opt => {
                const active = (answers[step.id] || []).includes(opt);
                return (
                  <button key={opt} className="hov" onClick={() => handleSelect(opt)} style={{ padding: "10px 18px", borderRadius: 50, border: `1.5px solid ${active ? C.accent : C.border}`, background: active ? C.accentSoft : C.pill, color: active ? C.accent : "#a09eb8", fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
                    {active ? "✓ " : ""}{opt}
                  </button>
                );
              })}
            </div>
            {(answers[step.id] || []).length > 0 && (
              <button className="hov" onClick={() => advance()} style={S.nextBtn}>Continuar →</button>
            )}
          </>
        )}

        {/* INTENSITY */}
        {step.type === "intensity" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {intensityData.map(item => {
              const active = answers[step.id] === item.label;
              return (
                <button key={item.label} className="hov" onClick={() => handleSelect(item.label)} style={{ padding: "22px 16px", borderRadius: 16, border: `2px solid ${active ? item.color : C.border}`, background: active ? item.bg : C.card, cursor: "pointer", textAlign: "center", fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ fontWeight: 600, color: active ? item.color : C.text, fontSize: 14 }}>{item.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {stepIdx > 0 && <button onClick={() => setStepIdx(i => i - 1)} style={S.backBtn}>← Atrás</button>}
      </div>
    </div>
  );
}

function AdminView({ records, onBack }) {
  const [selectedChild, setSelectedChild] = useState("todos");
  const [analysisResult, setAnalysisResult] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const children = [...new Set(records.map(r => r.child).filter(Boolean))];
  const filtered = selectedChild === "todos" ? records : records.filter(r => r.child === selectedChild);
  const sorted = [...filtered].reverse();

  const fieldMap = { context: "Contexto", who_present: "Presentes", antecedent_state: "Estado previo", antecedent_what: "Antecedente", behavior_type: "Conducta", intensity: "Intensidad", duration: "Duración", consequence: "Consecuencia", outcome: "Resultado" };
  const intColor = { "Leve": "#4ecdc4", "Moderada": "#ffd166", "Intensa": "#ff8c42", "Muy intensa": "#ef476f" };

  const runAnalysis = async () => {
    if (filtered.length < 2) { setAnalysisResult("⚠️ Se necesitan al menos 2 registros."); return; }
    setAnalyzing(true); setAnalysisResult("");
    const text = sorted.slice(0, 25).map((r, i) =>
      `[${i + 1}] ${r.child} | ${r.date || r.saved_at?.slice(0, 10)} | ${r.time_of_day} | ${r.context}
Presentes: ${[].concat(r.who_present || []).join(", ")} | Estado previo: ${r.antecedent_state}
ANTECEDENTE: ${r.antecedent_what}
CONDUCTA: ${[].concat(r.behavior_type || []).join(", ")} (${r.intensity} / ${r.duration})
CONSECUENCIA: ${[].concat(r.consequence || []).join(", ")} → ${r.outcome}`
    ).join("\n\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Eres especialista en ABA. Analiza estos registros ABC de ${selectedChild === "todos" ? "todos los niños" : selectedChild} para un profesional clínico.

${text}

Proporciona:
1. **PATRONES DE ANTECEDENTES**: Desencadenantes más frecuentes, horarios y contextos críticos
2. **ANÁLISIS TOPOGRÁFICO**: Topografías recurrentes, intensidad media, tendencia temporal
3. **HIPÓTESIS FUNCIONAL**: Función probable (atención, escape, acceso tangible, sensorial/automática) con justificación basada en datos
4. **ANÁLISIS DE CONSECUENCIAS**: Patrones de respuesta del cuidador, posibles reforzadores involuntarios
5. **VARIABLES CONTEXTUALES RELEVANTES**: Personas, momentos, estado emocional previo
6. **RECOMENDACIONES DE INTERVENCIÓN**: Estrategias específicas basadas en la hipótesis funcional
7. **PRÓXIMOS PASOS DE EVALUACIÓN**: Qué datos adicionales recoger` }],
        }),
      });
      const data = await res.json();
      setAnalysisResult(data.content?.map(b => b.text || "").join("") || "Error.");
    } catch { setAnalysisResult("Error de conexión."); }
    setAnalyzing(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: C.text, lineHeight: 1.2 }}>Panel profesional</p>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>{records.length} registros · {children.length} perfiles activos</p>
          </div>
          <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 40, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>← Salir</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total registros", val: records.length, color: C.accent },
            { label: "Esta semana", val: records.filter(r => r.saved_at && new Date(r.saved_at) > new Date(Date.now() - 7 * 86400000)).length, color: C.green },
            { label: "Alta intensidad", val: records.filter(r => r.intensity === "Muy intensa" || r.intensity === "Intensa").length, color: "#ef476f" },
            { label: "Perfiles", val: children.length, color: C.blue },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: s.color }}>{s.val}</p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["todos", ...children].map(c => (
            <button key={c} className="hov" onClick={() => setSelectedChild(c)} style={{ padding: "8px 18px", borderRadius: 40, border: `1.5px solid ${selectedChild === c ? C.accent : C.border}`, background: selectedChild === c ? C.accentSoft : "transparent", color: selectedChild === c ? C.accent : C.muted, fontSize: 13, fontWeight: selectedChild === c ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif', transition: 'all 0.18s" }}>
              {c === "todos" ? "Todos" : c}
            </button>
          ))}
        </div>

        {/* Records */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Registros ({filtered.length})</p>
          {sorted.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 16, padding: 32, textAlign: "center", border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: 14 }}>Sin registros para este filtro.</p>
            </div>
          ) : sorted.map(r => (
            <div key={r.id} onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              style={{ background: C.card, borderRadius: 16, padding: "16px 20px", marginBottom: 8, border: `1px solid ${expandedId === r.id ? C.accent + "60" : C.border}`, cursor: "pointer", transition: "border 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: intColor[r.intensity] || C.muted, flexShrink: 0 }} />
                  <span style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{r.child}</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>{r.date || r.saved_at?.slice(0, 10)} · {r.time_of_day}</span>
                </div>
                <span style={{ color: intColor[r.intensity] || C.muted, fontSize: 12, fontWeight: 600 }}>{r.intensity}</span>
              </div>
              {expandedId === r.id && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  {Object.entries(fieldMap).map(([k, label]) => r[k] && (
                    <div key={k} style={{ background: "#13121f", borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 13, color: C.blue, lineHeight: 1.5 }}>{[].concat(r[k]).join(", ")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Analysis */}
        <div style={{ background: C.card, borderRadius: 20, padding: 28, border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: C.text, marginBottom: 6 }}>Análisis clínico IA</p>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Análisis funcional de patrones conductuales para uso profesional</p>
          <button onClick={runAnalysis} disabled={analyzing} className="hov"
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: analyzing ? C.border : `linear-gradient(135deg, ${C.accent}, #ff6b9d)`, color: analyzing ? C.muted : "#fff", fontWeight: 600, fontSize: 15, cursor: analyzing ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
            {analyzing ? "Analizando patrones…" : "Generar análisis clínico →"}
          </button>

          {analyzing && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ width: 34, height: 34, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
              <p style={{ color: C.muted, fontSize: 13, animation: "pulse 2s infinite" }}>Procesando registros y detectando patrones…</p>
            </div>
          )}

          {analysisResult && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
              {analysisResult.split("\n").map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                if (line.startsWith("**") || /^\d+\./.test(line)) return <p key={i} style={{ fontWeight: 700, color: C.accent, fontSize: 15, marginTop: 22, marginBottom: 6 }}>{line.replace(/\*\*/g, "")}</p>;
                if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ color: "#d4d0e8", fontSize: 13, lineHeight: 1.85, paddingLeft: 14, marginBottom: 5 }}>• {line.slice(2)}</p>;
                return <p key={i} style={{ color: "#d4d0e8", fontSize: 13, lineHeight: 1.9, marginBottom: 4 }}>{line}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
