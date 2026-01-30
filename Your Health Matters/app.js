


/* Your Health Matters — Simple SPA + Premium UX (no frameworks) */

/* ---------- DOM helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const app = $("#app");
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

/* ----------------- Assets (real photos) -----------------
   Sources: Pexels (free to use)
*/
const ASSETS = {
  hero: "https://images.pexels.com/photos/8357153/pexels-photo-8357153.jpeg?cs=srgb&dl=pexels-marina-m-8357153.jpg&fm=jpg",
  story1: "https://images.pexels.com/photos/6298479/pexels-photo-6298479.jpeg?cs=srgb&dl=pexels-joshuamiranda-6298479.jpg&fm=jpg",
  story2: "https://images.pexels.com/photos/8442446/pexels-photo-8442446.jpeg?cs=srgb&dl=pexels-pavel-danilyuk-8442446.jpg&fm=jpg",
  story3: "https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg?cs=srgb&dl=pexels-mart-production-7089017.jpg&fm=jpg",
  story4: "https://images.pexels.com/photos/17597408/pexels-photo-17597408.jpeg?cs=srgb&dl=pexels-rasul70-17597408.jpg&fm=jpg",
  scans: "https://images.pexels.com/photos/4226256/pexels-photo-4226256.jpeg?cs=srgb&dl=pexels-anna-shvets-4226256.jpg&fm=jpg",
  about: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?cs=srgb&dl=pexels-anna-shvets-4021775.jpg&fm=jpg",
  consult: "https://images.pexels.com/photos/8413221/pexels-photo-8413221.jpeg?cs=srgb&dl=pexels-shvets-production-8413221.jpg&fm=jpg",
};

/* ---------- Theme toggle (dark default) ---------- */
const THEME_KEY = "yhm_theme";
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || "dark");
}
initTheme();

$("[data-theme-toggle]")?.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  applyTheme(next);
  toast(`Theme: ${next[0].toUpperCase() + next.slice(1)}`);
});

/* ---------- Mobile drawer ---------- */
const drawer = $("[data-drawer]");
const drawerBtn = $("[data-menu-btn]");
const drawerClose = $("[data-drawer-close]");
const drawerBackdrop = $("[data-drawer-backdrop]");

function openDrawer(){
  if(!drawer) return;
  drawer.hidden = false;
  drawerBtn?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  if(!drawer) return;
  drawer.hidden = true;
  drawerBtn?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}
drawerBtn?.addEventListener("click", () => {
  const expanded = drawerBtn.getAttribute("aria-expanded") === "true";
  expanded ? closeDrawer() : openDrawer();
});
drawerClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);
drawer?.addEventListener("click", (e) => {
  if (e.target.matches("a")) closeDrawer();
});

/* ---------- Topbar dismiss ---------- */
$("[data-topbar-close]")?.addEventListener("click", () => {
  $(".topbar")?.remove();
  $(".header")?.style?.setProperty("top", "0px");
});

/* ---------- Router ---------- */
const routes = {
  "/": HomePage,
  "/how-it-works": HowItWorksPage,
  "/what-we-test": WhatWeTestPage,
  "/scans": ScansPage,
  "/faq": FaqPage,
  "/about": AboutPage,
  "/pricing": PricingPage,
  "/contact": ContactPage,
  "/login": LoginPage,
  "/privacy": PrivacyPage,
  "/terms": TermsPage,
};

function getRoute(){
  const hash = location.hash || "#/";
  return hash.replace(/^#/, "");
}

function navigate(){
  const path = getRoute();
  const view = routes[path] || NotFoundPage;

  if (!app) return;

  app.classList.add("is-transitioning");
  setTimeout(() => {
    app.innerHTML = view();

    mountPageBehaviors();

    app.focus({preventScroll:true});
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => app.classList.remove("is-transitioning"));
  }, 140);
}

window.addEventListener("hashchange", navigate);
window.addEventListener("DOMContentLoaded", () => {
  prefetchImages([ASSETS.hero, ASSETS.story1, ASSETS.story2]);
  navigate();
});

/* ---------- Helpers ---------- */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function prefetchImages(urls = []){
  urls.slice(0, 6).forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = src;
  });
}

function PageHead(title, desc){
  return `
    <section class="section--tight">
      <div class="container pagehead">
        <span class="kicker">Premium • Prevention-first</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(desc)}</p>
      </div>
    </section>
  `;
}

function CTA(){
  return `
    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad grid2">
            <div>
              <h3 style="margin:0 0 8px; letter-spacing:-0.03em; font-size:22px;">Make your health measurable.</h3>
              <p class="muted" style="margin:0; line-height:1.8;">
                Clear testing + plain language reports + repeatable protocols—built for trust and action.
              </p>
              <div class="row" style="margin-top:14px;">
                <a class="btn btn--primary" href="#/pricing">Start testing</a>
                <a class="btn btn--ghost" href="#/how-it-works">How it works</a>
              </div>
            </div>
            <div class="card card--solid" style="border-radius:26px;">
              <div class="card__pad">
                <div class="statgrid" style="margin-top:0;">
                  <div class="stat"><b>100+ tests</b><p>Total each year</p></div>
                  <div class="stat"><b>2,000+ locations</b><p>Easy scheduling</p></div>
                  <div class="stat"><b>$1.37/day</b><p>$499 per year</p></div>
                </div>
                <div class="hr"></div>
                <p class="muted" style="margin:0; font-size:13px; line-height:1.8;">
                  Tip: Replace copy and numbers with your real offering (avoid medical claims unless you’re licensed).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function QuoteSlide(text, name, role){
  return `
    <article class="quote">
      <p>${escapeHtml(text)}</p>
      <div class="who">
        <span class="avatar" aria-hidden="true"></span>
        <span>${escapeHtml(name)} • ${escapeHtml(role)}</span>
      </div>
    </article>
  `;
}

/* ✅ Updated: use data-bg (lazy background) */
function StoryCard(title, desc, img){
  return `
    <article class="story reveal">
      <div class="story__img" role="img" aria-label="${escapeHtml(title)} image"
        data-bg="${img}"></div>
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(desc)}</p>
      <a href="#/pricing">Read story →</a>
    </article>
  `;
}

function FaqItem(q, a){
  return `
    <details class="details">
      <summary>${escapeHtml(q)}</summary>
      <p>${escapeHtml(a)}</p>
    </details>
  `;
}

/* ---------- Pages ---------- */
function HomePage(){
  const tags = [
    "Diabetes","Inflammation","Nutrient deficiency","Thyroid markers",
    "Heart risk","Insulin resistance","Anemia","Autoimmunity",
    "Liver health","Hormone balance","Metabolic markers","Kidney health"
  ];
  const doubled = [...tags, ...tags];

  return `
    <section class="hero">
      <div class="container hero__wrap">
        <div class="card reveal">
          <div class="card__pad">
            <span class="kicker">Your Health Matters</span>
            <h1 class="h1">Every year. <br/>Clarity you can act on.</h1>
            <p class="lead">
              A premium, prevention-first experience: comprehensive testing, clear explanations,
              and repeatable protocols to track trends over time.
            </p>
            <div class="row">
              <a class="btn btn--primary" href="#/pricing">Start testing</a>
              <a class="btn btn--ghost" href="#/how-it-works">How it works</a>
            </div>

            <div class="statgrid">
              <div class="stat"><b>100+ tests</b><p>Total each year</p></div>
              <div class="stat"><b>Whole body</b><p>Tested 2× per year</p></div>
              <div class="stat"><b>$1.37/day</b><p>$499 per year</p></div>
            </div>
          </div>
        </div>

        <div class="card hero__visual reveal" aria-label="Hero image">
          <div class="hero__photo" data-bg="${ASSETS.hero}"></div>
          <div class="hero__overlay"></div>

          <div class="visual__content">
            <div class="badges">
              <span class="badge">Trust-first UX</span>
              <span class="badge">Actionable insights</span>
              <span class="badge">Premium experience</span>
            </div>

            <div class="visual__tile">
              <h3>Modern care, simplified.</h3>
              <p>Beautiful UI + clear language = higher trust and better conversion.</p>
              <div class="spacer"></div>
              <a class="btn btn--ghost" href="#/about">Learn more</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad">
            <h2 style="margin:0 0 10px; letter-spacing:-0.03em;">Testing is easy</h2>
            <p class="muted" style="margin:0 0 18px; line-height:1.8;">
              A frictionless flow designed for trust: schedule → test → understand → act → track trends.
            </p>

            <div class="steps">
              <div class="step">
                <div class="step__num">01</div>
                <h3>Schedule fast</h3>
                <p>Pick a time at a partner location—simple, calm, and quick.</p>
              </div>
              <div class="step">
                <div class="step__num">02</div>
                <h3>Results explained</h3>
                <p>Clear “what it means” and “what to do next” guidance in plain language.</p>
              </div>
              <div class="step">
                <div class="step__num">03</div>
                <h3>Repeat your protocol</h3>
                <p>Re-test on a schedule, track trends, and build a measurable baseline.</p>
              </div>
            </div>

            <div class="row" style="margin-top:16px;">
              <a class="btn btn--primary" href="#/pricing">Start testing</a>
              <a class="btn btn--ghost" href="#/what-we-test">What we test</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section--tight">
      <div class="container">
        <div class="marquee reveal" aria-label="Conditions marquee">
          <div class="marquee__track">
            ${doubled.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container grid2">
        <div class="card reveal">
          <div class="card__pad">
            <h2 style="margin:0 0 10px; letter-spacing:-0.03em;">A test set designed for clarity</h2>
            <p class="muted" style="margin:0 0 14px; line-height:1.8;">
              Show depth without overwhelm. Category panels keep the page dense but readable.
            </p>
            <a class="btn btn--ghost" href="#/what-we-test">See test categories</a>
          </div>
        </div>

        <div class="card reveal">
          <div class="carousel" data-carousel>
            <div class="carousel__track" data-carousel-track>
              ${QuoteSlide("“The cleanest approach I’ve seen: depth with no confusion.”","Clinical Advisor","Preventive care")}
              ${QuoteSlide("“Everything feels organized for action—exactly what people need.”","Product Research","Health UX")}
              ${QuoteSlide("“Premium design earns trust. Trust improves follow-through.”","Care Team Lead","Patient experience")}
            </div>
            <div class="carousel__controls">
              <button class="iconpill" data-carousel-prev aria-label="Previous">←</button>
              <button class="iconpill" data-carousel-next aria-label="Next">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="reveal" style="margin:0 0 12px; letter-spacing:-0.03em;">Real people. Real results.</h2>
        <div class="cards">
          ${StoryCard("Aimee’s baseline","The signal a routine checkup missed", ASSETS.story1)}
          ${StoryCard("Alan’s momentum","From uncertainty to action", ASSETS.story2)}
          ${StoryCard("Geoff’s insight","Finding risk early, then optimizing", ASSETS.story3)}
          ${StoryCard("Catherine’s clarity","Simple plan, repeatable progress", ASSETS.story4)}
        </div>
      </div>
    </section>

    ${CTA()}
  `;
}

function HowItWorksPage(){
  return `
    ${PageHead("How it works","A clean step-by-step narrative. One primary CTA across the page.")}
    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad">
            <div class="steps">
              <div class="step">
                <div class="step__num">01</div>
                <h3>Join</h3>
                <p>Pick a plan with one clear price and no clutter.</p>
              </div>
              <div class="step">
                <div class="step__num">02</div>
                <h3>Test</h3>
                <p>Schedule at a partner location. Get reminders and support.</p>
              </div>
              <div class="step">
                <div class="step__num">03</div>
                <h3>Act</h3>
                <p>Understand results and follow a repeatable protocol.</p>
              </div>
            </div>

            <div class="hr"></div>

            <div class="grid2">
              <div class="card card--solid">
                <div class="card__pad">
                  <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">Repeatable protocol</h3>
                  <p class="muted" style="margin:0; line-height:1.8;">
                    Track trends over time (not single points). Make progress measurable.
                  </p>
                </div>
              </div>
              <div class="card card--solid">
                <div class="card__pad">
                  <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">Designed for trust</h3>
                  <p class="muted" style="margin:0; line-height:1.8;">
                    Calm layout, credible copy, and consistent UI patterns reduce friction.
                  </p>
                </div>
              </div>
            </div>

            <div class="row" style="margin-top:16px;">
              <a class="btn btn--primary" href="#/pricing">Start testing</a>
              <a class="btn btn--ghost" href="#/faq">Read FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${CTA()}
  `;
}

function WhatWeTestPage(){
  const tabs = [
    { id:"metabolic", label:"Metabolic & heart", meta:"18 biomarkers", items:[
      ["ApoB","Core"],["Lp(a)","Advanced"],["HbA1c","Core"],["Insulin","Core"],["hs-CRP","Core"],["Triglycerides","Core"]
    ]},
    { id:"thyroid", label:"Hormones & thyroid", meta:"16 biomarkers", items:[
      ["TSH","Core"],["Free T4","Core"],["TPO Ab","Advanced"],["TgAb","Advanced"],["Estradiol","Core"],["Testosterone","Core"]
    ]},
    { id:"nutrients", label:"Nutrients & recovery", meta:"14 biomarkers", items:[
      ["Vitamin D","Core"],["Ferritin","Core"],["B12","Core"],["Folate","Core"],["Magnesium","Advanced"],["Omega-3 index","Advanced"]
    ]},
    { id:"risk", label:"Silent risks", meta:"22 biomarkers", items:[
      ["CBC","Core"],["CMP","Core"],["Uric acid","Core"],["Homocysteine","Advanced"],["Lead","Toxins"],["Mercury","Toxins"]
    ]},
  ];

  return `
    ${PageHead("What we test","Tabbed categories keep the page dense but readable.")}
    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad tabs" data-tabs>
            <div class="tablist" role="tablist" aria-label="Test categories">
              ${tabs.map((t,i)=>`
                <button class="tabbtn" role="tab"
                  aria-selected="${i===0 ? "true":"false"}"
                  aria-controls="panel-${t.id}"
                  id="tab-${t.id}"
                  data-tab="${t.id}">
                  ${escapeHtml(t.label)}
                  <small>${escapeHtml(t.meta)}</small>
                </button>
              `).join("")}
            </div>

            <div class="tabpanel" role="tabpanel" id="panel-${tabs[0].id}" aria-labelledby="tab-${tabs[0].id}" data-panel>
              ${renderTabPanel(tabs[0])}
            </div>
          </div>
        </div>
      </div>
    </section>
    ${CTA()}
  `;

  function renderTabPanel(tab){
    return `
      <h3 style="margin:0; letter-spacing:-0.03em;">${escapeHtml(tab.label)}</h3>
      <p class="muted" style="margin:8px 0 0; line-height:1.8;">
        A curated set of biomarkers with practical interpretation and next steps.
      </p>
      <div class="list">
        ${tab.items.map(([name, tier]) => `
          <div class="item">
            <span>${escapeHtml(name)}</span>
            <b>${escapeHtml(tier)}</b>
          </div>
        `).join("")}
      </div>
      <div class="row" style="margin-top:14px;">
        <a class="btn btn--primary" href="#/pricing">Start testing</a>
        <a class="btn btn--ghost" href="#/faq">Questions?</a>
      </div>
    `;
  }
}

function ScansPage(){
  return `
    ${PageHead("Scans","A premium add-on section: one strong message, one visual, one clear CTA.")}
    <section class="section">
      <div class="container grid2">
        <div class="card reveal">
          <div class="card__pad">
            <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">Advanced imaging, simplified</h3>
            <p class="muted" style="margin:0; line-height:1.8;">
              Explain what’s included, who it’s for, and how it’s scheduled—keep it clear and compliant.
            </p>
            <div class="spacer"></div>
            <div class="pillrow">
              <span class="pill">MRI options</span>
              <span class="pill">CT options</span>
              <span class="pill">Partner network</span>
            </div>
            <div class="row" style="margin-top:16px;">
              <a class="btn btn--primary" href="#/pricing">See pricing</a>
              <a class="btn btn--ghost" href="#/contact">Talk to us</a>
            </div>
          </div>
        </div>

        <div class="card hero__visual reveal" aria-label="Scans image">
          <div class="hero__photo" data-bg="${ASSETS.scans}"></div>
          <div class="hero__overlay"></div>
          <div class="visual__content">
            <div class="visual__tile">
              <h3>Premium presentation</h3>
              <p>High spacing + calm type hierarchy communicates trust and quality.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${CTA()}
  `;
}

function FaqPage(){
  return `
    ${PageHead("FAQ","Short, confident answers improve conversion.")}
    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad faq">
            ${FaqItem("How often do members test?","Many programs follow a twice-yearly cadence. Keep it specific to your offering.")}
            ${FaqItem("Do I need insurance?","Clarify whether insurance is optional or not required, depending on your model.")}
            ${FaqItem("Where is testing available?","Highlight your partner network size and supported regions if true.")}
            ${FaqItem("Is this medical care?","Be clear: if you’re not providing medical care, direct users to consult clinicians.")}
            ${FaqItem("Can I cancel?","Offer clear cancellation/refund terms and link to Terms.")}
          </div>
        </div>
      </div>
    </section>
    ${CTA()}
  `;
}

function AboutPage(){
  return `
    ${PageHead("About","A trust page: mission, standards, privacy-first approach, and values.")}
    <section class="section">
      <div class="container">
        <div class="card reveal">
          <div class="card__pad grid2">
            <div>
              <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">Built for the new standard in health</h3>
              <p class="muted" style="margin:0; line-height:1.8;">
                Your Health Matters helps people understand results and track progress over time with a calm, premium experience.
              </p>
              <div class="spacer"></div>
              <div class="pillrow">
                <span class="pill">Evidence-led</span>
                <span class="pill">Privacy-first</span>
                <span class="pill">Premium UX</span>
              </div>
            </div>

            <div class="card card--solid" style="border-radius:26px;">
              <div class="card__pad">
                <div class="story__img" style="height:180px;" data-bg="${ASSETS.about}"></div>
                <div class="spacer"></div>
                <p class="muted" style="margin:0; line-height:1.8; font-size:13px;">
                  Designed to feel calm, credible, and fast—because trust is the conversion.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="spacer"></div>

        <div class="compare reveal">
          <table class="table">
            <thead><tr><th>Premium membership</th><th>Includes</th></tr></thead>
            <tbody>
              <tr><td>Actionable report</td><td class="tick">✓</td></tr>
              <tr><td>Trend tracking</td><td class="tick">✓</td></tr>
              <tr><td>Retest cadence</td><td class="tick">✓</td></tr>
              <tr><td>Concierge support</td><td class="tick">✓</td></tr>
            </tbody>
          </table>

          <table class="table">
            <thead><tr><th>Standard checkup</th><th>Typical</th></tr></thead>
            <tbody>
              <tr><td>One-time snapshot</td><td class="tick">✓</td></tr>
              <tr><td>Trend tracking</td><td class="cross">—</td></tr>
              <tr><td>Deep biomarker set</td><td class="cross">—</td></tr>
              <tr><td>Clear protocols</td><td class="cross">—</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    ${CTA()}
  `;
}

function PricingPage(){
  return `
    ${PageHead("Pricing","One plan, one story. Reduce choice overload.")}
    <section class="section">
      <div class="container grid2">
        <div class="card reveal">
          <div class="card__pad">
            <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">Membership</h3>
            <p class="muted" style="margin:0; line-height:1.8;">
              Show price with confidence. Add “per day” math and the core benefits.
            </p>

            <div class="hr"></div>

            <div style="display:flex; align-items:baseline; gap:10px;">
              <div style="font-size:44px; font-weight:900; letter-spacing:-0.05em;">$499</div>
              <div class="muted" style="font-weight:800;">/ year</div>
            </div>
            <p class="muted" style="margin:8px 0 0;">≈ $1.37 per day</p>

            <div class="spacer"></div>

            <div class="list" style="grid-template-columns: 1fr;">
              ${[
                "100+ lab tests annually",
                "Results explained in plain language",
                "Protocols + retesting cadence",
                "Trend tracking over time",
                "Optional advanced scans"
              ].map(x=>`
                <div class="item"><span>${escapeHtml(x)}</span><b>✓</b></div>
              `).join("")}
            </div>

            <div class="row" style="margin-top:16px;">
              <button class="btn btn--primary" data-toast="Checkout is a demo in this template.">Start testing</button>
              <a class="btn btn--ghost" href="#/faq">Read FAQ</a>
            </div>
          </div>
        </div>

        <div class="card hero__visual reveal" aria-label="Consultation image">
          <div class="hero__photo" data-bg="${ASSETS.consult}"></div>
          <div class="hero__overlay"></div>
          <div class="visual__content">
            <div class="visual__tile">
              <h3>Make checkout next</h3>
              <p>Connect this CTA to Stripe/Checkout later. The UI is ready.</p>
              <div class="spacer"></div>
              <div class="pillrow">
                <span class="pill">Secure payments</span>
                <span class="pill">Fast onboarding</span>
                <span class="pill">Email receipts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${CTA()}
  `;
}

function ContactPage(){
  return `
    ${PageHead("Contact","A clean contact page with a minimal form.")}
    <section class="section">
      <div class="container grid2">
        <div class="card reveal">
          <div class="card__pad">
            <h3 style="margin:0 0 8px; letter-spacing:-0.03em;">We’re here to help</h3>
            <p class="muted" style="margin:0; line-height:1.8;">
              Add your support hours, chat widget, or email. Keep it calm and direct.
            </p>
            <div class="spacer"></div>
            <div class="pillrow">
              <span class="pill">Support: support@yourdomain.com</span>
              <span class="pill">Sales: sales@yourdomain.com</span>
            </div>
          </div>
        </div>

        <div class="card reveal">
          <div class="card__pad">
            <form data-form>
              <label class="muted" style="font-weight:800; font-size:12px;">Name</label>
              <input class="input" name="name" placeholder="Your name" required />

              <div class="spacer"></div>

              <label class="muted" style="font-weight:800; font-size:12px;">Email</label>
              <input class="input" name="email" placeholder="you@email.com" required />

              <div class="spacer"></div>

              <label class="muted" style="font-weight:800; font-size:12px;">Message</label>
              <textarea class="input" name="message" rows="5" placeholder="How can we help?" required></textarea>

              <div class="spacer"></div>

              <button class="btn btn--primary btn--block" type="submit">Send message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

function LoginPage(){
  return `
    ${PageHead("Login","Template login page (UI only).")}
    <section class="section">
      <div class="container" style="max-width:520px;">
        <div class="card reveal">
          <div class="card__pad">
            <form data-form>
              <label class="muted" style="font-weight:800; font-size:12px;">Email</label>
              <input class="input" name="email" placeholder="you@email.com" required />

              <div class="spacer"></div>

              <label class="muted" style="font-weight:800; font-size:12px;">Password</label>
              <input class="input" name="password" type="password" placeholder="••••••••" required />

              <div class="spacer"></div>

              <button class="btn btn--primary btn--block" type="submit">Login</button>
              <div class="spacer"></div>
              <a class="btn btn--ghost btn--block" href="#/pricing">Create account</a>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

function PrivacyPage(){
  return `
    ${PageHead("Privacy","Add your real policy text here.")}
    <section class="section">
      <div class="container">
        <div class="card reveal"><div class="card__pad">
          <p class="muted" style="margin:0; line-height:1.9;">
            This is placeholder content. Replace with your actual privacy policy.
          </p>
        </div></div>
      </div>
    </section>
  `;
}

function TermsPage(){
  return `
    ${PageHead("Terms","Add your real terms here.")}
    <section class="section">
      <div class="container">
        <div class="card reveal"><div class="card__pad">
          <p class="muted" style="margin:0; line-height:1.9;">
            This is placeholder content. Replace with your actual terms of service.
          </p>
        </div></div>
      </div>
    </section>
  `;
}

function NotFoundPage(){
  return `
    ${PageHead("Not found","The page you’re looking for doesn’t exist.")}
    <section class="section">
      <div class="container">
        <a class="btn btn--primary" href="#/">Go home</a>
      </div>
    </section>
  `;
}

/* ---------- Page behaviors ---------- */
function mountPageBehaviors(){
  mountTabs();
  mountCarousel();
  mountForms();
  mountToasts();
  mountScrollReveal();
  mountLazyBackgrounds();
}

/* Tabs */
function mountTabs(){
  const tabsRoot = $("[data-tabs]");
  if(!tabsRoot) return;

  const tabButtons = $$("[data-tab]", tabsRoot);
  const panel = $("[data-panel]", tabsRoot);
  if(!panel) return;

  const data = {
    metabolic: {
      title:"Metabolic & heart",
      body:"Advanced lipid and metabolic markers to track trends over time.",
      items:[["ApoB","Core"],["Lp(a)","Advanced"],["HbA1c","Core"],["Insulin","Core"],["hs-CRP","Core"],["Triglycerides","Core"]],
    },
    thyroid: {
      title:"Hormones & thyroid",
      body:"Core thyroid markers and key hormones for better context.",
      items:[["TSH","Core"],["Free T4","Core"],["TPO Ab","Advanced"],["TgAb","Advanced"],["Estradiol","Core"],["Testosterone","Core"]],
    },
    nutrients: {
      title:"Nutrients & recovery",
      body:"Nutrient signals that support energy, recovery, and resilience.",
      items:[["Vitamin D","Core"],["Ferritin","Core"],["B12","Core"],["Folate","Core"],["Magnesium","Advanced"],["Omega-3 index","Advanced"]],
    },
    risk: {
      title:"Silent risks",
      body:"Broad health signals and environmental exposure markers.",
      items:[["CBC","Core"],["CMP","Core"],["Uric acid","Core"],["Homocysteine","Advanced"],["Lead","Toxins"],["Mercury","Toxins"]],
    },
  };

  function render(key){
    const d = data[key];
    if(!d) return;

    panel.innerHTML = `
      <h3 style="margin:0; letter-spacing:-0.03em;">${escapeHtml(d.title)}</h3>
      <p class="muted" style="margin:8px 0 0; line-height:1.8;">${escapeHtml(d.body)}</p>
      <div class="list">
        ${d.items.map(([name, tier]) => `
          <div class="item"><span>${escapeHtml(name)}</span><b>${escapeHtml(tier)}</b></div>
        `).join("")}
      </div>
      <div class="row" style="margin-top:14px;">
        <a class="btn btn--primary" href="#/pricing">Start testing</a>
        <a class="btn btn--ghost" href="#/faq">Questions?</a>
      </div>
    `;
  }

  tabButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabButtons.forEach(b=> b.setAttribute("aria-selected","false"));
      btn.setAttribute("aria-selected","true");
      render(btn.dataset.tab);
    });
  });
}

/* Carousel */
function mountCarousel(){
  const root = $("[data-carousel]");
  if(!root) return;

  const track = $("[data-carousel-track]", root);
  const prev = $("[data-carousel-prev]", root);
  const next = $("[data-carousel-next]", root);
  if(!track) return;

  let idx = 0;
  const slides = track.children.length;

  function update(){
    track.style.transform = `translateX(${idx * -100}%)`;
  }

  prev?.addEventListener("click", ()=>{
    idx = (idx - 1 + slides) % slides;
    update();
  });

  next?.addEventListener("click", ()=>{
    idx = (idx + 1) % slides;
    update();
  });

  let t = setInterval(()=>{ idx = (idx + 1) % slides; update(); }, 6000);
  root.addEventListener("mouseenter", ()=> { clearInterval(t); t = null; }, { once:true });
}

/* Forms (demo) */
function mountForms(){
  $$("form[data-form]").forEach(form=>{
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      toast("✅ Sent (demo). Hook this to your backend later.");
      form.reset();
    });
  });
}

/* Toast (single clean implementation) */
let toastEl = null;

function mountToasts(){
  if(toastEl) { mountToastsClick(); return; }

  toastEl = document.createElement("div");
  toastEl.style.position = "fixed";
  toastEl.style.left = "50%";
  toastEl.style.bottom = "22px";
  toastEl.style.transform = "translateX(-50%) translateY(8px)";
  toastEl.style.padding = "12px 14px";
  toastEl.style.borderRadius = "999px";
  toastEl.style.border = "1px solid rgba(255,255,255,.14)";
  toastEl.style.background = "rgba(255,255,255,.10)";
  toastEl.style.backdropFilter = "blur(14px)";
  toastEl.style.boxShadow = "0 12px 40px rgba(0,0,0,.35)";
  toastEl.style.fontWeight = "800";
  toastEl.style.fontSize = "13px";
  toastEl.style.color = "rgba(255,255,255,.92)";
  toastEl.style.opacity = "0";
  toastEl.style.pointerEvents = "none";
  toastEl.style.transition = "opacity .18s ease, transform .18s ease";
  document.body.appendChild(toastEl);

  mountToastsClick();
}

function toast(msg){
  if(!toastEl) mountToasts();
  toastEl.textContent = msg;
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateX(-50%) translateY(0)";
  setTimeout(()=>{
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(8px)";
  }, 2400);
}

function mountToastsClick(){
  $$("[data-toast]").forEach(el=>{
    if(el.dataset.boundToast === "1") return;
    el.dataset.boundToast = "1";
    el.addEventListener("click", ()=>{
      toast(el.dataset.toast || "✅ Done");
    });
  });
}

/* Scroll reveal */
function mountScrollReveal(){
  const els = $$(".reveal");
  if(!els.length) return;

  if(!("IntersectionObserver" in window)){
    els.forEach(el => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el=> io.observe(el));
}

/* ✅ Lazy-load background images via data-bg */
function mountLazyBackgrounds(){
  const bgEls = $$("[data-bg]");
  if(!bgEls.length) return;

  const apply = (el) => {
    const src = el.getAttribute("data-bg");
    if(!src) return;
    el.style.backgroundImage = `url('${src}')`;
    el.removeAttribute("data-bg");
  };

  if(!("IntersectionObserver" in window)){
    bgEls.forEach(apply);
    return;
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        apply(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  bgEls.forEach(el=> io.observe(el));
}






