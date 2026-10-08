/* AutoDirect admin console - loaded on demand when someone opens /admin.
   Built from the same components as the storefront (window.AD) and wired to /api/admin/*. */
(function () {
  "use strict";
  var R = window.React, h = R.createElement, useState = R.useState, useEffect = R.useEffect, useRef = R.useRef, Frag = R.Fragment;
  var A = window.AD, api = A.api, fmt = A.format, cx = fmt.cx;
  var STAGES = ["Requested", "Bidding", "Won", "LC opened", "Shipped", "Arrived", "Delivered"];
  var STOCK_STATUS = ["Available", "Reserved", "In transit", "Sold"];
  var FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
  var GEARS = ["Automatic", "Manual", "CVT"];
  var DRIVES = ["2WD", "4WD", "AWD"];

  /* ------------------------------------------------------------ helpers */
  function day(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"; }
  function dayTime(d) { return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"; }
  function toLocalInput(d) { if (!d) return ""; var x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); }
  function isoDate(d) { return d ? new Date(d).toISOString().slice(0, 10) : ""; }
  function opts(list, labelKey) { return list.map(function (o) { return typeof o === "object" ? { value: String(o.id), label: o[labelKey || "name"] } : { value: String(o), label: String(o) }; }); }
  function nameOf(list, id) { var x = list.filter(function (o) { return o.id === id; })[0]; return x ? x.name : ""; }
  function vtitle(v, L) { return [v.year, nameOf(L.manufacturers, v.vehicle_manufacturer), nameOf(L.models, v.vehicle_model), v.trim].filter(Boolean).join(" ") || "Vehicle #" + v.id; }
  function csv(rows, name) {
    var body = rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" })); a.download = name; a.click();
  }
  function upload(files, folder) {
    var fd = new FormData(); Array.prototype.forEach.call(files, function (f) { fd.append("images", f); });
    return api.token().then(function (t) { return fetch("/api/admin/upload?folder=" + folder, { method: "POST", headers: { Authorization: "Bearer " + t }, body: fd }); })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || "Upload failed"); return d.urls; }); });
  }
  function useLoad(url, deps) {
    var s = useState({ data: null, error: "" }), st = s[0], set = s[1];
    var n = useState(0), tick = n[0], setTick = n[1];
    useEffect(function () {
      var alive = true; set({ data: null, error: "" });
      api.get(url).then(function (d) { if (alive) set({ data: d, error: "" }); }, function (e) { if (alive) set({ data: null, error: e.message }); });
      return function () { alive = false; };
    }, (deps || []).concat([url, tick]));
    return { data: st.data, error: st.error, reload: function () { setTick(tick + 1); }, set: function (d) { set({ data: d, error: "" }); } };
  }
  function Modal(p) {
    useEffect(function () { function k(e) { if (e.key === "Escape") p.onClose(); } document.addEventListener("keydown", k); return function () { document.removeEventListener("keydown", k); }; }, []);
    return h("div", { className: "ad-modal", role: "dialog", "aria-modal": true, "aria-label": p.title, onMouseDown: function (e) { if (e.target === e.currentTarget) p.onClose(); } },
      h("div", { className: cx("ad-modal__box", p.wide && "ad-modal__box--wide") }, h("div", { className: "ad-row ad-row--between" }, h("h3", { className: "ad-h2" }, p.title),
        h("button", { type: "button", className: "ad-nav__icon", "aria-label": "Close", onClick: p.onClose }, h(A.Icon, { name: "x" }))), p.children));
  }
  function Confirm(p) {
    return h(Modal, { title: p.title, onClose: p.onCancel }, h("p", { className: "ad-muted" }, p.text),
      h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: p.onCancel, autoFocus: true }, "Cancel"), h(A.Button, { variant: "danger", icon: "trash", loading: p.busy, onClick: p.onOk }, p.okLabel || "Delete")));
  }
  function Table(p) {
    return h("div", { className: "ad-dt" }, h("table", null,
      h("thead", null, h("tr", null, p.cols.map(function (c, i) { return h("th", { key: i, scope: "col", className: c.center ? "ad-center" : "" }, c.label); }))),
      h("tbody", null, p.rows)), p.empty);
  }
  function Err(p) { return p.text ? h("p", { className: "ad-field__error", role: "alert" }, h(A.Icon, { name: "info", size: 14 }), p.text) : null; }
  function Thumb(p) { return p.src ? h("img", { src: p.src, alt: "", className: p.logo ? "ad-dt__logo" : "" }) : h("span", { className: "ad-dt__ph" }, h(A.Icon, { name: p.icon || "image", size: 16 })); }

  /* ------------------------------------------------------------ image uploader (single or many) */
  function ImageField(p) {
    var ref = useRef(null), bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    var images = p.images || [];
    function pick(e) {
      var files = e.target.files; if (!files.length) return;
      setBusy(true); setErr("");
      upload(files, p.folder).then(function (urls) { p.onChange(p.multiple ? images.concat(urls) : urls.slice(0, 1)); setBusy(false); }, function (x) { setErr(x.message); setBusy(false); });
      e.target.value = "";
    }
    function move(i, to) { if (to < 0 || to >= images.length) return; var a = images.slice(); a.splice(to, 0, a.splice(i, 1)[0]); p.onChange(a); }
    return h("div", { className: "ad-imgs" },
      h("div", { className: "ad-imgs__head" }, h("input", { ref: ref, type: "file", accept: "image/*", multiple: !!p.multiple, hidden: true, onChange: pick }),
        h(A.Button, { variant: "secondary", size: "s", icon: "plus", loading: busy, onClick: function () { ref.current.click(); } }, p.multiple ? "Upload photos" : images.length ? "Replace image" : "Upload image"),
        p.multiple ? h("span", { className: "ad-small ad-muted" }, "First photo is the cover shown in listings.") : null),
      h(Err, { text: err }),
      images.length ? h("div", { className: "ad-imgs__grid" }, images.map(function (u, i) {
        return h("div", { key: u + i, className: cx("ad-imgs__tile", i === 0 && p.multiple && "is-cover") }, h("img", { src: u, alt: "" }),
          i === 0 && p.multiple ? h("span", { className: "ad-imgs__cover" }, "Cover") : null,
          h("div", { className: "ad-imgs__acts" },
            p.multiple ? h("button", { type: "button", "aria-label": "Make cover", title: "Make cover", onClick: function () { move(i, 0); } }, h(A.Icon, { name: "star", size: 14 })) : null,
            p.multiple ? h("button", { type: "button", "aria-label": "Move left", onClick: function () { move(i, i - 1); } }, h(A.Icon, { name: "chevron-left", size: 14 })) : null,
            p.multiple ? h("button", { type: "button", "aria-label": "Move right", onClick: function () { move(i, i + 1); } }, h(A.Icon, { name: "chevron-right", size: 14 })) : null,
            h("button", { type: "button", "aria-label": "Remove image", onClick: function () { p.onChange(images.filter(function (_, k) { return k !== i; })); } }, h(A.Icon, { name: "trash", size: 14 }))));
      })) : null);
  }

  /* ------------------------------------------------------------ vehicles */
  function VehicleForm(p) {
    var v = p.vehicle, L = p.L, isNew = !v.id;
    var s = useState(function () { return Object.assign({}, v, { price: v.price == null ? "" : String(Math.round(v.price)), images: (v.images || []).slice(), feature_ids: (v.feature_ids || []).map(Number) }); }), f = s[0], setF = s[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    function set(k) { return function (e) { var o = Object.assign({}, f); o[k] = e && e.target ? e.target.value : e; setF(o); }; }
    var models = L.models.filter(function (m) { return String(m.manufacturer_id) === String(f.vehicle_manufacturer) && (m.status === 1 || m.id === f.vehicle_model); });
    function save(e) {
      e.preventDefault(); setErr("");
      if (!f.vehicle_manufacturer || !f.vehicle_type) { setErr("Choose a brand and a body type."); return; }
      setBusy(true);
      var body = Object.assign({}, f); delete body.id; delete body.created_at; delete body.updated_at; delete body.seo_url;
      delete body.manufacturer_name; delete body.model_name; delete body.type_name;
      (isNew ? api.post("/api/admin/vehicles", body) : api.put("/api/admin/vehicles/" + v.id, body))
        .then(function () { p.onSaved(isNew ? "Vehicle created" : "Changes saved"); }, function (x) { setErr(x.message); setBusy(false); });
    }
    var sel = function (k, label, list, ph, extra) { return h(A.SelectField, Object.assign({ label: label, placeholder: ph, options: list, value: f[k] == null ? "" : String(f[k]), onChange: set(k) }, extra || {})); };
    var txt = function (k, label, extra) { return h(A.TextField, Object.assign({ label: label, value: f[k] == null ? "" : f[k], onChange: set(k) }, extra || {})); };
    return h("form", { className: "ad-form", onSubmit: save },
      h("div", { className: "ad-row ad-row--between" }, h("h2", { className: "ad-h2" }, isNew ? "Add vehicle" : "Edit " + vtitle(v, L)), h(A.Button, { variant: "ghost", icon: "arrow-left", onClick: p.onCancel }, "Back to list")),
      h("div", { className: "ad-label" }, "Basics"),
      h("div", { className: "ad-form__grid ad-form__grid--3" },
        sel("vehicle_manufacturer", "Brand", opts(L.manufacturers.filter(function (m) { return m.status === 1 || m.id === f.vehicle_manufacturer; })), "Select brand", { onChange: function (e) { setF(Object.assign({}, f, { vehicle_manufacturer: e.target.value, vehicle_model: "" })); } }),
        sel("vehicle_model", "Model", opts(models), f.vehicle_manufacturer ? "Select model" : "Choose a brand first", { disabled: !f.vehicle_manufacturer }),
        sel("vehicle_type", "Body type", opts(L.types.filter(function (m) { return m.status === 1 || m.id === f.vehicle_type; })), "Select type"),
        txt("trim", "Trim / grade name", { placeholder: "e.g. Hybrid WxB" }), txt("year", "Year", { maxLength: 4, inputMode: "numeric" }),
        sel("location", "Inventory location", opts(L.locations.map(function (l) { return l.name; })), "Not set"),
        txt("price", "Price (LKR)", { type: "number", min: 0, step: 1000, hint: "Leave blank to show “Price on request”." }),
        sel("stock_status", "Sales status", opts(STOCK_STATUS)), sel("main_color", "Colour", opts(L.colors.filter(function (m) { return m.status === 1 || m.id === f.main_color; })), "Select colour"),
        txt("chassi_id", "Chassis no.", { mono: true })),
      h("div", { className: "ad-label" }, "Specifications"),
      h("div", { className: "ad-form__grid ad-form__grid--3" },
        txt("mileage", "Mileage (km)", { inputMode: "numeric" }), txt("engine_capacity", "Engine (cc)", { inputMode: "numeric" }),
        sel("fuel_type", "Fuel", opts(FUELS), "-"), sel("transmission", "Transmission", opts(GEARS), "-"), sel("drive_type", "Drive", opts(DRIVES), "-"),
        txt("auction_grade", "Auction grade", { placeholder: "4.5" }), txt("grade", "Interior grade", { placeholder: "A–E" }),
        txt("seats", "Seats", { type: "number", min: 0 }), txt("doors", "Doors", { type: "number", min: 0 }), txt("other_color", "Other colour notes"),
        h("div", { className: "ad-span3" }, txt("conditions", "Condition", { maxLength: 500 })),
        h("div", { className: "ad-span3" }, txt("description", "Description", { multiline: true, rows: 3, maxLength: 500, hint: "Shown on the vehicle page." }))),
      h("div", { className: "ad-label" }, "Photos"),
      h(ImageField, { multiple: true, folder: "vehicles", images: f.images, onChange: function (a) { setF(Object.assign({}, f, { images: a })); } }),
      h("div", { className: "ad-label" }, "Features"),
      h(A.ChipGroup, { multiple: true, label: "Features", value: f.feature_ids.map(String), onChange: function (a) { setF(Object.assign({}, f, { feature_ids: a.map(Number) })); },
        options: L.features.filter(function (x) { return x.status === 1 || f.feature_ids.indexOf(x.id) >= 0; }).map(function (x) { return { value: String(x.id), label: x.name }; }) }),
      h("div", { className: "ad-label" }, "Visibility"),
      h("div", { className: "ad-row", style: { gap: 24 } },
        h(A.Switch, { label: "Published on the website", checked: String(f.status) !== "0", onChange: function (on) { setF(Object.assign({}, f, { status: on ? 1 : 0 })); } }),
        h(A.Switch, { label: "Featured on the home page", checked: !!f.is_featured, onChange: function (on) { setF(Object.assign({}, f, { is_featured: on })); } }),
        h(A.Switch, { label: "New arrival badge", checked: !!f.is_latest, onChange: function (on) { setF(Object.assign({}, f, { is_latest: on })); } })),
      h(Err, { text: err }),
      h("div", { className: "ad-form__foot" }, h("span", { className: "ad-small ad-muted" }, isNew ? "You can add photos now or later." : "Changes go live on the website as soon as you save."),
        h("div", { className: "ad-row" }, h(A.Button, { variant: "ghost", onClick: p.onCancel }, "Cancel"), h(A.Button, { type: "submit", loading: busy, icon: "check" }, isNew ? "Create vehicle" : "Save changes"))));
  }

  function Vehicles(p) {
    var L = p.L;
    var d = useLoad("/api/admin/vehicles"), stats = useLoad("/api/admin/stats", [d.data && d.data.length]);
    var s1 = useState("All"), tab = s1[0], setTab = s1[1], s2 = useState(""), q = s2[0], setQ = s2[1];
    var s3 = useState(null), editing = s3[0], setEditing = s3[1], s4 = useState([]), picked = s4[0], setPicked = s4[1];
    var s5 = useState(null), confirm = s5[0], setConfirm = s5[1], s6 = useState(false), busy = s6[0], setBusy = s6[1];
    if (editing) return h(VehicleForm, { vehicle: editing, L: L, onCancel: function () { setEditing(null); }, onSaved: function (m) { setEditing(null); d.reload(); p.say(m); p.changed(); } });
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading vehicles…");
    var rows = d.data, st = stats.data || {};
    var list = rows.filter(function (v) {
      return (tab === "All" || v.stock_status === tab) && (!q || (vtitle(v, L) + " " + v.chassi_id + " " + v.location + " AD-" + String(v.id).padStart(4, "0")).toLowerCase().indexOf(q.toLowerCase()) >= 0);
    });
    function patch(v, body, msg) {
      return api.put("/api/admin/vehicles/" + v.id, body).then(function (r) { d.set(rows.map(function (x) { return x.id === v.id ? Object.assign({}, x, r) : x; })); if (msg) p.say(msg); p.changed(); }, function (e) { p.say(e.message, "danger"); });
    }
    function doDelete() {
      var ids = confirm === "bulk" ? picked : [confirm]; setBusy(true);
      Promise.all(ids.map(function (id) { return api.del("/api/admin/vehicles/" + id); })).then(function () { setBusy(false); setConfirm(null); setPicked([]); d.reload(); p.say(ids.length + " vehicle" + (ids.length === 1 ? "" : "s") + " deleted"); p.changed(); }, function (e) { setBusy(false); p.say(e.message, "danger"); });
    }
    var allOn = list.length && list.every(function (v) { return picked.indexOf(v.id) >= 0; });
    function blank() { return { status: 1, stock_status: "Available", is_latest: true, is_featured: false, location: "Japan", images: [], feature_ids: [] }; }
    return h(Frag, null,
      h("div", { className: "ad-kpis" }, [["In stock", st.in_stock, "car"], ["In transit", st.in_transit, "ship"], ["New inquiries", st.new_inquiries, "doc"], ["Subscribers", st.subscribers, "mail"]].map(function (k) {
        return h("div", { key: k[0], className: "ad-kpi" }, h(A.Icon, { name: k[2], size: 18 }), h("span", { className: "ad-label" }, k[0]), h("b", null, k[1] == null ? "-" : k[1]));
      })),
      h("div", { className: "ad-dt__bar" },
        h(A.Tabs, { variant: "line", label: "Status", tabs: ["All"].concat(STOCK_STATUS).map(function (x) { return { id: x, label: x, count: x === "All" ? rows.length : rows.filter(function (v) { return v.stock_status === x; }).length }; }), value: tab, onChange: setTab }),
        h("div", { className: "ad-row" }, h(A.TextField, { icon: "search", placeholder: "Search model, chassis, location", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search vehicles" }),
          h(A.Button, { icon: "plus", onClick: function () { setEditing(blank()); } }, "Add vehicle"))),
      picked.length ? h("div", { className: "ad-dt__bulk", role: "status" }, h("b", null, picked.length + " selected"),
        h(A.Button, { size: "s", variant: "secondary", icon: "star", onClick: function () { Promise.all(picked.map(function (id) { return api.put("/api/admin/vehicles/" + id, { is_featured: true }); })).then(function () { d.reload(); setPicked([]); p.say("Featured"); p.changed(); }); } }, "Feature"),
        h(A.Button, { size: "s", variant: "danger", icon: "trash", onClick: function () { setConfirm("bulk"); } }, "Delete"),
        h("button", { type: "button", className: "ad-link", onClick: function () { setPicked([]); } }, "Clear")) : null,
      h(Table, { cols: [{ label: "" }, { label: "Vehicle" }, { label: "Price" }, { label: "Grade" }, { label: "Location" }, { label: "Sales status" }, { label: "Featured" }, { label: "" }],
        empty: list.length ? null : h(A.Empty, { title: "No vehicles", text: rows.length ? "Nothing matches your search." : "Add your first vehicle to get started." }),
        rows: list.map(function (v) {
          var on = picked.indexOf(v.id) >= 0;
          return h("tr", { key: v.id, className: on ? "is-picked" : "" },
            h("td", { className: "ad-dt__cb" }, h(A.Checkbox, { ariaLabel: "Select vehicle " + v.id, checked: on, onChange: function (x) { setPicked(x ? picked.concat([v.id]) : picked.filter(function (y) { return y !== v.id; })); } })),
            h("td", null, h("div", { className: "ad-dt__veh" }, h(Thumb, { src: (v.images || [])[0] }),
              h("span", null, h("b", null, vtitle(v, L)), h("span", { className: "ad-mono ad-muted ad-small" }, "AD-" + String(v.id).padStart(4, "0") + (v.chassi_id ? " · " + v.chassi_id : "")),
                v.status === 0 ? h("span", { className: "ad-small", style: { color: "var(--warning)" } }, "Hidden from website") : null))),
            h("td", { className: "ad-num" }, v.price ? fmt.lkr(Number(v.price)) : "On request"), h("td", null, v.auction_grade ? v.auction_grade + " / " + (v.grade || "-") : "-"), h("td", null, v.location || "-"),
            h("td", null, h(A.SelectField, { "aria-label": "Sales status of " + v.id, options: STOCK_STATUS, value: v.stock_status, className: "ad-select--s", onChange: function (e) { patch(v, { stock_status: e.target.value }, "Status updated"); } })),
            h("td", null, h(A.Switch, { label: "Feature " + v.id + " on home page", hideLabel: true, checked: !!v.is_featured, onChange: function (x) { patch(v, { is_featured: x }); } })),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "ghost", size: "s", icon: "edit", "aria-label": "Edit " + vtitle(v, L), onClick: function () { setEditing(v); } }),
              h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete " + vtitle(v, L), onClick: function () { setConfirm(v.id); } })));
        }) }),
      confirm ? h(Confirm, { title: confirm === "bulk" ? "Delete " + picked.length + " vehicles?" : "Delete this vehicle?", text: "This removes the listing and its photos. Inquiries about it stay in the log.", busy: busy, onCancel: function () { setConfirm(null); }, onOk: doDelete }) : null);
  }

  /* ------------------------------------------------------------ catalogue lists (brands, models, types, colours, features) */
  var TAX = {
    manufacturers: { kind: "manufacturers", one: "brand", image: "brands", imageLabel: "Logo", featured: true },
    models: { kind: "models", one: "model", parent: true },
    types: { kind: "types", one: "body type", image: "types", imageLabel: "Icon (optional)" },
    colours: { kind: "colors", one: "colour", color: true },
    features: { kind: "features", one: "feature" }
  };
  function Taxonomy(p) {
    var cfg = TAX[p.mod], L = p.L;
    var d = useLoad("/api/admin/taxonomy/" + cfg.kind);
    var s1 = useState(""), q = s1[0], setQ = s1[1], s2 = useState(null), edit = s2[0], setEdit = s2[1], s3 = useState(null), del = s3[0], setDel = s3[1];
    var s4 = useState(""), parent = s4[0], setParent = s4[1];
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    var rows = d.data.filter(function (r) { return (!q || r.name.toLowerCase().indexOf(q.toLowerCase()) >= 0) && (!parent || String(r.manufacturer_id) === parent); });
    function patch(r, body) { api.put("/api/admin/taxonomy/" + cfg.kind + "/" + r.id, body).then(function (x) { d.set(d.data.map(function (y) { return y.id === r.id ? Object.assign({}, y, x) : y; })); p.reloadL(); p.changed(); }, function (e) { p.say(e.message, "danger"); }); }
    var cols = [{ label: cfg.image || cfg.color ? "" : "" }, { label: "Name" }];
    if (cfg.parent) cols.push({ label: "Brand" });
    if (cfg.featured) cols.push({ label: "In footer" });
    if (cfg.kind !== "features") cols.push({ label: "Vehicles" });
    cols.push({ label: "Active" }, { label: "" });
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" }, h("p", { className: "ad-muted" }, rows.length + " record" + (rows.length === 1 ? "" : "s")),
        h("div", { className: "ad-row" }, h(A.TextField, { icon: "search", placeholder: "Search", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search" }),
          cfg.parent ? h(A.SelectField, { "aria-label": "Filter by brand", placeholder: "All brands", options: opts(L.manufacturers), value: parent, onChange: function (e) { setParent(e.target.value); } }) : null,
          h(A.Button, { icon: "plus", onClick: function () { setEdit({ status: 1 }); } }, "Add " + cfg.one))),
      h(Table, { cols: cols, empty: rows.length ? null : h(A.Empty, { title: "Nothing here yet", text: "Add the first " + cfg.one + "." }),
        rows: rows.map(function (r) {
          return h("tr", { key: r.id },
            h("td", { className: "ad-dt__cb" }, cfg.image ? h(Thumb, { src: r.image, logo: true, icon: "tag" }) : cfg.color ? h("span", { className: "ad-swatch", style: { background: r.code || "#fff" } }) : null),
            h("td", null, h("b", null, r.name)), cfg.parent ? h("td", null, nameOf(L.manufacturers, r.manufacturer_id)) : null,
            cfg.featured ? h("td", null, h(A.Switch, { label: "Show " + r.name + " in footer", hideLabel: true, checked: !!r.is_featured, onChange: function (x) { patch(r, { is_featured: x }); } })) : null,
            cfg.kind !== "features" ? h("td", { className: "ad-num" }, r.vehicle_count || 0) : null,
            h("td", null, h(A.Switch, { label: "Active " + r.name, hideLabel: true, checked: r.status === 1, onChange: function (x) { patch(r, { status: x ? 1 : 0 }); } })),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "ghost", size: "s", icon: "edit", "aria-label": "Edit " + r.name, onClick: function () { setEdit(r); } }),
              h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete " + r.name, onClick: function () { setDel(r); } })));
        }) }),
      edit ? h(TaxModal, { cfg: cfg, row: edit, L: L, onClose: function () { setEdit(null); }, onSaved: function () { setEdit(null); d.reload(); p.reloadL(); p.say("Saved"); p.changed(); } }) : null,
      del ? h(Confirm, { title: "Delete “" + del.name + "”?", text: (del.vehicle_count ? del.vehicle_count + " vehicle(s) use it and will lose this value (the vehicles are kept). " : "") + (cfg.kind === "manufacturers" ? "Its models are deleted too." : ""),
        onCancel: function () { setDel(null); }, onOk: function () { api.del("/api/admin/taxonomy/" + cfg.kind + "/" + del.id).then(function () { setDel(null); d.reload(); p.reloadL(); p.say("Deleted"); p.changed(); }, function (e) { setDel(null); p.say(e.message, "danger"); }); } }) : null);
  }
  function TaxModal(p) {
    var cfg = p.cfg, r = p.row, isNew = !r.id;
    var s = useState({ name: r.name || "", image: r.image || "", code: /^#[0-9a-f]{6}$/i.test(r.code || "") ? r.code : "#ffffff", manufacturer_id: r.manufacturer_id ? String(r.manufacturer_id) : "", is_featured: !!r.is_featured, status: r.status == null ? 1 : r.status }), f = s[0], setF = s[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    function save(e) {
      e.preventDefault(); setErr(""); if (!f.name.trim()) { setErr("Name is required."); return; }
      if (cfg.parent && !f.manufacturer_id) { setErr("Choose a brand."); return; }
      var body = { name: f.name.trim(), status: f.status };
      if (cfg.image) body.image = f.image; if (cfg.color) body.code = f.code; if (cfg.featured) body.is_featured = f.is_featured; if (cfg.parent) body.manufacturer_id = Number(f.manufacturer_id);
      setBusy(true);
      (isNew ? api.post("/api/admin/taxonomy/" + cfg.kind, body) : api.put("/api/admin/taxonomy/" + cfg.kind + "/" + r.id, body)).then(p.onSaved, function (x) { setErr(x.message); setBusy(false); });
    }
    return h(Modal, { title: (isNew ? "Add " : "Edit ") + cfg.one, onClose: p.onClose },
      h("form", { className: "ad-modal__form", onSubmit: save },
        cfg.parent ? h(A.SelectField, { label: "Brand", placeholder: "Select brand", options: opts(p.L.manufacturers), value: f.manufacturer_id, onChange: function (e) { setF(Object.assign({}, f, { manufacturer_id: e.target.value })); } }) : null,
        h(A.TextField, { label: "Name", value: f.name, onChange: function (e) { setF(Object.assign({}, f, { name: e.target.value })); }, autoFocus: true }),
        cfg.color ? h(A.TextField, { label: "Swatch colour", type: "color", value: f.code, onChange: function (e) { setF(Object.assign({}, f, { code: e.target.value })); } }) : null,
        cfg.image ? h("div", null, h("div", { className: "ad-field__label" }, cfg.imageLabel), h(ImageField, { folder: cfg.image, images: f.image ? [f.image] : [], onChange: function (a) { setF(Object.assign({}, f, { image: a[0] || "" })); } })) : null,
        cfg.featured ? h(A.Switch, { label: "Show in the website footer", checked: f.is_featured, onChange: function (x) { setF(Object.assign({}, f, { is_featured: x })); } }) : null,
        h(A.Switch, { label: "Active (visible on the website)", checked: f.status === 1, onChange: function (x) { setF(Object.assign({}, f, { status: x ? 1 : 0 })); } }),
        h(Err, { text: err }),
        h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: p.onClose }, "Cancel"), h(A.Button, { type: "submit", loading: busy }, "Save"))));
  }

  /* ------------------------------------------------------------ auction lots */
  function Lots(p) {
    var d = useLoad("/api/admin/lots");
    var s1 = useState(null), edit = s1[0], setEdit = s1[1], s2 = useState(null), del = s2[0], setDel = s2[1];
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    function patch(r, body) { api.put("/api/admin/lots/" + r.id, body).then(function (x) { d.set(d.data.map(function (y) { return y.id === r.id ? x : y; })); p.changed(); }, function (e) { p.say(e.message, "danger"); }); }
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" }, h("p", { className: "ad-muted" }, "Lots shown on the home page and Live auction page until they close. Customers place proxy bids on them."),
        h(A.Button, { icon: "plus", onClick: function () { setEdit({ status: 1 }); } }, "Add lot")),
      h(Table, { cols: [{ label: "" }, { label: "Lot" }, { label: "Auction" }, { label: "Closes" }, { label: "Current bid" }, { label: "Visible" }, { label: "" }],
        empty: d.data.length ? null : h(A.Empty, { icon: "gavel", title: "No auction lots", text: "Add a lot you’re watching this week and it appears on the site with a live countdown." }),
        rows: d.data.map(function (r) {
          var ended = r.ends_at && new Date(r.ends_at) < new Date();
          return h("tr", { key: r.id },
            h("td", { className: "ad-dt__cb" }, h(Thumb, { src: r.image })),
            h("td", null, h("b", null, [r.year, r.make, r.model, r.trim].filter(Boolean).join(" ")), h("span", { className: "ad-mono ad-muted ad-small", style: { display: "block" } }, "Lot " + r.lot_no + (r.chassis ? " · " + r.chassis : ""))),
            h("td", null, [r.house, r.auction_date].filter(Boolean).join(" · ") || "-"),
            h("td", null, r.ends_at ? dayTime(r.ends_at) : "No end time", ended ? h("span", { style: { marginLeft: 8 } }, h(A.Badge, { tone: "danger" }, "Closed")) : null),
            h("td", { className: "ad-num" }, r.current_price || r.start_price ? fmt.yen(r.current_price || r.start_price) : "-"),
            h("td", null, h(A.Switch, { label: "Show lot " + r.lot_no, hideLabel: true, checked: r.status === 1, onChange: function (x) { patch(r, { status: x ? 1 : 0 }); } })),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "ghost", size: "s", icon: "edit", "aria-label": "Edit lot " + r.lot_no, onClick: function () { setEdit(r); } }),
              h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete lot " + r.lot_no, onClick: function () { setDel(r); } })));
        }) }),
      edit ? h(LotModal, { row: edit, onClose: function () { setEdit(null); }, onSaved: function () { setEdit(null); d.reload(); p.say("Lot saved"); p.changed(); } }) : null,
      del ? h(Confirm, { title: "Delete lot " + del.lot_no + "?", text: "Bids already placed on it stay in Auction requests.", onCancel: function () { setDel(null); }, onOk: function () { api.del("/api/admin/lots/" + del.id).then(function () { setDel(null); d.reload(); p.say("Deleted"); p.changed(); }); } }) : null);
  }
  function LotModal(p) {
    var r = p.row, isNew = !r.id;
    var s = useState({ lot_no: r.lot_no || "", house: r.house || "", auction_date: r.auction_date || "", ends_at: toLocalInput(r.ends_at), make: r.make || "", model: r.model || "", trim: r.trim || "", year: r.year || "",
      chassis: r.chassis || "", mileage: r.mileage || "", auction_grade: r.auction_grade || "", interior: r.interior || "", start_price: r.start_price || "", current_price: r.current_price || "", image: r.image || "", status: r.status == null ? 1 : r.status }), f = s[0], setF = s[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    function t(k, label, extra) { return h(A.TextField, Object.assign({ label: label, value: f[k], onChange: function (e) { var o = Object.assign({}, f); o[k] = e.target.value; setF(o); } }, extra || {})); }
    function save(e) {
      e.preventDefault(); setErr(""); if (!f.lot_no.trim() || !f.make.trim() || !f.model.trim()) { setErr("Lot number, make and model are required."); return; }
      var body = Object.assign({}, f, { ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null }); setBusy(true);
      (isNew ? api.post("/api/admin/lots", body) : api.put("/api/admin/lots/" + r.id, body)).then(p.onSaved, function (x) { setErr(x.message); setBusy(false); });
    }
    return h(Modal, { title: isNew ? "Add auction lot" : "Edit lot " + r.lot_no, wide: true, onClose: p.onClose },
      h("form", { className: "ad-modal__form", onSubmit: save },
        h("div", { className: "ad-form__grid" }, t("lot_no", "Lot number", { mono: true }), t("house", "Auction house", { placeholder: "USS Tokyo" }), t("auction_date", "Auction day (shown)", { placeholder: "Sat 26 Sep" }),
          t("ends_at", "Closes at", { type: "datetime-local", hint: "Your local time. Drives the countdown." }),
          t("make", "Make"), t("model", "Model"), t("trim", "Grade / trim"), t("year", "Year", { type: "number" }), t("chassis", "Chassis", { mono: true }), t("mileage", "Mileage (km)", { type: "number" }),
          t("auction_grade", "Auction grade"), t("interior", "Interior grade"), t("start_price", "Start price (¥)", { type: "number" }), t("current_price", "Current bid (¥)", { type: "number", hint: "Update as bidding moves." })),
        h("div", null, h("div", { className: "ad-field__label" }, "Photo"), h(ImageField, { folder: "lots", images: f.image ? [f.image] : [], onChange: function (a) { setF(Object.assign({}, f, { image: a[0] || "" })); } })),
        h(A.Switch, { label: "Visible on the website", checked: f.status === 1, onChange: function (x) { setF(Object.assign({}, f, { status: x ? 1 : 0 })); } }),
        h(Err, { text: err }),
        h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: p.onClose }, "Cancel"), h(A.Button, { type: "submit", loading: busy }, "Save lot"))));
  }

  /* ------------------------------------------------------------ inquiries + auction requests (shared) */
  function Tracking(p) {
    var live = p.mod === "requests", url = live ? "/api/admin/live-inquiries" : "/api/admin/inquiries", base = url;
    var d = useLoad(url);
    var s1 = useState("All"), tab = s1[0], setTab = s1[1], s2 = useState(""), q = s2[0], setQ = s2[1], s3 = useState(null), open = s3[0], setOpen = s3[1], s4 = useState(null), del = s4[0], setDel = s4[1];
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    var ref = function (r) { return live ? "AR-" + (3000 + r.id) : "INQ-" + (24000 + r.id); };
    var what = function (r) { return live ? [r.year && r.kind === "Auction bid" ? r.year : "", r.make, r.model].filter(Boolean).join(" ") : ([r.manufacturer_name, r.model_name].filter(Boolean).join(" ") || r.kind); };
    var rows = d.data.filter(function (r) {
      return (tab === "All" || (tab === "New" ? r.status === 0 : r.status === 1)) && (!q || (ref(r) + " " + r.name + " " + r.email + " " + r.phone + " " + what(r) + " " + r.message).toLowerCase().indexOf(q.toLowerCase()) >= 0);
    });
    function exportCsv() { csv([["Ref", "Date", "Kind", "Name", "Email", "Phone", "Request", "Stage", "Message"]].concat(d.data.map(function (r) { return [ref(r), day(r.created_at), r.kind, r.name, r.email, r.phone, what(r), STAGES[r.stage], r.message]; })), (live ? "auction-requests" : "inquiries") + ".csv"); }
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" },
        h(A.Tabs, { variant: "line", label: "Filter", tabs: [{ id: "All", label: "All", count: d.data.length }, { id: "New", label: "New", count: d.data.filter(function (r) { return r.status === 0; }).length }, { id: "Handled", label: "Handled", count: d.data.filter(function (r) { return r.status === 1; }).length }], value: tab, onChange: setTab }),
        h("div", { className: "ad-row" }, h(A.TextField, { icon: "search", placeholder: "Search name, phone, vehicle", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search" }),
          h(A.Button, { variant: "secondary", icon: "doc", onClick: exportCsv }, "Export CSV"))),
      h(Table, { cols: [{ label: "Ref" }, { label: "Customer" }, { label: live ? "Request" : "Vehicle / topic" }, { label: "Date" }, { label: "Stage" }, { label: "" }],
        empty: rows.length ? null : h(A.Empty, { icon: "doc", title: "Nothing here", text: "New " + (live ? "auction requests and bids" : "inquiries") + " appear here." }),
        rows: rows.map(function (r) {
          return h("tr", { key: r.id, style: r.status === 0 ? { fontWeight: 600 } : null },
            h("td", { className: "ad-mono" }, ref(r)),
            h("td", null, r.name, h("span", { className: "ad-muted ad-small", style: { display: "block", fontWeight: 400 } }, [r.phone, r.email].filter(Boolean).join(" · "))),
            h("td", null, what(r), h("span", { className: "ad-muted ad-small", style: { display: "block", fontWeight: 400 } }, r.kind)), h("td", null, day(r.created_at)),
            h("td", null, h(A.StatusBadge, { status: STAGES[r.stage] || "Requested" })),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "secondary", size: "s", icon: "eye", onClick: function () { setOpen(r); } }, "Open"),
              h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete " + ref(r), onClick: function () { setDel(r); } })));
        }) }),
      open ? h(TrackModal, { row: open, refNo: ref(open), live: live, what: what(open), url: base, onClose: function () { setOpen(null); }, onSaved: function () { setOpen(null); d.reload(); p.say("Updated"); p.refreshStats(); } }) : null,
      del ? h(Confirm, { title: "Delete " + ref(del) + "?", text: "This removes it from the customer’s account as well.", onCancel: function () { setDel(null); }, onOk: function () { api.del(base + "/" + del.id).then(function () { setDel(null); d.reload(); p.say("Deleted"); p.refreshStats(); }); } }) : null);
  }
  function TrackModal(p) {
    var r = p.row, det = r.details || {};
    var s = useState({ stage: String(r.stage || 0), note: r.note || "", eta: isoDate(r.eta), handled: r.status === 1 }), f = s[0], setF = s[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    function save(e) {
      e.preventDefault(); setBusy(true);
      api.put(p.url + "/" + r.id, { stage: Number(f.stage), note: f.note, eta: f.eta || null, status: f.handled ? 1 : 0 }).then(p.onSaved, function (x) { setErr(x.message); setBusy(false); });
    }
    var facts = [["Name", r.name], ["Phone", r.phone], ["Email", r.email], ["Received", dayTime(r.created_at)]];
    if (p.live) {
      if (det.yearFrom) facts.push(["Years", det.yearFrom + "–" + det.yearTo]); if (det.chassis) facts.push(["Chassis code", det.chassis]);
      if (det.budget) facts.push(["Budget", fmt.lkr(det.budget)]); if (det.maxKm) facts.push(["Max mileage", fmt.num(det.maxKm) + " km"]);
      if (r.grade) facts.push(["Min grade", r.grade]); if (r.color) facts.push(["Colours", r.color]);
      if (det.max) facts.push(["Proxy maximum", fmt.yen(det.max)]); if (det.lotNo) facts.push(["Lot", det.lotNo + (det.house ? " · " + det.house : "")]);
    }
    return h(Modal, { title: p.refNo + " · " + p.what, wide: true, onClose: p.onClose },
      h("dl", { className: "ad-facts" }, facts.filter(function (x) { return x[1]; }).map(function (x) { return h("div", { key: x[0] }, h("dt", { className: "ad-label" }, x[0]), h("dd", null, x[0] === "Email" ? h("a", { className: "ad-link", href: "mailto:" + x[1] }, x[1]) : x[0] === "Phone" ? h("a", { className: "ad-link", href: "tel:" + x[1] }, x[1]) : x[1])); })),
      r.message ? h("p", { className: "ad-quote-box" }, r.message) : null,
      h("form", { className: "ad-modal__form", onSubmit: save },
        h("div", { className: "ad-label" }, "Order tracking (visible to the customer in My account)"),
        h("div", { className: "ad-form__grid" },
          h(A.SelectField, { label: "Stage", options: STAGES.map(function (x, i) { return { value: String(i), label: x }; }), value: f.stage, onChange: function (e) { setF(Object.assign({}, f, { stage: e.target.value })); } }),
          h(A.TextField, { label: "ETA Colombo", type: "date", optional: true, value: f.eta, onChange: function (e) { setF(Object.assign({}, f, { eta: e.target.value })); } }),
          h(A.TextField, { className: "ad-span2", label: "Note for the customer", multiline: true, rows: 2, optional: true, value: f.note, maxLength: 500, onChange: function (e) { setF(Object.assign({}, f, { note: e.target.value })); }, hint: "e.g. “Vessel MOL Serenity departed Nagoya 18 Sep.”" })),
        h(A.Checkbox, { label: "Mark as handled", checked: f.handled, onChange: function (x) { setF(Object.assign({}, f, { handled: x })); } }),
        h(Err, { text: err }),
        h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: p.onClose }, "Close"), h(A.Button, { type: "submit", loading: busy }, "Save"))));
  }

  /* ------------------------------------------------------------ customers, newsletters */
  function Customers(p) {
    var d = useLoad("/api/admin/customers"), s1 = useState(""), q = s1[0], setQ = s1[1];
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    var rows = d.data.filter(function (r) { return !q || (r.name + " " + r.email + " " + r.phone).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    function setAdmin(r, on) { api.put("/api/admin/customers/" + r.uid, { is_admin: on }).then(function () { d.set(d.data.map(function (x) { return x.uid === r.uid ? Object.assign({}, x, { is_admin: on }) : x; })); p.say(on ? r.email + " is now an admin" : "Admin access removed"); }, function (e) { p.say(e.message, "danger"); }); }
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" }, h("p", { className: "ad-muted" }, rows.length + " account" + (rows.length === 1 ? "" : "s") + " · accounts are created when people register on the site"),
        h("div", { className: "ad-row" }, h(A.TextField, { icon: "search", placeholder: "Search name, email, phone", value: q, onChange: function (e) { setQ(e.target.value); }, "aria-label": "Search customers" }),
          h(A.Button, { variant: "secondary", icon: "doc", onClick: function () { csv([["Name", "Email", "Phone", "City", "Requests", "Joined"]].concat(d.data.map(function (r) { return [r.name, r.email, r.phone, r.address, r.requests, day(r.created_at)]; })), "customers.csv"); } }, "Export CSV"))),
      h(Table, { cols: [{ label: "Customer" }, { label: "Phone" }, { label: "Requests" }, { label: "Joined" }, { label: "Admin" }], empty: rows.length ? null : h(A.Empty, { icon: "users", title: "No customers yet" }),
        rows: rows.map(function (r) {
          return h("tr", { key: r.uid }, h("td", null, h("b", null, r.name || "-"), h("span", { className: "ad-muted ad-small", style: { display: "block" } }, r.email)), h("td", null, r.phone || "-"), h("td", { className: "ad-num" }, r.requests), h("td", null, day(r.created_at)),
            h("td", null, h(A.Switch, { label: "Admin access for " + r.email, hideLabel: true, checked: !!r.is_admin, onChange: function (x) { setAdmin(r, x); } })));
        }) }));
  }
  function Newsletters(p) {
    var d = useLoad("/api/admin/newsletters");
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" }, h("p", { className: "ad-muted" }, d.data.length + " subscriber" + (d.data.length === 1 ? "" : "s")),
        h(A.Button, { variant: "secondary", icon: "doc", onClick: function () { csv([["Email", "Name", "Joined"]].concat(d.data.map(function (r) { return [r.email, r.name, day(r.created_at)]; })), "subscribers.csv"); } }, "Export CSV")),
      h(Table, { cols: [{ label: "Subscriber" }, { label: "Name" }, { label: "Joined" }, { label: "" }], empty: d.data.length ? null : h(A.Empty, { icon: "mail", title: "No subscribers yet" }),
        rows: d.data.map(function (r) {
          return h("tr", { key: r.id }, h("td", null, h("b", null, r.email)), h("td", null, r.name || "-"), h("td", null, day(r.created_at)),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Remove " + r.email, onClick: function () { api.del("/api/admin/newsletters/" + r.id).then(function () { d.reload(); p.say("Removed"); }); } })));
        }) }));
  }

  /* ------------------------------------------------------------ console shell */
  var NAV = [
    ["Inventory", [["vehicles", "car", "Vehicles"], ["manufacturers", "tag", "Brands"], ["models", "layers", "Models"], ["types", "grid", "Body types"], ["colours", "palette", "Colours"], ["features", "check", "Features"]]],
    ["Auction", [["lots", "gavel", "Auction floor"]]],
    ["People", [["inquiries", "doc", "Inquiries"], ["requests", "send", "Auction requests"], ["customers", "users", "Customers"], ["newsletters", "mail", "Newsletter"]]]
  ];
  function Console(p) {
    var s = useState("vehicles"), mod = s[0], setMod = s[1];
    var n = useState(null), note = n[0], setNote = n[1];
    var l = useLoad("/api/admin/stats");
    var lk = useState(null), L = lk[0], setL = lk[1], ver = useState(0), lv = ver[0], setLv = ver[1];
    useEffect(function () {
      Promise.all(["types", "manufacturers", "models", "colors", "features"].map(function (k) { return api.get("/api/admin/taxonomy/" + k); }).concat([api.get("/api/locations")]))
        .then(function (r) { setL({ types: r[0], manufacturers: r[1], models: r[2], colors: r[3], features: r[4], locations: r[5] }); }, function (e) { setNote({ text: e.message, tone: "danger" }); });
    }, [lv]);
    useEffect(function () { if (!note) return; var t = setTimeout(function () { setNote(null); }, note.tone === "danger" ? 7000 : 2600); return function () { clearTimeout(t); }; }, [note]);
    function say(text, tone) { setNote({ text: text, tone: tone || "ok" }); }
    var label = NAV.reduce(function (a, g) { return a.concat(g[1]); }, []).filter(function (x) { return x[0] === mod; })[0];
    var group = NAV.filter(function (g) { return g[1].some(function (x) { return x[0] === mod; }); })[0][0];
    var common = { say: say, changed: p.onDataChanged || function () {}, L: L, reloadL: function () { setLv(lv + 1); }, refreshStats: l.reload };
    var body = !L ? h("p", { className: "ad-muted" }, "Loading…") :
      mod === "vehicles" ? h(Vehicles, common) : TAX[mod] ? h(Taxonomy, Object.assign({ mod: mod, key: mod }, common)) :
      mod === "lots" ? h(Lots, common) : mod === "inquiries" || mod === "requests" ? h(Tracking, Object.assign({ mod: mod, key: mod }, common)) :
      mod === "customers" ? h(Customers, common) : h(Newsletters, common);
    var newInq = l.data ? l.data.new_inquiries : 0;
    return h("div", { className: "ad-admin" },
      h("aside", { className: "ad-admin__nav" },
        h("div", { className: "ad-admin__brand" }, h(A.Logo, { size: 18, inverse: true }), h("span", { className: "ad-admin__tag" }, "Admin")),
        NAV.map(function (g) {
          return h("div", { key: g[0], className: "ad-admin__group" }, h("div", { className: "ad-label" }, g[0]), g[1].map(function (x) {
            return h("button", { key: x[0], type: "button", className: cx("ad-admin__link", mod === x[0] && "is-on"), "aria-current": mod === x[0] ? "page" : undefined, onClick: function () { setMod(x[0]); } },
              h(A.Icon, { name: x[1], size: 16 }), x[2], x[0] === "inquiries" && newInq ? h("span", { className: "ad-admin__n" }, newInq) : null);
          }));
        }),
        h("div", { className: "ad-admin__group" }, h("div", { className: "ad-label" }, "Site"),
          h("button", { type: "button", className: "ad-admin__link", onClick: p.onExit }, h(A.Icon, { name: "home", size: 16 }), "View website"),
          h("button", { type: "button", className: "ad-admin__link", onClick: p.onSignOut }, h(A.Icon, { name: "logout", size: 16 }), "Sign out"))),
      h("div", { className: "ad-admin__main" },
        h("div", { className: "ad-admin__top" }, h("div", null, h("div", { className: "ad-label" }, "Admin · " + group), h("h2", { className: "ad-h1" }, label[2])),
          h("div", { className: "ad-row" }, h("span", { className: "ad-small ad-muted ad-hide-sm" }, p.user && p.user.email), h("span", { className: "ad-avatar" }, ((p.user && (p.user.name || p.user.email)) || "?").slice(0, 2)))),
        note ? h("div", { className: cx("ad-note", note.tone === "danger" && "is-danger"), role: "status" }, h(A.Icon, { name: note.tone === "danger" ? "info" : "check", size: 16 }), note.text) : null,
        body));
  }

  window.AD_ADMIN = { Console: Console };
})();
