/* @ds-bundle: {"format":4,"namespace":"AD","components":[{"name":"Logo"},{"name":"Icon"},{"name":"Button"},{"name":"Badge"},{"name":"StatusBadge"},{"name":"GradeSeal"},{"name":"LotTag"},{"name":"TextField"},{"name":"SelectField"},{"name":"RangeSlider"},{"name":"ChipGroup"},{"name":"Switch"},{"name":"Tabs"},{"name":"SiteHeader"},{"name":"SiteFooter"},{"name":"HeroSearch"},{"name":"VehicleCard"},{"name":"StockBrowser"},{"name":"CompareTray"},{"name":"CompareTable"},{"name":"VehicleGallery"},{"name":"SpecSheet"},{"name":"LoanCalculator"},{"name":"InquiryForm"},{"name":"AuctionLotCard"},{"name":"AuctionSheetDecoder"},{"name":"AuctionRequestForm"},{"name":"ProcessSteps"},{"name":"Glossary"},{"name":"Testimonials"},{"name":"AuthCard"},{"name":"OrderTracker"},{"name":"AccountDashboard"},{"name":"AdminConsole"},{"name":"ContactPanel"},{"name":"HomePage"},{"name":"VehiclePage"}]} */
(function () {
  "use strict";
  var R = window.React;
  var h = R.createElement, Frag = R.Fragment;
  var useState = R.useState, useEffect = R.useEffect, useMemo = R.useMemo, useRef = R.useRef;

  /* ---------- helpers ---------- */
  function cx() { var a = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) a.push(arguments[i]); return a.join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }
  function num(n) { return Math.round(n).toLocaleString("en-US"); }
  function lkr(n) {
    if (n == null || n === "" || !isFinite(n) || n <= 0) return "Price on request";
    if (n >= 1e6) return "LKR " + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    return "LKR " + num(n);
  }
  function emi(P, rate, yrs) { var r = rate / 1200, n = yrs * 12; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; }
  function lkrFull(n) { return (n == null || !isFinite(n) || n <= 0) ? "Price on request" : "LKR " + num(n); }
  function yen(n) { return "¥" + num(n); }
  var JPY_LKR = 2.05; // overwritten from /api/catalog (site.jpyLkr)
  var _uid = 0;
  function useId(prefix, given) { var r = useRef(null); if (!r.current) r.current = (prefix || "ad") + "-" + (++_uid); return given || r.current; }
  function useOutside(ref, fn) {
    useEffect(function () {
      function on(e) { if (ref.current && !ref.current.contains(e.target)) fn(); }
      document.addEventListener("mousedown", on);
      return function () { document.removeEventListener("mousedown", on); };
    }, [ref, fn]);
  }
  function title(v) { return v.year + " " + v.make + " " + v.model; }

  /* ---------- live data (filled from /api/catalog by app.js via AD.data.load) ---------- */
  // These are mutated in place, so every component always reads the current catalogue.
  var IMG = { sheet: "/app/img/auction-sheet.jpg" };
  var MAKES = {};        // makes that have vehicles in stock -> model names (stock filters, hero search)
  var ALL_MAKES = {};    // every active brand -> model names (auction request, sell-your-car)
  var FEATURES = [];
  var VEHICLES = [];
  var LOTS = [];
  var LOCATIONS = [];    // [{ name, code, count }]
  var BODY_TYPES = [];   // body types that have vehicles in stock
  var ALL_TYPES = [];    // [{ id, name, image, count }]
  var BRANDS = [];       // [{ id, name, image, count }] for the Browse section
  var SITE = { phone: "", email: "", whatsapp: "", address: "", hours: "", instagram: "" };
  var HOOKS = {};        // server actions + navigation helpers, provided by app.js
  function replaceAll(arr, next) { arr.length = 0; Array.prototype.push.apply(arr, next); }
  function loadData(c) {
    replaceAll(VEHICLES, c.vehicles || []); replaceAll(LOTS, c.lots || []); replaceAll(FEATURES, c.features || []);
    replaceAll(LOCATIONS, c.locations || []); replaceAll(ALL_TYPES, c.types || []); replaceAll(BRANDS, c.brands || []);
    replaceAll(BODY_TYPES, (c.types || []).filter(function (t) { return t.count > 0; }).map(function (t) { return t.name; }));
    Object.keys(MAKES).forEach(function (k) { delete MAKES[k]; }); Object.keys(ALL_MAKES).forEach(function (k) { delete ALL_MAKES[k]; });
    (c.brands || []).forEach(function (b) { ALL_MAKES[b.name] = b.models || []; if (b.count > 0) MAKES[b.name] = b.models || []; });
    Object.assign(SITE, c.site || {});
    if (c.site && c.site.jpyLkr) JPY_LKR = Number(c.site.jpyLkr) || JPY_LKR;
  }
  var GLOSSARY = [
    { term: "Highest bidder wins", cat: "Auction", def: "Japanese car auctions work like any other auction: the highest bidder wins the lot." },
    { term: "Proxy bidding", cat: "Auction", def: "Bids are placed by proxy, so even with a high maximum you only pay just over the next-highest bidder.", example: "Your maximum is ¥500,000 and the next-highest bid is ¥400,000 — you win at ¥401,000, not ¥500,000." },
    { term: "Auction sheet", cat: "Auction", def: "The inspection report written at the auction house (USS, TAA, JU…). It records grade, first registration, mileage, chassis number and every scratch, dent and repair. We share the original with an English translation before every bid." },
    { term: "Auction grade", cat: "Auction", def: "The overall score on the auction sheet, from S (as new) through 6, 5, 4.5, 4, 3.5 down to R/RA (repaired). Interior is graded separately A–E." },
    { term: "Bid price", cat: "Auction", def: "The highest price a bidder is willing to pay for a lot." },
    { term: "FOB — Free on Board", cat: "Pricing", def: "The vehicle price plus transport, insurance and loading costs up to the port of departure in Japan." },
    { term: "C&F — Cost and Freight", cat: "Pricing", def: "The vehicle price including all costs and freight to the destination port (Colombo)." },
    { term: "CIF — Cost, Insurance and Freight", cat: "Pricing", def: "Vehicle price, insurance during delivery and shipping freight. Risk passes to the buyer after delivery at the destination port." },
    { term: "LC — Letter of Credit", cat: "Payment & docs", def: "A bank guarantee used to pay for the vehicle. The LC is opened within 7 days of the pro-forma invoice; we help prepare the bank documents." },
    { term: "Pro-forma invoice", cat: "Payment & docs", def: "The preliminary invoice issued after a successful bid. Your bank needs it to open the LC." },
    { term: "B/L — Bill of Lading", cat: "Payment & docs", def: "The official shipping document signed by the carrier, listing the cargo in transit from Japan to Sri Lanka." },
    { term: "Arrival date", cat: "Shipping", def: "The date the vessel is due at the port of delivery — usually about 20 days after loading." },
    { term: "Clearance agent", cat: "Shipping", def: "A nominated third party who clears the vehicle through Sri Lanka Customs. Duty and levies are paid directly to Customs." }
  ];

  /* ---------- Icon ---------- */
  var ICONS = {
    search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20",
    heart: "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z",
    compare: "M9 4H5v16h4M15 4h4v16h-4M12 2v20",
    "arrow-right": "M5 12h14M13 6l6 6-6 6",
    "arrow-left": "M19 12H5M11 6l-6 6 6 6",
    "chevron-down": "M6 9l6 6 6-6",
    "chevron-left": "M15 6l-6 6 6 6",
    "chevron-right": "M9 6l6 6-6 6",
    gauge: "M4 17a8 8 0 1 1 16 0M12 17l4-5",
    fuel: "M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M5 10h9M14 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3",
    gear: "M6 5v14M12 5v14M18 5v7M6 12h12",
    calendar: "M4 7h16v13H4zM4 11h16M8 4v4M16 4v4",
    pin: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
    mail: "M4 6h16v12H4zM4 7l8 6 8-6",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12M18 6L6 18",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
    ship: "M3 16l2 4h14l2-4M5 16v-5h14v5M8 11V7h8v4M12 3v4",
    doc: "M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h6M9.5 16h6",
    menu: "M4 7h16M4 12h16M4 17h16",
    filter: "M4 6h16M7 12h10M10 18h4",
    gavel: "M13.5 3.5l6 6M10.5 6.5l6 6M12 5l-4 4 6 6 4-4M11 12l-7.5 7.5 1 1L12 13M13 21h8",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    car: "M3 16v-3.5l2.2-5A2 2 0 0 1 7 6.3h10a2 2 0 0 1 1.8 1.2l2.2 5V16zM3 16v3h3v-3M18 16v3h3v-3M3.5 12.5h17M7 14h1.5M15.5 14H17",
    bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    list: "M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1",
    logout: "M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10",
    edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
    trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    "eye-off": "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2",
    star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
    home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
    users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6",
    tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
    palette: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7h.01M15 7.5h.01",
    send: "M4 12l16-8-6 16-2.5-6.5z",
    lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
    settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
    info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01",
    whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z",
    image: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15 8.5h.01",
    truck: "M2 7h11v9H2zM13 10h4l3 3v3h-7zM6 19a1.7 1.7 0 1 0 0-3.4A1.7 1.7 0 0 0 6 19zM17 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
    bus: "M5 4h14a1 1 0 0 1 1 1v11H4V5a1 1 0 0 1 1-1zM4 11h16M7 16v3M17 16v3M7.5 13.5h.01M16.5 13.5h.01",
    van: "M2 8a1 1 0 0 1 1-1h10l5 4 3 1v4H2zM7 17.5a1.6 1.6 0 1 0 0-.01zM17 17.5a1.6 1.6 0 1 0 0-.01zM13 7v4h5",
    wrench: "M14.5 6.5a4 4 0 0 0-5 5L3.5 17.5l3 3 6-6a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"
  };
  function Icon(p) {
    var s = p.size || 18;
    return h("svg", {
      className: cx("ad-icon", p.className), width: s, height: s, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: p.stroke || 1.75, strokeLinecap: "round", strokeLinejoin: "round",
      "aria-hidden": p.label ? undefined : true, role: p.label ? "img" : undefined, "aria-label": p.label, focusable: "false"
    }, h("path", { d: ICONS[p.name] || "" }));
  }

  /* ---------- Logo ---------- */
  function Logo(p) {
    return h("span", { className: cx("ad-logo", p.inverse && "ad-logo--inverse", p.className), style: { fontSize: p.size || 22 } },
      h("span", { className: "ad-logo__seal", "aria-hidden": true }, "直"),
      h("span", { className: "ad-logo__word" }, "Auto", h("b", null, "Direct")),
      p.suffix ? h("span", { className: "ad-logo__tld" }, p.suffix) : null);
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var v = p.variant || "primary", s = p.size || "m";
    var rest = omit(p, ["variant", "size", "icon", "iconRight", "block", "loading", "children", "className", "href"]);
    var isz = s === "s" ? 16 : 18;
    var tag = p.href ? "a" : "button";
    return h(tag, Object.assign({
      className: cx("ad-btn", "ad-btn--" + v, "ad-btn--" + s, p.block && "ad-btn--block", !p.children && "ad-btn--icon", p.loading && "is-loading", p.className),
      href: p.href, type: p.href ? undefined : "button", "aria-busy": p.loading || undefined
    }, rest),
      p.loading ? h("span", { className: "ad-spinner", "aria-hidden": true }) : p.icon ? h(Icon, { name: p.icon, size: isz }) : null,
      p.children ? h("span", null, p.children) : null,
      p.iconRight ? h(Icon, { name: p.iconRight, size: isz }) : null);
  }

  /* ---------- Badges ---------- */
  function Badge(p) {
    return h("span", { className: cx("ad-badge", "ad-badge--" + (p.tone || "neutral"), p.className) },
      p.icon ? h(Icon, { name: p.icon, size: 13, stroke: 2.2 }) : p.dot ? h("span", { className: "ad-badge__dot" }) : null,
      p.children);
  }
  var STATUS = {
    "Available": ["success", "check"], "Reserved": ["warning", "clock"], "In transit": ["info", "ship"], "Sold": ["neutral", "tag"],
    "Requested": ["neutral", "doc"], "Quote sent": ["info", "mail"], "Bidding": ["accent", "gavel"], "Won": ["success", "check"], "Outbid": ["danger", "x"],
    "LC opened": ["warning", "doc"], "Shipped": ["info", "ship"], "Arrived": ["info", "pin"], "Delivered": ["success", "check"],
    "Awaiting deposit": ["warning", "clock"], "Open": ["accent", "bell"], "Closed": ["neutral", "check"], "Published": ["success", "eye"], "Draft": ["neutral", "edit"]
  };
  function StatusBadge(p) {
    var m = STATUS[p.status] || ["neutral", null];
    return h(Badge, { tone: m[0], icon: m[1], className: p.className }, p.status);
  }
  function GradeSeal(p) {
    var sz = p.size || 56;
    return h("span", { className: cx("ad-seal", p.className), style: { width: sz, height: sz }, role: "img", "aria-label": "Auction grade " + p.grade + (p.interior ? ", interior " + p.interior : "") },
      h("span", { className: "ad-seal__grade", style: { fontSize: Math.round(sz * (String(p.grade).length > 2 ? 0.3 : 0.38)) } }, p.grade),
      p.interior ? h("span", { className: "ad-seal__int", style: { fontSize: Math.max(8, Math.round(sz * 0.16)) } }, "INT " + p.interior) : null);
  }
  function LotTag(p) {
    return h("span", { className: cx("ad-lot", p.className) }, h("span", { className: "ad-lot__k" }, "LOT"), h("span", null, p.lot));
  }

  /* ---------- Form controls ---------- */
  function Field(p) {
    return h("div", { className: cx("ad-field", p.error && "has-error", p.className) },
      p.label ? h("label", { className: "ad-field__label", htmlFor: p.id }, p.label, p.optional ? h("span", { className: "ad-field__opt" }, "Optional") : null) : null,
      p.children,
      p.error ? h("p", { className: "ad-field__error", id: p.id + "-err" }, h(Icon, { name: "info", size: 14 }), p.error)
        : p.hint ? h("p", { className: "ad-field__hint", id: p.id + "-hint" }, p.hint) : null);
  }
  function TextField(p) {
    var id = useId("tf", p.id);
    var rest = omit(p, ["label", "hint", "error", "className", "multiline", "prefix", "icon", "optional", "trailing", "mono"]);
    var ctl = h(p.multiline ? "textarea" : "input", Object.assign({
      id: id, className: cx("ad-input", p.mono && "ad-mono"), "aria-invalid": p.error ? true : undefined,
      "aria-describedby": p.error ? id + "-err" : p.hint ? id + "-hint" : undefined
    }, rest));
    var inner = (p.icon || p.prefix || p.trailing) ? h("div", { className: cx("ad-input-wrap", p.icon && "has-icon", p.prefix && "has-prefix") },
      p.icon ? h(Icon, { name: p.icon, size: 16, className: "ad-input-wrap__icon" }) : null,
      p.prefix ? h("span", { className: "ad-input-wrap__prefix" }, p.prefix) : null,
      ctl, p.trailing || null) : ctl;
    return h(Field, { label: p.label, hint: p.hint, error: p.error, id: id, className: p.className, optional: p.optional }, inner);
  }
  function SelectField(p) {
    var id = useId("sf", p.id);
    var rest = omit(p, ["label", "hint", "error", "className", "options", "placeholder", "optional"]);
    var opts = (p.options || []).map(function (o) { return typeof o === "object" ? o : { value: String(o), label: String(o) }; });
    return h(Field, { label: p.label, hint: p.hint, error: p.error, id: id, className: p.className, optional: p.optional },
      h("div", { className: cx("ad-select", p.disabled && "is-disabled") },
        h("select", Object.assign({ id: id, className: "ad-input", "aria-invalid": p.error ? true : undefined }, rest),
          p.placeholder != null ? h("option", { value: "" }, p.placeholder) : null,
          opts.map(function (o) { return h("option", { key: o.value, value: o.value }, o.label); })),
        h(Icon, { name: "chevron-down", size: 16, className: "ad-select__chev" })));
  }
  function RangeSlider(p) {
    var min = p.min, max = p.max, step = p.step || 1, fmt = p.format || String;
    var a = Math.min(p.value[0], p.value[1]), b = Math.max(p.value[0], p.value[1]);
    var pa = (a - min) / (max - min) * 100, pb = (b - min) / (max - min) * 100;
    var single = p.single;
    function set(i, x) { x = Number(x); p.onChange(i === 0 ? [Math.min(x, b), b] : [a, Math.max(x, a)]); }
    return h("div", { className: cx("ad-range", p.className) },
      p.label ? h("div", { className: "ad-range__head" }, h("span", { className: "ad-label" }, p.label),
        h("span", { className: "ad-range__val" }, single ? fmt(b) : fmt(a) + " – " + fmt(b))) : null,
      h("div", { className: "ad-range__track" },
        h("div", { className: "ad-range__fill", style: { left: (single ? 0 : pa) + "%", right: (100 - pb) + "%" } }),
        single ? null : h("input", { type: "range", min: min, max: max, step: step, value: a, onChange: function (e) { set(0, e.target.value); }, "aria-label": (p.label || "Range") + " minimum", "aria-valuetext": fmt(a) }),
        h("input", { type: "range", min: min, max: max, step: step, value: b, onChange: function (e) { set(1, e.target.value); }, "aria-label": (p.label || "Range") + (single ? "" : " maximum"), "aria-valuetext": fmt(b) })));
  }
  function ChipGroup(p) {
    var val = p.value, multiple = p.multiple;
    function on(k) { return multiple ? val.indexOf(k) >= 0 : val === k; }
    function toggle(k) {
      if (multiple) p.onChange(on(k) ? val.filter(function (x) { return x !== k; }) : val.concat([k]));
      else p.onChange(on(k) && p.allowEmpty ? "" : k);
    }
    return h("div", { className: cx("ad-chips", p.className), role: "group", "aria-label": p.label },
      p.options.map(function (o) {
        var k = typeof o === "object" ? o.value : o, lab = typeof o === "object" ? o.label : o;
        return h("button", { type: "button", key: k, className: cx("ad-chip", on(k) && "is-on"), "aria-pressed": on(k), onClick: function () { toggle(k); }, disabled: o.disabled },
          on(k) && multiple ? h(Icon, { name: "check", size: 14, stroke: 2.2 }) : null, lab,
          o.count != null ? h("span", { className: "ad-chip__n" }, o.count) : null);
      }));
  }
  function Switch(p) {
    var id = useId("sw", p.id);
    return h("label", { className: cx("ad-switch", p.className), htmlFor: id },
      h("input", { id: id, type: "checkbox", role: "switch", checked: !!p.checked, onChange: function (e) { p.onChange && p.onChange(e.target.checked); }, disabled: p.disabled }),
      h("span", { className: "ad-switch__track", "aria-hidden": true }, h("span", { className: "ad-switch__thumb" })),
      p.label ? h("span", { className: p.hideLabel ? "ad-sr" : "ad-switch__label" }, p.label) : null);
  }
  function Checkbox(p) {
    return h("label", { className: cx("ad-check", p.className) },
      h("input", { type: "checkbox", checked: !!p.checked, onChange: function (e) { p.onChange(e.target.checked); }, "aria-label": p.ariaLabel }),
      h("span", { className: "ad-check__box", "aria-hidden": true }, h(Icon, { name: "check", size: 13, stroke: 2.6 })),
      p.label ? h("span", null, p.label) : null);
  }
  function Tabs(p) {
    return h("div", { className: cx("ad-tabs", p.variant === "line" && "ad-tabs--line", p.block && "ad-tabs--block", p.className), role: "tablist", "aria-label": p.label },
      p.tabs.map(function (t) {
        var on = p.value === t.id;
        return h("button", { key: t.id, role: "tab", type: "button", "aria-selected": on, tabIndex: on ? 0 : -1, className: cx("ad-tab", on && "is-on"), onClick: function () { p.onChange(t.id); } },
          t.icon ? h(Icon, { name: t.icon, size: 16 }) : null, t.label,
          t.count != null ? h("span", { className: "ad-tab__n" }, t.count) : null);
      }));
  }
  function Spec(p) { return h("li", null, h(Icon, { name: p.icon, size: 15 }), h("span", null, p.children)); }
  function PhotoPending(p) {
    return h("div", { className: "ad-photo-pending" }, h(Icon, { name: "image", size: 26, stroke: 1.5 }),
      h("span", null, p.label || "Photos after inspection"));
  }
  function Empty(p) {
    return h("div", { className: "ad-empty" }, h("div", { className: "ad-empty__icon" }, h(Icon, { name: p.icon || "search", size: 24 })),
      h("h3", { className: "ad-h3" }, p.title), p.text ? h("p", { className: "ad-muted" }, p.text) : null, p.children);
  }

  /* ---------- SiteHeader ---------- */
  var NAV = [
    { id: "home", label: "Home" },
    { id: "stock", label: "Our stock" },
    { id: "auction", label: "Live auction", live: true },
    { id: "buy", label: "How to buy", children: [
      { id: "buy", label: "Buying process", text: "Five steps, 30–45 days" },
      { id: "sheet", label: "Reading an auction sheet", text: "Grades & damage codes decoded" },
      { id: "vocab", label: "Import vocabulary", text: "FOB, CIF, LC and more" }] },
    { id: "compare", label: "Compare" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" }
  ];
  function HREF(id) { return HOOKS.href ? HOOKS.href(id) : "#"; }
  function SiteHeader(p) {
    var st = useState(false), open = st[0], setOpen = st[1];
    var sm = useState(null), menu = sm[0], setMenu = sm[1];
    var ref = useRef(null);
    useOutside(ref, R.useCallback(function () { setMenu(null); }, []));
    var active = p.active || "home";
    function go(id) { return function (e) { e.preventDefault(); setMenu(null); setOpen(false); p.onNavigate && p.onNavigate(id); }; }
    return h("header", { className: "ad-header", ref: ref },
      h("div", { className: "ad-topbar" }, h("div", { className: "ad-wrap ad-topbar__in" },
        h("a", { href: "tel:" + SITE.phone.replace(/[^+0-9]/g, "") }, h(Icon, { name: "phone", size: 14 }), SITE.phone),
        h("a", { href: "mailto:" + SITE.email, className: "ad-hide-sm" }, h(Icon, { name: "mail", size: 14 }), SITE.email),
        h("span", { className: "ad-hide-sm" }, h(Icon, { name: "pin", size: 14 }), SITE.address),
        h("span", { className: "ad-topbar__sp" }),
        h("span", { className: "ad-topbar__live" }, h("span", { className: "ad-pulse", "aria-hidden": true }), LOTS.length ? LOTS.length + " auction lot" + (LOTS.length === 1 ? "" : "s") + " live this week" : "Japan auction imports for Sri Lanka"))),
      h("div", { className: "ad-wrap ad-nav" },
        h("a", { href: HREF("home"), className: "ad-nav__brand", "aria-label": "AutoDirect home", onClick: go("home") }, h(Logo, { size: 22 })),
        h("nav", { className: cx("ad-nav__links", open && "is-open"), "aria-label": "Main" },
          NAV.map(function (n) {
            var isActive = active === n.id || (n.children && n.children.some(function (c) { return c.id === active; }));
            if (n.children) {
              return h("div", { key: n.id, className: "ad-nav__dd" },
                h("button", { type: "button", className: cx("ad-nav__link", isActive && "is-active"), "aria-expanded": menu === n.id, onClick: function () { setMenu(menu === n.id ? null : n.id); } },
                  n.label, h(Icon, { name: "chevron-down", size: 14 })),
                menu === n.id ? h("div", { className: "ad-menu" }, n.children.map(function (c) {
                  return h("a", { key: c.label, href: HREF(c.id), className: "ad-menu__item", onClick: go(c.id) }, h("strong", null, c.label), h("span", null, c.text));
                })) : null);
            }
            return h("a", { key: n.id, href: HREF(n.id), className: cx("ad-nav__link", isActive && "is-active"), "aria-current": isActive ? "page" : undefined, onClick: go(n.id) },
              n.live ? h("span", { className: "ad-pulse", "aria-hidden": true }) : null, n.label);
          })),
        h("div", { className: "ad-nav__actions" },
          h("a", { href: HREF("compare"), className: "ad-nav__icon", "aria-label": "Compare list, " + (p.compareCount || 0) + " vehicles", onClick: go("compare") },
            h(Icon, { name: "compare" }), p.compareCount ? h("span", { className: "ad-count" }, p.compareCount) : null),
          p.user ? h("div", { className: "ad-nav__dd" },
            h("button", { type: "button", className: "ad-avatar-btn", "aria-expanded": menu === "acct", onClick: function () { setMenu(menu === "acct" ? null : "acct"); } },
              h("span", { className: "ad-avatar" }, p.user.split(" ").map(function (w) { return w[0] || ""; }).join("").slice(0, 2)),
              h("span", { className: "ad-hide-sm" }, p.user.split(" ")[0]), h(Icon, { name: "chevron-down", size: 14 })),
            menu === "acct" ? h("div", { className: "ad-menu ad-menu--right" },
              [["home", "Dashboard", "overview"], ["doc", "My inquiries", "inquiries"], ["heart", "Saved vehicles", "saved"], ["settings", "Profile settings", "profile"]].map(function (m) {
                return h("a", { key: m[1], href: HREF("account"), className: "ad-menu__row", onClick: function (e) { e.preventDefault(); setMenu(null); setOpen(false); p.onNavigate && p.onNavigate("account", { tab: m[2] }); } }, h(Icon, { name: m[0], size: 16 }), m[1]);
              }).concat(p.isAdmin ? [h("a", { key: "adm", href: HREF("admin"), className: "ad-menu__row", onClick: go("admin") }, h(Icon, { name: "settings", size: 16 }), "Admin console")] : [],
                [h("a", { key: "out", href: "#", className: "ad-menu__row", onClick: go("logout") }, h(Icon, { name: "logout", size: 16 }), "Sign out")])) : null)
            : h(Button, { variant: "secondary", size: "s", icon: "user", onClick: function () { p.onNavigate && p.onNavigate("login"); } }, "Sign in"),
          h(Button, { variant: "accent", size: "s", icon: "gavel", className: "ad-hide-md", onClick: function () { p.onNavigate && p.onNavigate("request"); } }, "Request a bid"),
          h("button", { type: "button", className: "ad-nav__burger", "aria-expanded": open, "aria-label": open ? "Close menu" : "Open menu", onClick: function () { setOpen(!open); } },
            h(Icon, { name: open ? "x" : "menu" })))));
  }

  /* ---------- SiteFooter ---------- */
  var FOOT_ROUTES = { "Our stock": "stock", "Live auction": "auction", "Compare vehicles": "compare", "Request a bid": "request", "How to buy": "buy", "Reading an auction sheet": "sheet", "Import vocabulary": "vocab", "About us": "about", "Contact us": "contact", "Sign in": "login", "Create account": "register", "My inquiries": "account", "Auction requests": "account", "Staff admin": "admin" };
  function SiteFooter(p) {
    var s = useState(""), email = s[0], setEmail = s[1];
    var d = useState("idle"), state = d[0], setState = d[1];
    function sub(e) {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("error"); return; }
      setState("busy");
      (HOOKS.subscribe ? HOOKS.subscribe(email) : Promise.reject(new Error("offline"))).then(function () { setState("done"); }, function () { setState("error"); });
    }
    var cols = [
      ["Buy", ["Our stock", "Live auction", "Compare vehicles", "Request a bid"]],
      ["Learn", ["How to buy", "Reading an auction sheet", "Import vocabulary", "About us", "Contact us"]],
      ["Account", ["Sign in", "Create account", "My inquiries", "Auction requests"]]
    ];
    return h("footer", { className: "ad-footer" },
      h("div", { className: "ad-wrap" },
        h("div", { className: "ad-footer__top" },
          h("div", { className: "ad-footer__brand" }, h(Logo, { size: 26, inverse: true }),
            h("p", null, "Japanese auction imports for Sri Lanka — original auction sheets, refundable deposits and door-to-door tracking."),
            h("form", { className: "ad-footer__sub", onSubmit: sub, noValidate: true },
              h("label", { htmlFor: "ad-ft-email", className: "ad-label" }, "New arrivals, weekly"),
              state === "done" ? h("p", { className: "ad-footer__ok", role: "status" }, h(Icon, { name: "check", size: 16 }), "Subscribed — thank you!")
                : h("div", { className: "ad-footer__subrow" },
                  h("input", { id: "ad-ft-email", type: "email", placeholder: "you@email.com", value: email, onChange: function (e) { setEmail(e.target.value); setState("idle"); }, "aria-invalid": state === "error" || undefined }),
                  h(Button, { type: "submit", variant: "accent", size: "s", iconRight: "arrow-right", loading: state === "busy" }, "Subscribe")),
              state === "error" ? h("p", { className: "ad-footer__err" }, "Enter a valid email address and try again.") : null)),
          cols.map(function (c) {
            return h("div", { key: c[0], className: "ad-footer__col" }, h("h4", { className: "ad-label" }, c[0]),
              h("ul", null, c[1].map(function (l) { return h("li", { key: l }, h("a", { href: HREF(FOOT_ROUTES[l] || "home"), onClick: function (e) { e.preventDefault(); p.onNavigate && p.onNavigate(FOOT_ROUTES[l] || "home", l === "Auction requests" ? { tab: "inquiries" } : l === "My inquiries" ? { tab: "inquiries" } : undefined); } }, l)); })));
          }),
          h("div", { className: "ad-footer__col" }, h("h4", { className: "ad-label" }, "Visit"),
            h("ul", { className: "ad-footer__contact" },
              h("li", null, h(Icon, { name: "pin", size: 15 }), SITE.address),
              h("li", null, h(Icon, { name: "phone", size: 15 }), SITE.phone),
              h("li", null, h(Icon, { name: "mail", size: 15 }), SITE.email),
              h("li", null, h(Icon, { name: "clock", size: 15 }), SITE.hours)))),
        h("div", { className: "ad-footer__makes" }, h("span", { className: "ad-label" }, "Popular makes"),
          Object.keys(MAKES).slice(0, 8).map(function (m) { return h("a", { key: m, href: HREF("stock") + "?make=" + encodeURIComponent(m), onClick: function (e) { e.preventDefault(); p.onNavigate && p.onNavigate("stock", { make: m }); } }, m); })),
        h("div", { className: "ad-footer__bottom" },
          h("span", null, "© " + new Date().getFullYear() + " AutoDirect (Pvt) Ltd. All rights reserved."),
          h("span", null, h("a", { href: SITE.instagram, target: "_blank", rel: "noopener" }, "Instagram"), " · ", h("a", { href: HREF("admin"), onClick: function (e) { e.preventDefault(); p.onNavigate && p.onNavigate("admin"); } }, "Staff admin")))));
  }

  /* ---------- HeroSearch ---------- */
  var YEARS = []; for (var yy = new Date().getFullYear(); yy >= 2010; yy--) YEARS.push(String(yy));
  // Slider limits follow the actual stock (priced cars only), so filters never hide the whole catalogue.
  function priceBounds() {
    var ps = VEHICLES.map(function (v) { return v.price; }).filter(function (x) { return x > 0; });
    if (!ps.length) return [0, 20000000];
    return [Math.floor(Math.min.apply(null, ps) / 500000) * 500000, Math.ceil(Math.max.apply(null, ps) / 1000000) * 1000000];
  }
  function yearBounds() {
    var ys = VEHICLES.map(function (v) { return v.year; }).filter(Boolean);
    if (!ys.length) return [2012, new Date().getFullYear()];
    return [Math.min.apply(null, ys), Math.max.apply(null, ys)];
  }
  function inPrice(v, r) { return v.price == null || v.price <= 0 || (v.price >= r[0] && v.price <= r[1]); }
  function HeroSearch(p) {
    var vehicles = p.vehicles || VEHICLES;
    var m = useState(p.mode || "stock"), mode = m[0], setMode = m[1];
    var a = useState(""), make = a[0], setMake = a[1];
    var b = useState(""), model = b[0], setModel = b[1];
    var c = useState(""), type = c[0], setType = c[1];
    var pb = priceBounds();
    var d = useState(pb), budget = d[0], setBudget = d[1];
    var e = useState(""), yFrom = e[0], setYFrom = e[1];
    var f = useState(""), chassis = f[0], setChassis = f[1];
    var g = useState(false), sent = g[0], setSent = g[1];
    var count = vehicles.filter(function (v) {
      return v.status !== "Sold" && (!make || v.make === make) && (!model || v.model === model) && (!type || v.type === type) &&
        inPrice(v, budget) && (!yFrom || v.year >= Number(yFrom));
    }).length;
    function submit(ev) { ev.preventDefault(); setSent(true); p.onSearch && p.onSearch({ mode: mode, make: make, model: model, type: type, budget: budget, bounds: pb, yearFrom: yFrom, chassis: chassis }); }
    var models = make ? (mode === "stock" ? MAKES : ALL_MAKES)[make] || [] : [];
    return h("div", { className: "ad-hs" },
      h(Tabs, { tabs: [{ id: "stock", label: "In our stock", icon: "car" }, { id: "auction", label: "Japan auctions", icon: "gavel" }], value: mode, onChange: function (x) { setMode(x); setSent(false); }, label: "Search in" }),
      h("form", { className: "ad-hs__grid", onSubmit: submit },
        h(SelectField, { label: "Make", placeholder: "Any make", options: mode === "stock" ? Object.keys(MAKES) : Object.keys(ALL_MAKES), value: make, onChange: function (ev) { setMake(ev.target.value); setModel(""); } }),
        h(SelectField, { label: "Model", placeholder: make ? "Any " + make : "Choose a make first", options: models, value: model, disabled: !make, onChange: function (ev) { setModel(ev.target.value); } }),
        mode === "stock"
          ? h(SelectField, { label: "Body type", placeholder: "Any body", options: BODY_TYPES, value: type, onChange: function (ev) { setType(ev.target.value); } })
          : h(TextField, { label: "Chassis code", placeholder: "e.g. NKE165", mono: true, value: chassis, onChange: function (ev) { setChassis(ev.target.value.toUpperCase()); } }),
        h(SelectField, { label: mode === "stock" ? "Year from" : "Model year", placeholder: "Any year", options: YEARS, value: yFrom, onChange: function (ev) { setYFrom(ev.target.value); } }),
        mode === "stock"
          ? h(RangeSlider, { className: "ad-hs__budget", label: "Budget", min: pb[0], max: pb[1], step: 250000, value: budget, onChange: setBudget, format: lkr })
          : h("p", { className: "ad-hs__budget ad-small ad-muted" }, "We search this week’s USS, TAA and JU lots for you."),
        h("div", { className: "ad-hs__go" },
          h(Button, { type: "submit", variant: mode === "stock" ? "primary" : "accent", size: "l", icon: "search", block: true },
            mode === "stock" ? "Show " + count + " vehicle" + (count === 1 ? "" : "s") : "Search auctions"),
          h("p", { className: "ad-hs__note", role: sent ? "status" : undefined },
            mode === "stock" ? (sent ? count + " matches — opening Our stock…" : "Live count updates as you choose")
              : (sent ? "Sign in to see full auction data for your search." : "Weekly USS, TAA & JU auctions · sign in for full data")))));
  }

  /* ---------- VehicleCard ---------- */
  function VehicleCard(p) {
    var v = p.vehicle;
    return h("article", { className: cx("ad-vcard", p.layout === "row" && "ad-vcard--row", v.status === "Sold" && "is-sold", p.className) },
      h("div", { className: "ad-vcard__media" },
        v.img ? h("img", { src: v.img, alt: (title(v) + " " + v.grade).trim(), loading: "lazy" }) : h(PhotoPending, null),
        h("div", { className: "ad-vcard__tags" }, h(StatusBadge, { status: v.status }), v.isNew ? h(Badge, { tone: "highlight" }, "New arrival") : null),
        p.onSave ? h("button", { type: "button", className: cx("ad-vcard__save", p.saved && "is-on"), "aria-pressed": !!p.saved, "aria-label": (p.saved ? "Remove " : "Save ") + title(v), onClick: p.onSave }, h(Icon, { name: "heart", size: 18 })) : null,
        v.auctionGrade ? h(GradeSeal, { grade: v.auctionGrade, interior: v.interior, size: 50, className: "ad-vcard__seal" }) : null),
      h("div", { className: "ad-vcard__body" },
        h("div", { className: "ad-vcard__meta ad-mono" }, v.id, h("span", { "aria-hidden": true }, "·"), v.chassis),
        h("h3", { className: "ad-vcard__title" }, h("a", { href: "/our-stock/" + encodeURIComponent(v.seo || v.id), onClick: function (e) { e.preventDefault(); p.onOpen && p.onOpen(v); } }, title(v)), h("span", null, v.grade)),
        h("ul", { className: "ad-vcard__specs" },
          h(Spec, { icon: "gauge" }, v.mileage ? num(v.mileage) + " km" : "—"), h(Spec, { icon: "fuel" }, v.fuel || "—"),
          h(Spec, { icon: "gear" }, v.trans === "Automatic" ? "Auto" : (v.trans || "—")), h(Spec, { icon: "car" }, v.engine ? v.engine + " cc" : "—")),
        h("div", { className: "ad-vcard__foot" },
          h("div", null, h("div", { className: "ad-label" }, v.status === "Sold" ? "Sold for" : "Price"), h("div", { className: "ad-vcard__price" }, lkr(v.price))),
          p.onCompare ? h("label", { className: cx("ad-cmp", p.compared && "is-on", p.compareDisabled && !p.compared && "is-disabled") },
            h("input", { type: "checkbox", checked: !!p.compared, onChange: p.onCompare, disabled: p.compareDisabled && !p.compared }),
            h(Icon, { name: p.compared ? "check" : "compare", size: 16 }), p.compared ? "Added" : "Compare") : null)));
  }

  /* ---------- CompareTray ---------- */
  function CompareTray(p) {
    var items = p.items || [];
    if (!items.length) return null;
    var slots = [0, 1, 2, 3];
    return h("div", { className: cx("ad-tray", p.floating && "ad-tray--float"), role: "region", "aria-label": "Compare list" },
      h("div", { className: "ad-tray__head" }, h("strong", null, "Compare"), h("span", { className: "ad-tray__n" }, items.length + " / 4")),
      h("div", { className: "ad-tray__slots" }, slots.map(function (i) {
        var v = items[i];
        if (!v) return h("div", { key: i, className: "ad-tray__slot is-empty" }, h(Icon, { name: "plus", size: 16 }), h("span", null, "Add a vehicle"));
        return h("div", { key: v.id, className: "ad-tray__slot" },
          v.img ? h("img", { src: v.img, alt: "" }) : h("span", { className: "ad-tray__ph" }, h(Icon, { name: "car", size: 18 })),
          h("span", { className: "ad-tray__name" }, h("b", null, v.make + " " + v.model), h("span", null, lkr(v.price))),
          h("button", { type: "button", className: "ad-tray__x", "aria-label": "Remove " + title(v), onClick: function () { p.onRemove && p.onRemove(v.id); } }, h(Icon, { name: "x", size: 14 })));
      })),
      h("div", { className: "ad-tray__act" },
        h(Button, { variant: "ghost", size: "s", onClick: p.onClear }, "Clear"),
        h(Button, { variant: "accent", size: "m", iconRight: "arrow-right", disabled: items.length < 2, onClick: p.onCompare }, items.length < 2 ? "Pick one more" : "Compare " + items.length)));
  }

  /* ---------- StockBrowser ---------- */
  var SORTS = [{ value: "new", label: "Newest arrivals" }, { value: "price-asc", label: "Price: low to high" }, { value: "price-desc", label: "Price: high to low" }, { value: "km", label: "Lowest mileage" }, { value: "grade", label: "Best auction grade" }];
  function gradeNum(g) { return g === "S" ? 7 : g === "R" || g === "RA" ? 0 : Number(g) || 0; }
  function StockBrowser(p) {
    var vehicles = p.vehicles || VEHICLES;
    var s1 = useState(""), q = s1[0], setQ = s1[1];
    var init = p.initial || {};
    var s2 = useState(init.make ? [init.make] : []), makes = s2[0], setMakes = s2[1];
    var s3 = useState(init.type ? [init.type] : []), types = s3[0], setTypes = s3[1];
    var pb = priceBounds(), yb = yearBounds();
    var s4 = useState(init.budget ? [Math.max(pb[0], init.budget[0]), Math.min(pb[1], init.budget[1])] : pb), price = s4[0], setPrice = s4[1];
    var s5 = useState(init.yearFrom ? [Math.min(yb[1], Math.max(yb[0], Number(init.yearFrom))), yb[1]] : yb), years = s5[0], setYears = s5[1];
    var sl = useState(init.location ? [init.location] : []), locs = sl[0], setLocs = sl[1];
    var priceTouched = price[0] !== pb[0] || price[1] !== pb[1];
    var s6 = useState(""), minGrade = s6[0], setMinGrade = s6[1];
    var s7 = useState("new"), sort = s7[0], setSort = s7[1];
    var s8 = useState("grid"), view = s8[0], setView = s8[1];
    var cmp = p.cmp || [], saved = p.saved || [];
    var s11 = useState(false), showSold = s11[0], setShowSold = s11[1];
    var s12 = useState(false), panel = s12[0], setPanel = s12[1];
    var list = useMemo(function () {
      var ql = q.trim().toLowerCase();
      var r = vehicles.filter(function (v) {
        return (showSold || v.status !== "Sold") && (!makes.length || makes.indexOf(v.make) >= 0) && (!types.length || types.indexOf(v.type) >= 0) &&
          (!locs.length || locs.indexOf(v.location) >= 0) &&
          (priceTouched ? (v.price > 0 && v.price >= price[0] && v.price <= price[1]) : true) && (!v.year || (v.year >= years[0] && v.year <= years[1])) &&
          (!minGrade || gradeNum(v.auctionGrade) >= Number(minGrade)) &&
          (!ql || (title(v) + " " + v.grade + " " + v.chassis + " " + v.id + " " + v.color).toLowerCase().indexOf(ql) >= 0);
      });
      var by = {
        "new": function (x, y) { return (y.isNew ? 1 : 0) - (x.isNew ? 1 : 0) || new Date(y.added || 0) - new Date(x.added || 0); },
        "price-asc": function (x, y) { return (x.price || 1e12) - (y.price || 1e12); }, "price-desc": function (x, y) { return (y.price || 0) - (x.price || 0); },
        "km": function (x, y) { return x.mileage - y.mileage; }, "grade": function (x, y) { return gradeNum(y.auctionGrade) - gradeNum(x.auctionGrade); }
      }[sort];
      return r.slice().sort(by);
    }, [vehicles, q, makes, types, locs, price, years, minGrade, sort, showSold]);
    var active = [];
    makes.forEach(function (m) { active.push([m, function () { setMakes(makes.filter(function (x) { return x !== m; })); }]); });
    types.forEach(function (t) { active.push([t, function () { setTypes(types.filter(function (x) { return x !== t; })); }]); });
    locs.forEach(function (l) { active.push([l, function () { setLocs(locs.filter(function (x) { return x !== l; })); }]); });
    if (minGrade) active.push(["Grade " + minGrade + "+", function () { setMinGrade(""); }]);
    if (priceTouched) active.push([lkr(price[0]) + "–" + lkr(price[1]).replace("LKR ", ""), function () { setPrice(pb); }]);
    if (years[0] !== yb[0] || years[1] !== yb[1]) active.push([years[0] + "–" + years[1], function () { setYears(yb); }]);
    function clearAll() { setMakes([]); setTypes([]); setLocs([]); setMinGrade(""); setPrice(pb); setYears(yb); setQ(""); }
    function countBy(key, val) { return vehicles.filter(function (v) { return v[key] === val && (showSold || v.status !== "Sold"); }).length; }
    function toggleCmp(id) { p.onToggleCmp && p.onToggleCmp(id); }
    var cmpItems = cmp.map(function (id) { return vehicles.filter(function (v) { return v.id === id; })[0]; }).filter(Boolean);
    var filters = h("aside", { className: cx("ad-filters", panel && "is-open"), "aria-label": "Filters" },
      h("div", { className: "ad-filters__head" }, h("h2", { className: "ad-h3" }, "Filters"),
        active.length ? h("button", { type: "button", className: "ad-link", onClick: clearAll }, "Clear all") : null,
        h("button", { type: "button", className: "ad-filters__close", "aria-label": "Close filters", onClick: function () { setPanel(false); } }, h(Icon, { name: "x" }))),
      h(TextField, { icon: "search", placeholder: "Model, chassis or ref", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search stock" }),
      h("div", { className: "ad-fgroup" }, h("div", { className: "ad-label" }, "Make"),
        h(ChipGroup, { multiple: true, label: "Make", value: makes, onChange: setMakes, options: Object.keys(MAKES).map(function (m) { return { value: m, label: m, count: countBy("make", m) }; }) })),
      h("div", { className: "ad-fgroup" }, h("div", { className: "ad-label" }, "Body type"),
        h(ChipGroup, { multiple: true, label: "Body type", value: types, onChange: setTypes, options: BODY_TYPES.map(function (t) { return { value: t, label: t, count: countBy("type", t) }; }) })),
      LOCATIONS.some(function (l) { return l.count > 0; }) ? h("div", { className: "ad-fgroup" }, h("div", { className: "ad-label" }, "Inventory location"),
        h(ChipGroup, { multiple: true, label: "Inventory location", value: locs, onChange: setLocs, options: LOCATIONS.filter(function (l) { return l.count > 0 || locs.indexOf(l.name) >= 0; }).map(function (l) { return { value: l.name, label: l.name, count: countBy("location", l.name) }; }) })) : null,
      pb[1] > pb[0] ? h("div", { className: "ad-fgroup" }, h(RangeSlider, { label: "Price", min: pb[0], max: pb[1], step: 250000, value: price, onChange: setPrice, format: lkr })) : null,
      yb[1] > yb[0] ? h("div", { className: "ad-fgroup" }, h(RangeSlider, { label: "Year", min: yb[0], max: yb[1], step: 1, value: years, onChange: setYears })) : null,
      h("div", { className: "ad-fgroup" }, h("div", { className: "ad-label" }, "Minimum auction grade"),
        h(ChipGroup, { label: "Minimum auction grade", value: minGrade, allowEmpty: true, onChange: setMinGrade, options: ["3.5", "4", "4.5", "5"].map(function (g) { return { value: g, label: g + "+" }; }) })),
      h("div", { className: "ad-fgroup" }, h(Switch, { label: "Show sold vehicles", checked: showSold, onChange: setShowSold })),
      h("div", { className: "ad-filters__mobilego" }, h(Button, { block: true, onClick: function () { setPanel(false); } }, "Show " + list.length + " results")));
    return h("div", { className: "ad-stock" },
      filters,
      h("div", { className: "ad-stock__main" },
        h("div", { className: "ad-stock__bar" },
          h("div", null, h("h2", { className: "ad-h2" }, list.length + " vehicle" + (list.length === 1 ? "" : "s")),
            h("p", { className: "ad-muted ad-small" }, "Imported from Japan · prices include duty & clearance")),
          h("div", { className: "ad-stock__tools" },
            h(Button, { variant: "secondary", size: "s", icon: "filter", className: "ad-show-md", onClick: function () { setPanel(true); } }, "Filters" + (active.length ? " (" + active.length + ")" : "")),
            h(SelectField, { "aria-label": "Sort by", options: SORTS, value: sort, onChange: function (e) { setSort(e.target.value); }, className: "ad-stock__sort" }),
            h("div", { className: "ad-seg", role: "group", "aria-label": "Layout" },
              h("button", { type: "button", "aria-pressed": view === "grid", "aria-label": "Grid view", className: view === "grid" ? "is-on" : "", onClick: function () { setView("grid"); } }, h(Icon, { name: "grid", size: 16 })),
              h("button", { type: "button", "aria-pressed": view === "list", "aria-label": "List view", className: view === "list" ? "is-on" : "", onClick: function () { setView("list"); } }, h(Icon, { name: "list", size: 16 }))))),
        active.length ? h("div", { className: "ad-active" }, active.map(function (a) {
          return h("button", { key: a[0], type: "button", className: "ad-active__chip", onClick: a[1], "aria-label": "Remove filter " + a[0] }, a[0], h(Icon, { name: "x", size: 13 }));
        })) : null,
        list.length ? h("div", { className: cx("ad-stock__grid", view === "list" && "is-list") }, list.map(function (v) {
          return h(VehicleCard, { key: v.id, vehicle: v, layout: view === "list" ? "row" : "card", compared: cmp.indexOf(v.id) >= 0, compareDisabled: cmp.length >= 4,
            onCompare: function () { toggleCmp(v.id); }, saved: saved.indexOf(v.id) >= 0,
            onSave: function () { p.onToggleSave && p.onToggleSave(v.id); }, onOpen: p.onOpen });
        })) : h(Empty, { title: "Nothing matches those filters", text: "Loosen a filter — or let us bid for the exact car at this week’s Japan auctions." },
          h("div", { className: "ad-row" }, h(Button, { variant: "secondary", onClick: clearAll }, "Clear filters"), h(Button, { variant: "accent", icon: "gavel", onClick: p.onRequest }, "Request from auction"))),
        h(CompareTray, { items: cmpItems, onRemove: toggleCmp, onClear: function () { p.onClearCmp && p.onClearCmp(); }, onCompare: function () { p.onCompare && p.onCompare(cmpItems); } })));
  }

  /* ---------- CompareTable ---------- */
  var CMP_ROWS = [
    ["Price", function (v) { return lkr(v.price); }, "price", "min"], ["Year", function (v) { return v.year || "—"; }, "year", "max"],
    ["Mileage", function (v) { return v.mileage ? num(v.mileage) + " km" : "—"; }, "mileage", "min"], ["Auction grade", function (v) { return v.auctionGrade ? v.auctionGrade + " · int. " + (v.interior || "—") : "—"; }, "auctionGrade", "grade"],
    ["Engine", function (v) { return v.engine ? v.engine + " cc" : "—"; }], ["Fuel", function (v) { return v.fuel || "—"; }], ["Transmission", function (v) { return v.trans || "—"; }],
    ["Body", function (v) { return v.type || "—"; }], ["Colour", function (v) { return v.color || "—"; }], ["Location", function (v) { return v.location || "—"; }], ["Chassis", function (v) { return v.chassis || "—"; }, null, null, true],
    ["Status", function (v) { return h(StatusBadge, { status: v.status }); }, "status"]
  ];
  function CompareTable(p) {
    var s = useState(p.vehicles || VEHICLES.slice(0, 3)), list = s[0], setList = s[1];
    var d = useState(false), diff = d[0], setDiff = d[1];
    function best(key, mode) {
      if (!key || !mode || list.length < 2) return null;
      var vals = list.map(function (v) { return mode === "grade" ? gradeNum(v[key]) : (!v[key] ? (mode === "min" ? Infinity : -Infinity) : v[key]); });
      var target = (mode === "min") ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
      return vals.map(function (x) { return isFinite(target) && x === target; });
    }
    function same(fn, key) { var vals = list.map(function (v) { return key ? String(v[key]) : String(fn(v)); }); return vals.every(function (x) { return x === vals[0]; }); }
    var rows = CMP_ROWS.filter(function (r) { return !diff || !same(r[1], r[2]); });
    var feats = FEATURES.filter(function (f) { if (!diff) return true; var hv = list.map(function (v) { return v.features.indexOf(f) >= 0; }); return hv.some(function (x) { return x !== hv[0]; }); });
    if (!list.length) return h(Empty, { icon: "compare", title: "Your compare list is empty", text: "Tick Compare on up to four vehicles in Our stock." });
    return h("div", { className: "ad-ctable" },
      h("div", { className: "ad-ctable__bar" }, h("p", { className: "ad-muted ad-small" }, "Best value in each row is marked."),
        h(Switch, { label: "Only show differences", checked: diff, onChange: setDiff })),
      h("div", { className: "ad-ctable__scroll" },
        h("table", null,
          h("thead", null, h("tr", null, h("th", { scope: "col", className: "ad-ctable__corner" }, h("span", { className: "ad-label" }, list.length + " vehicles")),
            list.map(function (v) {
              return h("th", { key: v.id, scope: "col" }, h("div", { className: "ad-ctable__car" },
                h("div", { className: "ad-ctable__img" }, v.img ? h("img", { src: v.img, alt: "" }) : h(PhotoPending, { label: "Photos soon" }),
                  h("button", { type: "button", className: "ad-ctable__x", "aria-label": "Remove " + title(v), onClick: function () { setList(list.filter(function (x) { return x.id !== v.id; })); p.onRemove && p.onRemove(v.id); } }, h(Icon, { name: "x", size: 14 }))),
                h("strong", null, title(v)), h("span", { className: "ad-muted ad-small" }, v.grade)));
            }))),
          h("tbody", null,
            rows.map(function (r) {
              var b = best(r[2], r[3]);
              return h("tr", { key: r[0] }, h("th", { scope: "row" }, r[0]), list.map(function (v, i) {
                return h("td", { key: v.id, className: cx(b && b[i] && "is-best", r[4] && "ad-mono") }, r[1](v), b && b[i] ? h("span", { className: "ad-best" }, r[3] === "min" ? (r[2] === "price" ? "Lowest" : "Lowest") : r[3] === "max" ? "Newest" : "Best") : null);
              }));
            }),
            feats.length ? h("tr", { className: "ad-ctable__sec" }, h("th", { colSpan: list.length + 1, scope: "rowgroup" }, "Features")) : null,
            feats.map(function (f) {
              return h("tr", { key: f }, h("th", { scope: "row" }, f), list.map(function (v) {
                var hv = v.features.indexOf(f) >= 0;
                return h("td", { key: v.id }, hv ? h("span", { className: "ad-yes" }, h(Icon, { name: "check", size: 16, stroke: 2.2 }), h("span", { className: "ad-sr" }, "Yes")) : h("span", { className: "ad-no" }, "—", h("span", { className: "ad-sr" }, "No")));
              }));
            })),
          h("tfoot", null, h("tr", null, h("th", null), list.map(function (v) {
            return h("td", { key: v.id }, h(Button, { size: "s", block: true, variant: v.status === "Sold" ? "secondary" : "primary", disabled: v.status === "Sold", onClick: function () { p.onQuote && p.onQuote(v); } }, v.status === "Sold" ? "Sold" : "Request quote"));
          }))))));
  }

  /* ---------- VehicleGallery ---------- */
  function VehicleGallery(p) {
    var items = p.items && p.items.length ? p.items : [{ src: null, label: "Photos after inspection" }];
    var s = useState(0), i = s[0], setI = s[1];
    var z = useState(false), zoom = z[0], setZoom = z[1];
    function go(d) { setI((i + d + items.length) % items.length); }
    function key(e) { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "Escape") setZoom(false); }
    var cur = items[i];
    return h("div", { className: "ad-gallery", onKeyDown: key },
      h("div", { className: cx("ad-gallery__stage", cur.sheet && "is-sheet") },
        cur.src ? h("button", { type: "button", className: "ad-gallery__img", onClick: function () { setZoom(true); }, "aria-label": "Enlarge " + cur.label }, h("img", { src: cur.src, alt: (p.alt || "Vehicle") + " — " + cur.label })) : h(PhotoPending, { label: cur.label }),
        h("span", { className: "ad-gallery__count ad-mono" }, (i + 1) + " / " + items.length + " · " + cur.label),
        items.length > 1 ? h("button", { type: "button", className: "ad-gallery__nav is-prev", onClick: function () { go(-1); }, "aria-label": "Previous photo" }, h(Icon, { name: "chevron-left" })) : null,
        items.length > 1 ? h("button", { type: "button", className: "ad-gallery__nav is-next", onClick: function () { go(1); }, "aria-label": "Next photo" }, h(Icon, { name: "chevron-right" })) : null),
      h("div", { className: "ad-gallery__thumbs", role: "tablist", "aria-label": "Photos" }, items.map(function (it, k) {
        return h("button", { key: k, type: "button", role: "tab", "aria-selected": k === i, "aria-label": it.label, className: cx("ad-gallery__thumb", k === i && "is-on"), onClick: function () { setI(k); } },
          it.src ? h("img", { src: it.src, alt: "" }) : h(Icon, { name: "image", size: 18 }), it.sheet ? h("span", { className: "ad-gallery__tag" }, "Sheet") : null);
      })),
      zoom && cur.src ? h("div", { className: "ad-lightbox", role: "dialog", "aria-modal": true, "aria-label": cur.label, onClick: function () { setZoom(false); } },
        h("img", { src: cur.src, alt: cur.label }), h("button", { type: "button", className: "ad-lightbox__x", "aria-label": "Close", autoFocus: true }, h(Icon, { name: "x" }))) : null);
  }

  /* ---------- SpecSheet ---------- */
  function SpecSheet(p) {
    var v = p.vehicle;
    var rows = [["Ref", v.id, true], ["Chassis no.", v.chassis || "—", true], ["Year", v.year || "—"], ["Mileage", v.mileage ? num(v.mileage) + " km" : "—"], ["Engine", v.engine ? v.engine + " cc" : "—"], ["Fuel", v.fuel || "—"], ["Transmission", v.trans || "—"], ["Drive", v.drive || "—"], ["Body", v.type || "—"], ["Colour", v.color || "—"], ["Grade", v.grade || "—"], ["Location", v.location || "—"]];
    return h("div", { className: "ad-specs" },
      v.auctionGrade ? h("div", { className: "ad-specs__report" },
        h(GradeSeal, { grade: v.auctionGrade, interior: v.interior, size: 72 }),
        h("div", null, h("div", { className: "ad-label" }, "Auction report"),
          h("p", { className: "ad-specs__rtitle" }, "Grade " + v.auctionGrade + " exterior" + (v.interior ? " · interior " + v.interior : "")),
          h("p", { className: "ad-muted ad-small" }, "Original sheet + English translation available on request. ", h("a", { href: HREF("sheet"), className: "ad-link", onClick: function (e) { e.preventDefault(); HOOKS.go && HOOKS.go("sheet"); } }, "How to read it")))) : null,
      h("dl", { className: "ad-specs__grid" }, rows.map(function (r) {
        return h("div", { key: r[0] }, h("dt", { className: "ad-label" }, r[0]), h("dd", { className: r[2] ? "ad-mono" : "" }, r[1]));
      })),
      v.description ? h("p", { className: "ad-bodyl" }, v.description) : null,
      FEATURES.length ? h("div", { className: "ad-specs__feat" }, h("div", { className: "ad-label" }, "Features"),
        h("ul", null, FEATURES.map(function (f) {
          var on = v.features.indexOf(f) >= 0;
          return h("li", { key: f, className: on ? "is-on" : "is-off" }, h(Icon, { name: on ? "check" : "minus", size: 14, stroke: 2.2 }), f, on ? null : h("span", { className: "ad-sr" }, " (not fitted)"));
        }))) : null);
  }

  /* ---------- LoanCalculator ---------- */
  function LoanCalculator(p) {
    var s1 = useState(p.price || 10000000), price = s1[0], setPrice = s1[1];
    var s2 = useState(30), down = s2[0], setDown = s2[1];
    var s3 = useState(14.5), rate = s3[0], setRate = s3[1];
    var s4 = useState(5), years = s4[0], setYears = s4[1];
    var principal = Math.max(0, price * (1 - down / 100));
    var n = years * 12, r = rate / 100 / 12;
    var monthly = r ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n;
    var total = monthly * n, interest = total - principal;
    var pShare = total ? principal / (total + price * down / 100) * 100 : 0;
    var iShare = total ? interest / (total + price * down / 100) * 100 : 0;
    return h("div", { className: "ad-loan" },
      h("div", { className: "ad-loan__in" },
        h(TextField, { label: "Vehicle price", prefix: "LKR", inputMode: "numeric", value: num(price), onChange: function (e) { var x = Number(e.target.value.replace(/[^0-9]/g, "")); setPrice(isNaN(x) ? 0 : x); } }),
        h(RangeSlider, { single: true, label: "Down payment", min: 10, max: 70, step: 5, value: [10, down], onChange: function (v) { setDown(v[1]); }, format: function (x) { return x + "% · " + lkr(price * x / 100); } }),
        h(RangeSlider, { single: true, label: "Interest rate (p.a.)", min: 8, max: 24, step: 0.25, value: [8, rate], onChange: function (v) { setRate(v[1]); }, format: function (x) { return x.toFixed(2) + "%"; } }),
        h("div", null, h("div", { className: "ad-label", id: "ad-loan-yrs" }, "Period"),
          h(ChipGroup, { label: "Period in years", value: String(years), onChange: function (x) { setYears(Number(x)); }, options: ["1", "2", "3", "4", "5", "6", "7"].map(function (y) { return { value: y, label: y + " yr" }; }) }))),
      h("div", { className: "ad-loan__out", "aria-live": "polite" },
        h("div", { className: "ad-label" }, "Monthly installment"),
        h("div", { className: "ad-loan__big" }, lkrFull(Math.round(monthly))),
        h("div", { className: "ad-loan__bar", "aria-hidden": true },
          h("span", { className: "is-down", style: { width: (100 - pShare - iShare) + "%" } }), h("span", { className: "is-p", style: { width: pShare + "%" } }), h("span", { className: "is-i", style: { width: iShare + "%" } })),
        h("dl", { className: "ad-loan__rows" },
          h("div", null, h("dt", null, h("i", { className: "k-down" }), "Down payment"), h("dd", null, lkr(price * down / 100))),
          h("div", null, h("dt", null, h("i", { className: "k-p" }), "Loan amount"), h("dd", null, lkr(principal))),
          h("div", null, h("dt", null, h("i", { className: "k-i" }), "Total interest"), h("dd", null, lkr(interest))),
          h("div", { className: "is-total" }, h("dt", null, "Total payable"), h("dd", null, lkr(total + price * down / 100)))),
        h("p", { className: "ad-small ad-muted" }, "Estimate only. Leasing partners confirm final rates.")));
  }

  /* ---------- InquiryForm ---------- */
  function InquiryForm(p) {
    var v = p.vehicle;
    var me = (HOOKS.me && HOOKS.me()) || {};
    var k = useState("quote"), kind = k[0], setKind = k[1];
    var f = useState({ name: me.name || "", email: me.email || "", phone: me.phone || "", date: "", msg: "I’m interested in the " + title(v) + " (" + v.id + "). Please send me your best price." }), form = f[0], setForm = f[1];
    var rf = useState(""), refNo = rf[0], setRefNo = rf[1];
    var c = useState("WhatsApp"), pref = c[0], setPref = c[1];
    var e = useState({}), errs = e[0], setErrs = e[1];
    var s = useState("idle"), state = s[0], setState = s[1];
    function set(key) { return function (ev) { var o = Object.assign({}, form); o[key] = ev.target.value; setForm(o); if (errs[key]) { var x = Object.assign({}, errs); delete x[key]; setErrs(x); } }; }
    function submit(ev) {
      ev.preventDefault();
      var x = {};
      if (form.name.trim().length < 2) x.name = "Tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) x.email = "Enter a valid email, e.g. name@gmail.com.";
      if (!/^(\+94|0)\s?7\d[\s-]?\d{3}[\s-]?\d{4}$/.test(form.phone.trim())) x.phone = "Use a Sri Lankan mobile, e.g. 077 123 4567.";
      if (kind === "viewing" && !form.date) x.date = "Pick a day for your visit.";
      setErrs(x);
      if (Object.keys(x).length) return;
      setState("sending");
      HOOKS.sendInquiry({ kind: kind === "quote" ? "Stock quote" : "Viewing", vehicle_id: v.dbId, name: form.name, email: form.email, phone: form.phone, message: form.msg, pref: pref, date: form.date })
        .then(function (r) { setRefNo(r.ref || ""); setState("done"); }, function (err) { setErrs({ form: err.message }); setState("idle"); });
    }
    if (state === "done") return h("div", { className: "ad-form ad-success", role: "status" },
      h("div", { className: "ad-success__icon" }, h(Icon, { name: "check", size: 26, stroke: 2.2 })),
      h("h3", { className: "ad-h2" }, kind === "quote" ? "Quote requested" : "Viewing booked"),
      h("p", null, "We’ll reach you on ", h("b", null, pref), " within 2 working hours."),
      refNo ? h("p", { className: "ad-mono ad-muted" }, "Reference " + refNo) : null,
      h("div", { className: "ad-row" }, h(Button, { variant: "secondary", icon: "doc", onClick: p.onTrack }, "Track in My inquiries"), h(Button, { variant: "ghost", onClick: function () { setState("idle"); } }, "Send another")));
    return h("form", { className: "ad-form", onSubmit: submit, noValidate: true },
      h("div", { className: "ad-form__head" },
        h(Tabs, { block: true, label: "Inquiry type", tabs: [{ id: "quote", label: "Request a quote", icon: "doc" }, { id: "viewing", label: "Book a viewing", icon: "calendar" }], value: kind, onChange: setKind })),
      h("div", { className: "ad-form__ctx" }, v.img ? h("img", { src: v.img, alt: "" }) : null, h("div", null, h("strong", null, title(v)), h("span", { className: "ad-mono ad-muted" }, v.id + " · " + lkr(v.price)))),
      errs.form ? h("p", { className: "ad-field__error", role: "alert" }, h(Icon, { name: "info", size: 14 }), errs.form) : null,
      h("div", { className: "ad-form__grid" },
        h(TextField, { label: "Full name", autoComplete: "name", value: form.name, onChange: set("name"), error: errs.name }),
        h(TextField, { label: "Mobile", type: "tel", autoComplete: "tel", placeholder: "077 123 4567", value: form.phone, onChange: set("phone"), error: errs.phone }),
        h(TextField, { label: "Email", type: "email", autoComplete: "email", value: form.email, onChange: set("email"), error: errs.email, className: kind === "viewing" ? "" : "ad-span2" }),
        kind === "viewing" ? h(TextField, { label: "Preferred day", type: "date", value: form.date, onChange: set("date"), error: errs.date }) : null,
        h("div", { className: "ad-span2" }, h("div", { className: "ad-field__label" }, "Reply on"), h(ChipGroup, { label: "Preferred contact", value: pref, onChange: setPref, options: ["WhatsApp", "Call", "Email"] })),
        h(TextField, { label: "Message", multiline: true, rows: 3, value: form.msg, onChange: set("msg"), className: "ad-span2", optional: true })),
      h("div", { className: "ad-form__foot" },
        h("p", { className: "ad-small ad-muted" }, h(Icon, { name: "lock", size: 14 }), " We never share your number."),
        h(Button, { type: "submit", loading: state === "sending", iconRight: state === "sending" ? null : "send" }, state === "sending" ? "Sending…" : kind === "quote" ? "Send request" : "Book viewing")));
  }

  /* ---------- AuctionLotCard ---------- */
  function fmtT(s) { if (s <= 0) return "00:00:00"; var hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60; return [hh, mm, ss].map(function (x) { return (x < 10 ? "0" : "") + x; }).join(":"); }
  function AuctionLotCard(p) {
    var lot = p.lot;
    function secsLeft() { return lot.endsAt ? Math.max(0, Math.floor((new Date(lot.endsAt) - Date.now()) / 1000)) : Infinity; }
    var t = useState(secsLeft), left = t[0], setLeft = t[1];
    var authed = HOOKS.isAuthed ? HOOKS.isAuthed() : false;
    var step = 10000;
    var b = useState(lot.current + 60000), max = b[0], setMax = b[1];
    var s = useState("idle"), state = s[0], setState = s[1];
    var e = useState(""), err = e[0], setErr = e[1];
    useEffect(function () { if (!lot.endsAt) return; var id = setInterval(function () { setLeft(secsLeft()); }, 1000); return function () { clearInterval(id); }; }, [lot.endsAt]);
    function place() {
      if (max <= lot.current) { setErr("Your maximum must be above the current bid of " + yen(lot.current) + "."); return; }
      if (!authed) { HOOKS.go && HOOKS.go("login"); return; }
      setErr(""); setState("placing");
      HOOKS.placeBid(lot, max).then(function () { setState("leading"); }, function (e) { setState("idle"); setErr(e.message); });
    }
    var urgent = left < 3600;
    var jst = lot.endsAt ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(lot.endsAt)) : "";
    return h("article", { className: cx("ad-lotcard", state === "leading" && "is-leading") },
      h("div", { className: "ad-lotcard__media" }, lot.img ? h("img", { src: lot.img, alt: lot.year + " " + lot.make + " " + lot.model }) : h(PhotoPending, null),
        h(LotTag, { lot: lot.lot, className: "ad-lotcard__lot" }), h(GradeSeal, { grade: lot.auctionGrade, interior: lot.interior, size: 50, className: "ad-lotcard__seal" })),
      h("div", { className: "ad-lotcard__body" },
        h("div", { className: "ad-lotcard__house" }, h("span", { className: "ad-pulse", "aria-hidden": true }), [lot.house, lot.date].filter(Boolean).join(" · ")),
        h("h3", { className: "ad-h3" }, lot.year + " " + lot.make + " " + lot.model + " ", h("span", { className: "ad-muted" }, lot.grade)),
        h("div", { className: "ad-mono ad-muted ad-small" }, lot.chassis + " · " + num(lot.mileage) + " km"),
        h("div", { className: "ad-lotcard__stats" },
          h("div", null, h("div", { className: "ad-label" }, "Current bid"), h("div", { className: "ad-lotcard__num" }, yen(lot.current)), h("div", { className: "ad-small ad-muted" }, "≈ " + lkr(lot.current * JPY_LKR) + " FOB")),
          h("div", { className: cx(urgent && "is-urgent") }, h("div", { className: "ad-label" }, "Closes in"), h("div", { className: "ad-lotcard__num", role: "timer", "aria-live": "off" }, isFinite(left) ? fmtT(left) : "Open"), h("div", { className: "ad-small ad-muted" }, jst ? "Japan time " + jst : "Ask for closing time"))),
        state === "leading"
          ? h("div", { className: "ad-lotcard__lead", role: "status" }, h(Icon, { name: "check", size: 18, stroke: 2.2 }),
            h("div", null, h("strong", null, "You’re leading"), h("span", null, "Proxy max " + yen(max) + " — we only bid what’s needed.")),
            h(Button, { variant: "ghost", size: "s", onClick: function () { setState("idle"); } }, "Edit"))
          : h("div", { className: "ad-lotcard__bid" },
            h("label", { className: "ad-label", htmlFor: "ad-max-" + lot.lot }, "Your maximum (proxy)"),
            h("div", { className: cx("ad-stepper", err && "has-error") },
              h("button", { type: "button", "aria-label": "Lower by 10,000 yen", onClick: function () { setMax(Math.max(lot.current, max - step)); } }, h(Icon, { name: "minus", size: 16 })),
              h("input", { id: "ad-max-" + lot.lot, className: "ad-mono", inputMode: "numeric", value: yen(max), onChange: function (ev) { var x = Number(ev.target.value.replace(/[^0-9]/g, "")); setMax(isNaN(x) ? 0 : x); setErr(""); }, "aria-invalid": err ? true : undefined }),
              h("button", { type: "button", "aria-label": "Raise by 10,000 yen", onClick: function () { setMax(max + step); setErr(""); } }, h(Icon, { name: "plus", size: 16 }))),
            err ? h("p", { className: "ad-field__error" }, h(Icon, { name: "info", size: 14 }), err) : h("p", { className: "ad-small ad-muted" }, "Our team places your bid after a refundable deposit · you pay just over the next bid"),
            h(Button, { variant: "accent", block: true, icon: "gavel", loading: state === "placing", onClick: place, disabled: left <= 0 }, left <= 0 ? "Bidding closed" : state === "placing" ? "Placing bid…" : authed ? "Place proxy bid" : "Sign in to bid"))));
  }

  /* ---------- AuctionSheetDecoder ---------- */
  var DAMAGE = {
    A: ["Scratch", "Surface scratch"], U: ["Dent", "Dent without paint damage"], B: ["Dent + scratch", "Dent with scratch"], W: ["Wave", "Repaired or repainted panel (wavy finish)"],
    S: ["Rust", "Surface rust"], C: ["Corrosion", "Corroded metal"], P: ["Paint", "Paint marked or faded"], X: ["Replace", "Panel needs replacing"],
    XX: ["Replaced", "Panel has been replaced"], Y: ["Crack", "Hole or crack"], G: ["Glass chip", "Stone chip in the windscreen"]
  };
  var SIZES = { "1": "small — about a thumbnail", "2": "medium — about a coin to a palm", "3": "large — bigger than a palm" };
  var GRADES = [
    ["S", "As new — under ~1,000 km, showroom condition."], ["6", "Almost new, very low mileage."], ["5", "Excellent — low mileage, very few marks."],
    ["4.5", "Very good — minor marks only. Our most-requested grade."], ["4", "Good — small scratches or dents, fixable."], ["3.5", "Fair — visible marks, higher mileage or some repair."],
    ["3", "Rough — needs cosmetic work."], ["R", "Repaired accident history (RA = minor repair). We’ll tell you exactly where."]
  ];
  var MARKS = [
    { id: "m1", code: "A1", panel: "Bonnet", x: 120, y: 58 },
    { id: "m2", code: "G", panel: "Windscreen", x: 120, y: 112 },
    { id: "m3", code: "U2", panel: "Right front door", x: 196, y: 186 },
    { id: "m4", code: "W1", panel: "Left rear quarter", x: 44, y: 292 },
    { id: "m5", code: "A2", panel: "Rear bumper", x: 138, y: 366 }
  ];
  function decode(code) { var m = /^(XX|[A-Z])(\d)?$/.exec(code); if (!m) return null; var d = DAMAGE[m[1]]; return { kind: d[0], text: d[1], size: m[2] ? SIZES[m[2]] : null }; }
  function AuctionSheetDecoder(p) {
    var s = useState("m3"), sel = s[0], setSel = s[1];
    var g = useState("4.5"), grade = g[0], setGrade = g[1];
    var q = useState(""), code = q[0], setCode = q[1];
    var mark = MARKS.filter(function (m) { return m.id === sel; })[0];
    var info = mark ? decode(mark.code) : null;
    var typed = code ? decode(code.toUpperCase().trim()) : null;
    return h("div", { className: "ad-decoder" },
      h("div", { className: "ad-decoder__map" },
        h("div", { className: "ad-label" }, "Damage map · tap a code"),
        h("svg", { viewBox: "0 0 240 420", className: "ad-carmap", role: "group", "aria-label": "Top view of the car with damage codes" },
          h("rect", { className: "ad-carmap__body", x: 30, y: 20, width: 180, height: 380, rx: 56 }),
          h("rect", { className: "ad-carmap__glass", x: 52, y: 100, width: 136, height: 40, rx: 14 }),
          h("rect", { className: "ad-carmap__roof", x: 56, y: 146, width: 128, height: 150, rx: 12 }),
          h("rect", { className: "ad-carmap__glass", x: 56, y: 302, width: 128, height: 30, rx: 12 }),
          h("line", { className: "ad-carmap__seam", x1: 30, y1: 222, x2: 56, y2: 222 }), h("line", { className: "ad-carmap__seam", x1: 184, y1: 222, x2: 210, y2: 222 }),
          h("line", { className: "ad-carmap__seam", x1: 40, y1: 90, x2: 200, y2: 90 }), h("line", { className: "ad-carmap__seam", x1: 40, y1: 344, x2: 200, y2: 344 }),
          h("rect", { className: "ad-carmap__wheel", x: 18, y: 70, width: 14, height: 44, rx: 6 }), h("rect", { className: "ad-carmap__wheel", x: 208, y: 70, width: 14, height: 44, rx: 6 }),
          h("rect", { className: "ad-carmap__wheel", x: 18, y: 300, width: 14, height: 44, rx: 6 }), h("rect", { className: "ad-carmap__wheel", x: 208, y: 300, width: 14, height: 44, rx: 6 }),
          h("text", { className: "ad-carmap__front", x: 120, y: 14, textAnchor: "middle" }, "FRONT"),
          MARKS.map(function (m) {
            var on = m.id === sel;
            return h("g", { key: m.id, className: cx("ad-carmap__mark", on && "is-on"), tabIndex: 0, role: "button", "aria-pressed": on, "aria-label": m.code + " on " + m.panel,
              onClick: function () { setSel(m.id); }, onKeyDown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(m.id); } } },
              h("circle", { cx: m.x, cy: m.y, r: 17 }), h("text", { x: m.x, y: m.y + 4.5, textAnchor: "middle" }, m.code));
          }))),
      h("div", { className: "ad-decoder__side" },
        info ? h("div", { className: "ad-decoder__card", "aria-live": "polite" },
          h("div", { className: "ad-decoder__code ad-mono" }, mark.code),
          h("div", null, h("div", { className: "ad-label" }, mark.panel), h("p", { className: "ad-h3" }, info.kind + (info.size ? " · " + info.size.split(" — ")[0] : "")),
            h("p", { className: "ad-muted ad-small" }, info.text + (info.size ? ", " + info.size + "." : ".")))) : null,
        h("div", { className: "ad-decoder__try" },
          h(TextField, { label: "Decode any code", placeholder: "e.g. B2, XX, S1", mono: true, value: code, onChange: function (e) { setCode(e.target.value); }, hint: typed ? typed.kind + (typed.size ? " · " + typed.size : "") + " — " + typed.text : code ? "Not a standard code — ask us, we translate every sheet." : "Letter = damage type, number 1–3 = size." })),
        h("div", null, h("div", { className: "ad-label" }, "Overall grade"),
          h("div", { className: "ad-gradescale", role: "radiogroup", "aria-label": "Overall grade" }, GRADES.map(function (gr) {
            return h("button", { key: gr[0], type: "button", role: "radio", "aria-checked": grade === gr[0], className: cx(grade === gr[0] && "is-on"), onClick: function () { setGrade(gr[0]); } }, gr[0]);
          })),
          h("p", { className: "ad-small", "aria-live": "polite" }, h("b", null, "Grade " + grade + ": "), GRADES.filter(function (gr) { return gr[0] === grade; })[0][1])),
        p.showSheet !== false ? h("a", { href: IMG.sheet, target: "_blank", rel: "noopener", className: "ad-decoder__sheet" }, h("img", { src: IMG.sheet, alt: "" }),
          h("span", null, h("strong", null, "See a real annotated sheet"), h("span", { className: "ad-small ad-muted" }, "27 fields, numbered"))) : null));
  }

  /* ---------- AuctionRequestForm ---------- */
  function AuctionRequestForm(p) {
    var st = useState(0), step = st[0], setStep = st[1];
    var ini = p.initial || {}, me = (HOOKS.me && HOOKS.me()) || {};
    var yNow = new Date().getFullYear();
    var f = useState({ make: ini.make || "", model: ini.model || "", chassis: ini.chassis || "", yFrom: String(yNow - 6), yTo: String(yNow), km: 80000, grade: "4", colours: [], budget: 12000000, name: me.name || "", phone: me.phone || "", ack: false }), d = f[0], setD = f[1];
    var rf = useState(""), refNo = rf[0], setRefNo = rf[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1];
    var e = useState({}), errs = e[0], setErrs = e[1];
    var done = useState(false), sent = done[0], setSent = done[1];
    function set(k, v) { var o = Object.assign({}, d); o[k] = v; setD(o); }
    var steps = ["Vehicle", "Budget & condition", "Confirm"];
    function next() {
      var x = {};
      if (step === 0 && !d.make) x.make = "Choose a make.";
      if (step === 2) { if (d.name.trim().length < 2) x.name = "Tell us your name."; if (!/^(\+94|0)\s?7\d[\s-]?\d{3}[\s-]?\d{4}$/.test(d.phone.trim())) x.phone = "Use a Sri Lankan mobile, e.g. 077 123 4567."; if (!d.ack) x.ack = "Please confirm you understand the deposit."; }
      setErrs(x); if (Object.keys(x).length) return;
      if (step < 2) { setStep(step + 1); return; }
      setBusy(true);
      HOOKS.sendRequest(d).then(function (r) { setRefNo(r.ref || ""); setSent(true); setBusy(false); }, function (err) { setErrs({ form: err.message }); setBusy(false); });
    }
    if (sent) return h("div", { className: "ad-form ad-success", role: "status" },
      h("div", { className: "ad-success__icon is-accent" }, h(Icon, { name: "gavel", size: 26 })),
      h("h3", { className: "ad-h2" }, "Auction request sent"),
      h("p", null, "We’ll shortlist matching lots from this week’s auctions and send each sheet with an English translation before we bid."),
      refNo ? h("p", { className: "ad-mono ad-muted" }, "Reference " + refNo) : null,
      h(Button, { variant: "secondary", onClick: function () { setSent(false); setStep(0); } }, "New request"));
    return h("div", { className: "ad-form ad-areq" },
      h("ol", { className: "ad-stepper-h", "aria-label": "Progress" }, steps.map(function (s, i) {
        return h("li", { key: s, className: cx(i < step && "is-done", i === step && "is-on"), "aria-current": i === step ? "step" : undefined },
          h("span", { className: "ad-stepper-h__dot" }, i < step ? h(Icon, { name: "check", size: 14, stroke: 2.4 }) : i + 1), h("span", null, s));
      })),
      step === 0 ? h("div", { className: "ad-form__grid" },
        h(SelectField, { label: "Make", placeholder: "Choose make", options: Object.keys(ALL_MAKES), value: d.make, onChange: function (ev) { var o = Object.assign({}, d, { make: ev.target.value, model: "" }); setD(o); }, error: errs.make }),
        h(SelectField, { label: "Model", placeholder: d.make ? "Any model" : "Choose a make first", options: d.make ? ALL_MAKES[d.make] || [] : [], disabled: !d.make, value: d.model, onChange: function (ev) { set("model", ev.target.value); } }),
        h(TextField, { label: "Chassis code", optional: true, mono: true, placeholder: "e.g. HNT32", value: d.chassis, onChange: function (ev) { set("chassis", ev.target.value.toUpperCase()); }, hint: "Narrows to one generation" }),
        h("div", { className: "ad-form__pair" },
          h(SelectField, { label: "Year from", options: YEARS, value: d.yFrom, onChange: function (ev) { set("yFrom", ev.target.value); } }),
          h(SelectField, { label: "to", options: YEARS, value: d.yTo, onChange: function (ev) { set("yTo", ev.target.value); } })),
        h("div", { className: "ad-span2" }, h("div", { className: "ad-field__label" }, "Colours you’d accept"),
          h(ChipGroup, { multiple: true, label: "Colours", value: d.colours, onChange: function (v) { set("colours", v); }, options: ["White / pearl", "Black", "Silver", "Grey", "Red", "Blue", "Any"] })))
        : step === 1 ? h("div", { className: "ad-form__grid" },
          h(RangeSlider, { single: true, className: "ad-span2", label: "Maximum budget (landed)", min: 3000000, max: 40000000, step: 250000, value: [3000000, d.budget], onChange: function (v) { set("budget", v[1]); }, format: lkr }),
          h(RangeSlider, { single: true, className: "ad-span2", label: "Maximum mileage", min: 10000, max: 150000, step: 5000, value: [10000, d.km], onChange: function (v) { set("km", v[1]); }, format: function (x) { return num(x) + " km"; } }),
          h("div", { className: "ad-span2" }, h("div", { className: "ad-field__label" }, "Minimum auction grade"),
            h(ChipGroup, { label: "Minimum grade", value: d.grade, onChange: function (v) { set("grade", v); }, options: ["3.5", "4", "4.5", "5", "S"] }),
            h("p", { className: "ad-field__hint" }, d.grade === "3.5" ? "More choice, expect visible marks." : d.grade === "4" ? "The sweet spot for value." : "Fewer lots, near-perfect cars.")))
          : h("div", { className: "ad-form__grid" },
            h("div", { className: "ad-summary ad-span2" },
              h("div", null, h("span", { className: "ad-label" }, "Vehicle"), h("b", null, (d.make || "Any") + " " + (d.model || "") + (d.chassis ? " · " + d.chassis : ""))),
              h("div", null, h("span", { className: "ad-label" }, "Years"), h("b", null, d.yFrom + "–" + d.yTo)),
              h("div", null, h("span", { className: "ad-label" }, "Budget"), h("b", null, "up to " + lkr(d.budget))),
              h("div", null, h("span", { className: "ad-label" }, "Condition"), h("b", null, "Grade " + d.grade + "+ · ≤ " + num(d.km) + " km"))),
            h(TextField, { label: "Full name", value: d.name, onChange: function (ev) { set("name", ev.target.value); }, error: errs.name }),
            h(TextField, { label: "Mobile", type: "tel", placeholder: "077 123 4567", value: d.phone, onChange: function (ev) { set("phone", ev.target.value); }, error: errs.phone }),
            h("div", { className: "ad-span2" }, h(Checkbox, { checked: d.ack, onChange: function (v) { set("ack", v); }, label: "I understand bidding starts after a 100% refundable deposit." }),
              errs.ack ? h("p", { className: "ad-field__error" }, h(Icon, { name: "info", size: 14 }), errs.ack) : null)),
      errs.form ? h("p", { className: "ad-field__error", role: "alert" }, h(Icon, { name: "info", size: 14 }), errs.form) : null,
      h("div", { className: "ad-form__foot" },
        step > 0 ? h(Button, { variant: "ghost", icon: "arrow-left", onClick: function () { setStep(step - 1); } }, "Back") : h("span", { className: "ad-small ad-muted" }, "Takes about a minute"),
        h(Button, { variant: step === 2 ? "accent" : "primary", iconRight: step === 2 ? "send" : "arrow-right", loading: busy, onClick: next }, step === 2 ? "Send request" : "Continue")));
  }

  /* ---------- ProcessSteps ---------- */
  var STEPS = [
    { t: "Select your vehicle", d: "Day 1–3", icon: "search", body: "We learn what you need, then review thousands of lots from reputed auction houses to shortlist the right car at the right price." },
    { t: "Bid at auction", d: "Weekly", icon: "gavel", body: "After a 100% refundable deposit we send the original auction sheet with an English translation, photos and a bid amount for your approval. If the car sells below your bid, you keep the difference." },
    { t: "Pay by LC", d: "Within 7 days", icon: "doc", body: "Open a Letter of Credit within 7 days of the pro-forma invoice. We prepare the bank documents with you." },
    { t: "Shipping", d: "~20 days at sea", icon: "ship", body: "Export certificate and inspections done, the vehicle is loaded. Duty and levies go directly to Sri Lanka Customs via a nominated clearance agent." },
    { t: "Delivery", d: "30–45 days total", icon: "car", body: "Cleared, registered and handed over. Track every stage in My account." }
  ];
  function ProcessSteps(p) {
    var s = useState(0), i = s[0], setI = s[1];
    var f = useState(false), faq = f[0], setFaq = f[1];
    var cur = STEPS[i];
    return h("div", { className: "ad-process" },
      h("ol", { className: "ad-process__rail", role: "tablist", "aria-label": "Buying steps" }, STEPS.map(function (st, k) {
        return h("li", { key: k }, h("button", { type: "button", role: "tab", "aria-selected": k === i, className: cx(k === i && "is-on", k < i && "is-past"), onClick: function () { setI(k); } },
          h("span", { className: "ad-process__n" }, k + 1), h("span", { className: "ad-process__t" }, st.t), h("span", { className: "ad-process__d" }, st.d)));
      })),
      h("div", { className: "ad-process__panel", role: "tabpanel" },
        h("div", { className: "ad-process__icon" }, h(Icon, { name: cur.icon, size: 28, stroke: 1.5 })),
        h("div", null, h("div", { className: "ad-label" }, "Step " + (i + 1) + " of 5 · " + cur.d), h("h3", { className: "ad-h2" }, cur.t), h("p", { className: "ad-bodyl" }, cur.body),
          h("div", { className: "ad-row" },
            i > 0 ? h(Button, { variant: "ghost", size: "s", icon: "arrow-left", onClick: function () { setI(i - 1); } }, "Previous") : null,
            i < 4 ? h(Button, { variant: "secondary", size: "s", iconRight: "arrow-right", onClick: function () { setI(i + 1); } }, "Next: " + STEPS[i + 1].t) : h(Button, { variant: "accent", size: "s", icon: "gavel", onClick: p.onStart }, "Start with a request")))),
      h("div", { className: "ad-faq" }, h("button", { type: "button", "aria-expanded": faq, onClick: function () { setFaq(!faq); } }, h(Icon, { name: "shield", size: 18 }), "Why do we ask for a deposit?", h(Icon, { name: "chevron-down", size: 16, className: "ad-faq__chev" })),
        faq ? h("p", null, "Deposits are 100% refundable. They protect you and us from last-minute cancellations and spam bids — we bid and pay for your car with our own resources, so every request has to be genuine.") : null));
  }

  /* ---------- Glossary ---------- */
  function Glossary(p) {
    var terms = p.terms || GLOSSARY;
    var s = useState(""), q = s[0], setQ = s[1];
    var c = useState("All"), cat = c[0], setCat = c[1];
    var o = useState("Proxy bidding"), open = o[0], setOpen = o[1];
    var cats = ["All"].concat(terms.map(function (t) { return t.cat; }).filter(function (x, i, a) { return a.indexOf(x) === i; }));
    var ql = q.trim().toLowerCase();
    var list = terms.filter(function (t) { return (cat === "All" || t.cat === cat) && (!ql || (t.term + " " + t.def).toLowerCase().indexOf(ql) >= 0); });
    function mark(txt) {
      if (!ql) return txt; var i = txt.toLowerCase().indexOf(ql); if (i < 0) return txt;
      return [txt.slice(0, i), h("mark", { key: "m" }, txt.slice(i, i + ql.length)), txt.slice(i + ql.length)];
    }
    return h("div", { className: "ad-gloss" },
      h("div", { className: "ad-gloss__bar" },
        h(TextField, { icon: "search", placeholder: "Search 13 import terms — try “LC”", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search terms" }),
        h(ChipGroup, { label: "Category", value: cat, onChange: setCat, options: cats.map(function (x) { return { value: x, label: x, count: x === "All" ? terms.length : terms.filter(function (t) { return t.cat === x; }).length }; }) })),
      list.length ? h("dl", { className: "ad-gloss__list" }, list.map(function (t) {
        var on = open === t.term;
        return h("div", { key: t.term, className: cx("ad-gloss__item", on && "is-open") },
          h("dt", null, h("button", { type: "button", "aria-expanded": on, onClick: function () { setOpen(on ? null : t.term); } },
            h("span", null, mark(t.term)), h("span", { className: "ad-gloss__cat" }, t.cat), h(Icon, { name: "chevron-down", size: 16 }))),
          on ? h("dd", null, h("p", null, mark(t.def)), t.example ? h("p", { className: "ad-gloss__ex" }, h("span", { className: "ad-label" }, "Example"), t.example) : null) : null);
      })) : h(Empty, { title: "No term matches “" + q + "”", text: "Ask us on WhatsApp — we’ll explain and add it here." }));
  }

  /* ---------- Testimonials ---------- */
  function Testimonials(p) {
    var items = p.items || [];
    var s = useState(0), i = s[0], setI = s[1];
    if (!items.length) return null;
    var q = items[i];
    return h("figure", { className: "ad-quote" },
      h("div", { className: "ad-quote__stars", role: "img", "aria-label": q.r + " out of 5" }, [1, 2, 3, 4, 5].map(function (k) { return h(Icon, { key: k, name: "star", size: 16, className: k <= q.r ? "is-on" : "" }); })),
      h("blockquote", { className: "ad-quote__q", "aria-live": "polite" }, "“" + q.q + "”"),
      h("figcaption", null, h("span", { className: "ad-avatar" }, q.n.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)), h("span", null, h("b", null, q.n), h("span", { className: "ad-muted" }, q.w))),
      h("div", { className: "ad-quote__nav" },
        h("button", { type: "button", "aria-label": "Previous review", onClick: function () { setI((i - 1 + items.length) % items.length); } }, h(Icon, { name: "arrow-left", size: 16 })),
        h("span", { className: "ad-mono ad-small" }, (i + 1) + " / " + items.length),
        h("button", { type: "button", "aria-label": "Next review", onClick: function () { setI((i + 1) % items.length); } }, h(Icon, { name: "arrow-right", size: 16 }))));
  }

  /* ---------- AuthCard ---------- */
  function strength(pw) { var s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return s; }
  function AuthCard(p) {
    var m = useState(p.mode || "login"), mode = m[0], setMode = m[1];
    var f = useState({ name: "", email: "", phone: "", pw: "", remember: true, terms: false }), d = f[0], setD = f[1];
    var sp = useState(false), show = sp[0], setShow = sp[1];
    var e = useState({}), errs = e[0], setErrs = e[1];
    var s = useState("idle"), state = s[0], setState = s[1];
    var dnm = useState(""), doneName = dnm[0], setDoneName = dnm[1];
    function set(k) { return function (ev) { var o = Object.assign({}, d); o[k] = ev && ev.target ? ev.target.value : ev; setD(o); }; }
    function submit(ev) {
      ev.preventDefault(); var x = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) x.email = "Enter a valid email address.";
      if (mode !== "forgot" && d.pw.length < (mode === "register" ? 8 : 1)) x.pw = mode === "register" ? "Use at least 8 characters." : "Enter your password.";
      if (mode === "register") { if (d.name.trim().length < 2) x.name = "Tell us your name."; if (!d.terms) x.terms = "Please accept the terms."; }
      setErrs(x); if (Object.keys(x).length) return;
      setState("busy");
      HOOKS.auth(mode, d).then(function (name) { setDoneName(name || ""); setState("done"); }, function (err) { setErrs({ form: err.message }); setState("idle"); });
    }
    var sc = strength(d.pw), words = ["Too short", "Weak", "Fair", "Good", "Strong"];
    if (state === "done") return h("div", { className: "ad-auth ad-success", role: "status" },
      h("div", { className: "ad-success__icon" }, h(Icon, { name: mode === "forgot" ? "mail" : "check", size: 26, stroke: 2 })),
      h("h3", { className: "ad-h2" }, mode === "login" ? "Welcome back" : mode === "register" ? "Account created" : "Check your inbox"),
      h("p", { className: "ad-muted" }, mode === "forgot" ? "A reset link is on its way to " + d.email + "." : "Your inquiries and auction requests are in My account."),
      h(Button, { variant: "secondary", onClick: function () { if (mode !== "forgot" && p.onDone) { p.onDone(doneName || d.name || d.email.split("@")[0]); return; } setState("idle"); setMode("login"); } }, mode === "forgot" ? "Back to sign in" : "Go to dashboard"));
    return h("form", { className: "ad-auth", onSubmit: submit, noValidate: true },
      h(Logo, { size: 20 }),
      mode === "forgot" ? h("div", null, h("h2", { className: "ad-h2" }, "Reset password"), h("p", { className: "ad-muted ad-small" }, "We don’t store your password. We’ll email a secure link to set a new one."))
        : h(Tabs, { block: true, label: "Account", tabs: [{ id: "login", label: "Sign in" }, { id: "register", label: "Create account" }], value: mode, onChange: function (x) { setMode(x); setErrs({}); } }),
      mode === "register" ? h(TextField, { label: "Full name", autoComplete: "name", value: d.name, onChange: set("name"), error: errs.name }) : null,
      h(TextField, { label: "Email", type: "email", autoComplete: "email", value: d.email, onChange: set("email"), error: errs.email }),
      mode === "register" ? h(TextField, { label: "Mobile", type: "tel", optional: true, placeholder: "077 123 4567", value: d.phone, onChange: set("phone"), hint: "For WhatsApp auction alerts" }) : null,
      mode !== "forgot" ? h(TextField, { label: "Password", type: show ? "text" : "password", autoComplete: mode === "login" ? "current-password" : "new-password", value: d.pw, onChange: set("pw"), error: errs.pw,
        trailing: h("button", { type: "button", className: "ad-input-wrap__btn", "aria-label": show ? "Hide password" : "Show password", onClick: function () { setShow(!show); } }, h(Icon, { name: show ? "eye-off" : "eye", size: 16 })) }) : null,
      mode === "register" && d.pw ? h("div", { className: "ad-pwmeter", "data-s": sc }, h("div", null, [1, 2, 3, 4].map(function (k) { return h("span", { key: k, className: k <= sc ? "is-on" : "" }); })), h("span", { className: "ad-small" }, words[sc])) : null,
      mode === "login" ? h("div", { className: "ad-row ad-row--between" }, h(Checkbox, { checked: d.remember, onChange: function (v) { var o = Object.assign({}, d, { remember: v }); setD(o); }, label: "Remember me" }),
        h("button", { type: "button", className: "ad-link", onClick: function () { setMode("forgot"); setErrs({}); } }, "Forgot password?")) : null,
      mode === "register" ? h("div", null, h(Checkbox, { checked: d.terms, onChange: function (v) { var o = Object.assign({}, d, { terms: v }); setD(o); }, label: "I agree to the terms and privacy policy" }),
        errs.terms ? h("p", { className: "ad-field__error" }, h(Icon, { name: "info", size: 14 }), errs.terms) : null) : null,
      errs.form ? h("p", { className: "ad-field__error", role: "alert" }, h(Icon, { name: "info", size: 14 }), errs.form) : null,
      h(Button, { type: "submit", block: true, size: "l", loading: state === "busy" }, mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"),
      mode === "forgot" ? h("button", { type: "button", className: "ad-link ad-center", onClick: function () { setMode("login"); } }, "← Back to sign in")
        : h("p", { className: "ad-small ad-muted ad-center" }, "Sign in to request auction data and track your import."));
  }

  /* ---------- OrderTracker ---------- */
  var STAGES = ["Requested", "Bidding", "Won", "LC opened", "Shipped", "Arrived", "Delivered"];
  function OrderTracker(p) {
    var inq = p.inquiry;
    var stage = Math.min(STAGES.length - 1, Math.max(0, inq.stage || 0));
    return h("div", { className: "ad-track" },
      h("div", { className: "ad-track__head" },
        h("div", null, h("div", { className: "ad-label" }, inq.kind + " · " + inq.ref), h("h3", { className: "ad-h3" }, inq.vehicle)),
        inq.eta && stage < 6 ? h("div", { className: "ad-track__eta" }, h("span", { className: "ad-label" }, "ETA Colombo"), h("b", null, new Date(inq.eta).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }))) : h(StatusBadge, { status: STAGES[stage] })),
      h("ol", { className: "ad-track__rail", style: { "--p": stage / (STAGES.length - 1) } }, STAGES.map(function (s, i) {
        return h("li", { key: s, className: cx(i < stage && "is-done", i === stage && "is-on"), "aria-current": i === stage ? "step" : undefined },
          h("span", { className: "ad-track__dot" }, i < stage ? h(Icon, { name: "check", size: 12, stroke: 2.6 }) : null), h("span", { className: "ad-track__l" }, s));
      })),
      inq.note ? h("p", { className: "ad-track__note" }, h(Icon, { name: STAGES[stage] === "Shipped" ? "ship" : "info", size: 16 }), inq.note) : null);
  }

  /* ---------- AccountDashboard ---------- */
  function fmtDay(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""; }
  function isAuctionKind(k) { return /^Auction/.test(k || ""); }
  function AccountDashboard(p) {
    var s = useState(p.tab || "overview"), tab = s[0], setTab = s[1];
    var ex = useState(null), open = ex[0], setOpen = ex[1];
    var u = p.user || {}, orders = p.orders || [], savedVehicles = p.savedVehicles || [];
    var pf = useState({ name: u.name || "", phone: u.phone || "", city: u.city || "" }), prof = pf[0], setProf = pf[1];
    var sv = useState("idle"), saveState = sv[0], setSaveState = sv[1];
    var er = useState(""), saveErr = er[0], setSaveErr = er[1];
    useEffect(function () { if (p.tab) setTab(p.tab); }, [p.tab]);
    var stockOrders = orders.filter(function (o) { return !isAuctionKind(o.kind); });
    var auctionOrders = orders.filter(function (o) { return isAuctionKind(o.kind); });
    var active = orders.filter(function (o) { return o.stage > 0 && o.stage < 6; });
    var initials = (u.name || u.email || "?").split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 2);
    var nav = [["overview", "home", "Overview"], ["inquiries", "doc", "My inquiries", stockOrders.length], ["auction", "gavel", "Auction requests", auctionOrders.length], ["saved", "heart", "Saved vehicles", savedVehicles.length], ["profile", "settings", "Profile settings"]];
    function list(items, emptyTitle, emptyText) {
      if (!items.length) return h(Empty, { icon: "doc", title: emptyTitle, text: emptyText });
      return h("div", { className: "ad-inqlist" }, items.map(function (q) {
        var on = open === q.ref;
        return h("div", { key: q.ref, className: cx("ad-inq", on && "is-open") },
          h("button", { type: "button", className: "ad-inq__row", "aria-expanded": on, onClick: function () { setOpen(on ? null : q.ref); } },
            h("span", { className: "ad-mono ad-small" }, q.ref), h("span", { className: "ad-inq__v" }, h("b", null, q.vehicle || q.kind), h("span", { className: "ad-muted ad-small" }, q.kind + " · " + fmtDay(q.date))),
            h(StatusBadge, { status: STAGES[q.stage] || "Requested" }), h(Icon, { name: "chevron-down", size: 16, className: "ad-inq__chev" })),
          on ? h("div", { className: "ad-inq__body" }, h(OrderTracker, { inquiry: q })) : null);
      }));
    }
    var body;
    if (tab === "overview") body = h(Frag, null,
      h("div", { className: "ad-dash__hello" }, h("h2", { className: "ad-h1" }, "Hi " + ((u.name || "there").split(" ")[0])),
        h("p", { className: "ad-muted" }, active.length ? "You have " + active.length + " import" + (active.length === 1 ? "" : "s") + " in progress." : "Your inquiries and imports will appear here.")),
      h("div", { className: "ad-kpis" },
        [["Active imports", active.length, "ship"], ["Open inquiries", orders.filter(function (o) { return o.stage === 0; }).length, "doc"], ["Auction requests", auctionOrders.length, "gavel"], ["Saved vehicles", savedVehicles.length, "heart"]].map(function (k) {
          return h("div", { key: k[0], className: "ad-kpi" }, h(Icon, { name: k[2], size: 18 }), h("span", { className: "ad-label" }, k[0]), h("b", null, k[1]));
        })),
      active[0] ? h(OrderTracker, { inquiry: active[0] }) : h(Empty, { icon: "car", title: "Nothing in progress yet", text: "Browse our stock or ask us to find a car at this week’s auctions." },
        h("div", { className: "ad-row" }, h(Button, { variant: "secondary", onClick: function () { p.onGo && p.onGo("stock"); } }, "Browse stock"), h(Button, { variant: "accent", icon: "gavel", onClick: function () { p.onGo && p.onGo("request"); } }, "Request a bid"))));
    else if (tab === "inquiries") body = h(Frag, null, h("h2", { className: "ad-h2" }, "My inquiries"),
      list(stockOrders, "No inquiries yet", "Use “Request a quote” on any vehicle and it will be tracked here."));
    else if (tab === "auction") body = h(Frag, null, h("h2", { className: "ad-h2" }, "Auction requests"),
      auctionOrders.length ? list(auctionOrders, "", "") : null,
      h("h3", { className: "ad-h3" }, "New request"), h(AuctionRequestForm, { key: auctionOrders.length }));
    else if (tab === "saved") body = h(Frag, null, h("h2", { className: "ad-h2" }, "Saved vehicles"),
      savedVehicles.length ? h("div", { className: "ad-stock__grid" }, savedVehicles.map(function (v) { return h(VehicleCard, { key: v.id, vehicle: v, saved: true, onSave: function () { p.onToggleSave && p.onToggleSave(v.id); }, onOpen: p.onOpenVehicle }); }))
        : h(Empty, { icon: "heart", title: "No saved vehicles", text: "Tap the heart on a car to keep it here." }));
    else body = h("form", { className: "ad-form", onSubmit: function (e) {
        e.preventDefault(); setSaveState("saving"); setSaveErr("");
        p.onSaveProfile(prof).then(function () { setSaveState("done"); }, function (err) { setSaveErr(err.message); setSaveState("idle"); });
      } },
      h("h2", { className: "ad-h2" }, "Profile settings"),
      h("div", { className: "ad-form__grid" },
        h(TextField, { label: "Full name", value: prof.name, onChange: function (e) { setProf(Object.assign({}, prof, { name: e.target.value })); setSaveState("idle"); } }),
        h(TextField, { label: "Email", value: u.email || "", disabled: true, hint: "Your sign-in email can’t be changed here." }),
        h(TextField, { label: "Mobile", type: "tel", value: prof.phone, onChange: function (e) { setProf(Object.assign({}, prof, { phone: e.target.value })); setSaveState("idle"); } }),
        h(TextField, { label: "City", value: prof.city, onChange: function (e) { setProf(Object.assign({}, prof, { city: e.target.value })); setSaveState("idle"); } })),
      saveErr ? h("p", { className: "ad-field__error", role: "alert" }, h(Icon, { name: "info", size: 14 }), saveErr) : null,
      h("div", { className: "ad-form__foot" }, saveState === "done" ? h("span", { className: "ad-okline", role: "status" }, h(Icon, { name: "check", size: 16 }), "Saved") : h("span"),
        h(Button, { type: "submit", loading: saveState === "saving" }, "Save changes")));
    return h("div", { className: "ad-dash" },
      h("aside", { className: "ad-dash__nav" },
        h("div", { className: "ad-dash__me" }, h("span", { className: "ad-avatar ad-avatar--l" }, initials), h("div", null, h("b", null, u.name || u.email), h("span", { className: "ad-muted ad-small" }, u.email))),
        h("nav", { "aria-label": "Account" }, nav.map(function (n) {
          return h("button", { key: n[0], type: "button", className: cx("ad-dash__link", tab === n[0] && "is-on"), "aria-current": tab === n[0] ? "page" : undefined, onClick: function () { setTab(n[0]); } },
            h(Icon, { name: n[1], size: 17 }), h("span", null, n[2]), n[3] ? h("span", { className: "ad-dash__n" }, n[3]) : null);
        }), h("button", { type: "button", className: "ad-dash__link", onClick: p.onSignOut }, h(Icon, { name: "logout", size: 17 }), h("span", null, "Sign out")))),
      h("div", { className: "ad-dash__main" }, body));
  }

  /* ---------- ContactPanel ---------- */
  function ContactPanel(p) {
    var t = useState(p.topic || "general"), topic = t[0], setTopic = t[1];
    var s = useState(false), sent = s[0], setSent = s[1];
    var e = useState({}), errs = e[0], setErrs = e[1];
    var me = (HOOKS.me && HOOKS.me()) || {};
    var f = useState({ name: me.name || "", phone: me.phone || "", msg: "", make: "", model: "", year: "", km: "", ask: "", location: "Malabe showroom" }), d = f[0], setD = f[1];
    var bz = useState(false), busy = bz[0], setBusy = bz[1];
    function set(k) { return function (ev) { var o = Object.assign({}, d); o[k] = ev.target.value; setD(o); }; }
    function submit(ev) {
      ev.preventDefault(); var x = {};
      if (d.name.trim().length < 2) x.name = "Tell us your name.";
      if (!/^(\+94|0)\s?7\d[\s-]?\d{3}[\s-]?\d{4}$/.test(d.phone.trim())) x.phone = "Use a Sri Lankan mobile, e.g. 077 123 4567.";
      if (topic === "sell" && !d.make) x.make = "Which make is it?";
      setErrs(x); if (Object.keys(x).length) return;
      setBusy(true);
      HOOKS.sendContact(topic, d).then(function () { setSent(true); setBusy(false); }, function (err) { setErrs({ form: err.message }); setBusy(false); });
    }
    return h("div", { className: "ad-contact" },
      h("div", { className: "ad-contact__info" },
        h("h2", { className: "ad-h1" }, "Talk to a real person"),
        h("p", { className: "ad-muted" }, "Two locations, one team. Most messages answered within two working hours."),
        h("ul", null,
          [["pin", "Malabe showroom", "Visit and inspect stock"], ["pin", "Colombo 07 office", "LC & documentation desk"], ["phone", SITE.phone, SITE.hours, "tel:" + SITE.phone.replace(/[^+0-9]/g, "")], ["whatsapp", "WhatsApp", "Auction alerts & quick questions", "https://wa.me/" + SITE.whatsapp], ["mail", SITE.email, "Quotes and paperwork", "mailto:" + SITE.email]].map(function (r) {
            return h("li", { key: r[1] }, h("span", { className: "ad-contact__ic" }, h(Icon, { name: r[0], size: 18 })), h("span", null, r[3] ? h("a", { href: r[3], className: "ad-link" }, r[1]) : h("b", null, r[1]), h("span", { className: "ad-muted ad-small" }, r[2])));
          }))),
      sent ? h("div", { className: "ad-form ad-success", role: "status" }, h("div", { className: "ad-success__icon" }, h(Icon, { name: "check", size: 26, stroke: 2.2 })),
        h("h3", { className: "ad-h2" }, topic === "sell" ? "Valuation request received" : "Message sent"), h("p", { className: "ad-muted" }, "We’ll call " + d.phone + " soon."),
        h(Button, { variant: "secondary", onClick: function () { setSent(false); } }, "Send another"))
        : h("form", { className: "ad-form", onSubmit: submit, noValidate: true },
          h(Tabs, { block: true, label: "Topic", tabs: [{ id: "general", label: "General" }, { id: "sell", label: "Sell your car" }, { id: "visit", label: "Visit" }], value: topic, onChange: function (x) { setTopic(x); setErrs({}); } }),
          h("div", { className: "ad-form__grid" },
            h(TextField, { label: "Name", value: d.name, onChange: set("name"), error: errs.name }),
            h(TextField, { label: "Mobile", type: "tel", placeholder: "077 123 4567", value: d.phone, onChange: set("phone"), error: errs.phone }),
            topic === "sell" ? h(Frag, null,
              h(SelectField, { label: "Make", placeholder: "Choose", options: Object.keys(ALL_MAKES), value: d.make, onChange: set("make"), error: errs.make }),
              h(TextField, { label: "Model", value: d.model, onChange: set("model") }),
              h(SelectField, { label: "Year", placeholder: "Choose", options: YEARS, value: d.year, onChange: set("year") }),
              h(TextField, { label: "Mileage", inputMode: "numeric", placeholder: "e.g. 42,000", value: d.km, onChange: set("km"), trailing: h("span", { className: "ad-input-wrap__suffix" }, "km") }),
              h(TextField, { label: "Asking price", prefix: "LKR", className: "ad-span2", optional: true, value: d.ask, onChange: set("ask") })) : null,
            topic === "visit" ? h(SelectField, { label: "Location", className: "ad-span2", options: ["Malabe showroom", "Colombo 07 office"], value: d.location, onChange: set("location") }) : null,
            h(TextField, { label: "Message", multiline: true, rows: 3, className: "ad-span2", optional: topic !== "general", value: d.msg, onChange: set("msg") })),
          errs.form ? h("p", { className: "ad-field__error", role: "alert" }, h(Icon, { name: "info", size: 14 }), errs.form) : null,
          h("div", { className: "ad-form__foot" }, h("span"), h(Button, { type: "submit", iconRight: "send", loading: busy }, topic === "sell" ? "Get a valuation" : "Send message"))));
  }

  /* ---------- BrowseSection: browse by brand / body type / inventory location ---------- */
  function typeIcon(n) {
    n = String(n).toLowerCase();
    if (/bus/.test(n)) return "bus"; if (/heavy/.test(n)) return "wrench"; if (/truck|pick/.test(n)) return "truck"; if (/van/.test(n)) return "van";
    return "car";
  }
  function BrowseTile(p) {
    var inner = [h("span", { key: "i", className: "ad-browse__ic" }, p.icon),
      h("span", { key: "t", className: "ad-browse__tx" }, h("span", { className: "ad-browse__nm" }, p.name), h("span", { className: "ad-browse__n ad-mono" }, "(" + num(p.count) + ")"))];
    return p.count > 0
      ? h("a", { href: p.href, className: "ad-browse__tile", onClick: function (e) { e.preventDefault(); p.onClick(); } }, inner)
      : h("span", { className: "ad-browse__tile is-empty", "aria-disabled": true }, inner);
  }
  function BrowseGroup(p) {
    var more = useState(false), showAll = more[0], setMore = more[1];
    var live = p.items.filter(function (i) { return i.count > 0; }), none = p.items.filter(function (i) { return !(i.count > 0); });
    var shown = p.collapse && live.length ? (showAll ? p.items : live) : p.items;
    return h("div", { className: "ad-browse__group" },
      h("h3", { className: "ad-h3" }, p.title),
      h("div", { className: "ad-browse__grid ad-browse__grid--" + p.kind }, shown.map(p.render)),
      p.collapse && live.length && none.length ? h("button", { type: "button", className: "ad-link ad-small", "aria-expanded": showAll, onClick: function () { setMore(!showAll); } },
        showAll ? "Show fewer" : "Show " + none.length + " more with no stock right now") : null);
  }
  function BrowseSection(p) {
    function href(q) { return HREF("stock") + "?" + q; }
    return h("div", { className: "ad-browse" },
      BRANDS.length ? h(BrowseGroup, { title: "Browse by car brand", kind: "brands", collapse: true, items: BRANDS.slice().sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); }), render: function (b) {
        return h(BrowseTile, { key: b.id, name: b.name, count: b.count, href: href("make=" + encodeURIComponent(b.name)), onClick: function () { p.onBrowse({ make: b.name }); },
          icon: b.image ? h("img", { src: b.image, alt: "", loading: "lazy", onError: function (e) { e.target.style.display = "none"; } }) : h("span", { className: "ad-browse__ini", "aria-hidden": true }, b.name.charAt(0)) });
      } }) : null,
      ALL_TYPES.length ? h(BrowseGroup, { title: "Browse by body type", kind: "types", collapse: true, items: ALL_TYPES.slice().sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); }), render: function (t) {
        return h(BrowseTile, { key: t.id, name: t.name, count: t.count, href: href("type=" + encodeURIComponent(t.name)), onClick: function () { p.onBrowse({ type: t.name }); },
          icon: t.image ? h("img", { src: t.image, alt: "", loading: "lazy" }) : h(Icon, { name: typeIcon(t.name), size: 26, stroke: 1.5 }) });
      } }) : null,
      LOCATIONS.length ? h(BrowseGroup, { title: "Browse by inventory location", kind: "locations", items: LOCATIONS, render: function (l) {
        return h(BrowseTile, { key: l.name, name: l.name, count: l.count, href: href("location=" + encodeURIComponent(l.name)), onClick: function () { p.onBrowse({ location: l.name }); },
          icon: h("img", { className: "ad-browse__flag", src: "https://flagcdn.com/w40/" + l.code + ".png", alt: "", loading: "lazy", width: 28, height: 20, onError: function (e) { e.target.style.display = "none"; } }) });
      } }) : null);
  }

  var AD = {
    Logo: Logo, Icon: Icon, Button: Button, Badge: Badge, StatusBadge: StatusBadge, GradeSeal: GradeSeal, LotTag: LotTag,
    TextField: TextField, SelectField: SelectField, RangeSlider: RangeSlider, ChipGroup: ChipGroup, Switch: Switch, Checkbox: Checkbox, Tabs: Tabs,
    SiteHeader: SiteHeader, SiteFooter: SiteFooter, HeroSearch: HeroSearch, VehicleCard: VehicleCard, StockBrowser: StockBrowser,
    CompareTray: CompareTray, CompareTable: CompareTable, VehicleGallery: VehicleGallery, SpecSheet: SpecSheet, LoanCalculator: LoanCalculator,
    InquiryForm: InquiryForm, AuctionLotCard: AuctionLotCard, AuctionSheetDecoder: AuctionSheetDecoder, AuctionRequestForm: AuctionRequestForm,
    ProcessSteps: ProcessSteps, Glossary: Glossary, Testimonials: Testimonials, AuthCard: AuthCard, OrderTracker: OrderTracker,
    AccountDashboard: AccountDashboard, ContactPanel: ContactPanel, BrowseSection: BrowseSection, Empty: Empty, PhotoPending: PhotoPending, Spec: Spec,
    data: { vehicles: VEHICLES, lots: LOTS, brands: BRANDS, types: ALL_TYPES, locations: LOCATIONS, features: FEATURES, makes: ALL_MAKES, stockMakes: MAKES, glossary: GLOSSARY, images: IMG, load: loadData },
    hooks: HOOKS, site: SITE,
    format: { lkr: lkr, lkrFull: lkrFull, yen: yen, num: num, title: title, emi: emi, cx: cx, priceBounds: priceBounds }
  };
  window.AD = Object.assign(window.AD || {}, AD);
})();

