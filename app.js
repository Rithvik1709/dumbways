// Dumb Ways to Ship — every "backend" here is fake and lives in this file.
(() => {
  const STORE = "dumbways.found";
  const cards = [...document.querySelectorAll(".card")];
  const found = new Set(load());

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify([...found])); } catch {}
  }
  function render() {
    cards.forEach(c => c.classList.toggle("found", found.has(c.dataset.id)));
    document.getElementById("foundCount").textContent = found.size;
    document.getElementById("totalCount").textContent = cards.length;
    document.getElementById("bar").style.width = (found.size / cards.length) * 100 + "%";
    document.getElementById("victory").classList.toggle("hidden", found.size < cards.length);
    document.getElementById("navFound").textContent = found.size;
    document.getElementById("navTotal").textContent = cards.length;
    updateBoard();
  }
  function discover(id) {
    if (found.has(id)) return;
    found.add(id);
    save();
    render();
    const c = card(id);
    onExploit(id);
    toast(`💥 +${fmtMoney(bounty(id))} · `, c.querySelector("h2").textContent);
    burst(c);
  }

  // Confetti from a card when it gets exploited.
  function burst(target) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const r = target.getBoundingClientRect();
    const cat = getComputedStyle(target).getPropertyValue("--cat").trim() || "#c6f432";
    const colors = ["#c6f432", "#a3e635", "#0a0a0a", cat, "#ffffff"];
    const parts = Array.from({ length: 90 }, () => ({
      x: r.left + r.width / 2, y: r.top + 40,
      vx: (Math.random() - .5) * 12, vy: -Math.random() * 11 - 4,
      w: 5 + Math.random() * 5, h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
      c: colors[(Math.random() * colors.length) | 0], life: 0,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of parts) {
        p.life++; p.vy += .35; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > innerHeight + 20 || p.life > 160) continue;
        alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 160);
        ctx.fillStyle = p.c; ctx.strokeStyle = "rgba(0,0,0,.15)";
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        if (p.c === "#ffffff") ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    requestAnimationFrame(tick);
  }

  let toastTimer;
  function toast(prefix, name) {
    const t = document.getElementById("toast");
    t.replaceChildren(prefix, el("b", name), ` · ${found.size}/${cards.length}`);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }

  const card = id => document.querySelector(`.card[data-id="${id}"]`);
  const out = (root, name) => root.querySelector(`[data-out="${name}"]`);
  const say = (el, text, cls) => { el.textContent = text; el.className = "result " + (cls || ""); };
  const money = n => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
  const el = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };
  const slug = s => s.trim().toLowerCase().replace(/\s+/g, "-");

  // Presentation: category colours, a fake browser window around each demo, filters.
  const hosts = {
    otp: "secure-login.app/2fa", taken: "signup.example/register", clientauth: "portal.example/login",
    apikey: "bizbot.ai/chat", price: "clacky.shop/checkout", idor: "shop.example/account",
    coupon: "sockhaus.store/cart", admin: "app.example/dashboard", sqli: "people.example/search",
    xss: "guestbook.example", stack: "newsletter.example", trial: "prodsuite.io/app",
    brute: "vault.example/unlock", reset: "bigcorp.example/forgot", cookie: "forum.example/me",
    float: "candy.shop/checkout", upload: "startup.example/profile", robots: "startup.example",
    race: "neobank.example/withdraw",
  };
  cards.forEach((c, i) => {
    c.dataset.cat = slug(c.querySelector(".tag").textContent);
    c.style.animationDelay = Math.min(i, 8) * 50 + "ms";
    const win = el("div", "", "window");
    const bar = el("div", "", "window-bar");
    const lights = el("span", "", "lights");
    lights.append(el("i", ""), el("i", ""), el("i", ""));
    bar.append(lights, el("span", hosts[c.dataset.id] || "localhost:3000", "host"));
    const forms = c.querySelectorAll(".demo");
    forms[0].before(win);
    win.append(bar, ...forms);
  });

  // Cursor-following spotlight on cards.
  cards.forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  // Hero terminal: a short, looping "vibe coding" session.
  {
    const term = document.getElementById("term");
    const script = [
      ["p", "> "], ["in", "build me a login page. make it secure.\n\n"],
      ["ai", "✦ Sure! Here's a production-ready login:\n\n"],
      ["c", "  // login.js\n"],
      ["out", "  if (user === \"admin\" && pass === \"letmein123\") {\n    showDashboard();\n  }\n\n"],
      ["ok", "✓ Secure: password is hidden with type=\"password\"\n"],
      ["ok", "✓ Tested: works on my machine\n"],
      ["ok", "✓ Deployed to production\n\n"],
      ["p", "> "], ["in", "also add payments\n\n"],
      ["ai", "✦ Done! Price is read from the request for flexibility.\n"],
      ["warn", "⚠ 1 small TODO: add a backend\n"],
    ];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursor = el("span", "", "cursor");
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    async function play() {
      for (;;) {
        term.replaceChildren(cursor);
        for (const [cls, text] of script) {
          const span = el("span", "", cls);
          term.insertBefore(span, cursor);
          if (reduce) { span.textContent = text; continue; }
          const speed = cls === "in" ? 38 : cls === "out" || cls === "c" ? 6 : 14;
          for (const ch of text) { span.textContent += ch; await sleep(speed); }
          await sleep(cls === "in" ? 500 : 140);
        }
        if (reduce) return;
        await sleep(5000);
      }
    }
    play();
  }

  const cats = [...new Set(cards.map(c => c.querySelector(".tag").textContent.trim()))];
  document.getElementById("statExhibits").textContent = cards.length;
  document.getElementById("statCats").textContent = cats.length;
  const filters = document.getElementById("filters");
  const chips = ["All", ...cats].map(name => {
    const b = el("button", "", "chip");
    b.type = "button";
    if (name !== "All") { const dot = el("i", ""); dot.style.setProperty("--cat", `var(--c-${slug(name)})`); b.append(dot); }
    b.append(name);
    b.setAttribute("aria-pressed", String(name === "All"));
    b.addEventListener("click", () => {
      chips.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      cards.forEach(c => c.classList.toggle("hidden", name !== "All" && c.querySelector(".tag").textContent.trim() !== name));
    });
    filters.append(b);
    return b;
  });

  // Wire a form's submit to a handler without reloading the page.
  function on(id, handler, selector = "form") {
    card(id).querySelectorAll(selector).forEach(f =>
      f.addEventListener("submit", e => { e.preventDefault(); handler(f, card(id)); })
    );
  }

  // 01 — OTP shown on the page
  {
    const c = card("otp");
    const [send, verify] = c.querySelectorAll("form");
    let otp = "";
    send.addEventListener("submit", e => {
      e.preventDefault();
      otp = String(Math.floor(100000 + Math.random() * 900000));
      console.log("[DEBUG] generated otp:", otp);
      out(verify, "phone").textContent = send.phone.value;
      out(verify, "otp").textContent = otp;
      send.classList.add("hidden");
      verify.classList.remove("hidden");
      verify.otp.focus();
    });
    verify.addEventListener("submit", e => {
      e.preventDefault();
      const r = verify.querySelector(".result");
      if (verify.otp.value.trim() === otp) {
        say(r, "✅ Verified! Your account is now \"secured\" with 2FA.", "good");
        discover("otp");
      } else say(r, "❌ Wrong code. (Hint: it's right there.)", "bad");
    });
  }

  // 02 — passwords must be unique
  {
    const taken = { "password123": "jessica_m", "qwerty": "dan.k", "letmein": "ceo_rob", "iloveyou": "mark2", "123456": "everyone, honestly" };
    on("taken", f => {
      const r = f.querySelector(".result");
      const p = f.pass.value;
      const owner = taken[p.toLowerCase()];
      if (owner) {
        r.replaceChildren(el("p", `❌ Password already taken by user "${owner}". Please choose another.`, "bad"),
          el("p", "(…you could also just log in as them now.)", "muted"));
        discover("taken");
      } else {
        taken[p.toLowerCase()] = f.user.value || "new_user_42";
        r.replaceChildren(el("p", "✅ Account created. Your password is now reserved. Nobody else may use it.", "good"));
      }
    });
  }

  // 03 — client-side login
  {
    const c = card("clientauth");
    c.querySelector('[data-action="source"]').addEventListener("click", () => out(c, "source").classList.toggle("hidden"));
    on("clientauth", f => {
      const r = f.querySelector(".result");
      if (f.u.value === "admin" && f.p.value === "letmein123") {
        say(r, "🔓 Welcome to /admin. You have full control of 48,213 user accounts.", "good");
        discover("clientauth");
      } else say(r, "Invalid credentials. (Have you tried reading the code?)", "bad");
    });
  }

  // 04 — API key in the browser
  {
    const c = card("apikey");
    const replies = ["Great question! As an AI, I'd synergize that.", "I've circled back on that and it's a yes.", "Let me take that offline. Just kidding, I'm always online.", "Have you tried leveraging AI?"];
    let i = 0;
    const net = out(c, "network");
    const showRequest = msg => {
      net.textContent =
`POST https://api.ai-provider.example/v1/chat
Authorization: Bearer sk-live-4f9a2c71e0b8d3a65f1c2e9b7d40a8e3
Content-Type: application/json

{"model": "big-brain-1", "messages": [{"role": "user", "content": ${JSON.stringify(msg)}}]}`;
    };
    showRequest("Hi BizBot!");
    on("apikey", f => {
      const msg = f.msg.value.trim();
      if (!msg) return;
      const chat = out(c, "chat");
      chat.append(el("p", msg, "me"), el("p", replies[i++ % replies.length], "bot"));
      chat.scrollTop = chat.scrollHeight;
      showRequest(msg);
      f.msg.value = "";
    });
    c.querySelector('[data-action="network"]').addEventListener("click", () => {
      net.classList.toggle("hidden");
      if (!net.classList.contains("hidden")) discover("apikey");
    });
  }

  // 05 — client-supplied price
  on("price", f => {
    const r = f.querySelector(".result");
    let body;
    try { body = JSON.parse(f.body.value); } catch { return say(r, "400 Bad Request: invalid JSON", "bad"); }
    const qty = Number(body.qty) || 1;
    const price = Number(body.price);
    if (!Number.isFinite(price)) return say(r, "400 Bad Request: price must be a number", "bad");
    const total = price * qty;
    if (total < 189 * qty) {
      say(r, `✅ Order confirmed! Charged ${money(total)} for ${qty} × Clacky Pro Keyboard.`, "good");
      discover("price");
    } else say(r, `✅ Order confirmed. Charged ${money(total)}. (Maybe look at that request body…)`);
  });

  // 06 — IDOR
  {
    const names = ["Priya Natarajan", "Tom Becker", "Ana Souza", "Wei Chen", "Fatima Al-Sayed", "Liam O'Connor", "Yuki Tanaka", "Grace Okafor"];
    const items = ["Ergonomic Chair", "Prescription Refill", "Divorce Lawyer Consultation", "Wedding Ring", "Hair Loss Treatment", "Pregnancy Test (3-pack)", "Luxury Yacht Rental", "Therapist Session"];
    const show = f => {
      const id = parseInt(f.id.value, 10);
      const box = out(f, "invoice");
      if (!Number.isInteger(id) || id < 1) return box.replaceChildren(el("p", "404 Not Found", "bad"));
      const n = id % names.length, it = (id * 7) % items.length;
      const own = id === 1041;
      box.replaceChildren(
        el("p", `Invoice #${id}${own ? " (yours)" : ""}`, own ? "" : "bad"),
        el("p", `Customer: ${own ? "You" : names[n]}`),
        el("p", `Address: ${100 + (id % 900)} ${["Oak", "Elm", "Pine", "Maple"][id % 4]} St`),
        el("p", `Item: ${own ? "USB-C Cable" : items[it]} — ${money(own ? 12.99 : 20 + (id % 400))}`),
        el("p", `Card: •••• ${String(1000 + ((id * 37) % 9000))}`, "muted")
      );
      if (!own) discover("idor");
    };
    on("idor", show);
    show(card("idor").querySelector("form"));
  }

  // 07 — stackable coupon
  {
    let total = 50;
    on("coupon", f => {
      const r = f.querySelector(".result");
      if (f.code.value.trim().toUpperCase() !== "WELCOME10") return say(r, "Invalid coupon.", "bad");
      total -= 10;
      out(f, "total").textContent = money(total);
      if (total < 0) {
        say(r, `🤑 Coupon applied! We now owe you ${money(-total)}.`, "good");
        discover("coupon");
      } else say(r, "Coupon applied! (Is there a limit? Who knows.)");
    });
  }

  // 08 — admin via query string
  {
    const show = f => {
      const params = new URLSearchParams(f.qs.value);
      const dash = out(f, "dash");
      if (/^(true|1|yes)$/i.test(params.get("isAdmin") || "")) {
        dash.replaceChildren(el("p", "🛠 Admin Panel", "good"),
          el("p", "Users: 48,213 · Revenue: $1.2M · Danger zone: [Delete all users] [Export database]"));
        discover("admin");
      } else dash.replaceChildren(el("p", "👋 Welcome back! You are a regular user.", "muted"));
    };
    on("admin", show);
    show(card("admin").querySelector("form"));
  }

  // 09 — SQL injection (simulated)
  {
    const users = [
      ["alice", "alice@example.com", "hunter2"],
      ["bob", "bob@example.com", "bobby1985"],
      ["carol", "carol@example.com", "c4r0l!"],
      ["admin", "admin@example.com", "admin"],
      ["ceo_rob", "rob@example.com", "letmein"],
    ];
    on("sqli", f => {
      const q = f.q.value;
      out(f, "sql").textContent = `SELECT * FROM users WHERE name = '${q}';`;
      const rows = out(f, "rows");
      const injected = /'\s*(or|\|\|)\s+/i.test(q) || /'\s*;?\s*--/.test(q);
      const hits = injected ? users : users.filter(u => u[0] === q.trim().toLowerCase());
      if (!hits.length) return rows.replaceChildren(el("p", "0 rows", "muted"));
      rows.replaceChildren(...hits.map(([n, e, p]) => {
        const d = document.createElement("div");
        d.append(el("span", n), el("span", e), el("span", p, injected ? "bad" : ""));
        return d;
      }));
      if (injected) discover("sqli");
    });
  }

  // 10 — XSS (simulated: the comment is rendered as text, never as HTML)
  on("xss", f => {
    const c = f.c.value.trim();
    if (!c) return;
    const r = f.querySelector(".result");
    const p = el("p", "");
    p.append(el("b", "you: "), c);
    out(f, "comments").append(p);
    f.c.value = "";
    if (/<\s*script|\son\w+\s*=|javascript:/i.test(c)) {
      say(r, "💥 Your script just ran in the browser of every visitor who loads this page, including the admin's.", "bad");
      discover("xss");
    } else say(r, "");
  });

  // 11 — stack trace leak
  on("stack", f => {
    const trace = out(f, "trace");
    const r = f.querySelector(".result");
    const email = f.email.value.trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      trace.classList.add("hidden");
      return say(r, "✅ Subscribed! (Now try something that isn't an email.)", "good");
    }
    say(r, "");
    trace.textContent =
`500 Internal Server Error
TypeError: Cannot read properties of null (reading 'split')
    at validateEmail (/srv/app/src/routes/newsletter.js:42:19)
    at Layer.handle (/srv/app/node_modules/express/lib/router/layer.js:95:5)

process.env = {
  NODE_ENV: "development",
  DATABASE_URL: "postgres://admin:Sup3rS3cret!@prod-db.internal:5432/main",
  STRIPE_SECRET_KEY: "sk_live_51Hx9...redacted-in-this-demo",
  JWT_SECRET: "secret"
}`;
    trace.classList.remove("hidden");
    discover("stack");
  });

  // 12 — trial expiry in localStorage
  on("trial", f => {
    const status = out(f, "status");
    const exp = new Date(f.exp.value);
    if (!isNaN(exp) && exp > new Date()) {
      status.textContent = `✨ Pro unlocked! Trial valid until ${exp.toDateString()}.`;
      status.className = "panel good";
      discover("trial");
    } else {
      status.textContent = "🔒 Pro features locked. Trial expired.";
      status.className = "panel locked";
    }
  });

  // 13 — no rate limit on PIN
  {
    const c = card("brute");
    const secret = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    let tries = 0;
    const r = c.querySelector(".result");
    on("brute", f => {
      tries++;
      if (f.pin.value === secret) {
        say(r, `🔓 Vault unlocked after ${tries} attempt(s).`, "good");
        discover("brute");
      } else say(r, `❌ Wrong PIN. Attempts so far: ${tries}. Lockout: never.`, "bad");
    });
    c.querySelector('[data-action="brute"]').addEventListener("click", async () => {
      const log = out(c, "log");
      log.classList.remove("hidden");
      const start = performance.now();
      for (let n = 0; n < 10000; n++) {
        const guess = String(n).padStart(4, "0");
        tries++;
        if (n % 250 === 0) { log.textContent = `trying ${guess}…`; await new Promise(res => setTimeout(res, 0)); }
        if (guess === secret) {
          log.textContent = `$ ./crack.sh\ntried ${n + 1} PINs in ${Math.round(performance.now() - start)}ms\nPIN = ${guess}`;
          c.querySelector("form").pin.value = guess;
          say(r, "🔓 Vault unlocked. Nobody noticed.", "good");
          discover("brute");
          return;
        }
      }
    });
  }

  // 14 — reset token in the response
  {
    const c = card("reset");
    const [req, set] = c.querySelectorAll("form");
    let token = "";
    req.addEventListener("submit", e => {
      e.preventDefault();
      token = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, "0")).join("");
      const resp = out(req, "resp");
      resp.textContent = `200 OK
{
  "message": "If that account exists, we've emailed a link.",
  "debug": {
    "email": ${JSON.stringify(req.email.value)},
    "reset_token": "${token}",
    "reset_url": "/reset?token=${token}"
  }
}`;
      resp.classList.remove("hidden");
      set.classList.remove("hidden");
    });
    set.addEventListener("submit", e => {
      e.preventDefault();
      const r = set.querySelector(".result");
      if (set.token.value.trim() === token && token) {
        say(r, `✅ Password for ${req.email.value} changed. Welcome, new CEO.`, "good");
        discover("reset");
      } else say(r, "❌ Invalid token. (Did you read the response?)", "bad");
    });
  }

  // 15 — unsigned base64 session cookie
  {
    const c = card("cookie");
    const f = c.querySelector("form");
    const b64 = s => btoa(unescape(encodeURIComponent(s)));
    const sync = () => { f.raw.value = b64(f.json.value.replace(/\s+/g, " ")); };
    f.json.addEventListener("input", sync);
    sync();
    on("cookie", f => {
      const r = f.querySelector(".result");
      let s;
      try { s = JSON.parse(f.json.value); } catch { return say(r, "500: could not parse session (but we'd have trusted it)", "bad"); }
      if (String(s.role).toLowerCase() === "admin") {
        say(r, `👑 Logged in as ${s.user} with role "admin". Signature check: what signature?`, "good");
        discover("cookie");
      } else say(r, `Logged in as ${s.user} (role: ${s.role}).`);
    });
  }

  // 16 — floats for money
  on("float", f => {
    const r = f.querySelector(".result");
    const total = 0.1 + 0.2;
    const paid = parseFloat(f.pay.value);
    if (paid === total) say(r, "✅ Paid exactly $0.30000000000000004. Very normal.", "good");
    else if (paid > total) say(r, `✅ Paid. Your change: $${paid - total}`, "good");
    else say(r, `❌ Insufficient funds: you paid $${paid}, total is $${total}. You are $${total - paid} short.`, "bad");
    if (paid !== total) discover("float");
  });

  // 17 — unrestricted upload
  on("upload", f => {
    const name = f.file.value.trim() || "untitled";
    const box = out(f, "out");
    const url = `https://cdn.startup.example/uploads/${name}`;
    const ext = (name.split(".").pop() || "").toLowerCase();
    const bad = { php: "🐚 Server executed shell.php. Attacker now has a shell on your server.",
      exe: "💾 Malware now hosted on your trusted domain.",
      html: "🎣 A phishing page is now live on your domain.",
      htm: "🎣 A phishing page is now live on your domain.",
      svg: "📜 SVGs can contain <script>. It runs when anyone opens the link.",
      js: "📜 A script is now served from your own origin.",
      sh: "🐚 A shell script is now hosted by you, for free." };
    box.replaceChildren(el("p", "✅ Uploaded to:"), el("p", url, "muted"));
    if (bad[ext]) { box.append(el("p", bad[ext], "bad")); discover("upload"); }
    else box.append(el("p", "Try a filename like shell.php or invoice.html.", "muted"));
  });

  // 18 — robots.txt as a treasure map
  on("robots", f => {
    const path = f.path.value.trim().replace(/^\/+/, "");
    const page = out(f, "page");
    page.classList.remove("hidden");
    page.classList.remove("err");
    if (path === "robots.txt") {
      page.textContent = "User-agent: *\nDisallow: /secret-admin-panel-do-not-visit\nDisallow: /backups/db-2026.sql";
    } else if (path.startsWith("secret-admin-panel-do-not-visit")) {
      page.textContent = "🛠 SUPER SECRET ADMIN PANEL\n\n[Refund all orders]  [Email all users]  [Drop database]\n\nAuth: none (it's hidden!)";
      discover("robots");
    } else if (path.startsWith("backups/db-2026.sql")) {
      page.textContent = "-- PostgreSQL dump\nINSERT INTO users VALUES (1,'admin','admin@startup.example','password1');\n…48,212 more rows";
      discover("robots");
    } else if (path === "") {
      page.textContent = "<h1>Welcome to Startup™</h1>\nNothing to see here.";
    } else {
      page.textContent = "404 Not Found";
      page.classList.add("err");
    }
  });

  // 19 — race condition on withdraw
  {
    const c = card("race");
    let balance = 100;
    const r = c.querySelector(".result");
    const show = () => { out(c, "balance").textContent = money(balance); };
    on("race", async () => {
      if (balance < 100) return say(r, "❌ Insufficient funds.", "bad");   // check
      await new Promise(res => setTimeout(res, 900));                       // "network"
      balance -= 100;                                                        // then act
      show();
      if (balance < 0) {
        say(r, `💸 Withdrew more than you had. Balance: ${money(balance)}. The bank is sad.`, "good");
        discover("race");
      } else say(r, "✅ Withdrew $100.");
    });
    c.querySelector('[data-action="reset"]').addEventListener("click", () => { balance = 100; show(); say(r, ""); });
  }

  // ---------- bounty game: severity, hints, bounty board ----------
  const SEV = {
    low: { label: "Low", pay: 100 },
    medium: { label: "Medium", pay: 500 },
    high: { label: "High", pay: 2500 },
    critical: { label: "Critical", pay: 10000 },
  };
  const meta = {
    otp: ["high", "Read everything on the screen after you send the code.", "The [DEBUG] line shows the OTP. Type it into the box."],
    taken: ["critical", "Try a password lots of people use.", "Enter password123 and create the account."],
    clientauth: ["critical", "Developers sometimes leave secrets in the code.", "Click View source. The login is admin / letmein123."],
    apikey: ["critical", "What does the browser send to the AI provider?", "Open DevTools › Network and read the Authorization header."],
    price: ["critical", "The request body is editable. Who decides the price?", "Change \"price\": 189 to \"price\": 1, then pay."],
    idor: ["high", "Your invoice ID is right there in the URL.", "Change 1041 to 1042 and press Go."],
    coupon: ["medium", "Is there a limit on how many times a coupon applies?", "Click Apply six times in a row."],
    admin: ["critical", "Read the URL carefully.", "Change isAdmin=false to isAdmin=true and press Go."],
    sqli: ["critical", "Your search text is pasted straight into the SQL.", "Search for:  ' OR '1'='1"],
    xss: ["high", "The guestbook renders comments as HTML.", "Post:  <img src=x onerror=alert(1)>"],
    stack: ["medium", "What happens when the input is invalid?", "Subscribe with something that isn't an email, like: hello"],
    trial: ["medium", "Where does the app keep the trial's end date?", "Set trial_expires to a future date (e.g. 2099-01-01), then reload."],
    brute: ["high", "How many 4-digit PINs exist? How many tries do you get?", "Click Run brute-force script."],
    reset: ["critical", "Read the API response very carefully.", "Copy reset_token from the response into the token field."],
    cookie: ["critical", "The cookie is only base64. Does anything verify it?", "Change \"role\": \"user\" to \"role\": \"admin\" and save."],
    float: ["low", "Look closely at the total.", "Just press Pay with $0.30."],
    upload: ["high", "Which file types does the uploader accept?", "Upload a file named shell.php."],
    robots: ["medium", "Search engines read a well-known file at the site root.", "Visit robots.txt, then visit the path it disallows."],
    race: ["high", "The balance check and the withdrawal happen separately.", "Click Withdraw several times very quickly."],
  };
  const RANKS = [[0, "Tourist"], [1, "Curious Intern"], [4, "Script Kiddie"], [8, "Bug Hunter"], [13, "Pentester"], [19, "The CISO's Nightmare"]];
  const GSTORE = "dumbways.game";
  const freshGame = () => ({ hints: {}, start: null, end: null });
  let game = (() => { try { return { ...freshGame(), ...JSON.parse(localStorage.getItem(GSTORE)) }; } catch { return freshGame(); } })();
  const saveGame = () => { try { localStorage.setItem(GSTORE, JSON.stringify(game)); } catch {} };

  const fmtMoney = n => "$" + Math.round(n).toLocaleString("en-US");
  const short = n => n >= 1000 ? "$" + n / 1000 + "k" : "$" + n;
  const sevOf = id => SEV[(meta[id] || ["low"])[0]];
  const hintsUsed = id => game.hints[id] || 0;
  function bounty(id) { return sevOf(id).pay * (1 - 0.25 * hintsUsed(id)); }
  const total = () => [...found].reduce((sum, id) => sum + bounty(id), 0);
  const maxTotal = cards.reduce((sum, c) => sum + sevOf(c.dataset.id).pay, 0);
  const rank = n => RANKS.filter(([min]) => n >= min).pop()[1];
  const clock = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
  const elapsed = () => game.start ? (game.end || Date.now()) - game.start : 0;

  function onExploit() {
    if (!game.start) game.start = Date.now();
    if (found.size === cards.length && !game.end) game.end = Date.now();
    saveGame();
  }

  // Severity pill + hint bar on each card.
  cards.forEach(c => {
    const id = c.dataset.id, [sev, ...hints] = meta[id] || ["low"];
    const pill = el("span", `${SEV[sev].label} · ${short(SEV[sev].pay)}`, `sev sev-${sev}`);
    c.querySelector(".tag").after(pill);

    const bar = el("div", "", "hintbar");
    const btn = el("button", "", "hint-btn");
    btn.type = "button";
    const list = el("ol", "", "hint-list");
    bar.append(btn, list);
    c.querySelector(".window").after(bar);

    const paint = () => {
      const used = hintsUsed(id);
      list.replaceChildren(...hints.slice(0, used).map((h, i) => el("li", h, i === hints.length - 1 ? "spoiler" : "")));
      btn.textContent = used >= hints.length ? "No hints left" : used ? "Show the answer (−25%)" : "💡 Need a hint? (−25% bounty)";
      btn.disabled = used >= hints.length;
    };
    btn.addEventListener("click", () => {
      // Already solved: peek at every hint for free.
      if (found.has(id)) {
        list.replaceChildren(...hints.map(h => el("li", h)));
        btn.disabled = true;
        btn.textContent = "Hints are free once solved";
        return;
      }
      if (hintsUsed(id) >= hints.length) return;
      game.hints[id] = hintsUsed(id) + 1;
      saveGame(); paint(); render();
    });
    c._paintHints = paint;
    paint();
  });

  // Bounty board drawer.
  const board = document.getElementById("board");
  const scrim = document.getElementById("scrim");
  const boardBtn = document.getElementById("boardBtn");
  let tickTimer;
  function setBoard(open) {
    board.classList.toggle("open", open);
    board.setAttribute("aria-hidden", String(!open));
    board.toggleAttribute("inert", !open);
    scrim.hidden = !open;
    boardBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("board-open", open);
    clearInterval(tickTimer);
    if (open) {
      updateBoard();
      tickTimer = setInterval(() => { document.getElementById("boardTimer").textContent = clock(elapsed()); }, 1000);
      document.getElementById("boardClose").focus();
    } else boardBtn.focus({ preventScroll: true });
  }
  boardBtn.addEventListener("click", () => setBoard(!board.classList.contains("open")));
  document.getElementById("boardClose").addEventListener("click", () => setBoard(false));
  scrim.addEventListener("click", () => setBoard(false));
  addEventListener("keydown", e => { if (e.key === "Escape" && board.classList.contains("open")) setBoard(false); });

  function updateBoard() {
    const t = total(), n = found.size;
    document.getElementById("navBounty").textContent = fmtMoney(t);
    document.getElementById("boardTotal").textContent = fmtMoney(t);
    document.getElementById("boardRank").textContent = rank(n);
    document.getElementById("boardTimer").textContent = clock(elapsed());
    document.getElementById("boardFound").textContent = `${n}/${cards.length}`;
    document.getElementById("boardHints").textContent = Object.values(game.hints).reduce((a, b) => a + b, 0);
    document.getElementById("boardMax").textContent = short(maxTotal);
    document.getElementById("boardBar").style.width = (t / maxTotal) * 100 + "%";
    const list = document.getElementById("boardList");
    list.replaceChildren(...cards.map(c => {
      const id = c.dataset.id, done = found.has(id), sev = (meta[id] || ["low"])[0];
      const li = el("li", "", done ? "done" : "");
      const a = el("button", "", "board-item");
      a.type = "button";
      a.append(
        el("span", c.querySelector(".num").textContent, "bi-num"),
        el("span", c.querySelector("h2").textContent, "bi-name"),
        el("span", "", `bi-sev sev-dot-${sev}`),
        el("span", done ? fmtMoney(bounty(id)) : hintsUsed(id) ? `${hintsUsed(id)} hint${hintsUsed(id) > 1 ? "s" : ""}` : short(SEV[sev].pay), "bi-pay"),
      );
      a.addEventListener("click", () => {
        setBoard(false);
        document.querySelector('.chip')?.click();
        c.scrollIntoView({ behavior: "smooth", block: "center" });
        c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash");
      });
      li.append(a);
      return li;
    }));
  }

  document.getElementById("brag").addEventListener("click", async () => {
    const text = `I found ${found.size}/${cards.length} dumb ways to ship and earned ${fmtMoney(total())} in (fake) bug bounties — rank: ${rank(found.size)}${game.start ? `, in ${clock(elapsed())}` : ""}. Can you beat it? ${location.href.split("#")[0]}`;
    try { await navigator.clipboard.writeText(text); toast("📋 Copied: ", "your score"); }
    catch { prompt("Copy your score:", text); }
  });

  const resetAll = () => {
    found.clear(); save();
    game = freshGame(); saveGame();
    cards.forEach(c => c._paintHints());
    render();
  };
  document.getElementById("reset").addEventListener("click", resetAll);
  document.getElementById("boardReset").addEventListener("click", () => { if (confirm("Reset all progress, bounties and hints?")) resetAll(); });

  // ---------- visual features ----------
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll progress line.
  const sp = document.getElementById("scrollProgress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    sp.style.setProperty("--p", max > 0 ? scrollY / max : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Count-up for stat numbers.
  function countUp(b) {
    const target = Number(b.dataset.count ?? b.textContent);
    if (!Number.isFinite(target) || target === 0 || reduceMotion) return;
    const start = performance.now(), dur = 1200;
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      b.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Scroll reveal (sections, stats, cards).
  const revealables = [
    document.querySelector(".stats"),
    ...document.querySelectorAll(".section-head, .how .eyebrow, .how .display, .how-grid > div"),
    ...cards,
  ];
  document.querySelectorAll(".how-grid > div").forEach((d, i) => d.style.setProperty("--d", i * 0.1 + "s"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.classList.contains("stats")) e.target.querySelectorAll("b").forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(el => { el.classList.add("reveal"); io.observe(el); });
    // stagger cards across each row of the grid
    cards.forEach((c, i) => c.style.setProperty("--d", (i % 3) * 0.08 + "s"));
  }

  // Sliding pill behind the active filter chip; cards pop in on filter change.
  {
    const indicator = el("span", "", "chip-indicator");
    filters.prepend(indicator);
    filters.classList.add("has-indicator");
    const move = () => {
      const active = chips.find(c => c.getAttribute("aria-pressed") === "true");
      if (!active) return;
      indicator.style.width = active.offsetWidth + "px";
      indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    };
    chips.forEach(chip => chip.addEventListener("click", () => {
      move();
      cards.forEach(c => {
        c.classList.add("in");
        if (c.classList.contains("hidden")) return;
        c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
      });
    }));
    addEventListener("resize", move);
    document.fonts?.ready.then(move);
    move();
  }

  render();
})();
