/* AutoDirect storefront - router, API client, Firebase auth and pages.
   Components live in ds.js (window.AD); this file wires them to the Express API. */
(function () {
  "use strict";
  var R = window.React, h = R.createElement, useState = R.useState, useEffect = R.useEffect, Frag = R.Fragment;
  var A = window.AD, D = A.data, fmt = A.format, hooks = A.hooks;

  /* ------------------------------------------------------------------ API */
  var fb = null;            // firebase namespace once initialised (null when auth isn't configured)
  var authReady;            // promise resolving when Firebase has been initialised (or found missing)
  var me = null;            // profile row from /api/account/me for the signed-in user

  function token() {
    try { return fb && fb.auth().currentUser ? fb.auth().currentUser.getIdToken() : Promise.resolve(""); }
    catch (e) { return Promise.resolve(""); }
  }
  function request(method, url, body) {
    return token().then(function (t) {
      var headers = { "Content-Type": "application/json" };
      if (t) headers.Authorization = "Bearer " + t;
      return fetch(url, { method: method, headers: headers, body: body === undefined ? undefined : JSON.stringify(body) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) { var e = new Error((data && data.error) || "Something went wrong (" + res.status + ")"); e.status = res.status; throw e; }
        return data;
      });
    });
  }
  var api = { get: function (u) { return request("GET", u); }, post: function (u, b) { return request("POST", u, b); },
    put: function (u, b) { return request("PUT", u, b); }, del: function (u) { return request("DELETE", u); }, token: token };
  A.api = api;

  /* ------------------------------------------------------------------ routes */
  var PATHS = { home: "/", stock: "/our-stock", compare: "/compare", auction: "/live-auction", request: "/request-a-bid", buy: "/how-to-buy",
    sheet: "/how-to-read-auction-sheet", vocab: "/vocabulary", about: "/about-us", contact: "/contact-us", login: "/login", register: "/register",
    account: "/my-account", admin: "/admin" };
  var TITLES = { home: "Japanese auction car imports for Sri Lanka", stock: "Our stock", compare: "Compare vehicles", auction: "Live auction", request: "Request a bid",
    buy: "How to buy", sheet: "How to read an auction sheet", vocab: "Import vocabulary", about: "About us", contact: "Contact us", login: "Sign in", register: "Create account",
    account: "My account", admin: "Admin" };
  var ACCOUNT_TABS = { "live-auction-request": "auction", "profile-settings": "profile", "my-inquiries": "inquiries" };

  hooks.href = function (id) { return PATHS[id] || "/"; };

  function parse() {
    var path = location.pathname.replace(/\/+$/, "") || "/";
    var q = new URLSearchParams(location.search);
    var m = /^\/our-stock\/([^/]+)$/.exec(path);
    if (m) return { page: "vehicle", seo: decodeURIComponent(m[1]) };
    if (/^\/my-account(\/|$)/.test(path)) return { page: "account", tab: ACCOUNT_TABS[path.split("/")[2]] || q.get("tab") || "overview" };
    if (/^\/admin(\/|$)/.test(path)) return { page: "admin" };
    for (var k in PATHS) if (PATHS[k] === path) {
      if (k === "stock") {
        var f = {};
        ["make", "type", "location"].forEach(function (n) { if (q.get(n)) f[n] = q.get(n); });
        if (q.get("min") || q.get("max")) f.budget = [Number(q.get("min")) || 0, Number(q.get("max")) || 1e12];
        if (q.get("from")) f.yearFrom = q.get("from");
        return { page: "stock", filters: f };
      }
      return { page: k };
    }
    return { page: "notfound" };
  }
  function urlFor(page, arg) {
    if (page === "vehicle") return "/our-stock/" + encodeURIComponent(arg);
    if (page === "stock" && arg) {
      var q = new URLSearchParams();
      ["make", "type", "location"].forEach(function (n) { if (arg[n]) q.set(n, arg[n]); });
      if (arg.budget) { q.set("min", arg.budget[0]); q.set("max", arg.budget[1]); }
      if (arg.yearFrom) q.set("from", arg.yearFrom);
      return PATHS.stock + (q.toString() ? "?" + q.toString() : "");
    }
    if (page === "account" && arg && arg.tab && arg.tab !== "overview") return PATHS.account + "?tab=" + arg.tab;
    return PATHS[page] || "/";
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ------------------------------------------------------------------ Firebase auth */
  var FRIENDLY = {
    "auth/invalid-credential": "Incorrect email or password.", "auth/wrong-password": "Incorrect email or password.", "auth/user-not-found": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email address.", "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/weak-password": "Choose a stronger password (at least 8 characters).", "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network problem. Check your connection and try again."
  };
  function initFirebase() {
    return api.get("/api/config").then(function (cfg) {
      if (!cfg.firebase || !cfg.firebase.apiKey || !window.firebase) return null;
      if (!firebase.apps.length) firebase.initializeApp(cfg.firebase);
      fb = firebase;
      return fb;
    }).catch(function () { return null; });
  }
  function fbError(e) { return new Error(FRIENDLY[e.code] || e.message || "Something went wrong."); }
  function needFb() { if (!fb) throw new Error("Sign-in isn’t available yet. Please call us instead."); return fb; }

  hooks.auth = function (mode, d) {
    return Promise.resolve().then(function () {
      var f = needFb(), au = f.auth();
      if (mode === "forgot") return au.sendPasswordResetEmail(d.email).then(function () { return ""; });
      if (mode === "login") {
        return au.setPersistence(d.remember ? f.auth.Auth.Persistence.LOCAL : f.auth.Auth.Persistence.SESSION)
          .then(function () { return au.signInWithEmailAndPassword(d.email, d.pw); }).then(function (c) { return c.user.displayName || d.email.split("@")[0]; });
      }
      return au.createUserWithEmailAndPassword(d.email, d.pw).then(function (c) {
        return c.user.updateProfile({ displayName: d.name }).then(function () { return c.user.getIdToken(true); })
          .then(function () { return api.put("/api/account/me", { name: d.name, phone: d.phone || "", address: "" }).catch(function () {}); })
          .then(function () { return d.name; });
      });
    }).catch(function (e) { throw e.code ? fbError(e) : e; });
  };
  hooks.isAuthed = function () { return !!me; };
  hooks.me = function () { return me ? { name: me.name, email: me.email, phone: me.phone } : null; };

  /* ------------------------------------------------------------------ server actions used by the forms */
  hooks.subscribe = function (email) { return api.post("/api/newsletter", { email: email }); };
  hooks.sendInquiry = function (p) { return api.post("/api/inquiries", p); };
  hooks.sendRequest = function (d) {
    return api.post("/api/live-inquiries", { make: d.make, model: d.model, chassis: d.chassis, yFrom: d.yFrom, yTo: d.yTo, colours: d.colours,
      budget: d.budget, km: d.km, grade: d.grade, name: d.name, phone: d.phone });
  };
  hooks.sendContact = function (topic, d) {
    var message = d.msg || "";
    if (topic === "sell") message = ["Sell your car: " + [d.year, d.make, d.model].filter(Boolean).join(" "), d.km ? "Mileage: " + d.km + " km" : "", d.ask ? "Asking: LKR " + d.ask : "", message].filter(Boolean).join("\n");
    return api.post("/api/inquiries", { kind: topic === "sell" ? "Sell your car" : "Contact", name: d.name, phone: d.phone, message: message, location: topic === "visit" ? d.location : "" });
  };
  hooks.placeBid = function (lot, max) { return api.post("/api/lots/" + lot.id + "/bid", { max: max }); };

  /* ------------------------------------------------------------------ small helpers */
  function byRef(id) { return D.vehicles.filter(function (v) { return v.id === id; })[0]; }
  function bySeo(seo) { return D.vehicles.filter(function (v) { return v.seo === seo; })[0]; }
  function setMeta(title) { document.title = (title ? title + " | " : "") + "AutoDirect"; }

  function PageHead(p) {
    // "bare" pages show only the breadcrumb and action; the title stays as a visually hidden h1.
    if (p.bare) return h("section", { className: "ad-sec ad-pagehead" }, h("div", { className: "ad-wrap" }, h("h1", { className: "ad-sr" }, p.title),
      h("div", { className: "ad-row ad-row--between" },
        p.crumb ? h("nav", { className: "ad-crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "/", onClick: function (e) { e.preventDefault(); hooks.go("home"); } }, "Home"), h(A.Icon, { name: "chevron-right", size: 14 }), h("span", { "aria-current": "page" }, p.crumb)) : h("span"),
        p.action || null)));
    return h("section", { className: "ad-sec ad-pagehead" }, h("div", { className: "ad-wrap" },
      p.crumb ? h("nav", { className: "ad-crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "/", onClick: function (e) { e.preventDefault(); hooks.go("home"); } }, "Home"), h(A.Icon, { name: "chevron-right", size: 14 }), h("span", { "aria-current": "page" }, p.crumb)) : null,
      h("div", { className: "ad-sec__head" },
        h("div", null, p.kicker ? h("div", { className: "ad-kicker" }, p.live ? h("span", { className: "ad-pulse", "aria-hidden": true }) : null, p.kicker) : null,
          h("h1", { className: "ad-displayl" }, p.title), p.lead ? h("p", { className: "ad-bodyl ad-muted" }, p.lead) : null),
        p.action || null)));
  }
  function Sec(p) {
    return h("section", { className: "ad-sec" + (p.tint ? " ad-sec--tint" : "") + (p.tight ? " ad-sec--tight" : "") }, h("div", { className: "ad-wrap" },
      p.title ? h("div", { className: "ad-sec__head" }, h("div", null, p.kicker ? h("div", { className: "ad-kicker" }, p.kicker) : null, h("h2", { className: "ad-h1" }, p.title), p.lead ? h("p", { className: "ad-bodyl ad-muted" }, p.lead) : null), p.action || null) : null,
      p.children));
  }
  function CTA(p) {
    return h("div", { className: "ad-cta" }, h("div", null, h("h2", { className: "ad-h1" }, p.title), h("p", { className: "ad-bodyl" }, p.text)), h("div", { className: "ad-row" }, p.children));
  }
  function Loading(p) { return h("div", { className: "ad-wrap ad-pagebody" }, h("p", { className: "ad-muted" }, p.text || "Loading…")); }

  /* ------------------------------------------------------------------ pages */
  function Home(p) {
    var feat = D.vehicles.filter(function (v) { return v.featured && v.status !== "Sold"; });
    if (!feat.length) feat = D.vehicles.filter(function (v) { return v.status !== "Sold"; }).slice(0, 4);
    feat = feat.slice(0, 4);
    return h(Frag, null,
      h("section", { className: "ad-hero" }, h("div", { className: "ad-wrap ad-hero__in" },
        h("div", { className: "ad-hero__copy" },
          h("div", { className: "ad-kicker" }, h("span", { className: "ad-pulse", "aria-hidden": true }), "Japan → Sri Lanka imports"),
          h("h1", { className: "ad-display" }, "Bid in Tokyo.", h("br"), h("span", null, "Drive in Colombo.")),
          h("p", { className: "ad-bodyl" }, "Browse our imported stock or let us bid for your exact car at this week’s Japanese auctions, with the original auction sheet translated before every bid."),
          h("ul", { className: "ad-hero__proof" },
            h("li", null, h(A.Icon, { name: "doc", size: 18 }), "Original auction sheet, in English"),
            h("li", null, h(A.Icon, { name: "shield", size: 18 }), "100% refundable deposit"),
            h("li", null, h(A.Icon, { name: "ship", size: 18 }), "30–45 days, LC to your driveway"))),
        h("div", { className: "ad-hero__search" }, h(A.HeroSearch, { onSearch: p.onSearch })))),
      feat.length ? h(Sec, { kicker: "Featured", title: "Ready to drive", lead: "Landed, cleared and waiting at our Malabe showroom.", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("stock"); } }, "All stock") },
        h("div", { className: "ad-stock__grid ad-stock__grid--4" }, feat.map(function (v) { return vehicleCard(p, v); })),
        h(A.CompareTray, { floating: true, items: p.cmp.map(byRef).filter(Boolean), onRemove: p.toggleCmp, onClear: p.clearCmp, onCompare: function () { p.nav("compare"); } })) : null,
      D.lots.length ? h(Sec, { tint: true, kicker: "Live now", title: "This week’s auction floor", lead: "Set a proxy maximum. We bid only what’s needed to win.", action: h(A.Button, { variant: "accent", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid") },
        h("div", { className: "ad-grid2" }, D.lots.slice(0, 2).map(function (l) { return h(A.AuctionLotCard, { key: l.id, lot: l }); }))) : null,
      h(Sec, { kicker: "How to buy", title: "Five steps, fully tracked", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("buy"); } }, "Full buying guide") },
        h(A.ProcessSteps, { onStart: function () { p.nav("request"); } })),
      h(Sec, { tint: true, kicker: "Know what you’re buying", title: "Read any auction sheet", lead: "Every lot comes with its inspection sheet. Tap a code on the car to decode it.", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("sheet"); } }, "Auction sheet guide") },
        h(A.AuctionSheetDecoder, null)),
      h(Sec, { tight: true }, h(CTA, { title: "Looking for one exact car?", text: "Tell us the model, year and budget. We shortlist lots and send every sheet before bidding." },
        h(A.Button, { variant: "accent", size: "l", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"),
        h(A.Button, { variant: "secondary", size: "l", icon: "phone", onClick: function () { p.nav("contact"); } }, "Talk to us"))),
      h(Sec, { tint: true, kicker: "Find it your way", title: "Browse our stock" }, h(A.BrowseSection, { onBrowse: function (f) { p.nav("stock", f); } })));
  }

  function vehicleCard(p, v) {
    return h(A.VehicleCard, { key: v.id, vehicle: v, onOpen: function () { p.nav("vehicle", v.seo); }, compared: p.cmp.indexOf(v.id) >= 0, compareDisabled: p.cmp.length >= 4,
      onCompare: function () { p.toggleCmp(v.id); }, saved: p.saved.indexOf(v.id) >= 0, onSave: function () { p.toggleSave(v.id); } });
  }

  function Stock(p) {
    return h(Frag, null,
      h(PageHead, { bare: true, crumb: "Our stock", title: "Our stock" }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.StockBrowser, {
        key: JSON.stringify(p.filters), initial: p.filters, vehicles: D.vehicles,
        cmp: p.cmp, onToggleCmp: p.toggleCmp, onClearCmp: p.clearCmp, saved: p.saved, onToggleSave: p.toggleSave,
        onOpen: function (v) { p.nav("vehicle", v.seo); }, onCompare: function () { p.nav("compare"); }, onRequest: function () { p.nav("request"); }
      })));
  }

  function Vehicle(p) {
    var v = bySeo(p.seo);
    var t = useState("specs"), tab = t[0], setTab = t[1];
    useEffect(function () { setTab("specs"); }, [p.seo]);
    useEffect(function () { if (v) setMeta(fmt.title(v) + " " + v.grade); }, [p.seo]);
    if (!v) return h("div", { className: "ad-wrap ad-pagebody" },
      h(A.Empty, { icon: "car", title: "We couldn’t find that vehicle", text: "It may have been sold or taken down. Browse what’s in stock or ask us to find a similar car." },
        h("div", { className: "ad-row" }, h(A.Button, { onClick: function () { p.nav("stock"); } }, "Our stock"), h(A.Button, { variant: "accent", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"))));
    var inCmp = p.cmp.indexOf(v.id) >= 0, saved = p.saved.indexOf(v.id) >= 0, sold = v.status === "Sold";
    var monthly = v.price > 0 ? (function () { var P = v.price * 0.7, r = 14.5 / 1200, n = 60; return P * r / (1 - Math.pow(1 + r, -n)); })() : 0;
    function goTab(x) { setTab(x); setTimeout(function () { var el = document.getElementById("vp-tabs"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30); }
    var similar = D.vehicles.filter(function (x) { return x.id !== v.id && x.status !== "Sold"; })
      .sort(function (a, b) { return ((b.make === v.make) * 2 + (b.type === v.type)) - ((a.make === v.make) * 2 + (a.type === v.type)); }).slice(0, 3);
    var items = v.images.map(function (src, i) { return { src: src, label: "Photo " + (i + 1) }; });
    return h("div", { className: "ad-wrap ad-vp" },
      h("nav", { className: "ad-crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "/our-stock", onClick: function (e) { e.preventDefault(); p.nav("stock"); } }, "Our stock"), h(A.Icon, { name: "chevron-right", size: 14 }),
        h("a", { href: urlFor("stock", { make: v.make }), onClick: function (e) { e.preventDefault(); p.nav("stock", { make: v.make }); } }, v.make), h(A.Icon, { name: "chevron-right", size: 14 }), h("span", { "aria-current": "page" }, (v.model + " " + v.grade).trim())),
      h("div", { className: "ad-vp__top" },
        h(A.VehicleGallery, { key: v.id, alt: fmt.title(v), items: items }),
        h("aside", { className: "ad-vp__buy" },
          h("div", { className: "ad-row" }, h(A.StatusBadge, { status: v.status }), v.isNew ? h(A.Badge, { tone: "highlight" }, "New arrival") : null, h("span", { className: "ad-mono ad-muted ad-small" }, v.id)),
          h("h1", { className: "ad-h1" }, fmt.title(v)), h("p", { className: "ad-muted" }, [v.grade, v.color].filter(Boolean).join(" · ")),
          h("ul", { className: "ad-vcard__specs ad-vp__specs" },
            h(A.Spec, { icon: "gauge" }, v.mileage ? fmt.num(v.mileage) + " km" : "-"), h(A.Spec, { icon: "fuel" }, v.fuel || "-"),
            h(A.Spec, { icon: "gear" }, v.trans || "-"), h(A.Spec, { icon: "car" }, v.engine ? v.engine + " cc" : "-")),
          h("div", { className: "ad-vp__price" }, h("div", null, h("div", { className: "ad-label" }, sold ? "Sold for" : "Price, duty paid"), h("div", { className: "ad-price" }, fmt.lkrFull(v.price)),
            monthly ? h("button", { type: "button", className: "ad-link ad-small", onClick: function () { goTab("loan"); } }, "≈ " + fmt.lkrFull(Math.round(monthly)) + "/month · 30% down, 5 yrs") : null),
            v.auctionGrade ? h(A.GradeSeal, { grade: v.auctionGrade, interior: v.interior, size: 64 }) : null),
          h(A.Button, { size: "l", block: true, icon: "doc", disabled: sold, onClick: function () { goTab("inquiry"); } }, sold ? "Sold" : "Request a quote"),
          h("div", { className: "ad-row" },
            h(A.Button, { variant: "secondary", block: true, icon: inCmp ? "check" : "compare", onClick: function () { p.toggleCmp(v.id); }, "aria-pressed": inCmp }, inCmp ? "In compare (" + p.cmp.length + ")" : "Compare"),
            h(A.Button, { variant: "secondary", icon: "heart", "aria-label": saved ? "Remove from saved" : "Save", "aria-pressed": saved, className: saved ? "is-saved" : "", onClick: function () { p.toggleSave(v.id); } }),
            h(A.Button, { variant: "secondary", icon: "whatsapp", "aria-label": "Share on WhatsApp", href: "https://wa.me/?text=" + encodeURIComponent(fmt.title(v) + " " + v.grade + " at AutoDirect " + location.origin + "/our-stock/" + v.seo), target: "_blank", rel: "noopener" })),
          h("p", { className: "ad-small ad-muted ad-vp__trust" }, h(A.Icon, { name: "shield", size: 15 }), "Original auction sheet and translation available on request"))),
      h("div", { id: "vp-tabs" }, h(A.Tabs, { variant: "line", label: "Vehicle details", tabs: [{ id: "specs", label: "Specs & features" }, { id: "loan", label: "Loan calculator" }, { id: "inquiry", label: "Inquiry" }], value: tab, onChange: setTab })),
      h("div", { className: "ad-vp__panel" }, tab === "specs" ? h(A.SpecSheet, { vehicle: v }) : tab === "loan" ? h(A.LoanCalculator, { key: v.id, price: v.price }) :
        h("div", { className: "ad-narrow" }, h(A.InquiryForm, { key: v.id, vehicle: v, onTrack: function () { p.nav("account", { tab: "inquiries" }); } }))),
      similar.length ? h(Frag, null,
        h("div", { className: "ad-sec__head ad-vp__similar" }, h("h2", { className: "ad-h2" }, "Similar vehicles"), h(A.Button, { variant: "ghost", iconRight: "arrow-right", onClick: function () { p.nav("stock"); } }, "All stock")),
        h("div", { className: "ad-stock__grid ad-stock__grid--3" }, similar.map(function (x) { return vehicleCard(p, x); }))) : null);
  }

  function Compare(p) {
    var list = p.cmp.map(byRef).filter(Boolean);
    return h(Frag, null,
      h(PageHead, { bare: true, crumb: "Compare", title: "Compare vehicles", action: h(A.Button, { variant: "secondary", icon: "plus", onClick: function () { p.nav("stock"); } }, "Add from stock") }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.CompareTable, { key: p.cmp.join(","), vehicles: list, onRemove: p.toggleCmp, onQuote: function (v) { p.nav("vehicle", v.seo); } })));
  }

  function Auction(p) {
    return h(Frag, null,
      h(PageHead, { bare: true, crumb: "Live auction", title: "Live auction", action: h(A.Button, { variant: "accent", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a specific car") }),
      h("div", { className: "ad-wrap ad-pagebody" },
        D.lots.length ? h("div", { className: "ad-grid2" }, D.lots.map(function (l) { return h(A.AuctionLotCard, { key: l.id, lot: l }); }))
          : h(A.Empty, { icon: "gavel", title: "No lots listed right now", text: "Thousands of cars cross the block each week. Tell us what you want and we’ll shortlist matching lots." }),
        h("div", { className: "ad-infostrip" },
          [["doc", "Sheet first", "Every lot’s original sheet, translated, before you bid."], ["shield", "Refundable deposit", "Bidding starts after a 100% refundable deposit."], ["gavel", "Proxy bidding", "Win below your maximum and keep the difference."]].map(function (x) {
            return h("div", { key: x[1] }, h(A.Icon, { name: x[0], size: 22 }), h("b", null, x[1]), h("p", { className: "ad-small ad-muted" }, x[2]));
          })),
        h(CTA, { title: "Not on this list?", text: "Tell us the model, year and budget and we’ll shortlist the lots." },
          h(A.Button, { variant: "accent", size: "l", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"),
          h(A.Button, { variant: "secondary", size: "l", onClick: function () { p.nav("sheet"); } }, "How to read a sheet"))));
  }

  function Request(p) {
    return h(Frag, null,
      h(PageHead, { crumb: "Request a bid", kicker: "Auction request", title: "Tell us the car. We’ll find the lot.", lead: "Three short steps. We reply with matching lots and translated sheets before any bid." }),
      h("div", { className: "ad-wrap ad-pagebody ad-split" },
        h(A.AuctionRequestForm, { initial: p.prefill }),
        h("aside", { className: "ad-sidecard" },
          h("h2", { className: "ad-h3" }, "What happens next"),
          h("ol", { className: "ad-mini-steps" },
            h("li", null, h("b", null, "Shortlist"), h("span", null, "We match lots from USS, TAA and JU auctions.")),
            h("li", null, h("b", null, "Sheets"), h("span", null, "You get each auction sheet with an English translation.")),
            h("li", null, h("b", null, "Deposit & bid"), h("span", null, "After a refundable deposit we bid up to your approved amount.")),
            h("li", null, h("b", null, "Track"), h("span", null, "Follow LC, shipping and delivery in My account."))),
          h(A.Button, { variant: "ghost", iconRight: "arrow-right", onClick: function () { p.nav("buy"); } }, "Full buying guide"))));
  }

  function Buy(p) {
    return h(Frag, null,
      h(PageHead, { crumb: "How to buy", kicker: "How to buy", title: "From auction floor to your driveway", lead: "No hidden charges. The whole process is visible in My account." }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.ProcessSteps, { onStart: function () { p.nav("request"); } }),
        h("div", { className: "ad-infostrip" },
          [["clock", "30–45 days", "Typical time from opening the LC to delivery."], ["doc", "LC within 7 days", "Of the pro-forma invoice. We prepare the bank documents with you."], ["ship", "~20 days at sea", "After loading. Duty is paid directly to Sri Lanka Customs."]].map(function (x) {
            return h("div", { key: x[1] }, h(A.Icon, { name: x[0], size: 22 }), h("b", null, x[1]), h("p", { className: "ad-small ad-muted" }, x[2]));
          })),
        h(CTA, { title: "Ready to start?", text: "Send a request, or browse cars that have already landed." },
          h(A.Button, { variant: "accent", size: "l", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"),
          h(A.Button, { variant: "secondary", size: "l", onClick: function () { p.nav("stock"); } }, "Browse stock"))));
  }

  function Sheet(p) {
    return h(Frag, null,
      h(PageHead, { crumb: "Auction sheet guide", kicker: "Auction sheet guide", title: "Read an auction sheet in a minute", lead: "Tap a code on the car, type any code you see, or pick a grade to learn what it means." }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.AuctionSheetDecoder, { showSheet: false }),
        h("div", { className: "ad-sheetref" },
          h("div", null, h("div", { className: "ad-kicker" }, "Real example"), h("h2", { className: "ad-h1" }, "An annotated sheet"),
            h("p", { className: "ad-bodyl ad-muted" }, "Red boxes are the inspector’s report and damage map. Blue boxes are lot number, model year, chassis, mileage, grade and equipment. We send this with an English translation for every lot before you bid."),
            h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("vocab"); } }, "Import vocabulary")),
          h("img", { src: D.images.sheet, alt: "Annotated Japanese auction sheet with 27 numbered fields" }))));
  }

  function Vocab() {
    return h(Frag, null, h(PageHead, { crumb: "Vocabulary", kicker: "Vocabulary", title: "Import terms, explained", lead: "FOB, CIF, LC and the rest, in plain English." }),
      h("div", { className: "ad-wrap ad-pagebody ad-narrow" }, h(A.Glossary, null)));
  }

  function About(p) {
    var pts = [
      ["shield", "Honesty, transparency, trust", "We carefully select quality vehicles and share the original auction sheet with an English translation before every bid."],
      ["tag", "Right choices, best price", "We never let you buy a car that isn’t right for you. No hidden fees."],
      ["pin", "Japan, Australia and UK", "We source through reputed, reliable auto traders and auction houses."],
      ["clock", "Faster, complete service", "Minimum paperwork and one team that handles the whole purchase for you."]
    ];
    return h(Frag, null,
      h(PageHead, { bare: true, crumb: "About", title: "About us" }),
      h("div", { className: "ad-wrap ad-pagebody" },
        h("div", { className: "ad-values" }, pts.map(function (x) { return h("div", { key: x[1] }, h("span", { className: "ad-contact__ic" }, h(A.Icon, { name: x[0], size: 20 })), h("h2", { className: "ad-h3" }, x[1]), h("p", { className: "ad-muted" }, x[2])); })),
        h(CTA, { title: "Visit us in Malabe or Colombo 07", text: "See landed stock in person, or sit down with our LC desk." },
          h(A.Button, { size: "l", icon: "pin", onClick: function () { p.nav("contact"); } }, "Contact & locations"))));
  }

  function Contact() {
    return h(Frag, null, h(PageHead, { bare: true, crumb: "Contact", title: "Contact us" }), h("div", { className: "ad-wrap ad-pagebody" }, h(A.ContactPanel, null)));
  }

  function NotFound(p) {
    return h("div", { className: "ad-wrap ad-pagebody" }, h(A.Empty, { icon: "search", title: "Page not found", text: "That page doesn’t exist any more." },
      h("div", { className: "ad-row" }, h(A.Button, { onClick: function () { p.nav("home"); } }, "Go home"), h(A.Button, { variant: "secondary", onClick: function () { p.nav("stock"); } }, "Our stock"))));
  }

  function Login(p) {
    return h("div", { className: "ad-wrap ad-authpage" }, h(A.AuthCard, { key: p.mode, mode: p.mode, onDone: p.onLogin }),
      p.note ? h("p", { className: "ad-small ad-muted ad-center" }, p.note) : null);
  }

  function Account(p) {
    var o = useState(null), orders = o[0], setOrders = o[1];
    var e = useState(""), err = e[0], setErr = e[1];
    useEffect(function () { api.get("/api/account/orders").then(setOrders, function (x) { setErr(x.message); setOrders([]); }); }, []);
    return h("div", { className: "ad-wrap ad-pagebody ad-pad-top" },
      err ? h("p", { className: "ad-field__error", role: "alert" }, h(A.Icon, { name: "info", size: 14 }), err) : null,
      orders === null ? h("p", { className: "ad-muted" }, "Loading your account…") : h(A.AccountDashboard, {
        tab: p.tab, orders: orders, user: { name: me.name, email: me.email, phone: me.phone, city: me.address },
        savedVehicles: p.saved.map(byRef).filter(Boolean), onToggleSave: p.toggleSave, onOpenVehicle: function (v) { p.nav("vehicle", v.seo); },
        onGo: p.nav, onSignOut: p.signOut,
        onSaveProfile: function (prof) {
          return api.put("/api/account/me", { name: prof.name, phone: prof.phone, address: prof.city }).then(function (row) {
            me = row; return fb && fb.auth().currentUser ? fb.auth().currentUser.updateProfile({ displayName: prof.name }) : null;
          });
        } }));
  }

  /* Admin console is a separate file, loaded only when somebody opens /admin. */
  var adminLoading = false;
  function Admin(p) {
    var s = useState(0), setTick = s[1];
    useEffect(function () {
      if (window.AD_ADMIN || adminLoading) return;
      adminLoading = true;
      var el = document.createElement("script"); el.src = "/app/admin.js";
      el.onload = function () { setTick(function (x) { return x + 1; }); };
      el.onerror = function () { adminLoading = false; };
      document.body.appendChild(el);
    }, []);
    if (!window.AD_ADMIN) return h(Loading, { text: "Loading admin…" });
    return h("div", { className: "ad-wrap ad-pagebody ad-pad-top" }, h(window.AD_ADMIN.Console, { user: me, onSignOut: p.signOut, onExit: function () { p.nav("home"); }, onDataChanged: p.reloadCatalog }));
  }

  /* ------------------------------------------------------------------ app shell */
  function ThemeToggle() {
    var saved = store("ad-theme");
    var s = useState(document.documentElement.getAttribute("data-theme") || saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")), t = s[0], setT = s[1];
    useEffect(function () { document.documentElement.setAttribute("data-theme", t); }, []);
    function flip() { var n = t === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", n); store("ad-theme", n); setT(n); }
    return h("button", { type: "button", className: "ad-themebtn", onClick: flip, "aria-label": "Switch to " + (t === "dark" ? "daylight" : "night auction") + " theme" },
      h("span", { className: "ad-themebtn__dot", "aria-hidden": true }), t === "dark" ? "Night auction" : "Daylight");
  }

  function App(p) {
    var r = useState(parse), route = r[0], setRoute = r[1];
    var u = useState(undefined), user = u[0], setUser = u[1];          // undefined = still checking, null = signed out
    var c = useState(function () { return (store("ad-compare") || []).filter(byRef); }), cmp = c[0], setCmp = c[1];
    var sv = useState(function () { return (store("ad-saved") || []).filter(byRef); }), saved = sv[0], setSaved = sv[1];
    var rq = useState(null), prefill = rq[0], setPrefill = rq[1];
    var rl = useState(0), setVer = rl[1];

    useEffect(function () { function on() { setRoute(parse()); window.scrollTo(0, 0); } window.addEventListener("popstate", on); return function () { window.removeEventListener("popstate", on); }; }, []);
    useEffect(function () { store("ad-compare", cmp); }, [cmp]);
    useEffect(function () { store("ad-saved", saved); }, [saved]);
    useEffect(function () {
      authReady.then(function () {
        if (!fb) { setUser(null); return; }
        fb.auth().onAuthStateChanged(function (fu) {
          if (!fu) { me = null; setUser(null); return; }
          api.get("/api/account/me").then(function (row) { me = row; setUser(row); }, function () { me = { name: fu.displayName || "", email: fu.email || "", phone: "", address: "", is_admin: false }; setUser(me); });
        });
      });
    }, []);

    function reloadCatalog() { return api.get("/api/catalog").then(function (c) { D.load(c); setVer(function (x) { return x + 1; }); }); }
    function nav(page, arg, opts) {
      if (page === "request") setPrefill(arg && typeof arg === "object" ? arg : null);
      var url = urlFor(page, page === "request" ? null : arg);
      if (location.pathname + location.search !== url) history.pushState(null, "", url);
      if (route.page === "admin" && page !== "admin") reloadCatalog();
      setRoute(parse()); window.scrollTo(0, 0);
    }
    hooks.go = nav;
    function toggle(list, set, id, max) { set(list.indexOf(id) >= 0 ? list.filter(function (x) { return x !== id; }) : (max && list.length >= max ? list : list.concat([id]))); }
    function signOut() { (fb ? fb.auth().signOut() : Promise.resolve()).then(function () { me = null; setUser(null); nav("home"); }); }

    var common = { nav: nav, cmp: cmp, saved: saved, clearCmp: function () { setCmp([]); },
      toggleCmp: function (id) { toggle(cmp, setCmp, id, 4); }, toggleSave: function (id) { toggle(saved, setSaved, id); }, signOut: signOut, reloadCatalog: reloadCatalog };
    var pg = route.page, body;
    function needLogin(note) {
      if (user === undefined) return h(Loading, null);
      return h(Login, { mode: "login", note: note, onLogin: function () { setRoute(parse()); } });
    }

    if (pg === "stock") body = h(Stock, Object.assign({ filters: route.filters || {} }, common));
    else if (pg === "vehicle") body = h(Vehicle, Object.assign({ seo: route.seo }, common));
    else if (pg === "compare") body = h(Compare, common);
    else if (pg === "auction") body = h(Auction, common);
    else if (pg === "request") body = h(Request, Object.assign({ prefill: prefill }, common));
    else if (pg === "buy") body = h(Buy, common);
    else if (pg === "sheet") body = h(Sheet, common);
    else if (pg === "vocab") body = h(Vocab, common);
    else if (pg === "about") body = h(About, common);
    else if (pg === "contact") body = h(Contact, common);
    else if (pg === "login" || pg === "register") body = user ? h(Loading, null) : h(Login, { mode: pg, note: "Sign in to request auction data and track your import.", onLogin: function () { nav("account"); } });
    else if (pg === "account") body = user ? h(Account, Object.assign({ tab: route.tab }, common)) : needLogin("Sign in to see your inquiries and imports.");
    else if (pg === "admin") body = !user ? needLogin("Staff sign-in") : !user.is_admin ? h("div", { className: "ad-wrap ad-pagebody" }, h(A.Empty, { icon: "lock", title: "Admin access required", text: "You’re signed in as " + user.email + ", which isn’t an admin account." }, h(A.Button, { variant: "secondary", onClick: signOut }, "Sign out"))) : h(Admin, common);
    else if (pg === "notfound") body = h(NotFound, common);
    else body = h(Home, Object.assign({ onSearch: function (q) {
      if (q.mode === "stock") {
        var f = {}; if (q.make) f.make = q.make; if (q.type) f.type = q.type; if (q.yearFrom) f.yearFrom = q.yearFrom;
        if (q.budget[0] !== q.bounds[0] || q.budget[1] !== q.bounds[1]) f.budget = q.budget;
        nav("stock", f);
      } else nav("request", { make: q.make, model: q.model, chassis: q.chassis });
    } }, common));

    useEffect(function () { setMeta(pg === "vehicle" ? "" : TITLES[pg] || ""); }, [pg]);
    // Signed in while on the login / register page -> go to the account.
    useEffect(function () { if (user && (pg === "login" || pg === "register")) { history.replaceState(null, "", PATHS.account); setRoute(parse()); window.scrollTo(0, 0); } }, [user, pg]);
    var active = pg === "vehicle" ? "stock" : pg === "request" ? "auction" : (pg === "login" || pg === "register") ? "login" : pg;
    var userName = user ? (user.name || (user.email || "").split("@")[0]) : null;
    return h("div", { className: "ad-page" },
      h(A.SiteHeader, { active: active, onNavigate: function (id, init) { if (id === "logout") signOut(); else nav(id, init); }, compareCount: cmp.length, user: userName, isAdmin: !!(user && user.is_admin) }),
      h("main", { key: pg + (route.seo || ""), className: "ad-main" }, body),
      h(A.SiteFooter, { onNavigate: function (id, init) { nav(id, init); } }),
      h(ThemeToggle, null));
  }

  /* ------------------------------------------------------------------ boot */
  authReady = initFirebase();
  var root = document.getElementById("app");
  api.get("/api/catalog").then(function (c) {
    D.load(c);
    ReactDOM.createRoot(root).render(h(App));
  }).catch(function (e) {
    root.innerHTML = '<div class="ad-boot"><p><b>We couldn’t load the site just now.</b><br>' + String(e.message || e).replace(/</g, "&lt;") +
      '</p><p><button class="ad-btn ad-btn--primary" onclick="location.reload()">Try again</button></p></div>';
  });
})();
