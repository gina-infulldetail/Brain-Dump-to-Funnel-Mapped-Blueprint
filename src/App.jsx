import { useState, useEffect, useRef } from "react";

// ─── FUNNEL STAGES ────────────────────────────────────────────────────────────
const FUNNEL = {
  TOFU: {
    label: "TOFU",
    full: "Awareness",
    sub: "Attract",
    color: "#FDBD97",
    bg: "rgba(253,189,151,0.22)",
    border: "rgba(253,189,151,0.6)",
    glow: "rgba(253,189,151,0.16)",
    pct: 35,
    desc: "Reach new people who don't know you yet. No selling, just content that earns attention.",
  },
  MOFU: {
    label: "MOFU",
    full: "Consideration",
    sub: "Nurture",
    color: "#98B6B1",
    bg: "rgba(152,182,177,0.24)",
    border: "rgba(152,182,177,0.6)",
    glow: "rgba(152,182,177,0.16)",
    pct: 45,
    desc: "Warm your audience. Build trust and educate so they're ready to buy when the time comes.",
  },
  BOFU: {
    label: "BOFU",
    full: "Conversion",
    sub: "Sell",
    color: "#CF8C2E",
    bg: "rgba(207,140,46,0.26)",
    border: "rgba(207,140,46,0.65)",
    glow: "rgba(207,140,46,0.18)",
    pct: 20,
    desc: "Make the ask. Clear offer, clear CTA. This is where followers become clients.",
  },
};

const FORMATS = [
  { id:"F1", label:"FAQ",          funnel:["MOFU","BOFU"] },
  { id:"F2", label:"Myth Bust",    funnel:["TOFU","MOFU"] },
  { id:"F3", label:"How To",       funnel:["TOFU","MOFU"] },
  { id:"F4", label:"List",         funnel:["TOFU","MOFU","BOFU"] },
  { id:"F5", label:"Story",        funnel:["MOFU","TOFU"] },
  { id:"F6", label:"Hot Take",     funnel:["TOFU"] },
  { id:"F7", label:"Before/After", funnel:["MOFU","BOFU"] },
  { id:"F8", label:"Comparison",   funnel:["MOFU","BOFU"] },
];

const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const PILLAR_PALETTES = [
  { bg:"#1E4A4F", accent:"#98B6B1", border:"#377077", dot:"#98B6B1" },
  { bg:"#5C3D14", accent:"#FDBD97", border:"#FDBD97", dot:"#FDBD97" },
  { bg:"#5A3010", accent:"#FDBD97", border:"#FDBD97", dot:"#FDBD97" },
  { bg:"#1C3A3D", accent:"#377077", border:"#5C9AA1", dot:"#98B6B1" },
  { bg:"#4A3A2A", accent:"#FDBD97", border:"#8F7F72", dot:"#FDBD97" },
];

// ─── CALENDAR BUILDER ────────────────────────────────────────────────────────
function buildWeek(days, pillars, weekNum) {
  const tofu = Math.max(1, Math.round(days * 0.35));
  const bofu = Math.max(1, Math.round(days * 0.20));
  const mofu = days - tofu - bofu;

  const tofuPillars = pillars.filter(p => p.funnel === "TOFU");
  const mofuPillars = pillars.filter(p => p.funnel === "MOFU");
  const bofuPillars = pillars.filter(p => p.funnel === "BOFU");

  const fallbackPillar = pillars[0];

  // rotate starting pillar index by week so variety increases across the month
  const rot = (arr, n) => arr.length ? arr.map((_,i)=>arr[(i+n)%arr.length]) : arr;
  const tP = rot(tofuPillars, weekNum);
  const mP = rot(mofuPillars, weekNum);
  const bP = rot(bofuPillars, weekNum);

  const slots = [
    ...Array(tofu).fill(null).map((_, i) => ({ pillar: tP[i % (tP.length || 1)] || fallbackPillar, stage:"TOFU" })),
    ...Array(mofu).fill(null).map((_, i) => ({ pillar: mP[i % (mP.length || 1)] || fallbackPillar, stage:"MOFU" })),
    ...Array(bofu).fill(null).map((_, i) => ({ pillar: bP[i % (bP.length || 1)] || fallbackPillar, stage:"BOFU" })),
  ];

  const ordered = [
    ...slots.filter(s => s.stage === "TOFU").slice(0, 1),
    ...slots.filter(s => s.stage === "MOFU").slice(0, 1),
    ...slots.filter(s => s.stage === "BOFU").slice(0, 1),
    ...slots.filter(s => s.stage === "TOFU").slice(1),
    ...slots.filter(s => s.stage === "MOFU").slice(1),
    ...slots.filter(s => s.stage === "BOFU").slice(1),
  ].slice(0, days);

  while (ordered.length < days) ordered.push(slots[ordered.length % slots.length]);

  const fmtByStage = { TOFU:["F6","F3","F2","F4"], MOFU:["F7","F5","F8","F1","F4"], BOFU:["F7","F1","F4","F8"] };

  return ordered.map((s, i) => {
    const fmtIds = fmtByStage[s.stage];
    // offset format rotation by week so the same day doesn't always get the same format
    const fmt = FORMATS.find(f => f.id === fmtIds[(i + weekNum) % fmtIds.length]);
    return {
      day: DAY_NAMES[i],
      week: weekNum + 1,
      pillar: s.pillar,
      format: fmt,
      stage: s.stage,
      combo: `${s.pillar?.shortName || "P?"} + ${fmt.id}`,
    };
  });
}

function buildCalendar(days, pillars) {
  if (!pillars?.length) return [];
  const weeks = [];
  for (let w = 0; w < 4; w++) weeks.push(buildWeek(days, pillars, w));
  return weeks; // array of 4 arrays
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function FunnelBadge({ stage, tiny }) {
  const f = FUNNEL[stage];
  if (!f) return null;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize: tiny ? 9 : 10, padding: tiny ? "2px 6px" : "3px 9px",
      borderRadius:4, fontFamily:"'Montserrat', sans-serif", fontWeight:700,
      letterSpacing:1.2, textTransform:"uppercase",
      background: f.bg, color: f.color, border:`1px solid ${f.border}`,
    }}>
      {f.label}
      {!tiny && <span style={{ opacity:0.6, fontWeight:400 }}> · {f.sub}</span>}
    </span>
  );
}

function DumpBox({ label, hint, value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) { ref.current.style.height="auto"; ref.current.style.height = ref.current.scrollHeight+"px"; }
  }, [value]);
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ marginBottom:6 }}>
        <div style={{ fontSize:13, color:"#F6F4F1", fontWeight:600, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:11, color:"#4A4A5A", letterSpacing:0.3 }}>{hint}</div>
      </div>
      <textarea ref={ref} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} rows={3}
        style={{
          width:"100%", padding:"13px 15px", borderRadius:10, boxSizing:"border-box",
          border:"1.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)",
          color:"#E8E4DC", fontSize:13.5, outline:"none", resize:"none", overflow:"hidden",
          fontFamily:"'Poppins', sans-serif", lineHeight:1.7, transition:"border 0.2s",
        }}
        onFocus={e=>e.target.style.border="1.5px solid rgba(253,189,151,0.7)"}
        onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.07)"}
      />
    </div>
  );
}

function PillarCard({ pillar, index, visible }) {
  const c = PILLAR_PALETTES[index % PILLAR_PALETTES.length];
  const f = FUNNEL[pillar.funnel] || FUNNEL.MOFU;
  return (
    <div style={{
      background:c.bg, border:`1px solid ${c.border}`, borderRadius:12,
      padding:"20px 22px", marginBottom:10,
      borderLeft:`3px solid ${f.color}`,
      opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(16px)",
      transition:`opacity 0.4s ${index*0.12}s, transform 0.4s ${index*0.12}s`,
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8, gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
            <FunnelBadge stage={pillar.funnel} />
            <span style={{ fontSize:10, color:"#A8978A", fontFamily:"'Montserrat', sans-serif" }}>{f.pct}% of content</span>
          </div>
          <div style={{ fontSize:17, color:"#F6F4F1", letterSpacing:-0.3, fontFamily:"'Montserrat', sans-serif", fontWeight:600 }}>{pillar.name}</div>
        </div>
        <div style={{ fontSize:26, flexShrink:0 }}>{pillar.emoji}</div>
      </div>
      <p style={{ fontSize:13, color:"#D6CFC7", lineHeight:1.65, margin:"0 0 14px" }}>{pillar.description}</p>
      <div style={{ borderTop:`1px solid ${c.border}`, paddingTop:12 }}>
        <div style={{ fontSize:9, color:f.color, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:8, fontWeight:700 }}>Post Ideas</div>
        {pillar.examples.map((ex, i) => (
          <div key={i} style={{ display:"flex", gap:9, marginBottom:5, alignItems:"flex-start" }}>
            <span style={{ fontSize:10, color:f.color, fontFamily:"'Montserrat', sans-serif", marginTop:2, flexShrink:0 }}>→</span>
            <span style={{ fontSize:12, color:"#A0A0A0", lineHeight:1.55 }}>{ex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FUNNEL BAR ───────────────────────────────────────────────────────────────
function FunnelBar({ days, pillars }) {
  const tofu = Math.max(1, Math.round(days * 0.35));
  const bofu = Math.max(1, Math.round(days * 0.20));
  const mofu = days - tofu - bofu;
  const segments = [
    { stage:"TOFU", count:tofu },
    { stage:"MOFU", count:mofu },
    { stage:"BOFU", count:bofu },
  ];
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:9, color:"#A8978A", letterSpacing:2, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:8 }}>Weekly Funnel Split</div>
      <div style={{ display:"flex", height:10, borderRadius:6, overflow:"hidden", gap:2 }}>
        {segments.map(s => {
          const f = FUNNEL[s.stage];
          return <div key={s.stage} style={{ flex:s.count, background:f.color, opacity:0.85, borderRadius:2 }} />;
        })}
      </div>
      <div style={{ display:"flex", gap:14, marginTop:10, flexWrap:"wrap" }}>
        {segments.map(s => {
          const f = FUNNEL[s.stage];
          return (
            <div key={s.stage} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:f.color, flexShrink:0 }} />
              <span style={{ fontSize:10, color:"#B5A89C", fontFamily:"'Montserrat', sans-serif" }}>
                <span style={{ color:f.color, fontWeight:700 }}>{f.full}</span>
                {" "}{s.count}x · {Math.round(s.count/days*100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ANALYZING ───────────────────────────────────────────────────────────────
function Analyzing({ msg }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 0" }}>
      <div style={{ fontSize:38, marginBottom:20 }}>🧠</div>
      <div style={{ fontSize:13, color:"#C2B7AD", fontFamily:"'Montserrat', sans-serif", letterSpacing:1, marginBottom:20 }}>{msg}</div>
      <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#FDBD97",
            animation:`dp 1.2s ${i*0.2}s ease-in-out infinite` }} />
        ))}
      </div>
      <style>{`@keyframes dp{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ─── VOICE OPTIONS ────────────────────────────────────────────────────────────
const VOICE_AXES = [
  {
    key: "formality",
    label: "Formality",
    left: "Casual",
    right: "Polished",
  },
  {
    key: "energy",
    label: "Energy",
    left: "Calm & steady",
    right: "High energy",
  },
  {
    key: "directness",
    label: "Directness",
    left: "Gentle",
    right: "Blunt",
  },
  {
    key: "humor",
    label: "Humor",
    left: "Serious",
    right: "Playful",
  },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Days","Brain Dump","Voice","Pillars","Blueprint"];

export default function App() {
  const [step, setStep]           = useState(0);
  const [animIn, setAnimIn]       = useState(true);
  const [days, setDays]           = useState(null);
  const [expertise, setExpertise] = useState("");
  const [interests, setInterests] = useState("");
  const [business, setBusiness]   = useState("");
  const [offers, setOffers]       = useState("");
  const [voiceSliders, setVoiceSliders] = useState({ formality:50, energy:50, directness:50, humor:50 });
  const [voiceWords, setVoiceWords]     = useState("");
  const [voiceAvoid, setVoiceAvoid]     = useState("");
  const [pillars, setPillars]     = useState(null);
  const [insight, setInsight]     = useState("");
  const [calendar, setCalendar]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadMsg, setLoadMsg]     = useState("");
  const [pillarsVisible, setPillarsVisible] = useState(false);
  const [tab, setTab]             = useState("pillars");

  const go = n => { setAnimIn(false); setTimeout(()=>{ setStep(n); setAnimIn(true); }, 180); };

  // ── build voice profile string ────────────────────────────────────────────
  const buildVoiceProfile = () => {
    const describe = (key, val) => {
      const axis = VOICE_AXES.find(a=>a.key===key);
      if (val <= 30) return axis.left;
      if (val >= 70) return axis.right;
      return `balanced between ${axis.left.toLowerCase()} and ${axis.right.toLowerCase()}`;
    };
    let s = `Tone: ${describe("formality", voiceSliders.formality)}. `;
    s += `Energy: ${describe("energy", voiceSliders.energy)}. `;
    s += `Directness: ${describe("directness", voiceSliders.directness)}. `;
    s += `Humor: ${describe("humor", voiceSliders.humor)}.`;
    if (voiceWords.trim()) s += `\nWords/phrases that sound like them: ${voiceWords.trim()}`;
    if (voiceAvoid.trim()) s += `\nAvoid: ${voiceAvoid.trim()}`;
    return s;
  };

  // ── AI: identify pillars ──────────────────────────────────────────────────
  const analyzeDump = async () => {
    setLoading(true);
    const msgs = ["Reading your brain dump...","Finding the patterns...","Naming your pillars...","Almost there..."];
    let mi = 0; setLoadMsg(msgs[0]);
    const iv = setInterval(()=>{ mi=(mi+1)%msgs.length; setLoadMsg(msgs[mi]); }, 1800);

    const prompt = `You are a content strategist who specializes in sales funnel content frameworks. Analyze this brain dump and define exactly 4 or 5 content pillars. Each pillar must be assigned to a funnel stage: TOFU, MOFU, or BOFU.

FUNNEL RULES (strict):
- TOFU (Awareness/Attract): 35% of content. Reaches cold audiences. No selling. Shareable, discoverable, opinionated content.
- MOFU (Consideration/Nurture): 45% of content. Warms warm audiences. Builds trust and educates. Moves them toward a decision.
- BOFU (Conversion/Sell): 20% of content. Direct offers, CTAs, results. Only 1 pillar should be BOFU.

BRAIN DUMP:
Expertise: ${expertise}
Topics they love: ${interests}
What helps their business: ${business}
Offers: ${offers}

VOICE PROFILE (write all examples in this voice):
${buildVoiceProfile()}

Rules:
- Name each pillar in a way a total beginner would instantly understand. Lean toward clear, friendly, slightly broad names over clever or niche-specific jargon (e.g. "Tips & How-Tos", "Client Wins", "Behind the Scenes", "Your Offers" are good directions) — but still flavor the name and description with details from THIS person's world so it doesn't feel generic
- One pillar = BOFU (tied to their actual offers), one or two = TOFU, rest = MOFU
- Give each pillar: a simple, clear name (2-4 words), emoji, 1-2 sentence description written so a newbie immediately gets the idea, funnel stage, 3 specific post idea examples
- Examples must be specific to their actual expertise, not generic, and written in their voice per the voice profile above
- Write a 2-sentence strategic insight about their content identity, also in their voice, explained simply
- No em dashes anywhere in the response

Return ONLY valid JSON:
{
  "insight": "...",
  "pillars": [
    {
      "name": "...",
      "shortName": "P1",
      "emoji": "...",
      "description": "...",
      "funnel": "TOFU",
      "examples": ["...", "...", "..."]
    }
  ]
}`;

    try {
      const res = await fetch("/api/claude",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ max_tokens:1200, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      parsed.pillars = parsed.pillars.map((p,i)=>({...p, shortName:`P${i+1}`}));
      clearInterval(iv);
      setPillars(parsed.pillars);
      setInsight(parsed.insight);
      setLoading(false);
      go(2);
      setTimeout(()=>setPillarsVisible(true), 300);
    } catch(e) {
      clearInterval(iv);
      const fallback = [
        {name:"Your Hot Takes",shortName:"P1",emoji:"🔥",funnel:"TOFU",description:"Opinionated, shareable content that earns new eyes. No selling — just magnetism.",examples:["An industry belief you think is completely wrong","The thing no one wants to say out loud in your space","Why most people fail at this — your real answer"]},
        {name:"Your Framework",shortName:"P2",emoji:"🧠",funnel:"TOFU",description:"Your methodology made visible. Teach the way you think so people understand your value.",examples:["Break down your step-by-step process","The one question you always ask first","A concept your industry overcomplicates"]},
        {name:"Trust Builders",shortName:"P3",emoji:"📈",funnel:"MOFU",description:"Results, proof, and depth that move warm followers toward a buying decision.",examples:["A before/after client result with specifics","An objection you hear and how you address it","What working with you actually looks like"]},
        {name:"Their Reality",shortName:"P4",emoji:"🪞",funnel:"MOFU",description:"Content that makes your audience feel deeply seen. Mirror their world.",examples:["A struggle they haven't named yet","The comparison trap they fall into","Why they keep staying stuck despite trying"]},
        {name:"The Offer",shortName:"P5",emoji:"💼",funnel:"BOFU",description:"Direct, confident promotion. Clear outcome, clear CTA, no apology.",examples:["What's inside your offer and who it's for","An FAQ that pre-sells your service","A time-sensitive reason to act now"]},
      ];
      setPillars(fallback);
      setInsight("Your expertise spans education and proof, which is a powerful combination. The key is making sure your TOFU content earns attention from strangers, not just validates people who already follow you.");
      setLoading(false);
      go(2);
      setTimeout(()=>setPillarsVisible(true), 300);
    }
  };

  // ── AI: generate post ideas ───────────────────────────────────────────────
  const buildBlueprint = async () => {
    setLoading(true); setLoadMsg("Building your monthly blueprint...");
    const weeks = buildCalendar(days, pillars);
    const flat = weeks.flat();

    const prompt = `Content strategist. One specific post idea per day for a full month (4 weeks). Tied to their niche and offers. Direct, no fluff, no em dashes. Vary the ideas across the month so weeks don't repeat the same idea even when the pillar/format combo repeats.

Offers: ${offers}
Pillars: ${pillars.map(p=>`${p.name} (${p.funnel})`).join(", ")}

VOICE PROFILE (write every idea in this voice):
${buildVoiceProfile()}

Days:
${flat.map((d,i)=>`${i+1}. Week ${d.week}, ${d.day}: "${d.pillar.name}" pillar, ${d.format.label} format, ${d.stage} stage`).join("\n")}

Return ONLY valid JSON:
{ "postIdeas": ["idea 1", "idea 2", ...] }`;

    try {
      const res = await fetch("/api/claude",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ max_tokens:3000, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      flat.forEach((d,i)=>{ d.postIdea = parsed.postIdeas?.[i]||""; });
    } catch(e) { flat.forEach(d=>{ d.postIdea=""; }); }

    setCalendar(weeks); setLoading(false); setTab("blueprint"); go(3);
  };

  const canDump = (expertise.trim()||interests.trim()||business.trim()) && !loading;
  const sellCount = days ? Math.max(1, Math.round(days*0.20)) : null;
  const tofuCount = days ? Math.max(1, Math.round(days*0.35)) : null;
  const mofuCount = days ? days - sellCount - tofuCount : null;

  return (
    <div style={{ minHeight:"100vh", background:"#2B2B2B", fontFamily:"'Poppins', sans-serif", color:"#F6F4F1", overflowX:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 10% 20%, rgba(253,189,151,0.06) 0%,transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(152,182,177,0.06) 0%,transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(207,140,46,0.05) 0%,transparent 60%)" }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:700, margin:"0 auto", padding:"36px 22px 80px" }}>

        {/* ── header ── */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            display:"inline-block", fontSize:10, letterSpacing:5, color:"#2B2B2B",
            textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:14,
            fontWeight:700, background:"#FDBD97", padding:"5px 14px", borderRadius:20,
          }}>Content Matrix</div>
          <h1 style={{ fontSize:"clamp(28px,6vw,46px)", fontWeight:700, margin:"0 0 10px", lineHeight:1.1, letterSpacing:"-1px", fontFamily:"'Montserrat', sans-serif" }}>
            Brain Dump to<br/>
            <span style={{ color:"#FDBD97" }}>Funnel-Mapped</span> Blueprint
          </h1>
          <p style={{ fontSize:13, color:"#C2B7AD", margin:0, fontWeight:500 }}>TOFU · MOFU · BOFU — built from your brain, not a template</p>
        </div>

        {/* ── funnel legend ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:36 }}>
          {Object.entries(FUNNEL).map(([k,f])=>(
            <div key={k} style={{ background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:f.color, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", fontWeight:700, marginBottom:4 }}>{f.label}</div>
              <div style={{ fontSize:14, color:"#F6F4F1", marginBottom:2, fontWeight:600, fontFamily:"'Montserrat', sans-serif" }}>{f.full}</div>
              <div style={{ fontSize:11, color:"#E8E4DC", fontFamily:"'Montserrat', sans-serif", fontWeight:500, marginBottom:6 }}>{f.pct}% · {f.sub}</div>
              <div style={{ fontSize:11, color:"#D6CFC7", lineHeight:1.5, fontWeight:400 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── stepper ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:32 }}>
          {STEP_LABELS.map((label,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center" }}>
              <div onClick={()=>{ if(i<step) go(i); }} style={{
                width:28, height:28, borderRadius:"50%", flexShrink:0,
                background: i===step?"#FDBD97":i<step?"rgba(253,189,151,0.28)":"transparent",
                border: i<step?"1.5px solid #FDBD97":i===step?"none":"1.5px solid #3F3F3F",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontFamily:"'Montserrat', sans-serif",
                color: i===step?"#2B2B2B":i<step?"#F6F4F1":"#9C8D7F",
                cursor: i<step?"pointer":"default", transition:"all 0.3s",
              }}>
                {i<step ? <span style={{ fontSize:12, color:"#FDBD97" }}>✓</span> : i+1}
              </div>
              {i<STEP_LABELS.length-1 && (
                <div style={{ width:24, height:1, background: i<step?"rgba(253,189,151,0.6)":"#3A3A3A", margin:"0 2px" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── card ── */}
        <div style={{
          background:"rgba(255,255,255,0.022)", border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:16, padding:"34px 30px",
          opacity:animIn?1:0, transform:animIn?"translateY(0)":"translateY(10px)",
          transition:"opacity 0.2s, transform 0.2s",
        }}>

          {/* STEP 0 ── DAYS */}
          {step===0 && (
            <div>
              <h2 style={{ fontSize:19, fontWeight:600, marginBottom:6, fontFamily:"'Montserrat', sans-serif" }}>How many days a week do you post?</h2>
              <p style={{ fontSize:13, color:"#B5A89C", marginBottom:26, lineHeight:1.65 }}>
                Your TOFU / MOFU / BOFU split will be calculated automatically.
              </p>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:7, marginBottom:20 }}>
                {[1,2,3,4,5,6,7].map(n=>(
                  <button key={n} onClick={()=>setDays(n)} style={{
                    padding:"15px 4px", cursor:"pointer", transition:"all 0.15s", fontFamily:"'Poppins', sans-serif",
                    border: days===n?"1.5px solid #FDBD97":"1.5px solid rgba(255,255,255,0.07)",
                    borderRadius:9, background: days===n?"rgba(253,189,151,0.22)":"rgba(255,255,255,0.02)",
                    color: days===n?"#FDBD97":"#B5A89C", fontSize:19,
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  }}>
                    {n}
                    <span style={{ fontSize:8, letterSpacing:1, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", opacity:0.6 }}>{DAY_NAMES[n-1].slice(0,3)}</span>
                  </button>
                ))}
              </div>

              {days && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:22 }}>
                  {[
                    { stage:"TOFU", count:tofuCount },
                    { stage:"MOFU", count:mofuCount },
                    { stage:"BOFU", count:sellCount },
                  ].map(({stage,count})=>{
                    const f = FUNNEL[stage];
                    return (
                      <div key={stage} style={{ background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:9, color:f.color, letterSpacing:2.5, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", fontWeight:700, marginBottom:4 }}>{f.label}</div>
                        <div style={{ fontSize:22, color:"#F6F4F1", marginBottom:2 }}>{count}x</div>
                        <div style={{ fontSize:10, color:"#A8978A", fontFamily:"'Montserrat', sans-serif" }}>{Math.round(count/days*100)}% · {f.sub}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Btn disabled={!days} onClick={()=>go(1)}>Continue →</Btn>
            </div>
          )}

          {/* STEP 1 ── BRAIN DUMP */}
          {step===1 && (
            <div>
              <h2 style={{ fontSize:19, fontWeight:600, marginBottom:6, fontFamily:"'Montserrat', sans-serif" }}>Brain dump everything.</h2>
              <p style={{ fontSize:13, color:"#B5A89C", marginBottom:26, lineHeight:1.65 }}>
                Don't filter yourself. We'll read it all, find the patterns, and define your exact content pillars — each mapped to the right funnel stage.
              </p>

              <DumpBox label="What are you an expert in?" hint="Your skills, credentials, experience, knowledge" value={expertise} onChange={setExpertise}
                placeholder="e.g. brand photography, helping women feel confident on camera, lighting, storytelling, 10 years in beauty, L'Oréal educator, content strategy, Notion systems, social media..." />
              <DumpBox label="What do you want to post about?" hint="Topics you love, things you could talk about forever" value={interests} onChange={setInterests}
                placeholder="e.g. behind the scenes of brand shoots, mindset around visibility, showing up authentically online, productivity for entrepreneurs, systems, content batching..." />
              <DumpBox label="What helps your business grow?" hint="What converts followers, brings in clients, builds trust" value={business} onChange={setBusiness}
                placeholder="e.g. showing client results, educating on why brand photos matter, sharing my process, demystifying pricing, before/after, testimonials..." />

              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:13, color:"#F6F4F1", fontWeight:600, marginBottom:6 }}>What are your main offers?</div>
                <textarea value={offers} onChange={e=>setOffers(e.target.value)} rows={2}
                  placeholder="e.g. Brand photography packages, Content strategy retainer, Content Clarity Workshop, Notion system builds..."
                  style={{ width:"100%", padding:"13px 15px", borderRadius:10, boxSizing:"border-box",
                    border:"1.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)",
                    color:"#E8E4DC", fontSize:13.5, outline:"none", resize:"vertical",
                    fontFamily:"'Poppins', sans-serif", lineHeight:1.65, transition:"border 0.2s" }}
                  onFocus={e=>e.target.style.border="1.5px solid rgba(253,189,151,0.7)"}
                  onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.07)"}
                />
              </div>

              <div style={{ display:"flex", gap:9 }}>
                <BackBtn onClick={()=>go(0)} />
                <Btn disabled={!canDump} onClick={()=>go(1.6)}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* STEP 1.6 ── VOICE */}
          {step===1.6 && (
            <div>
              <h2 style={{ fontSize:19, fontWeight:600, marginBottom:6, fontFamily:"'Montserrat', sans-serif" }}>What's your voice?</h2>
              <p style={{ fontSize:13, color:"#B5A89C", marginBottom:26, lineHeight:1.65 }}>
                This shapes how every post idea sounds. Drag each slider to match how you actually talk.
              </p>

              {VOICE_AXES.map(axis=>(
                <div key={axis.key} style={{ marginBottom:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:12, color:"#F6F4F1", fontWeight:600 }}>{axis.label}</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={voiceSliders[axis.key]}
                    onChange={e=>setVoiceSliders(v=>({...v,[axis.key]:Number(e.target.value)}))}
                    style={{ width:"100%", accentColor:"#FDBD97", cursor:"pointer" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <span style={{ fontSize:10, color:"#A8978A", fontFamily:"'Montserrat', sans-serif", letterSpacing:0.5 }}>{axis.left}</span>
                    <span style={{ fontSize:10, color:"#A8978A", fontFamily:"'Montserrat', sans-serif", letterSpacing:0.5 }}>{axis.right}</span>
                  </div>
                </div>
              ))}

              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, color:"#F6F4F1", fontWeight:600, marginBottom:6 }}>Words or phrases that sound like you</div>
                <div style={{ fontSize:11, color:"#A8978A", marginBottom:8 }}>Things you say a lot, brand phrases, your style of slang</div>
                <textarea value={voiceWords} onChange={e=>setVoiceWords(e.target.value)} rows={2}
                  placeholder="e.g. built for business owners who have sh*t to do, cool girl who knows her stuff, let's get into it..."
                  style={{ width:"100%", padding:"13px 15px", borderRadius:10, boxSizing:"border-box",
                    border:"1.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)",
                    color:"#E8E4DC", fontSize:13.5, outline:"none", resize:"vertical",
                    fontFamily:"'Poppins', sans-serif", lineHeight:1.65, transition:"border 0.2s" }}
                  onFocus={e=>e.target.style.border="1.5px solid rgba(253,189,151,0.7)"}
                  onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.07)"}
                />
              </div>

              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:12, color:"#F6F4F1", fontWeight:600, marginBottom:6 }}>Words, phrases, or vibes to avoid</div>
                <div style={{ fontSize:11, color:"#A8978A", marginBottom:8 }}>Things that feel off-brand, fluffy, or just not you</div>
                <textarea value={voiceAvoid} onChange={e=>setVoiceAvoid(e.target.value)} rows={2}
                  placeholder="e.g. no em dashes, no corporate jargon, nothing that sounds like a LinkedIn post, no 'unlock your potential' type phrases..."
                  style={{ width:"100%", padding:"13px 15px", borderRadius:10, boxSizing:"border-box",
                    border:"1.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)",
                    color:"#E8E4DC", fontSize:13.5, outline:"none", resize:"vertical",
                    fontFamily:"'Poppins', sans-serif", lineHeight:1.65, transition:"border 0.2s" }}
                  onFocus={e=>e.target.style.border="1.5px solid rgba(253,189,151,0.7)"}
                  onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.07)"}
                />
              </div>

              <div style={{ display:"flex", gap:9 }}>
                <BackBtn onClick={()=>go(1)} />
                <Btn disabled={loading} onClick={()=>{ go(1.5); setTimeout(analyzeDump, 50); }}>{loading ? loadMsg : "Find My Pillars →"}</Btn>
              </div>
            </div>
          )}

          {/* STEP 1.5 ── ANALYZING */}
          {step===1.5 && <Analyzing msg={loadMsg} />}

          {/* STEP 2 ── PILLARS */}
          {step===2 && pillars && (
            <div>
              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:9, color:"#FDBD97", letterSpacing:3, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:7, fontWeight:700 }}>Your Content Identity</div>
                <p style={{ fontSize:13.5, color:"#D6CFC7", lineHeight:1.7, margin:0, fontStyle:"italic" }}>{insight}</p>
              </div>

              <FunnelBar days={days} pillars={pillars} />

              <div style={{ fontSize:9, color:"#FDBD97", letterSpacing:3, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:12, fontWeight:700 }}>Your Content Pillars</div>
              {pillars.map((p,i)=><PillarCard key={i} pillar={p} index={i} visible={pillarsVisible} />)}

              <div style={{ display:"flex", gap:9, marginTop:6 }}>
                <BackBtn onClick={()=>go(1.6)} label="← Edit Voice" />
                <Btn disabled={loading} onClick={buildBlueprint}>{loading ? loadMsg : "Build My Blueprint →"}</Btn>
              </div>
            </div>
          )}

          {/* STEP 3 ── BLUEPRINT */}
          {step===3 && calendar && (
            <BlueprintView
              calendar={calendar} pillars={pillars} days={days}
              insight={insight} tab={tab} setTab={setTab}
              onBack={()=>go(2)} onReset={()=>{ setStep(0); setDays(null); setExpertise(""); setInterests(""); setBusiness(""); setOffers(""); setVoiceSliders({formality:50,energy:50,directness:50,humor:50}); setVoiceWords(""); setVoiceAvoid(""); setPillars(null); setCalendar(null); setInsight(""); setPillarsVisible(false); setTab("pillars"); setAnimIn(true); }}
            />
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:9, color:"#3A3A3A", marginTop:22, fontFamily:"'Montserrat', sans-serif", letterSpacing:3, textTransform:"uppercase" }}>
          TOFU 35% · MOFU 45% · BOFU 20%
        </p>
      </div>
    </div>
  );
}

// ─── BLUEPRINT VIEW ───────────────────────────────────────────────────────────
function BlueprintView({ calendar, pillars, days, insight, tab, setTab, onBack, onReset }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const tofu = Math.max(1, Math.round(days*0.35));
  const bofu = Math.max(1, Math.round(days*0.20));
  const mofu = days-tofu-bofu;
  const weekCal = calendar[activeWeek] || [];

  return (
    <div>
      {/* tabs */}
      <div style={{ display:"flex", gap:3, marginBottom:24, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:4 }}>
        {[{id:"pillars",label:"Pillars"},{id:"blueprint",label:"Calendar"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:"9px", border:"none", borderRadius:8,
            background: tab===t.id?"rgba(253,189,151,0.28)":"transparent",
            color: tab===t.id?"#FDBD97":"#A8978A",
            fontSize:11, cursor:"pointer", letterSpacing:2, textTransform:"uppercase",
            fontFamily:"'Montserrat', sans-serif", fontWeight: tab===t.id?700:400, transition:"all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="pillars" && (
        <div>
          <div style={{ fontSize:9, color:"#FDBD97", letterSpacing:3, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:12, fontWeight:700 }}>Your Content Pillars</div>
          {pillars.map((p,i)=><PillarCard key={i} pillar={p} index={i} visible={true} />)}
        </div>
      )}

      {tab==="blueprint" && (
        <div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:9, color:"#FDBD97", letterSpacing:3, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:7, fontWeight:700 }}>Strategic Insight</div>
            <p style={{ fontSize:13, color:"#CFC6BD", lineHeight:1.7, margin:0, fontStyle:"italic" }}>{insight}</p>
          </div>

          {/* stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
            {[
              { stage:"TOFU", count:tofu },
              { stage:"MOFU", count:mofu },
              { stage:"BOFU", count:bofu },
            ].map(({stage,count})=>{
              const f=FUNNEL[stage];
              return (
                <div key={stage} style={{ background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:10, padding:"12px", textAlign:"center" }}>
                  <div style={{ fontSize:9, color:f.color, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", fontWeight:700, marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:22, color:"#F6F4F1", marginBottom:2 }}>{count}x</div>
                  <div style={{ fontSize:10, color:"#A8978A", fontFamily:"'Montserrat', sans-serif" }}>per week · {f.sub}</div>
                </div>
              );
            })}
          </div>

          {/* week selector */}
          <div style={{ display:"flex", gap:6, marginBottom:18 }}>
            {[0,1,2,3].map(w=>(
              <button key={w} onClick={()=>setActiveWeek(w)} style={{
                flex:1, padding:"10px 4px", borderRadius:8,
                border: activeWeek===w ? "1.5px solid #FDBD97" : "1.5px solid rgba(255,255,255,0.07)",
                background: activeWeek===w ? "rgba(253,189,151,0.22)" : "rgba(255,255,255,0.02)",
                color: activeWeek===w ? "#FDBD97" : "#B5A89C",
                fontSize:11, fontFamily:"'Montserrat', sans-serif", letterSpacing:1.5, textTransform:"uppercase",
                cursor:"pointer", fontWeight: activeWeek===w?700:400, transition:"all 0.15s",
              }}>Week {w+1}</button>
            ))}
          </div>

          <div style={{ fontSize:9, color:"#FDBD97", letterSpacing:3, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif", marginBottom:12, fontWeight:700 }}>Week {activeWeek+1} Calendar</div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
            {weekCal.map((item,i)=>{
              const f = FUNNEL[item.stage];
              const pidx = pillars.findIndex(p=>p.shortName===item.pillar?.shortName);
              const pal = PILLAR_PALETTES[pidx%PILLAR_PALETTES.length];
              return (
                <div key={i} style={{
                  background:"rgba(255,255,255,0.018)", border:"1px solid rgba(255,255,255,0.055)",
                  borderRadius:10, padding:"14px 16px", borderLeft:`3px solid ${f.color}`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:"#F6F4F1", fontFamily:"'Montserrat', sans-serif", fontWeight:700, minWidth:72 }}>{item.day}</span>
                    <span style={{ fontSize:11, color:pal.accent, fontFamily:"'Montserrat', sans-serif", fontWeight:700 }}>{item.combo}</span>
                    <FunnelBadge stage={item.stage} tiny />
                  </div>
                  <div style={{ fontSize:12, color:"#C2B7AD", marginBottom: item.postIdea?6:0 }}>
                    {item.pillar?.name} · {item.format?.label}
                  </div>
                  {item.postIdea && (
                    <div style={{ fontSize:12, color:"#B5A89C", fontStyle:"italic", lineHeight:1.55 }}>"{item.postIdea}"</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:9, marginTop:4 }}>
        <BackBtn onClick={onBack} label="← Pillars" />
        <button onClick={onReset} style={{
          flex:1, padding:"12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)",
          background:"transparent", color:"#A8978A", fontSize:11, cursor:"pointer",
          letterSpacing:2, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif",
        }}>Start Over</button>
      </div>
    </div>
  );
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function Btn({ children, disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      flex:1, width:"100%", padding:"13px", borderRadius:10, border:"none",
      background: disabled?"rgba(255,255,255,0.04)":"#FDBD97",
      color: disabled?"#454545":"#2B2B2B", fontSize:12, fontWeight:700,
      cursor: disabled?"not-allowed":"pointer",
      letterSpacing:2, textTransform:"uppercase", fontFamily:"'Montserrat', sans-serif",
      transition:"all 0.2s",
    }}>{children}</button>
  );
}
function BackBtn({ onClick, label="← Back" }) {
  return (
    <button onClick={onClick} style={{
      padding:"13px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)",
      background:"transparent", color:"#B5A89C", fontSize:11, cursor:"pointer",
      fontFamily:"'Montserrat', sans-serif", letterSpacing:1, whiteSpace:"nowrap",
    }}>{label}</button>
  );
}
