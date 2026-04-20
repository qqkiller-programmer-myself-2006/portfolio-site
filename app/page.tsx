"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import profile from "@/profile.json";
import worksData from "@/works.json";

type Lang = "th" | "en";

/* ── Intersection observer hook for scroll animations ── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const { ref, visible } = useVisible();
  return (
    <section id={id} className={`section ${className}`}>
      <div ref={ref} className={`container fade-up ${visible ? "visible" : ""}`}>{children}</div>
    </section>
  );
}

/* ── Contact Form ── */
function ContactForm({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [st, setSt] = useState<"idle"|"loading"|"success"|"error">("idle");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSt("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setSt((await res.json()).success ? "success" : "error");
    } catch { setSt("error"); }
  }

  const cls = "w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm outline-none focus:border-indigo-500 transition-colors";

  if (st === "success") return (
    <div className="text-center py-10 glass rounded-2xl">
      <p className="text-3xl mb-2">🎉</p>
      <p className="text-green-400 font-semibold">{lang === "th" ? "ส่งข้อความสำเร็จ! จะติดต่อกลับเร็วๆ นี้" : "Message sent! I'll reply soon."}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg mx-auto">
      <input value={form.name} onChange={e => set("name", e.target.value)} placeholder={lang === "th" ? "ชื่อของคุณ *" : "Your name *"} required className={cls} />
      <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="Email *" required className={cls} />
      <textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder={lang === "th" ? "รายละเอียดงาน *" : "Project details *"} required rows={4} className={`${cls} resize-none`} />
      <button type="submit" disabled={st === "loading"} className="py-3 rounded-xl font-semibold text-white disabled:opacity-60 hover:scale-[1.02] active:scale-95 transition-all" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontFamily: "'Prompt',sans-serif" }}>
        {st === "loading" ? "..." : lang === "th" ? "ส่งข้อความ" : "Send Message"}
      </button>
      {st === "error" && <p className="text-red-400 text-sm text-center">{lang === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่" : "Error. Please try again."}</p>}
    </form>
  );
}

/* ── Main Page ── */
export default function PortfolioPage() {
  const [lang, setLang] = useState<Lang>("th");
  const [cat, setCat] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const t = (th: string, en: string) => lang === "th" ? th : en;

  const filtered = cat === "all" ? worksData.works : worksData.works.filter(w => w.category === cat);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#050510]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#hero" className="font-bold text-indigo-400" style={{ fontFamily: "'Prompt',sans-serif" }}>
            {profile.nickname}.dev
          </a>
          <div className="flex items-center gap-5">
            {["about","skills","works","contact"].map(s => (
              <a key={s} href={`#${s}`} className="nav-link hidden sm:block capitalize">
                {t(
                  s === "about" ? "เกี่ยวกับ" : s === "skills" ? "ทักษะ" : s === "works" ? "ผลงาน" : "ติดต่อ",
                  s.charAt(0).toUpperCase() + s.slice(1)
                )}
              </a>
            ))}
            <button onClick={() => setLang(l => l === "th" ? "en" : "th")} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-white transition-colors">
              {lang === "th" ? "EN" : "TH"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="section pt-32">
        <div className="container flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("พร้อมรับงาน", "Available for work")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Prompt',sans-serif" }}>
              {t(`สวัสดี ผม${profile.nickname}`, `Hi, I'm ${profile.nickname}`)} 👋
            </h1>
            <p className="text-xl text-indigo-400 font-semibold mb-4">{profile.role}</p>
            <p className="text-slate-400 leading-relaxed mb-8 whitespace-pre-line">{t(profile.bio, profile.bioEn)}</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {profile.stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-bold text-indigo-400" style={{ fontFamily: "'Prompt',sans-serif" }}>{s.value}</p>
                  <p className="text-xs text-slate-500">{t(s.labelTh, s.labelEn)}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href="#contact" className="px-6 py-2.5 rounded-xl font-semibold text-white hover:scale-105 active:scale-95 transition-all" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontFamily: "'Prompt',sans-serif" }}>
                {t("ติดต่อเลย", "Contact Me")}
              </a>
              <a href={profile.fastwork} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition-all">
                Fastwork
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition-all">
                GitHub
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-44 h-44 rounded-full overflow-hidden ring-4 ring-indigo-500/30 ring-offset-4 ring-offset-[#050510] relative">
              <Image src={profile.avatar} alt={profile.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-600 text-white text-5xl font-bold" style={{ fontFamily: "'Prompt',sans-serif" }}>IQ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <Section id="skills">
        <h2 className="section-title">{t("ทักษะ", "Skills")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {profile.skills.map(skill => (
            <div key={skill.name}>
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="font-medium">{skill.name}</span>
                <span className="text-indigo-400 font-semibold">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${skill.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Works */}
      <Section id="works">
        <h2 className="section-title">{t("ผลงาน", "Works")}</h2>
        {/* Category filter */}
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {worksData.categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${cat === c.id ? "bg-indigo-600 text-white" : "glass text-slate-400 hover:text-white"}`}>
              {t(c.labelTh, c.labelEn)}
            </button>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(work => (
            <div key={work.id} className="work-card">
              {/* Image */}
              <div className="relative aspect-video bg-slate-800 cursor-pointer" onClick={() => setLightbox(work.image)}>
                <Image src={work.image} alt={t(work.titleTh, work.titleEn)} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">🖥️</div>
                {work.featured && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">Featured</span>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold mb-1" style={{ fontFamily: "'Prompt',sans-serif" }}>{t(work.titleTh, work.titleEn)}</h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{t(work.descTh, work.descEn)}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {work.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a href={work.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">Demo →</a>
                  <a href={work.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg glass text-slate-300 hover:text-white transition-colors">GitHub</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact">
        <h2 className="section-title">{t("ติดต่อฉัน", "Contact Me")}</h2>
        <div className="text-center mb-8">
          <p className="text-slate-400">{t("พร้อมรับงานแล้ว ติดต่อมาได้เลย!", "Ready for work. Let's build something great!")}</p>
          <div className="flex gap-4 justify-center mt-4 text-sm text-slate-400">
            <span>📧 {profile.email}</span>
            <span>📞 {profile.phone}</span>
            <span>LINE: {profile.line}</span>
          </div>
        </div>
        <ContactForm lang={lang} />
      </Section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5">
        <p className="text-slate-600 text-sm">© 2025 {profile.nickname} — {t(profile.name, profile.nameEn)}</p>
      </footer>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full">
            <Image src={lightbox} alt="Preview" width={1200} height={675} className="rounded-xl object-contain" />
          </div>
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-slate-300" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
