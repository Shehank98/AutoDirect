(function () {
  "use strict";
  var R = window.React, h = R.createElement, useState = R.useState, useEffect = R.useEffect;
  var A = window.AD, V = A.data.vehicles, LOTS = A.data.lots, IMG = A.data.images;
  var fmt = A.format;
  function byId(id) { return V.filter(function (v) { return v.id === id; })[0]; }
  function title(v) { return v.year + " " + v.make + " " + v.model; }

  var PAGES = ["home", "stock", "vehicle", "compare", "auction", "request", "buy", "sheet", "vocab", "about", "contact", "login", "register", "account", "admin"];
  function parse(hash) {
    var t = (hash || "").replace(/^#/, "");
    if (t.indexOf("vehicle-") === 0 && byId(t.slice(8))) return { page: "vehicle", id: t.slice(8) };
    return { page: PAGES.indexOf(t) >= 0 && t !== "vehicle" ? t : "home" };
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---------- shared bits ---------- */
  function PageHead(p) {
    return h("section", { className: "ad-sec ad-pagehead" }, h("div", { className: "ad-wrap" },
      p.crumb ? h("nav", { className: "ad-crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "#home" }, "Home"), h(A.Icon, { name: "chevron-right", size: 14 }), h("span", { "aria-current": "page" }, p.crumb)) : null,
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
    return h("div", { className: "ad-cta" },
      h("div", null, h("h2", { className: "ad-h1" }, p.title), h("p", { className: "ad-bodyl" }, p.text)),
      h("div", { className: "ad-row" }, p.children));
  }

  /* ---------- pages ---------- */
  function Home(p) {
    var feat = V.filter(function (v) { return v.featured; });
    return h(R.Fragment, null,
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
      h(Sec, { kicker: "Featured", title: "Ready to drive", lead: "Landed, cleared and waiting at our Malabe showroom.", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("stock"); } }, "All stock") },
        h("div", { className: "ad-stock__grid ad-stock__grid--4" }, feat.map(function (v) {
          return h(A.VehicleCard, { key: v.id, vehicle: v, onOpen: function () { p.nav("vehicle", v.id); }, compared: p.cmp.indexOf(v.id) >= 0, compareDisabled: p.cmp.length >= 4, onCompare: function () { p.toggleCmp(v.id); }, saved: p.saved.indexOf(v.id) >= 0, onSave: function () { p.toggleSave(v.id); } });
        })),
        h(A.CompareTray, { floating: true, items: p.cmp.map(byId), onRemove: p.toggleCmp, onClear: function () { p.setCmp([]); }, onCompare: function () { p.nav("compare"); } })),
      h(Sec, { tint: true, kicker: "Live now", title: "This week’s auction floor", lead: "Set a proxy maximum. We bid only what’s needed to win.", action: h(A.Button, { variant: "accent", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid") },
        h("div", { className: "ad-grid2" }, LOTS.map(function (l) { return h(A.AuctionLotCard, { key: l.lot, lot: l }); }))),
      h(Sec, { kicker: "How to buy", title: "Five steps, fully tracked", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("buy"); } }, "Full buying guide") },
        h(A.ProcessSteps, { onStart: function () { p.nav("request"); } })),
      h(Sec, { tint: true, kicker: "Know what you’re buying", title: "Read any auction sheet", lead: "Every lot comes with its inspection sheet. Tap a code on the car to decode it.", action: h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("sheet"); } }, "Auction sheet guide") },
        h(A.AuctionSheetDecoder, null)),
      h(Sec, { kicker: "Reviews", title: "Straight from the driveway" }, h(A.Testimonials, null)),
      h(Sec, { tight: true }, h(CTA, { title: "Looking for one exact car?", text: "Tell us the model, year and budget. We shortlist lots and send every sheet before bidding." },
        h(A.Button, { variant: "accent", size: "l", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"),
        h(A.Button, { variant: "secondary", size: "l", icon: "phone", onClick: function () { p.nav("contact"); } }, "Talk to us"))));
  }

  function Stock(p) {
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Our stock", kicker: "Our stock", title: "Imported, cleared, ready", lead: "Every car here landed through our own auction desk. Prices include duty and clearance." }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.StockBrowser, {
        key: JSON.stringify(p.init), initial: p.init, initialCompare: p.cmp,
        onOpen: function (v) { p.nav("vehicle", v.id); },
        onCompare: function (items) { p.setCmp(items.map(function (v) { return v.id; })); p.nav("compare"); },
        onRequest: function () { p.nav("request"); }
      })));
  }

  function Vehicle(p) {
    var v = byId(p.id) || V[3];
    var t = useState(p.tab || "specs"), tab = t[0], setTab = t[1];
    useEffect(function () { setTab(p.tab || "specs"); }, [p.id, p.tab]);
    var inCmp = p.cmp.indexOf(v.id) >= 0, saved = p.saved.indexOf(v.id) >= 0;
    var monthly = (function () { var P = v.price * 0.7, r = 14.5 / 1200, n = 60; return P * r / (1 - Math.pow(1 + r, -n)); })();
    function goTab(x) { setTab(x); setTimeout(function () { var el = document.getElementById("vp-tabs"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30); }
    return h("div", { className: "ad-wrap ad-vp" },
      h("nav", { className: "ad-crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "#stock" }, "Our stock"), h(A.Icon, { name: "chevron-right", size: 14 }),
        h("a", { href: "#stock", onClick: function (e) { e.preventDefault(); p.nav("stock", null, { make: v.make }); } }, v.make), h(A.Icon, { name: "chevron-right", size: 14 }), h("span", { "aria-current": "page" }, v.model + " " + v.grade)),
      h("div", { className: "ad-vp__top" },
        h(A.VehicleGallery, { key: v.id, alt: title(v), items: [{ src: v.img, label: v.img ? "Exterior" : "Exterior — after inspection" }, { src: IMG.sheet, label: "Auction sheet", sheet: true }, { src: null, label: "Interior — on request" }] }),
        h("aside", { className: "ad-vp__buy" },
          h("div", { className: "ad-row" }, h(A.StatusBadge, { status: v.status }), v.isNew ? h(A.Badge, { tone: "highlight" }, "New arrival") : null, h("span", { className: "ad-mono ad-muted ad-small" }, v.id)),
          h("h1", { className: "ad-h1" }, title(v)), h("p", { className: "ad-muted" }, v.grade + " · " + v.color),
          h("ul", { className: "ad-vcard__specs ad-vp__specs" },
            h("li", null, h(A.Icon, { name: "gauge", size: 15 }), fmt.num(v.mileage) + " km"), h("li", null, h(A.Icon, { name: "fuel", size: 15 }), v.fuel),
            h("li", null, h(A.Icon, { name: "gear", size: 15 }), v.trans), h("li", null, h(A.Icon, { name: "car", size: 15 }), v.engine + " cc")),
          h("div", { className: "ad-vp__price" }, h("div", null, h("div", { className: "ad-label" }, v.status === "Sold" ? "Sold for" : "Price, duty paid"), h("div", { className: "ad-price" }, fmt.lkrFull(v.price)),
            h("button", { type: "button", className: "ad-link ad-small", onClick: function () { goTab("loan"); } }, "≈ " + fmt.lkrFull(Math.round(monthly)) + "/month · 30% down, 5 yrs")),
            h(A.GradeSeal, { grade: v.auctionGrade, interior: v.interior, size: 64 })),
          h(A.Button, { size: "l", block: true, icon: "doc", disabled: v.status === "Sold", onClick: function () { goTab("inquiry"); } }, v.status === "Sold" ? "Sold" : "Request a quote"),
          h("div", { className: "ad-row" },
            h(A.Button, { variant: "secondary", block: true, icon: inCmp ? "check" : "compare", onClick: function () { p.toggleCmp(v.id); }, "aria-pressed": inCmp }, inCmp ? "In compare (" + p.cmp.length + ")" : "Compare"),
            h(A.Button, { variant: "secondary", icon: "heart", "aria-label": saved ? "Remove from saved" : "Save", "aria-pressed": saved, className: saved ? "is-saved" : "", onClick: function () { p.toggleSave(v.id); } }),
            h(A.Button, { variant: "secondary", icon: "whatsapp", "aria-label": "Share on WhatsApp", href: "https://wa.me/?text=" + encodeURIComponent(title(v) + " " + v.grade + " at AutoDirect"), target: "_blank", rel: "noopener" })),
          h("p", { className: "ad-small ad-muted ad-vp__trust" }, h(A.Icon, { name: "shield", size: 15 }), "Inspected at the Malabe showroom · sheet verified"))),
      h("div", { id: "vp-tabs" }, h(A.Tabs, { variant: "line", label: "Vehicle details", tabs: [{ id: "specs", label: "Specs & features" }, { id: "loan", label: "Loan calculator" }, { id: "inquiry", label: "Inquiry" }], value: tab, onChange: setTab })),
      h("div", { className: "ad-vp__panel" }, tab === "specs" ? h(A.SpecSheet, { vehicle: v }) : tab === "loan" ? h(A.LoanCalculator, { key: v.id, price: v.price }) : h("div", { className: "ad-narrow" }, h(A.InquiryForm, { key: v.id, vehicle: v, onTrack: function () { p.nav("account"); } }))),
      h("div", { className: "ad-sec__head ad-vp__similar" }, h("h2", { className: "ad-h2" }, "Similar vehicles"), h(A.Button, { variant: "ghost", iconRight: "arrow-right", onClick: function () { p.nav("stock"); } }, "All stock")),
      h("div", { className: "ad-stock__grid ad-stock__grid--3" }, V.filter(function (x) { return x.id !== v.id && x.status !== "Sold"; }).sort(function (a, b) { return (b.type === v.type) - (a.type === v.type); }).slice(0, 3).map(function (x) {
        return h(A.VehicleCard, { key: x.id, vehicle: x, onOpen: function () { p.nav("vehicle", x.id); }, compared: p.cmp.indexOf(x.id) >= 0, compareDisabled: p.cmp.length >= 4, onCompare: function () { p.toggleCmp(x.id); } });
      })));
  }

  function Compare(p) {
    var list = p.cmp.map(byId).filter(Boolean);
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Compare", kicker: "Compare", title: "Side by side", lead: "Best value in each row is marked. Remove a car with ×, or add up to four from Our stock.", action: h(A.Button, { variant: "secondary", icon: "plus", onClick: function () { p.nav("stock"); } }, "Add from stock") }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.CompareTable, { key: p.cmp.join(","), vehicles: list, onQuote: function (v) { p.nav("vehicle", v.id, null, "inquiry"); } })));
  }

  function Auction(p) {
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Live auction", kicker: "USS Tokyo · JU Aichi · live today", live: true, title: "Live auction", lead: "Lots our team is watching this week. Set a proxy maximum and we bid only what’s needed to win.", action: h(A.Button, { variant: "accent", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a specific car") }),
      h("div", { className: "ad-wrap ad-pagebody" },
        h("div", { className: "ad-grid2" }, LOTS.map(function (l) { return h(A.AuctionLotCard, { key: l.lot, lot: l }); })),
        h("div", { className: "ad-infostrip" },
          [["doc", "Sheet first", "Every lot’s original sheet, translated, before you bid."], ["shield", "Refundable deposit", "Bidding starts after a 100% refundable deposit."], ["gavel", "Proxy bidding", "Win below your maximum and keep the difference."]].map(function (x) {
            return h("div", { key: x[1] }, h(A.Icon, { name: x[0], size: 22 }), h("b", null, x[1]), h("p", { className: "ad-small ad-muted" }, x[2]));
          })),
        h(CTA, { title: "Not on this list?", text: "Thousands of cars cross the block each week. Tell us what you want and we’ll shortlist the lots." },
          h(A.Button, { variant: "accent", size: "l", icon: "gavel", onClick: function () { p.nav("request"); } }, "Request a bid"),
          h(A.Button, { variant: "secondary", size: "l", onClick: function () { p.nav("sheet"); } }, "How to read a sheet"))));
  }

  function Request(p) {
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Request a bid", kicker: "Auction request", title: "Tell us the car. We’ll find the lot.", lead: "Three short steps. We reply with matching lots and translated sheets before any bid." }),
      h("div", { className: "ad-wrap ad-pagebody ad-split" },
        h(A.AuctionRequestForm, null),
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
    return h(R.Fragment, null,
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
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Auction sheet guide", kicker: "Auction sheet guide", title: "Read an auction sheet in a minute", lead: "Tap a code on the car, type any code you see, or pick a grade to learn what it means." }),
      h("div", { className: "ad-wrap ad-pagebody" }, h(A.AuctionSheetDecoder, { showSheet: false }),
        h("div", { className: "ad-sheetref" },
          h("div", null, h("div", { className: "ad-kicker" }, "Real example"), h("h2", { className: "ad-h1" }, "An annotated sheet"),
            h("p", { className: "ad-bodyl ad-muted" }, "Red boxes are the inspector’s report and damage map. Blue boxes are lot number, model year, chassis, mileage, grade and equipment. We send this with an English translation for every lot before you bid."),
            h(A.Button, { variant: "secondary", iconRight: "arrow-right", onClick: function () { p.nav("vocab"); } }, "Import vocabulary")),
          h("img", { src: IMG.sheet, alt: "Annotated Japanese auction sheet with 27 numbered fields" }))));
  }

  function Vocab(p) {
    return h(R.Fragment, null,
      h(PageHead, { crumb: "Vocabulary", kicker: "Vocabulary", title: "Import terms, explained", lead: "FOB, CIF, LC and the rest, in plain English." }),
      h("div", { className: "ad-wrap ad-pagebody ad-narrow" }, h(A.Glossary, null)));
  }

  function About(p) {
    var pts = [
      ["shield", "Honesty, transparency, trust", "We carefully select quality vehicles and share the original auction sheet with an English translation before every bid."],
      ["tag", "Right choices, best price", "We never let you buy a car that isn’t right for you. No hidden fees."],
      ["pin", "Japan, Australia and UK", "We source through reputed, reliable auto traders and auction houses."],
      ["clock", "Faster, complete service", "Minimum paperwork and one team that handles the whole purchase for you."]
    ];
    return h(R.Fragment, null,
      h(PageHead, { crumb: "About", kicker: "About AutoDirect", title: "Simple, candid and real", lead: "We make importing your next car from Japan straightforward, from the first shortlist to the day you drive it home." }),
      h("div", { className: "ad-wrap ad-pagebody" },
        h("div", { className: "ad-values" }, pts.map(function (x) { return h("div", { key: x[1] }, h("span", { className: "ad-contact__ic" }, h(A.Icon, { name: x[0], size: 20 })), h("h2", { className: "ad-h3" }, x[1]), h("p", { className: "ad-muted" }, x[2])); })),
        h(CTA, { title: "Visit us in Malabe or Colombo 07", text: "See landed stock in person, or sit down with our LC desk." },
          h(A.Button, { size: "l", icon: "pin", onClick: function () { p.nav("contact"); } }, "Contact & locations"))));
  }

  function Contact() {
    return h(R.Fragment, null, h(PageHead, { crumb: "Contact", kicker: "Contact", title: "We’re easy to reach" }), h("div", { className: "ad-wrap ad-pagebody" }, h(A.ContactPanel, null)));
  }
  function Login(p) {
    return h("div", { className: "ad-wrap ad-authpage" }, h(A.AuthCard, { key: p.mode, mode: p.mode, onDone: p.onLogin }),
      h("p", { className: "ad-small ad-muted ad-center" }, "Prototype: any valid email and password signs you in."));
  }
  function Account(p) {
    return h("div", { className: "ad-wrap ad-pagebody ad-pad-top" }, h(A.AccountDashboard, { onSignOut: p.onSignOut }));
  }
  function Admin() {
    return h("div", { className: "ad-wrap ad-pagebody ad-pad-top" }, h(A.AdminConsole, null));
  }

  /* ---------- app shell ---------- */
  function ThemeToggle() {
    var s = useState(document.documentElement.getAttribute("data-theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")), t = s[0], setT = s[1];
    function flip() { var n = t === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", n); setT(n); }
    return h("button", { type: "button", className: "ad-themebtn", onClick: flip, "aria-label": "Switch to " + (t === "dark" ? "Daylight" : "Night Auction") + " theme" },
      h("span", { className: "ad-themebtn__dot", "aria-hidden": true }), t === "dark" ? "Night auction" : "Daylight");
  }

  function App() {
    var r = useState(parse(location.hash)), route = r[0], setRoute = r[1];
    var u = useState(store("ad-user")), user = u[0], setUser = u[1];
    var c = useState(["AD-2417", "AD-2421"]), cmp = c[0], setCmp = c[1];
    var sv = useState([]), saved = sv[0], setSaved = sv[1];
    var si = useState({}), stockInit = si[0], setStockInit = si[1];
    var tb = useState(null), vtab = tb[0], setVtab = tb[1];

    useEffect(function () {
      function on() { setRoute(parse(location.hash)); window.scrollTo(0, 0); }
      window.addEventListener("hashchange", on);
      return function () { window.removeEventListener("hashchange", on); };
    }, []);

    function nav(page, id, init, tab) {
      if (page === "logout") { setUser(null); store("ad-user", null); page = "home"; }
      if (page === "account" && !user) page = "login";
      if (page === "stock") setStockInit(init || {});
      setVtab(tab || null);
      var hash = page === "vehicle" ? "vehicle-" + id : page;
      if (location.hash.replace("#", "") === hash) { setRoute(parse("#" + hash)); window.scrollTo(0, 0); }
      else location.hash = hash;
    }
    function toggle(list, set, id, max) {
      set(list.indexOf(id) >= 0 ? list.filter(function (x) { return x !== id; }) : (max && list.length >= max ? list : list.concat([id])));
    }
    var common = { nav: nav, cmp: cmp, setCmp: setCmp, saved: saved,
      toggleCmp: function (id) { toggle(cmp, setCmp, id, 4); }, toggleSave: function (id) { toggle(saved, setSaved, id); } };
    var pg = route.page, body;
    if (pg === "stock") body = h(Stock, Object.assign({ init: stockInit }, common));
    else if (pg === "vehicle") body = h(Vehicle, Object.assign({ id: route.id, tab: vtab }, common));
    else if (pg === "compare") body = h(Compare, common);
    else if (pg === "auction") body = h(Auction, common);
    else if (pg === "request") body = h(Request, common);
    else if (pg === "buy") body = h(Buy, common);
    else if (pg === "sheet") body = h(Sheet, common);
    else if (pg === "vocab") body = h(Vocab, common);
    else if (pg === "about") body = h(About, common);
    else if (pg === "contact") body = h(Contact, common);
    else if (pg === "login" || pg === "register") body = h(Login, { mode: pg === "register" ? "register" : "login", onLogin: function (name) { var n = name ? name.charAt(0).toUpperCase() + name.slice(1) : "Kasun Perera"; setUser(n); store("ad-user", n); nav("account"); } });
    else if (pg === "account") body = user ? h(Account, { onSignOut: function () { nav("logout"); } }) : h(Login, { mode: "login", onLogin: function (name) { setUser(name || "Kasun"); store("ad-user", name || "Kasun"); } });
    else if (pg === "admin") body = h(Admin, null);
    else body = h(Home, Object.assign({ onSearch: function (q) { if (q.mode === "stock") nav("stock", null, { make: q.make, type: q.type, budget: q.budget }); else nav("request"); } }, common));
    var active = pg === "vehicle" ? "stock" : pg === "request" ? "auction" : pg;
    return h("div", { className: "ad-page" },
      h(A.SiteHeader, { active: active, onNavigate: function (id) { nav(id); }, compareCount: cmp.length, user: user }),
      h("main", { key: pg + (route.id || "") , className: "ad-main" }, body),
      h(A.SiteFooter, { onNavigate: function (id, init) { nav(id, null, init); } }),
      h(ThemeToggle, null));
  }

  ReactDOM.createRoot(document.getElementById("app")).render(h(App));
})();
