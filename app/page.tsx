"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import profile from "@/profile.json";
import worksData from "@/works.json";

/* Three.js scene loaded client-side only to skip SSR */
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

type Lang = "th" | "en";

/* ── Intersection-observer scroll reveal ── */
function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Section({
  id, children, className = "",
}: {
  id?: string; children: React.ReactNode; className?: string;
}) {
  const { ref, visible } = useVisible();
  return (
    <section id={id} className={`section ${className}`}>
      <div ref={ref} className={`container fade-up ${visible ? "visible" : ""}`}>
        {children}
      </div>
    </section>
  );
}

/* ── Contact form ── */
function ContactForm({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [st, setSt] = useState<"idle" | "loading" | "success" | "error">("idle");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSt("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSt((await res.json()).success ? "success" : "error");
    } catch { setSt("error"); }
  }

  const cls =
    "w-full p-3.5 rounded-xl bg-white/80 border border-[#A8D5E2]/30 text-stone-700 " +
    "placeholder-stone-400 text-sm outline-none focus:border-[#5B9DB8] " +
    "focus:ring-2 focus:ring-[#A8D5E2]/25 transition-all";

  if (st === "success") return (
    <div className="text-center py-12 glass rounded-2xl">
      <p className="text-4xl mb-3">🌸</p>
      <p className="font-semibold text-[#4AA87A] text-lg">
        {lang === "th" ? "ส่งข้อความสำเร็จ! จะติดต่อกลับเร็วๆ นี้" : "Message sent! I'll reply soon."}
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg mx-auto">
      <input
        value={form.name} onChange={e => set("name", e.target.value)}
        placeholder={lang === "th" ? "ชื่อของคุณ *" : "Your name *"}
        required className={cls}
      />
      <input
        value={form.email} onChange={e => set("email", e.target.value)}
        type="email" placeholder="Email *" required className={cls}
      />
      <textarea
        value={form.message} onChange={e => set("message", e.target.value)}
        placeholder={lang === "th" ? "รายละเอียดงาน *" : "Project details *"}
        required rows={4} className={`${cls} resize-none`}
      />
      <button
        type="submit" disabled={st === "loading"}
        className="py-3.5 rounded-xl font-semibold text-white disabled:opacity-60 hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all shadow-md"
        style={{ background: "linear-gradient(135deg,#7BB8CC,#6ABFA0)", fontFamily: "'Prompt',sans-serif" }}
      >
        {st === "loading" ? "…" : lang === "th" ? "ส่งข้อความ" : "Send Message"}
      </button>
      {st === "error" && (
        <p className="text-red-500 text-sm text-center">
          {lang === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่" : "Error. Please try again."}
        </p>
      )}
    </form>
  );
}

/* ── Main page ── */
export default function PortfolioPage() {
  const [lang, setLang] = useState<Lang>("th");
  const [cat, setCat] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const t = (th: string, en: string) => lang === "th" ? th : en;
  const filtered = cat === "all"
    ? worksData.works
    : worksData.works.filter(w => w.category === cat);

  /* GSAP entrance animation for hero elements */
  useEffect(() => {
    let ctx: { revert?: () => void } = {};
    (async () => {
      const gsap = (await import("gsap")).default;
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(".gsap-badge",  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(".gsap-title",  { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.65 }, "-=0.25")
        .fromTo(".gsap-role",   { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 },  "-=0.3")
        .fromTo(".gsap-bio",    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 },  "-=0.3")
        .fromTo(".gsap-stats",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 },  "-=0.25")
        .fromTo(".gsap-ctas",   { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.2")
        .fromTo(".gsap-avatar", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.75, ease: "back.out(1.4)" }, "-=0.55");
      ctx = { revert: () => tl.kill() };
    })();
    return () => ctx.revert?.();
  }, []);

  /* ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#F8F5F0]/88 backdrop-blur-md border-b border-[#A8D5E2]/22">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <a href="#about" className="font-bold text-[#5B9DB8] text-lg tracking-tight"
            style={{ fontFamily: "'Prompt',sans-serif" }}>
            {profile.nickname}<span className="text-[#4AA87A]">.dev</span>
          </a>

          <div className="flex items-center gap-5">
            {(["about", "skills", "works", "contact"] as const).map(s => (
              <a key={s} href={`#${s}`} className="nav-link hidden sm:block capitalize">
                {t(
                  s === "about" ? "เกี่ยวกับ" :
                  s === "skills" ? "ทักษะ" :
                  s === "works" ? "ผลงาน" : "ติดต่อ",
                  s.charAt(0).toUpperCase() + s.slice(1),
                )}
              </a>
            ))}
            <button
              onClick={() => setLang(l => l === "th" ? "en" : "th")}
              className="text-xs px-3 py-1.5 rounded-full border border-[#A8D5E2]/40 text-[#5B9DB8] hover:bg-[#A8D5E2]/12 transition-colors"
            >
              {lang === "th" ? "EN" : "TH"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="about" className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Three.js canvas — full hero background */}
        <div className="absolute inset-0 z-0">
          <ThreeScene />
        </div>

        {/* Gradient veil so text stays readable */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(100deg, rgba(248,245,240,0.97) 0%, rgba(248,245,240,0.80) 52%, rgba(248,245,240,0.15) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-[2] max-w-5xl mx-auto px-4 w-full py-24">
          <div className="flex flex-col md:flex-row items-center gap-14">

            {/* Text */}
            <div className="flex-1 text-center md:text-left">

              {/* Available badge */}
              <div className="gsap-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 opacity-0"
                style={{
                  background: "rgba(74,168,122,0.11)",
                  border: "1px solid rgba(74,168,122,0.28)",
                }}>
                <span className="w-2 h-2 rounded-full bg-[#4AA87A] animate-pulse" />
                <span className="text-[#4AA87A] text-sm font-medium">
                  {t("พร้อมรับงาน", "Available for work")}
                </span>
              </div>

              <h1
                className="gsap-title text-5xl sm:text-6xl font-bold mb-3 leading-tight opacity-0"
                style={{ fontFamily: "'Prompt',sans-serif", color: "#2D2D2D", letterSpacing: "-0.025em" }}
              >
                {t(`สวัสดี, ผม${profile.nickname}`, `Hi, I'm ${profile.nickname}`)}
              </h1>

              <p className="gsap-role text-xl font-semibold mb-4 opacity-0" style={{ color: "#5B9DB8" }}>
                {profile.role}
              </p>

              <p className="gsap-bio text-[#7A8EA0] leading-relaxed mb-8 max-w-md whitespace-pre-line opacity-0">
                {t(profile.bio, profile.bioEn)}
              </p>

              {/* Stats */}
              <div className="gsap-stats grid grid-cols-4 gap-3 mb-8 opacity-0">
                {profile.stats.map((s, i) => (
                  <div
                    key={i}
                    className="text-center p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(168,213,226,0.25)",
                    }}
                  >
                    <p className="text-lg font-bold" style={{ fontFamily: "'Prompt',sans-serif", color: "#5B9DB8" }}>
                      {s.value}
                    </p>
                    <p className="text-xs leading-tight" style={{ color: "#7A8EA0" }}>
                      {t(s.labelTh, s.labelEn)}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="gsap-ctas flex flex-wrap gap-3 justify-center md:justify-start opacity-0">
                <a
                  href="#contact"
                  className="px-6 py-2.5 rounded-xl font-semibold text-white hover:scale-105 hover:shadow-lg active:scale-95 transition-all shadow-md"
                  style={{ background: "linear-gradient(135deg,#7BB8CC,#6ABFA0)", fontFamily: "'Prompt',sans-serif" }}
                >
                  {t("ติดต่อเลย", "Contact Me")}
                </a>
                <a
                  href={profile.fastwork} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl font-semibold text-[#5B9DB8] hover:bg-[#A8D5E2]/12 transition-all"
                  style={{ background: "rgba(255,255,255,0.58)", border: "1px solid rgba(168,213,226,0.40)", backdropFilter: "blur(8px)" }}
                >
                  Fastwork
                </a>
                <a
                  href={profile.github} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl font-semibold text-[#5B9DB8] hover:bg-[#A8D5E2]/12 transition-all"
                  style={{ background: "rgba(255,255,255,0.58)", border: "1px solid rgba(168,213,226,0.40)", backdropFilter: "blur(8px)" }}
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Avatar */}
            <div className="gsap-avatar relative flex-shrink-0 opacity-0">
              <div className="relative w-52 h-52">
                {/* Decorative rings */}
                <div className="ring-slow absolute rounded-full border-2 border-[#A8D5E2]/30"
                  style={{ inset: "-18px" }} />
                <div className="ring-reverse absolute rounded-full border border-[#B8E0C8]/22"
                  style={{ inset: "-32px" }} />
                {/* Avatar circle */}
                <div className="w-full h-full rounded-full overflow-hidden shadow-xl"
                  style={{ outline: "4px solid rgba(168,213,226,0.40)", outlineOffset: "4px" }}>
                  <div className="relative w-full h-full">
                    <Image
                      src={profile.avatar} alt={profile.name} fill className="object-cover"
                      onError={e => { e.currentTarget.style.display = "none"; }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold"
                      style={{ background: "linear-gradient(135deg,#7BB8CC,#6ABFA0)", fontFamily: "'Prompt',sans-serif" }}
                    >
                      IQ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] tracking-widest uppercase text-[#7A8EA0]">scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-[#A8D5E2]/50 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-[#5B9DB8] caret-bounce" />
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <Section id="skills" className="bg-[#EEF7F5]">
        <h2 className="section-title">{t("ทักษะ", "Skills")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {profile.skills.map(skill => (
            <div
              key={skill.name}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(168,213,226,0.22)",
                boxShadow: "0 2px 12px rgba(90,157,184,0.06)",
              }}
            >
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-semibold text-[#2D2D2D]">{skill.name}</span>
                <span className="font-bold text-[#5B9DB8]">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${skill.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Works ── */}
      <Section id="works">
        <h2 className="section-title">{t("ผลงาน", "Works")}</h2>

        {/* Category filter */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {worksData.categories.map(c => (
            <button
              key={c.id} onClick={() => setCat(c.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={cat === c.id
                ? { background: "linear-gradient(135deg,#7BB8CC,#6ABFA0)", color: "#fff", boxShadow: "0 4px 14px rgba(107,191,160,0.30)" }
                : { background: "rgba(255,255,255,0.70)", border: "1px solid rgba(168,213,226,0.36)", backdropFilter: "blur(8px)", color: "#5B9DB8" }
              }
            >
              {t(c.labelTh, c.labelEn)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(work => (
            <div key={work.id} className="work-card">
              {/* Thumbnail */}
              <div
                className="relative aspect-video cursor-pointer overflow-hidden"
                style={{ background: "#EEF7F5" }}
                onClick={() => setLightbox(work.image)}
              >
                <Image
                  src={work.image} alt={t(work.titleTh, work.titleEn)} fill className="object-cover"
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">🖥️</div>
                {work.featured && (
                  <span
                    className="absolute top-2 right-2 text-xs px-2.5 py-0.5 rounded-full font-semibold text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg,#6ABFA0,#5BAA8E)" }}
                  >
                    Featured
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold mb-1.5 text-[#2D2D2D]" style={{ fontFamily: "'Prompt',sans-serif" }}>
                  {t(work.titleTh, work.titleEn)}
                </h3>
                <p className="text-[#7A8EA0] text-sm mb-3 line-clamp-2">{t(work.descTh, work.descEn)}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {work.tags.map(tag => (
                    <span
                      key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "rgba(168,213,226,0.14)",
                        color: "#5B9DB8",
                        border: "1px solid rgba(168,213,226,0.28)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a
                    href={work.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-sm"
                    style={{ background: "linear-gradient(135deg,#7BB8CC,#6ABFA0)" }}
                  >
                    Demo&nbsp;→
                  </a>
                  <a
                    href={work.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg text-[#5B9DB8] font-medium hover:bg-[#A8D5E2]/12 transition-colors"
                    style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(168,213,226,0.30)" }}
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact" className="bg-[#F0EEF7]">
        <h2 className="section-title">{t("ติดต่อฉัน", "Contact Me")}</h2>
        <div className="text-center mb-8">
          <p className="text-[#7A8EA0]">
            {t("พร้อมรับงานแล้ว ติดต่อมาได้เลย!", "Ready for work. Let's build something great!")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm text-[#5B9DB8]">
            <span>📧 {profile.email}</span>
            <span>📞 {profile.phone}</span>
            <span>LINE: {profile.line}</span>
          </div>
        </div>
        <ContactForm lang={lang} />
      </Section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 text-center border-t border-[#A8D5E2]/20">
        <p className="text-[#7A8EA0] text-sm">
          © 2025 {profile.nickname} — {t(profile.name, profile.nameEn)}
        </p>
      </footer>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <Image
              src={lightbox} alt="Preview" width={1200} height={675}
              className="rounded-2xl object-contain shadow-2xl"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-xl w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/12 transition-colors"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
