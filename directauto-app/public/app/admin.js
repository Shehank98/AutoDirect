/* Direct Auto admin console - loaded on demand when someone opens /admin.
   Built from the same components as the storefront (window.AD) and wired to /api/admin/*. */
(function () {
  "use strict";
  var R = window.React, h = R.createElement, useState = R.useState, useEffect = R.useEffect, useRef = R.useRef, Frag = R.Fragment;
  var A = window.AD, api = A.api, fmt = A.format, cx = fmt.cx;
  var STAGES = ["Requested", "Bidding", "Won", "LC opened", "Shipped", "Arrived", "Delivered"];
  var STOCK_STATUS = ["Available", "Ex Stock", "Reserved", "In transit", "Sold"];
  var FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
  var GEARS = ["Automatic", "Manual", "CVT"];
  var DRIVES = ["2WD", "4WD", "AWD"];
  // Wording for the single bar on a car's photo. "" = no bar (a car that is Sold / Reserved / In transit still shows that status).
  var LABEL_PRESETS = ["New arrival", "Available now", "Ex Stock", "Just landed", "Hot deal", "Price reduced", "Reserved", "In transit", "Sold"];
  function labelOptions(cur) { var o = [{ value: "", label: "No label" }].concat(LABEL_PRESETS.map(function (x) { return { value: x, label: x }; })); if (cur && LABEL_PRESETS.indexOf(cur) < 0) o.push({ value: cur, label: cur + " (custom)" }); return o; }
  // Car photos are shown 4:3 on the listing cards, so that is the default shape.
  var CAR_CROP = { aspects: [{ label: "4:3 (car cards)", a: 4 / 3 }, { label: "3:2", a: 3 / 2 }, { label: "16:9", a: 16 / 9 }, { label: "Square", a: 1 }], def: 0 };
  var CAPS = { uploads: false, sampleImages: true, email: { enabled: false } };   // filled from /api/admin/me when the console opens

  /* ------------------------------------------------------------ helpers */
  function day(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"; }
  function dayTime(d) { return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"; }
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
    return api.authFor("/api/admin/upload").then(function (t) { return fetch("/api/admin/upload?folder=" + folder, { method: "POST", headers: { Authorization: "Bearer " + t }, body: fd }); })
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
      h("thead", null, h("tr", null, p.cols.map(function (c, i) { return h("th", { key: i, scope: "col", className: (c.center ? "ad-center " : "") + (i === 0 && typeof c.label === "object" ? "ad-dt__cb" : "") }, c.label); }))),
      h("tbody", null, p.rows)), p.empty);
  }
  function Err(p) { return p.text ? h("p", { className: "ad-field__error", role: "alert" }, h(A.Icon, { name: "info", size: 14 }), p.text) : null; }
  function Thumb(p) { return p.src ? h("img", { src: p.src, alt: "", className: p.logo ? "ad-dt__logo" : "" }) : h("span", { className: "ad-dt__ph" }, h(A.Icon, { name: p.icon || "image", size: 16 })); }

  /* ------------------------------------------------------------ photo cropper */
  // Drag to move, slider / wheel / pinch to zoom, pick the shape. Produces a JPEG of the chosen area.
  function CropDialog(p) {
    var aspects = p.aspects, ai = useState(p.def || 0), ia = ai[0], setIa = ai[1];
    var asp = aspects[ia].a;
    var src = useState(null), url = src[0], setUrl = src[1];
    var nat = useState(null), size = nat[0], setSize = nat[1];            // natural size of the photo
    var fwS = useState(0), fw = fwS[0], setFw = fwS[1];                   // frame width on screen
    var vw = useState({ z: 1, ox: 0, oy: 0 }), view = vw[0], setView = vw[1];
    var frame = useRef(null), imgRef = useRef(null), ptrs = useRef({}), last = useRef(null);
    useEffect(function () { var u = URL.createObjectURL(p.file); setUrl(u); return function () { URL.revokeObjectURL(u); }; }, [p.file]);
    useEffect(function () {
      function measure() { if (frame.current) setFw(frame.current.getBoundingClientRect().width); }
      measure(); window.addEventListener("resize", measure); return function () { window.removeEventListener("resize", measure); };
    }, [ia, !!size]);
    var fh = fw / asp;
    var s0 = size && fw ? Math.max(fw / size.w, fh / size.h) : 1, s = s0 * view.z;
    function clamp(ox, oy, z) {
      var sc = s0 * z, dw = size.w * sc, dh = size.h * sc;
      return { z: z, ox: Math.min(0, Math.max(fw - dw, ox)), oy: Math.min(0, Math.max(fh - dh, oy)) };
    }
    function center(z) { var sc = s0 * z; return clamp((fw - size.w * sc) / 2, (fh - size.h * sc) / 2, z); }
    // Start centred whenever the photo or the shape changes.
    useEffect(function () { if (size && fw) setView(center(1)); }, [size, ia, fw > 0]);
    function zoomTo(z) {
      z = Math.min(4, Math.max(1, z));
      setView(function (v) {   // keep whatever is in the middle of the frame in the middle
        var cx = (fw / 2 - v.ox) / (s0 * v.z), cy = (fh / 2 - v.oy) / (s0 * v.z);
        return clamp(fw / 2 - cx * s0 * z, fh / 2 - cy * s0 * z, z);
      });
    }
    function down(e) { frame.current.setPointerCapture(e.pointerId); ptrs.current[e.pointerId] = { x: e.clientX, y: e.clientY }; last.current = null; }
    function move(e) {
      var pt = ptrs.current[e.pointerId]; if (!pt || !size) return;
      var ids = Object.keys(ptrs.current);
      if (ids.length === 1) {
        var dx = e.clientX - pt.x, dy = e.clientY - pt.y;
        setView(function (v) { return clamp(v.ox + dx, v.oy + dy, v.z); });
      } else if (ids.length === 2) {
        var o = ptrs.current[ids.filter(function (k) { return Number(k) !== e.pointerId; })[0]];
        var d = Math.hypot(e.clientX - o.x, e.clientY - o.y);
        if (last.current) zoomTo(view.z * d / last.current);
        last.current = d;
      }
      ptrs.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    }
    function up(e) { delete ptrs.current[e.pointerId]; last.current = null; }
    function wheel(e) { e.preventDefault(); zoomTo(view.z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); }
    useEffect(function () { var el = frame.current; if (!el) return; el.addEventListener("wheel", wheel, { passive: false }); return function () { el.removeEventListener("wheel", wheel); }; });
    function apply() {
      var im = imgRef.current, sw = fw / s, sh = fh / s, sx = -view.ox / s, sy = -view.oy / s;
      var ow = Math.min(1600, Math.round(sw)), oh = Math.round(ow * fh / fw);
      var cv = document.createElement("canvas"); cv.width = ow; cv.height = oh;
      var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, ow, oh); cx.imageSmoothingQuality = "high";
      cx.drawImage(im, sx, sy, sw, sh, 0, 0, ow, oh);
      cv.toBlob(function (b) { p.onDone(new File([b], (p.file.name.replace(/\.[^.]+$/, "") || "photo") + ".jpg", { type: "image/jpeg" })); }, "image/jpeg", 0.9);
    }
    return h(Modal, { title: "Crop photo" + (p.total > 1 ? " " + (p.index + 1) + " of " + p.total : ""), wide: true, onClose: p.onCancel },
      h("div", { className: "ad-crop" },
        h("p", { className: "ad-small ad-muted" }, "Drag the photo to move it. Use the slider (or pinch) to zoom. The cropped area is what visitors will see."),
        h("div", { className: "ad-crop__shapes", role: "radiogroup", "aria-label": "Shape" }, aspects.map(function (x, i) {
          return h("button", { key: x.label, type: "button", role: "radio", "aria-checked": i === ia, className: cx("ad-chip", i === ia && "is-on"), onClick: function () { setIa(i); } }, x.label);
        })),
        h("div", { ref: frame, className: "ad-crop__frame", style: { aspectRatio: String(asp) }, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up },
          url ? h("img", { ref: imgRef, src: url, alt: "", draggable: false, onLoad: function (e) { setSize({ w: e.target.naturalWidth, h: e.target.naturalHeight }); },
            style: size && fw ? { width: size.w * s, height: size.h * s, left: view.ox, top: view.oy } : { visibility: "hidden" } }) : null,
          h("span", { className: "ad-crop__grid", "aria-hidden": true })),
        h("label", { className: "ad-crop__zoom" }, h("span", { className: "ad-small" }, "Zoom"),
          h("input", { type: "range", min: 1, max: 4, step: 0.01, value: view.z, onChange: function (e) { zoomTo(Number(e.target.value)); }, "aria-label": "Zoom" })),
        h("div", { className: "ad-row ad-row--between" },
          h(A.Button, { variant: "ghost", onClick: p.onSkip }, "Upload without cropping"),
          h("div", { className: "ad-row" }, h(A.Button, { variant: "ghost", onClick: p.onCancel }, "Cancel"), h(A.Button, { icon: "check", onClick: apply, disabled: !size }, "Use this crop")))));
  }

  /* ------------------------------------------------------------ image uploader (single or many) */
  function ImageField(p) {
    var ref = useRef(null), bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    var images = p.images || [];
    if (!CAPS.uploads) {
      // Without Firebase Storage nothing can be uploaded; a logo can still be a link to an image.
      if (p.multiple) return h("p", { className: "ad-small ad-muted" }, "Photo upload needs Firebase Storage. Not configured.");
      return h(A.TextField, { label: "", "aria-label": "Image URL", placeholder: "https://… link to an image (optional)", value: images[0] || "", onChange: function (e) { p.onChange(e.target.value ? [e.target.value.trim()] : []); },
        hint: "Image upload turns on when Firebase Storage is configured." });
    }
    var cq = useState(null), queue = cq[0], setQueue = cq[1];   // { files, i, out } while the crop window is open
    function send(files) {
      setBusy(true); setErr("");
      upload(files, p.folder).then(function (urls) { p.onChange(p.multiple ? images.concat(urls) : urls.slice(0, 1)); setBusy(false); }, function (x) { setErr(x.message); setBusy(false); });
    }
    function pick(e) {
      var input = e.target, chosen = Array.prototype.slice.call(input.files); if (!chosen.length) return;
      // Read every file into memory straight away, so nothing depends on the file input once it is cleared.
      Promise.all(chosen.map(function (f) { return f.arrayBuffer().then(function (buf) { return new File([buf], f.name, { type: f.type, lastModified: f.lastModified }); }); })).then(function (files) {
        input.value = "";
        if (!p.crop) { send(files); return; }
        // Only JPEG / PNG / WebP can be cropped; anything else (GIF, SVG) goes up as it is.
        var first = files.findIndex(function (f) { return /^image\/(jpeg|png|webp)$/.test(f.type); });
        if (first < 0) { send(files); return; }
        setQueue({ files: files, i: first, out: files.slice(0, first) });
      }, function () { input.value = ""; setErr("Could not read that file."); });
    }
    function next(file) {   // the cropped (or original) file for this photo; then the next one, then upload
      var q = queue, out = q.out.concat([file]), i = q.i + 1;
      while (i < q.files.length && !/^image\/(jpeg|png|webp)$/.test(q.files[i].type)) { out.push(q.files[i]); i++; }
      if (i >= q.files.length) { setQueue(null); send(out); } else setQueue({ files: q.files, i: i, out: out });
    }
    function move(i, to) { if (to < 0 || to >= images.length) return; var a = images.slice(); a.splice(to, 0, a.splice(i, 1)[0]); p.onChange(a); }
    return h("div", { className: "ad-imgs" },
      h("div", { className: "ad-imgs__head" }, h("input", { ref: ref, type: "file", accept: "image/*", multiple: !!p.multiple, hidden: true, onChange: pick }),
        h(A.Button, { variant: "secondary", size: "s", icon: "plus", loading: busy, onClick: function () { ref.current.click(); } }, p.multiple ? "Upload photos" : images.length ? "Replace image" : "Upload image"),
        p.multiple ? h("span", { className: "ad-small ad-muted" }, "First photo is the cover shown in listings.") : null),
      h(Err, { text: err }),
      queue ? h(CropDialog, { key: queue.i, file: queue.files[queue.i], index: queue.i, total: queue.files.length, aspects: p.crop.aspects, def: p.crop.def,
        onDone: next, onSkip: function () { next(queue.files[queue.i]); }, onCancel: function () { setQueue(null); } }) : null,
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
      var body = Object.assign({}, f); delete body.__custom; delete body.id; delete body.created_at; delete body.updated_at; delete body.seo_url;
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
      CAPS.sampleImages
        ? h("p", { className: "ad-note" }, h(A.Icon, { name: "image", size: 16 }), "Sample car photos are shown on every listing for now, so there is nothing to upload.")
        : h(Frag, null, h("div", { className: "ad-label" }, "Photos"), h(ImageField, { multiple: true, folder: "vehicles", crop: CAR_CROP, images: f.images, onChange: function (a) { setF(Object.assign({}, f, { images: a })); } })),
      h("div", { className: "ad-label" }, "Features"),
      h(A.ChipGroup, { multiple: true, label: "Features", value: f.feature_ids.map(String), onChange: function (a) { setF(Object.assign({}, f, { feature_ids: a.map(Number) })); },
        options: L.features.filter(function (x) { return x.status === 1 || f.feature_ids.indexOf(x.id) >= 0; }).map(function (x) { return { value: String(x.id), label: x.name }; }) }),
      h("div", { className: "ad-label" }, "Visibility"),
      h("div", { className: "ad-row", style: { gap: 24 } },
        h(A.Switch, { label: "Published on the website", checked: String(f.status) !== "0", onChange: function (on) { setF(Object.assign({}, f, { status: on ? 1 : 0 })); } }),
        h(A.Switch, { label: "Featured on the home page", checked: !!f.is_featured, onChange: function (on) { setF(Object.assign({}, f, { is_featured: on })); } }),
        h("span")),
      h("div", { className: "ad-label" }, "Label on the photo"),
      h("div", { className: "ad-form__grid ad-form__grid--3" },
        h(A.SelectField, { label: "Bar shown on this car’s photo", options: labelOptions(LABEL_PRESETS.indexOf(f.badge || "") < 0 ? "" : f.badge).concat([{ value: "__custom", label: "Custom wording…" }]), value: f.__custom || (f.badge && LABEL_PRESETS.indexOf(f.badge) < 0) ? "__custom" : (f.badge || ""),
          onChange: function (e) { var v2 = e.target.value; setF(Object.assign({}, f, v2 === "__custom" ? { __custom: true, badge: LABEL_PRESETS.indexOf(f.badge) >= 0 ? "" : (f.badge || "") } : { __custom: false, badge: v2 })); },
          hint: "One bar on the photo, e.g. New arrival or Hot deal. “No label” shows nothing (Sold, Reserved and In transit still show their status)." }),
        f.__custom || (f.badge && LABEL_PRESETS.indexOf(f.badge) < 0) ? txt("badge", "Your wording", { maxLength: 40, placeholder: "e.g. Eid special" }) : null),
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
    function blank() { return { status: 1, stock_status: "Available", badge: "New arrival", is_featured: false, location: "Japan", images: [], feature_ids: [] }; }
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
      h(Table, { cols: [{ label: h(A.Checkbox, { ariaLabel: "Select all vehicles", checked: !!allOn, onChange: function (x) { setPicked(x ? list.map(function (v) { return v.id; }) : []); } }) }, { label: "Vehicle" }, { label: "Price" }, { label: "Grade" }, { label: "Location" }, { label: "Sales status" }, { label: "Label on photo" }, { label: "Featured" }, { label: "" }],
        empty: list.length ? null : h(A.Empty, { title: "No vehicles", text: rows.length ? "Nothing matches your search." : "Add your first vehicle to get started." }),
        rows: list.map(function (v) {
          var on = picked.indexOf(v.id) >= 0;
          return h("tr", { key: v.id, className: on ? "is-picked" : "" },
            h("td", { className: "ad-dt__cb" }, h(A.Checkbox, { ariaLabel: "Select vehicle " + v.id, checked: on, onChange: function (x) { setPicked(x ? picked.concat([v.id]) : picked.filter(function (y) { return y !== v.id; })); } })),
            h("td", null, h("div", { className: "ad-dt__veh" }, h(Thumb, { src: v.thumb }),
              h("span", null, h("b", null, vtitle(v, L)), h("span", { className: "ad-mono ad-muted ad-small" }, "AD-" + String(v.id).padStart(4, "0") + (v.chassi_id ? " · " + v.chassi_id : "")),
                v.status === 0 ? h("span", { className: "ad-small", style: { color: "var(--warning)" } }, "Hidden from website") : null))),
            h("td", { className: "ad-num" }, v.price ? fmt.lkr(Number(v.price)) : "On request"), h("td", null, v.auction_grade ? v.auction_grade + " / " + (v.grade || "-") : "-"), h("td", null, v.location || "-"),
            h("td", null, h(A.SelectField, { "aria-label": "Sales status of " + v.id, options: STOCK_STATUS, value: v.stock_status, className: "ad-select--s", onChange: function (e) { patch(v, { stock_status: e.target.value }, "Status updated"); } })),
            h("td", null, h(A.SelectField, { "aria-label": "Label on the photo of " + v.id, options: labelOptions(v.badge), value: v.badge || "", className: "ad-select--s", onChange: function (e) { patch(v, { badge: e.target.value }, "Label updated"); } })),
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

  /* ------------------------------------------------------------ inquiries + auction requests (shared) */
  // Shows whether the Google mail service is connected (alerts to staff, updates to customers) and lets you send a test.
  function EmailStatus(p) {
    var b = useState(false), busy = b[0], setBusy = b[1];
    function test() { setBusy(true); api.post("/api/admin/email-test", {}).then(function (r) { setBusy(false); p.say(r.to && r.to.length ? "Test email sent to " + r.to.join(", ") : "Test email sent."); }, function (e) { setBusy(false); p.say(e.message, "danger"); }); }
    return CAPS.email.enabled
      ? h("div", { className: "ad-note" }, h(A.Icon, { name: "mail", size: 16 }), "Email is connected. The team gets an email for every new message, and customers get an email when their order moves to a new stage.",
        h(A.Button, { variant: "secondary", size: "s", loading: busy, onClick: test, className: "ad-note__btn" }, "Send test email"))
      : h("div", { className: "ad-note is-muted" }, h(A.Icon, { name: "mail", size: 16 }), "Email is off. Connect the Google mail script (APPS_SCRIPT_URL and APPS_SCRIPT_SECRET on the server) to get an email for every new message and to update customers.");
  }

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
      h(EmailStatus, { say: p.say }),
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

  /* ------------------------------------------------------------ testimonials (home page reviews) */
  function Testimonials(p) {
    var d = useLoad("/api/admin/testimonials");
    var s1 = useState(null), edit = s1[0], setEdit = s1[1], s2 = useState(null), del = s2[0], setDel = s2[1];
    if (d.error) return h(Err, { text: d.error });
    if (!d.data) return h("p", { className: "ad-muted" }, "Loading…");
    function patch(r, body) { api.put("/api/admin/testimonials/" + r.id, body).then(function () { d.reload(); p.changed(); }, function (e) { p.say(e.message, "danger"); }); }
    return h(Frag, null,
      h("div", { className: "ad-dt__bar" }, h("p", { className: "ad-muted" }, d.data.length + " review" + (d.data.length === 1 ? "" : "s") + ". The featured one is pinned and highlighted on the home page; the rest scroll past."),
        h("div", { className: "ad-row" }, h(A.Button, { icon: "plus", onClick: function () { setEdit({ status: 1, lang: "en" }); } }, "Add testimonial"))),
      h(Table, { cols: [{ label: "" }, { label: "Customer" }, { label: "Review" }, { label: "Featured" }, { label: "Active" }, { label: "" }],
        empty: d.data.length ? null : h(A.Empty, { icon: "star", title: "No testimonials yet", text: "Add the first customer review." }),
        rows: d.data.map(function (r) {
          return h("tr", { key: r.id },
            h("td", { className: "ad-dt__cb" }, r.image ? h("img", { src: r.image, alt: "", className: "ad-dt__face" }) : h("span", { className: "ad-dt__ph ad-dt__face" }, h(A.Icon, { name: "user", size: 16 }))),
            h("td", null, h("b", null, r.name), h("div", { className: "ad-small ad-muted" }, r.role)),
            h("td", { className: "ad-dt__wrap", lang: r.lang }, r.quote.length > 120 ? r.quote.slice(0, 120) + "…" : r.quote),
            h("td", null, h(A.Switch, { label: "Feature " + r.name, hideLabel: true, checked: !!r.featured, onChange: function (x) { patch(r, { featured: x }); } })),
            h("td", null, h(A.Switch, { label: "Show " + r.name, hideLabel: true, checked: r.status === 1, onChange: function (x) { patch(r, { status: x ? 1 : 0 }); } })),
            h("td", { className: "ad-dt__act" }, h(A.Button, { variant: "ghost", size: "s", icon: "edit", "aria-label": "Edit " + r.name, onClick: function () { setEdit(r); } }),
              h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete " + r.name, onClick: function () { setDel(r); } })));
        }) }),
      edit ? h(TestimonialModal, { row: edit, onClose: function () { setEdit(null); }, onSaved: function () { setEdit(null); d.reload(); p.say("Saved"); p.changed(); } }) : null,
      del ? h(Confirm, { title: "Delete the review from " + del.name + "?", text: "It disappears from the home page. This cannot be undone.", onCancel: function () { setDel(null); },
        onOk: function () { api.del("/api/admin/testimonials/" + del.id).then(function () { setDel(null); d.reload(); p.say("Deleted"); p.changed(); }, function (e) { setDel(null); p.say(e.message, "danger"); }); } }) : null);
  }
  function TestimonialModal(p) {
    var r = p.row, isNew = !r.id;
    var s = useState({ name: r.name || "", role: r.role || "", quote: r.quote || "", lang: r.lang || "en", image: r.image || "", featured: !!r.featured, status: r.status == null ? 1 : r.status }), f = s[0], setF = s[1];
    var bs = useState(false), busy = bs[0], setBusy = bs[1], er = useState(""), err = er[0], setErr = er[1];
    function set(k) { return function (e) { var o = Object.assign({}, f); o[k] = e && e.target ? e.target.value : e; setF(o); }; }
    function save(e) {
      e.preventDefault(); setErr("");
      if (!f.name.trim() || !f.quote.trim()) { setErr("Name and review text are required."); return; }
      var body = { name: f.name.trim(), role: f.role.trim(), quote: f.quote.trim(), lang: f.lang, image: f.image, featured: f.featured, status: f.status };
      setBusy(true);
      (isNew ? api.post("/api/admin/testimonials", body) : api.put("/api/admin/testimonials/" + r.id, body)).then(p.onSaved, function (x) { setErr(x.message); setBusy(false); });
    }
    return h(Modal, { title: (isNew ? "Add" : "Edit") + " testimonial", onClose: p.onClose },
      h("form", { className: "ad-modal__form", onSubmit: save },
        h(A.TextField, { label: "Customer name", value: f.name, onChange: set("name"), autoFocus: true }),
        h(A.TextField, { label: "Job / place", optional: true, placeholder: "e.g. Bank of Ceylon (BOC), Kegalle Branch", value: f.role, onChange: set("role") }),
        h(A.TextField, { label: "Review", multiline: true, rows: 6, value: f.quote, onChange: set("quote") }),
        h(A.SelectField, { label: "Language", options: [{ value: "en", label: "English" }, { value: "si", label: "Sinhala" }], value: f.lang, onChange: set("lang") }),
        h("div", null, h("div", { className: "ad-field__label" }, "Customer photo (optional)"), h(ImageField, { folder: "testimonials", crop: { aspects: [{ label: "Square", a: 1 }, { label: "4:3", a: 4 / 3 }], def: 0 }, images: f.image ? [f.image] : [], onChange: function (a) { setF(Object.assign({}, f, { image: a[0] || "" })); } })),
        h(A.Switch, { label: "Featured (pinned and highlighted on the home page; replaces the current one)", checked: f.featured, onChange: function (x) { setF(Object.assign({}, f, { featured: x })); } }),
        h(A.Switch, { label: "Active (visible on the website)", checked: f.status === 1, onChange: function (x) { setF(Object.assign({}, f, { status: x ? 1 : 0 })); } }),
        h(Err, { text: err }),
        h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: p.onClose }, "Cancel"), h(A.Button, { type: "submit", loading: busy }, "Save"))));
  }

  /* ------------------------------------------------------------ site settings (contact details, colours, home page text) */
  function useSettings() {
    var d = useLoad("/api/admin/settings");
    return d;
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function isList(k) { return !!(A.defaults && A.defaults[k]) && Array.isArray(A.defaults[k]); }
  // Lists start from what the website shows now: the admin's saved version, or the built-in rows.
  function pickSettings(values, keys) {
    var o = {};
    keys.forEach(function (k) { o[k] = isList(k) ? clone(Array.isArray(values[k]) && values[k].length ? values[k] : A.defaults[k]) : (values[k] == null ? "" : values[k]); });
    return o;
  }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  // Only these fields of each row are saved, so built-in rows (which may carry extras like an icon) compare equal.
  var LIST_FIELDS = { buySteps: ["t", "d", "body"], aboutValues: ["title", "text"], locationsList: ["name", "text"], glossaryItems: ["term", "cat", "def", "example"], auctionPoints: ["title", "text"] };
  function norm(k, rows) { return (rows || []).map(function (x) { var o = {}; LIST_FIELDS[k].forEach(function (c) { o[c] = x[c] == null ? "" : String(x[c]); }); return o; }); }
  function SaveBar(p) {
    return h("div", { className: "ad-savebar" }, h("span", { className: "ad-small ad-muted" }, p.dirty ? "You have unsaved changes." : "All changes saved."),
      h("div", { className: "ad-row" }, p.dirty ? h(A.Button, { variant: "ghost", onClick: p.onReset }, "Discard") : null, h(A.Button, { type: "submit", icon: "check", loading: p.busy, disabled: !p.dirty }, "Save changes")));
  }
  function Card(p) { return h("section", { className: "ad-card" }, p.title ? h("div", { className: "ad-card__h" }, h("h3", { className: "ad-h3" }, p.title), p.text ? h("p", { className: "ad-small ad-muted" }, p.text) : null) : null, p.children); }

  // One saved form for a group of settings; `render(f, set, tog)` returns the fields.
  function SettingsForm(p) {
    var d = useSettings();
    var s = useState(null), f = s[0], setF = s[1], b = useState(false), busy = b[0], setBusy = b[1];
    useEffect(function () { if (d.data) setF(pickSettings(d.data.values, p.keys)); }, [d.data]);
    if (d.error) return h(Err, { text: d.error });
    if (!d.data || !f) return h("p", { className: "ad-muted" }, "Loading…");
    var saved = pickSettings(d.data.values, p.keys);
    var dirty = p.keys.some(function (k) { return isList(k) ? !same(norm(k, f[k]), norm(k, saved[k])) : String(f[k]) !== String(saved[k]); });
    function set(k) { return function (e) { var o = Object.assign({}, f); o[k] = e && e.target ? e.target.value : e; setF(o); }; }
    function tog(k) { return function (x) { var o = Object.assign({}, f); o[k] = x; setF(o); }; }
    function submit(e) {
      e.preventDefault(); setBusy(true);
      var body = {}; p.keys.forEach(function (k) { body[k] = isList(k) ? (same(norm(k, f[k]), norm(k, A.defaults[k])) ? "" : norm(k, f[k])) : typeof f[k] === "boolean" ? f[k] : String(f[k]).trim(); });
      api.put("/api/admin/settings", body).then(function (r) { d.set(r); setBusy(false); p.say("Saved. The website is updated."); p.changed(); }, function (x) { setBusy(false); p.say(x.message, "danger"); });
    }
    return h("form", { className: "ad-settings", onSubmit: submit }, p.render(f, set, tog, d.data.defaults),
      h(SaveBar, { dirty: dirty, busy: busy, onReset: function () { setF(saved); } }));
  }
  function on(f, k) { return f[k] === "" || f[k] == null ? true : f[k] !== false; }

  var SITE_KEYS = ["notifyCustomers", "seoTitle", "seoDescription", "phone", "email", "whatsapp", "address", "hours", "instagram", "whatsappMessage", "showWhatsapp", "liveAuctionUrl", "liveAuctionHint", "topbarText", "footerText"];
  function SiteDetails(p) {
    return h(SettingsForm, Object.assign({ keys: SITE_KEYS, render: function (f, set, tog) {
      return h(Frag, null,
        h(Card, { title: "Contact details", text: "Shown in the top bar, footer, Contact page and on the WhatsApp button." },
          h("div", { className: "ad-fgrid" },
            h(A.TextField, { label: "Phone", value: f.phone, onChange: set("phone"), placeholder: "+94 77 123 4567" }),
            h(A.TextField, { label: "Email", type: "email", value: f.email, onChange: set("email") }),
            h(A.TextField, { label: "WhatsApp number", value: f.whatsapp, onChange: set("whatsapp"), hint: "Digits only, with country code. Example: 94768656515" }),
            h(A.TextField, { label: "Opening hours", value: f.hours, onChange: set("hours") }),
            h(A.TextField, { label: "Address / locations", className: "ad-span2", value: f.address, onChange: set("address") }),
            h(A.TextField, { label: "Instagram link", className: "ad-span2", value: f.instagram, onChange: set("instagram"), placeholder: "https://www.instagram.com/yourpage/" }))),
        h(Card, { title: "WhatsApp button", text: "The green button that follows visitors on every page." },
          h(A.Switch, { label: "Show the WhatsApp button", checked: on(f, "showWhatsapp"), onChange: tog("showWhatsapp") }),
          h(A.TextField, { label: "First message", value: f.whatsappMessage, onChange: set("whatsappMessage"), placeholder: "Hi Direct Auto, I have a question about importing a car.", hint: "What the chat starts with when a visitor taps the button. Leave empty for the standard message." })),
        h(Card, { title: "Live auction", text: "The Japan auction viewer shown on the Live auction page." },
          h(A.TextField, { label: "Auction viewer link", value: f.liveAuctionUrl, onChange: set("liveAuctionUrl"), placeholder: "https://jpcenter.ru/on?classic" }),
          h(A.TextField, { label: "Notice above the viewer", optional: true, value: f.liveAuctionHint, onChange: set("liveAuctionHint"), hint: "A short message such as login details or opening times." })),
        h(Card, { title: "Google and link previews", text: "How the home page appears in Google results and when the link is shared on WhatsApp or Facebook." },
          h(A.TextField, { label: "Home page title", value: f.seoTitle, onChange: set("seoTitle"), placeholder: "Japanese auction car imports for Sri Lanka" }),
          h(A.TextField, { label: "Description", multiline: true, rows: 3, value: f.seoDescription, onChange: set("seoDescription"), placeholder: "Browse imported cars in stock or let Direct Auto bid for your exact car at Japanese auctions…", hint: "One or two sentences. Search engines may take a few days to show a change." })),
        h(Card, { title: "Emails to customers", text: "Sent through the Google mail script when the customer left an email address." },
          h(A.Switch, { label: "Email customers a receipt when they send a message or request", checked: on(f, "notifyCustomers"), onChange: tog("notifyCustomers") }),
          h("p", { className: "ad-small ad-muted" }, "This switch also controls the order-stage emails (Bidding, Won, Shipped and so on) sent from Inquiries and Auction requests. Emails to the team are always sent.")),
        h(Card, { title: "Header and footer text" },
          h(A.TextField, { label: "Top bar message (right side)", value: f.topbarText, onChange: set("topbarText"), placeholder: "Japan auction imports for Sri Lanka" }),
          h(A.TextField, { label: "Footer description", multiline: true, rows: 3, value: f.footerText, onChange: set("footerText"), placeholder: "Japanese auction imports for Sri Lanka, with original auction sheets, refundable deposits and door-to-door tracking." })));
    } }, p));
  }

  var HOME_KEYS = ["showAuction", "auctionPoints", "auctionTitle", "auctionLead", "showReviews", "reviewsTitle", "showCta", "ctaTitle", "ctaText"];
  function HomeContent(p) {
    return h(SettingsForm, Object.assign({ keys: HOME_KEYS, render: function (f, set, tog) {
      return h(Frag, null,
        h("p", { className: "ad-note" }, h(A.Icon, { name: "info", size: 16 }), "Switch sections on or off and change their wording. A box left empty keeps the standard wording shown inside it."),
        h(Card, { title: "Live auction", text: "The Japan auctions promo strip." },
          h(A.Switch, { label: "Show this section", checked: on(f, "showAuction"), onChange: tog("showAuction") }),
          h("div", { className: "ad-fgrid" }, h(A.TextField, { label: "Heading", value: f.auctionTitle, onChange: set("auctionTitle"), placeholder: "Watch Japan auctions live" }),
            h(A.TextField, { label: "Sub-heading", value: f.auctionLead, onChange: set("auctionLead"), placeholder: "Browse live lots from Japanese auction houses without leaving Direct Auto." })),
          h("div", { className: "ad-field__label" }, "The three points under it"),
          h(ListEditor, { rows: f.auctionPoints, listKey: "auctionPoints", defaults: A.defaults.auctionPoints, onChange: set("auctionPoints"), fields: [{ key: "title", label: "Title", half: true }, { key: "text", label: "Text", half: true }], min: 1, max: 6, addLabel: "Add a point" })),
        h(Card, { title: "Customer reviews", text: "Add and edit the reviews themselves under Website > Testimonials." },
          h(A.Switch, { label: "Show this section", checked: on(f, "showReviews"), onChange: tog("showReviews") }),
          h(A.TextField, { label: "Heading", value: f.reviewsTitle, onChange: set("reviewsTitle"), placeholder: "What our customers say" })),
        h(Card, { title: "“Looking for one exact car?” banner" },
          h(A.Switch, { label: "Show this section", checked: on(f, "showCta"), onChange: tog("showCta") }),
          h(A.TextField, { label: "Heading", value: f.ctaTitle, onChange: set("ctaTitle"), placeholder: "Looking for one exact car?" }),
          h(A.TextField, { label: "Text", multiline: true, rows: 2, value: f.ctaText, onChange: set("ctaText"), placeholder: "Tell us the model, year and budget. We shortlist lots and send every sheet before bidding." })));
    } }, p));
  }

  /* ------------------------------------------------------------ appearance: colour themes */
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function Appearance(p) {
    var d = useSettings();
    var s = useState(null), f = s[0], setF = s[1], b = useState(false), busy = b[0], setBusy = b[1];
    var themes = A.themes;
    useEffect(function () { if (d.data) setF({ theme: d.data.values.theme || "forest", brandColor: d.data.values.brandColor || "#0e4f45", accentColor: d.data.values.accentColor || "#c93a17", font: d.data.values.fontTheme || "default", style: d.data.values.siteStyle || "standard" }); }, [d.data]);
    useEffect(function () { Object.keys(A.fonts).forEach(A.loadFont); }, []);
    // Preview while choosing; when leaving the page without saving, go back to what is saved.
    useEffect(function () { if (f) { A.applyStyle(f.style); A.applyTheme(f.theme, f.brandColor, f.accentColor); A.applyFont(f.font); } }, [f]);
    useEffect(function () { return function () { A.applySiteTheme(A.site); }; }, []);
    if (d.error) return h(Err, { text: d.error });
    if (!d.data || !f) return h("p", { className: "ad-muted" }, "Loading…");
    var v = d.data.values, cur = v.theme || "forest";
    var curFont = v.fontTheme || "default", curStyle = v.siteStyle || "standard";
    var dirty = f.style !== curStyle || f.theme !== cur || f.font !== curFont || (f.theme === "custom" && (f.brandColor !== (v.brandColor || "#0e4f45") || f.accentColor !== (v.accentColor || "#c93a17")));
    var tooLight = f.theme === "custom" && lum(f.brandColor) > 0.3;
    function pick(id) { setF(Object.assign({}, f, { theme: id })); }
    function save(e) {
      e.preventDefault(); setBusy(true);
      var body = { siteStyle: f.style === "standard" ? "" : f.style, fontTheme: f.font === "default" ? "" : f.font, theme: f.theme === "forest" ? "" : f.theme, brandColor: f.theme === "custom" ? f.brandColor : "", accentColor: f.theme === "custom" ? f.accentColor : "" };
      api.put("/api/admin/settings", body).then(function (r) { d.set(r); setBusy(false); p.say("Saved. The whole website now uses your choices."); p.changed(); }, function (x) { setBusy(false); p.say(x.message, "danger"); });
    }
    return h("form", { className: "ad-settings", onSubmit: save },
      h("p", { className: "ad-note" }, h(A.Icon, { name: "palette", size: 16 }), "Pick a complete theme, colours or a font to preview them right here, then press Save to publish them to the whole website and this admin. Light and dark mode both follow the theme."),
      h(Card, { title: "Complete themes", text: "A full look for the whole website: page and card colours, text, corner shapes and font, in light and dark mode. Colours or a font chosen below still override the theme." },
        h("div", { className: "ad-styles", role: "radiogroup", "aria-label": "Complete theme" },
          Object.keys(A.styles).map(function (id) {
            var st = A.styles[id], c = st.light, fontName = A.fonts[st.font] ? A.fonts[st.font].display : null;
            return h("button", { key: id, type: "button", role: "radio", "aria-checked": f.style === id, className: cx("ad-stylecard", f.style === id && "is-on"), onClick: function () { setF(Object.assign({}, f, { style: id })); } },
              h("span", { className: "ad-stylecard__pv", "aria-hidden": true, style: { background: c.s1, borderColor: c.line } },
                h("span", { className: "ad-stylecard__bar", style: { background: c.s2, borderColor: c.line } }, h("i", { style: { background: c.brand } }), h("i", { style: { background: c.line, width: 26 } }), h("i", { style: { background: c.line, width: 18 } })),
                h("span", { className: "ad-stylecard__card", style: { background: c.s2, borderColor: c.line, borderRadius: Math.round(st.r[2] / 2.2) } },
                  h("b", { style: { color: c.ink, fontFamily: fontName ? '"' + fontName + '", system-ui' : undefined } }, "Aa"),
                  h("span", { className: "ad-stylecard__btns" }, h("i", { style: { background: c.brand, borderRadius: Math.round(st.r[1] / 2) } }), h("i", { style: { background: c.acc, borderRadius: Math.round(st.r[1] / 2) } })))),
              h("b", null, st.name), h("span", { className: "ad-small ad-muted" }, st.note), id === curStyle ? h("span", { className: "ad-small ad-muted" }, "In use") : null,
              f.style === id ? h(A.Icon, { name: "check", size: 16, className: "ad-theme__ck" }) : null);
          }))),
      h(Card, { title: "Colour themes", text: f.style !== "standard" ? "Optional. “Forest” here means: use the complete theme’s own colours." : undefined },
        h("div", { className: "ad-themes", role: "radiogroup", "aria-label": "Colour theme" },
          Object.keys(themes).map(function (id) {
            var t = themes[id];
            return h("button", { key: id, type: "button", role: "radio", "aria-checked": f.theme === id, className: cx("ad-theme", f.theme === id && "is-on"), onClick: function () { pick(id); } },
              h("span", { className: "ad-theme__sw" }, h("i", { style: { background: t.brand } }), h("i", { style: { background: t.accent } }), h("i", { style: { background: t.tint } })),
              h("b", null, t.name), id === cur ? h("span", { className: "ad-small ad-muted" }, "In use") : null, f.theme === id ? h(A.Icon, { name: "check", size: 16, className: "ad-theme__ck" }) : null);
          }),
          h("button", { type: "button", role: "radio", "aria-checked": f.theme === "custom", className: cx("ad-theme", f.theme === "custom" && "is-on"), onClick: function () { pick("custom"); } },
            h("span", { className: "ad-theme__sw" }, h("i", { style: { background: f.brandColor } }), h("i", { style: { background: f.accentColor } }), h("i", { className: "ad-theme__plus" }, "+")),
            h("b", null, "Your own colours"), cur === "custom" ? h("span", { className: "ad-small ad-muted" }, "In use") : null, f.theme === "custom" ? h(A.Icon, { name: "check", size: 16, className: "ad-theme__ck" }) : null)),
        f.theme === "custom" ? h("div", { className: "ad-fgrid ad-custom" },
          h(A.TextField, { label: "Main colour", type: "color", value: f.brandColor, onChange: function (e) { setF(Object.assign({}, f, { brandColor: e.target.value })); }, hint: "Buttons, links, highlights." }),
          h(A.TextField, { label: "Accent colour", type: "color", value: f.accentColor, onChange: function (e) { setF(Object.assign({}, f, { accentColor: e.target.value })); }, hint: "Request-a-bid button and small highlights." }),
          tooLight ? h("p", { className: "ad-field__error ad-span2", role: "alert" }, h(A.Icon, { name: "info", size: 14 }), "This main colour is quite light, so white button text may be hard to read. Try a darker shade.") : null) : null),
      h(Card, { title: "Font", text: "The lettering used across the website and this admin. Sinhala and Tamil text uses your device’s own font." },
        h("div", { className: "ad-themes ad-fonts", role: "radiogroup", "aria-label": "Font" },
          Object.keys(A.fonts).map(function (id) {
            var ft = A.fonts[id], css = id === "default" ? undefined : { fontFamily: '"' + ft.display + '", system-ui, sans-serif' };
            return h("button", { key: id, type: "button", role: "radio", "aria-checked": f.font === id, className: cx("ad-theme", "ad-font", f.font === id && "is-on"), onClick: function () { setF(Object.assign({}, f, { font: id })); } },
              h("span", { className: "ad-font__aa", style: css, "aria-hidden": true }, "Aa"), h("b", null, ft.name), h("span", { className: "ad-small ad-muted" }, ft.note),
              id === curFont ? h("span", { className: "ad-small ad-muted" }, "In use") : null, f.font === id ? h(A.Icon, { name: "check", size: 16, className: "ad-theme__ck" }) : null);
          }))),
      h(Card, { title: "Preview", text: "These samples use the colours and font you picked." },
        h("div", { className: "ad-row ad-themeprev" }, h(A.Button, null, "Show 6 vehicles"), h(A.Button, { variant: "accent", icon: "gavel" }, "Request a bid"), h(A.Button, { variant: "secondary" }, "Secondary"), h(A.Badge, { tone: "success" }, "Available"),
          h("a", { href: "#", className: "ad-link", onClick: function (e) { e.preventDefault(); } }, "A text link"))),
      h(SaveBar, { dirty: dirty, busy: busy, onReset: function () { setF({ theme: cur, brandColor: v.brandColor || "#0e4f45", accentColor: v.accentColor || "#c93a17", font: curFont, style: curStyle }); } }));
  }

  /* ------------------------------------------------------------ editable lists and pages */
  function ListEditor(p) {
    var rows = p.rows, fields = p.fields;
    function upd(i, k, v) { var a = rows.map(function (x) { return Object.assign({}, x); }); a[i][k] = v; p.onChange(a); }
    function move(i, to) { if (to < 0 || to >= rows.length) return; var a = rows.slice(); a.splice(to, 0, a.splice(i, 1)[0]); p.onChange(a); }
    function del(i) { var a = rows.slice(); a.splice(i, 1); p.onChange(a); }
    function add() { var b = {}; fields.forEach(function (f) { b[f.key] = ""; }); p.onChange(rows.concat([b])); }
    var canDel = rows.length > (p.min || 1);
    return h("div", { className: "ad-list" },
      rows.map(function (r, i) {
        return h("div", { key: i, className: "ad-list__row" },
          h("span", { className: "ad-list__n", "aria-hidden": true }, i + 1),
          h("div", { className: "ad-list__f" }, fields.map(function (f) {
            return h(A.TextField, { key: f.key, label: f.label, multiline: !!f.multiline, rows: f.rows || 2, optional: f.optional, className: f.half ? "" : "ad-span2", placeholder: f.placeholder, value: r[f.key] || "", onChange: function (e) { upd(i, f.key, e.target.value); } });
          })),
          h("div", { className: "ad-list__act" },
            h(A.Button, { variant: "ghost", size: "s", icon: "arrow-left", "aria-label": "Move " + (i + 1) + " up", disabled: i === 0, className: "ad-list__up", onClick: function () { move(i, i - 1); } }),
            h(A.Button, { variant: "ghost", size: "s", icon: "arrow-right", "aria-label": "Move " + (i + 1) + " down", disabled: i === rows.length - 1, className: "ad-list__down", onClick: function () { move(i, i + 1); } }),
            h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Delete " + (i + 1), disabled: !canDel, onClick: function () { del(i); } })));
      }),
      h("div", { className: "ad-row" }, !p.max || rows.length < p.max ? h(A.Button, { variant: "secondary", icon: "plus", onClick: add }, p.addLabel || "Add another") : h("span", { className: "ad-small ad-muted" }, "Maximum of " + p.max + " reached."),
        p.defaults && !same(norm(p.listKey, rows), norm(p.listKey, p.defaults)) ? h(A.Button, { variant: "ghost", onClick: function () { p.onChange(clone(p.defaults)); } }, "Reset to standard wording") : null));
  }
  function listCard(f, set, key, title, text, fields, extra) {
    return h(Card, { title: title, text: text }, h(ListEditor, Object.assign({ rows: f[key], listKey: key, defaults: A.defaults[key], onChange: set(key), fields: fields }, extra || {})));
  }

  function BuyPage(p) {
    return h(SettingsForm, Object.assign({ keys: ["buySteps", "depositFaq"], render: function (f, set) {
      return h(Frag, null,
        listCard(f, set, "buySteps", "The buying steps", "Shown on the How to buy page. Use the arrows to change the order.", [
          { key: "t", label: "Step title", half: true }, { key: "d", label: "How long", half: true, placeholder: "e.g. Day 1–3" }, { key: "body", label: "What happens", multiline: true, rows: 3 }], { min: 2, max: 8, addLabel: "Add a step" }),
        h(Card, { title: "“Why do we ask for a deposit?”", text: "The answer shown under the steps." },
          h(A.TextField, { label: "Answer", multiline: true, rows: 3, value: f.depositFaq, onChange: set("depositFaq"), placeholder: "Deposits are 100% refundable. They protect you and us from last-minute cancellations and spam bids…", hint: "Leave empty to use the standard answer." })));
    } }, p));
  }
  function AboutPage(p) {
    return h(SettingsForm, Object.assign({ keys: ["showAbout", "aboutValues", "aboutCtaTitle", "aboutCtaText"], render: function (f, set, tog) {
      return h(Frag, null,
        h(Card, { title: "Show “About us” on the website", text: "Off: the page is hidden from the menu and footer. You can still edit it here, and turn it on any time." },
          h(A.Switch, { label: "Show About us in the menu and footer", checked: f.showAbout === true, onChange: tog("showAbout") })),
        listCard(f, set, "aboutValues", "About us: what we stand for", "The boxes on the About us page.", [{ key: "title", label: "Heading" }, { key: "text", label: "Text", multiline: true, rows: 2 }], { min: 1, max: 8, addLabel: "Add a box" }),
        h(Card, { title: "Visit us banner", text: "The banner at the bottom of the About us page." },
          h(A.TextField, { label: "Heading", value: f.aboutCtaTitle, onChange: set("aboutCtaTitle"), placeholder: "Visit us in Malabe or Colombo 07" }),
          h(A.TextField, { label: "Text", value: f.aboutCtaText, onChange: set("aboutCtaText"), placeholder: "See landed stock in person, or sit down with our LC desk." })));
    } }, p));
  }
  function ContactPage(p) {
    return h(SettingsForm, Object.assign({ keys: ["locationsList"], render: function (f, set) {
      return h(Frag, null,
        h("p", { className: "ad-note" }, h(A.Icon, { name: "info", size: 16 }), "Phone, email, WhatsApp, address and opening hours are under Website > Site details."),
        listCard(f, set, "locationsList", "Showrooms and offices", "Listed on the Contact page, and offered in the “Visit us” form.", [{ key: "name", label: "Name", half: true, placeholder: "Malabe showroom" }, { key: "text", label: "Short note", half: true, placeholder: "Visit and inspect stock" }], { min: 1, max: 6, addLabel: "Add a location" }));
    } }, p));
  }
  function GlossaryPage(p) {
    return h(SettingsForm, Object.assign({ keys: ["glossaryItems"], render: function (f, set) {
      return listCard(f, set, "glossaryItems", "Import vocabulary", "The terms on the Vocabulary page. Terms with the same category are grouped together.", [
        { key: "term", label: "Term", half: true, placeholder: "LC (Letter of Credit)" }, { key: "cat", label: "Category", half: true, placeholder: "Payment & docs" },
        { key: "def", label: "Meaning", multiline: true, rows: 3 }, { key: "example", label: "Example", multiline: true, rows: 2, optional: true }], { min: 1, max: 80, addLabel: "Add a term" });
    } }, p));
  }

  /* ------------------------------------------------------------ seasons (Christmas, New Year ...) */
  var SEASON_KEYS = ["season", "seasonStart", "seasonEnd", "seasonIntensity", "seasonEffect", "seasonDecor", "seasonBanner", "seasonMessage", "seasonTheme"];
  // Shows the chosen season on this admin page while editing: falling effect, button decorations, colours.
  function SeasonPreview(p) {
    var f = p.f, def = A.seasons[f.season];
    var effectOn = def && on(f, "seasonEffect"), decorOn = def && on(f, "seasonDecor"), themeOn = def && on(f, "seasonTheme");
    useEffect(function () {
      A.applySeasonDecor(decorOn ? { id: f.season, decor: true } : null);
      if (themeOn) A.applyTheme("custom", def.brand, def.accent); else A.applySiteTheme(A.site);
    }, [f.season, decorOn, themeOn]);
    useEffect(function () { return function () { A.applySiteTheme(A.site); }; }, []);
    return effectOn ? h(A.SeasonFX, { kind: def.effect, density: f.seasonIntensity || "normal" }) : null;
  }
  function Seasons(p) {
    return h(SettingsForm, Object.assign({ keys: SEASON_KEYS, render: function (f, set, tog) {
      var def = A.seasons[f.season], ids = Object.keys(A.seasons);
      var st = f.season ? A.seasonState({ season: f.season, seasonStart: f.seasonStart, seasonEnd: f.seasonEnd }) : null;
      var status = !def ? "No season is active. The website looks normal."
        : st ? "Live now. Visitors see " + def.name + "." + (f.seasonEnd ? " It switches off after " + f.seasonEnd + "." : " It stays on until you choose “No season”.")
        : (f.seasonStart && A.format && new Date().toISOString().slice(0, 10) < f.seasonStart ? "Scheduled. It switches on by itself on " + f.seasonStart + "." : "The dates have passed, so the website looks normal now.");
      function card(id, emoji, name, sub) {
        return h("button", { key: id || "none", type: "button", role: "radio", "aria-checked": (f.season || "") === id, className: cx("ad-theme", "ad-season", (f.season || "") === id && "is-on"), onClick: function () { set("season")(id); } },
          h("span", { className: "ad-season__e", "aria-hidden": true }, emoji), h("b", null, name), h("span", { className: "ad-small ad-muted" }, sub), (f.season || "") === id ? h(A.Icon, { name: "check", size: 16, className: "ad-theme__ck" }) : null);
      }
      return h(Frag, null,
        h(SeasonPreview, { f: f }),
        h("p", { className: "ad-note" }, h(A.Icon, { name: "bell", size: 16 }), "Pick a season to preview it on this page (snow, decorations and colours), then press Save to show it to every visitor."),
        h(Card, { title: "Choose a season" },
          h("div", { className: "ad-themes", role: "radiogroup", "aria-label": "Season" },
            card("", "🚫", "No season", "Normal website"),
            ids.map(function (id) { var d = A.seasons[id]; return card(id, d.emoji, d.name, d.effectName + " · " + d.decor); })),
          h("p", { className: cx("ad-small", st ? "ad-live-on" : "ad-muted") }, status)),
        def ? h(Fragment2, null,
          h(Card, { title: "What to show", text: "Switch each part on or off." },
            h(A.Switch, { label: def.effectName + " falling from the top of every page", checked: on(f, "seasonEffect"), onChange: tog("seasonEffect") }),
            on(f, "seasonEffect") ? h(A.SelectField, { label: "How much", options: [{ value: "light", label: "Light" }, { value: "normal", label: "Normal" }, { value: "heavy", label: "Heavy" }], value: f.seasonIntensity || "normal", onChange: set("seasonIntensity") }) : null,
            h(A.Switch, { label: def.decor + " on the logo and main buttons (Request a bid, Show vehicles, WhatsApp)", checked: on(f, "seasonDecor"), onChange: tog("seasonDecor") }),
            h(A.Switch, { label: "Greeting banner at the top of the website", checked: on(f, "seasonBanner"), onChange: tog("seasonBanner") }),
            on(f, "seasonBanner") ? h(A.TextField, { label: "Greeting message", multiline: true, rows: 2, value: f.seasonMessage, onChange: set("seasonMessage"), placeholder: def.message, hint: "Leave empty to use the standard greeting shown above." }) : null,
            h(A.Switch, { label: "Use " + def.name + " colours while the season is on (replaces the colour theme)", checked: on(f, "seasonTheme"), onChange: tog("seasonTheme") })),
          h(Card, { title: "When", text: "Optional. Set dates to switch the season on and off by itself, so you never have to remember." },
            h("div", { className: "ad-fgrid" }, h(A.TextField, { label: "Starts on", type: "date", value: f.seasonStart, onChange: set("seasonStart") }), h(A.TextField, { label: "Ends on (last day)", type: "date", value: f.seasonEnd, onChange: set("seasonEnd") })),
            h("p", { className: "ad-small ad-muted" }, "Leave both empty to keep it on until you choose “No season”.")),
          h(Card, { title: "Preview", text: "How the decorations look on buttons." },
            h("div", { className: "ad-row ad-themeprev ad-season__prev" }, h(A.Button, { variant: "accent", icon: "gavel", className: "ad-admin-preview-btn" }, "Request a bid"), h(A.Button, { size: "l", icon: "search", className: "ad-admin-preview-btn" }, "Show 6 vehicles")))) : null);
    } }, p));
  }
  var Fragment2 = Frag;

  /* ------------------------------------------------------------ admins: who may open this admin */
  function Admins(p) {
    var d = useLoad("/api/admin/admins");
    var s1 = useState(""), email = s1[0], setEmail = s1[1], s2 = useState(false), busy = s2[0], setBusy = s2[1], s3 = useState(null), del = s3[0], setDel = s3[1], s4 = useState(""), err = s4[0], setErr = s4[1];
    function add(e) {
      e.preventDefault(); setErr("");
      if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email.trim())) { setErr("Enter a valid email address."); return; }
      setBusy(true);
      api.post("/api/admin/admins", { email: email.trim() }).then(function () { setBusy(false); setEmail(""); d.reload(); p.say("Added. They can sign in on the website with that email."); }, function (x) { setBusy(false); setErr(x.message); });
    }
    function status(r) {
      if (r.is_admin) return h(A.Badge, { tone: "success", icon: "check" }, "Active");
      if (r.signed_up) return h(A.Badge, { tone: "warning", icon: "clock" }, "Needs to verify their email");
      return h(A.Badge, { tone: "neutral", icon: "clock" }, "Waiting for them to sign up");
    }
    var rows = d.data ? d.data.owners.map(function (o) { return { owner: true, email: o.email, name: o.name, r: o }; }).concat(d.data.added.map(function (a) { return { owner: false, email: a.email, name: a.name, r: a, by: a.added_by }; })) : [];
    return h(Frag, null,
      h(Card, { title: "Add an admin", text: "Type their email. They then sign in on the website (top right, “Sign in”) with that email, verify it, and an Admin button appears for them." },
        h("form", { className: "ad-row ad-admins__form", onSubmit: add },
          h(A.TextField, { label: "Email address", type: "email", placeholder: "name@example.com", value: email, onChange: function (e) { setEmail(e.target.value); setErr(""); }, error: err, className: "ad-admins__f" }),
          h(A.Button, { type: "submit", icon: "plus", loading: busy }, "Add admin")),
        h("p", { className: "ad-small ad-muted" }, "They don’t have an account yet? They tap “Sign in”, choose “Create account” with the same email, and open the link in the email we send. Only a verified email is ever made an admin.")),
      d.error ? h(Err, { text: d.error }) : !d.data ? h("p", { className: "ad-muted" }, "Loading…") :
        h(Card, { title: "People who can open the admin" },
          h(Table, { cols: [{ label: "Email" }, { label: "Status" }, { label: "Added by" }, { label: "" }],
            empty: rows.length ? null : h(A.Empty, { icon: "users", title: "No admins listed yet" }),
            rows: rows.map(function (x) {
              return h("tr", { key: x.email },
                h("td", null, h("b", null, x.email), x.name ? h("div", { className: "ad-small ad-muted" }, x.name) : null),
                h("td", null, x.owner ? h(A.Badge, { tone: "info", icon: "lock" }, "Owner · set on the server") : status(x.r)),
                h("td", { className: "ad-small ad-muted" }, x.owner ? "ADMIN_EMAILS" : (x.by || "-")),
                h("td", { className: "ad-dt__act" }, x.owner ? null : h(A.Button, { variant: "ghost", size: "s", icon: "trash", "aria-label": "Remove " + x.email, onClick: function () { setDel(x); } })));
            }) })),
      del ? h(Confirm, { title: "Remove " + del.email + "?", text: "They lose admin access straight away. They can still sign in as a normal customer.", okLabel: "Remove", onCancel: function () { setDel(null); },
        onOk: function () { api.del("/api/admin/admins/" + encodeURIComponent(del.email)).then(function () { setDel(null); d.reload(); p.say("Removed"); }, function (e) { setDel(null); p.say(e.message, "danger"); }); } }) : null);
  }

  /* ------------------------------------------------------------ backup: download, email, restore */
  function ago(ms) { return ms ? new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""; }
  var LOOKUPS = ["vehicle_type", "vehicle_model", "vehicle_color", "vehicle_feature"];
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function tiles(x) {
    var c = x.counts, out = [];
    x.tables.forEach(function (t) { if (LOOKUPS.indexOf(t) < 0) out.push([cap(x.labels[t] || t), c[t] == null ? 0 : c[t]]); });
    out.push(["Models, types, colours & features", LOOKUPS.reduce(function (a, t) { return a + (c[t] || 0); }, 0)]);
    return out;
  }
  function Backup(p) {
    var d = useLoad("/api/admin/backup/summary"), st = useLoad("/api/admin/settings");
    var s1 = useState(false), dl = s1[0], setDl = s1[1], s2 = useState(false), em = s2[0], setEm = s2[1], s3 = useState(null), file = s3[0], setFile = s3[1];
    var s4 = useState(""), word = s4[0], setWord = s4[1], s5 = useState(false), rb = s5[0], setRb = s5[1], s6 = useState(null), pt = s6[0], setPt = s6[1];
    var every = st.data && st.data.values ? (st.data.values.backupEvery || "") : "";
    function download() {
      setDl(true);
      api.authFor("/api/admin/backup/download").then(function (t) { return fetch("/api/admin/backup/download", { headers: { Authorization: "Bearer " + t } }); })
        .then(function (r) { if (!r.ok) throw new Error("Could not make the backup (" + r.status + ")"); var name = (/filename="([^"]+)"/.exec(r.headers.get("Content-Disposition") || "") || [])[1] || "direct-auto-backup.json"; return r.blob().then(function (b) { return [b, name]; }); })
        .then(function (x) { var a = document.createElement("a"); a.href = URL.createObjectURL(x[0]); a.download = x[1]; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); setDl(false); p.say("Backup saved to your device."); },
          function (e) { setDl(false); p.say(e.message, "danger"); });
    }
    function setEvery(e) { var v = e.target.value; api.put("/api/admin/settings", { backupEvery: v }).then(function (r) { st.set(r); p.say(v ? "Automatic backup is on." : "Automatic backup is off."); }, function (x) { p.say(x.message, "danger"); }); }
    function mailNow() { setEm(true); api.post("/api/admin/backup/email-now", {}).then(function (r) { setEm(false); d.reload(); p.say(r.tooBig ? "Sent, but the file was too big to attach. Use Download instead." : "Backup emailed to " + (r.to || []).join(", ")); }, function (x) { setEm(false); p.say(x.message, "danger"); }); }
    function done(r) { setRb(false); setPt(null); setFile(null); setWord(""); d.reload(); p.reloadL(); p.changed(); p.say("Restored. A restore point of the data before this was saved, so you can undo."); }
    function restoreFile() {
      setRb(true); var fd = new FormData(); fd.append("confirm", word.trim()); fd.append("file", file);
      api.authFor("/api/admin/backup/restore").then(function (t) { return fetch("/api/admin/backup/restore", { method: "POST", headers: { Authorization: "Bearer " + t }, body: fd }); })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Restore failed"); return j; }); })
        .then(done, function (e) { setRb(false); p.say(e.message, "danger"); });
    }
    function restorePoint() {
      setRb(true);
      api.post("/api/admin/backup/points/" + pt.id + "/restore", { confirm: word.trim() }).then(done, function (e) { setRb(false); p.say(e.message, "danger"); });
    }
    var x = d.data;
    return h(Frag, null,
      d.error ? h(Err, { text: d.error }) : null,
      h(Card, { title: "Your data is safe when the site is updated", text: "Updating or redeploying the website never deletes anything. The numbers below are counted live from your database. Photos are stored in Firebase." },
        !x ? h("p", { className: "ad-muted ad-small" }, "Loading…") :
          h("div", { className: "ad-bk__counts" }, tiles(x).map(function (t) { return h("div", { key: t[0], className: "ad-bk__n" }, h("b", null, t[1]), h("span", { className: "ad-small ad-muted" }, t[0])); }))),
      h(Card, { title: "Download a backup", text: "One file with the vehicles, brands, reviews, settings, customers, inquiries and admins. Keep it somewhere safe, like Google Drive." },
        h("div", { className: "ad-row" }, h(A.Button, { icon: "download", loading: dl, onClick: download }, "Download backup"))),
      h(Card, { title: "Automatic backup by email", text: "We email the backup file to the owner addresses so you always have a recent copy." },
        x && !x.emailReady ? h("p", { className: "ad-small ad-muted" }, "Email is not connected yet, so this is switched off. See docs/email/SETUP.md.") : null,
        h("div", { className: "ad-row ad-bk__mail" },
          h(A.SelectField, { label: "How often", options: [{ value: "", label: "Off" }, { value: "daily", label: "Every day" }, { value: "weekly", label: "Every week" }], value: every, disabled: !(x && x.emailReady), onChange: setEvery }),
          h(A.Button, { variant: "secondary", icon: "mail", loading: em, disabled: !(x && x.emailReady), onClick: mailNow }, "Email me a backup now")),
        x && x.lastEmailed ? h("p", { className: "ad-small ad-muted" }, "Last emailed: " + ago(x.lastEmailed)) : null),
      h(Card, { title: "Restore from a file", text: "Replaces everything on the website with the contents of a backup file. Your current data is saved as a restore point first." },
        h("label", { className: "ad-bk__file" }, h(A.Icon, { name: "upload", size: 18 }), h("span", null, file ? file.name : "Choose a backup file (.json)"), h("input", { type: "file", accept: "application/json,.json", "aria-label": "Backup file", onChange: function (e) { setFile(e.target.files[0] || null); } })),
        file ? h("div", { className: "ad-row ad-bk__mail" }, h(A.TextField, { label: "Type RESTORE to confirm", value: word, onChange: function (e) { setWord(e.target.value); } }),
          h(A.Button, { variant: "danger", icon: "upload", loading: rb, disabled: word.trim() !== "RESTORE", onClick: restoreFile }, "Restore")) : null),
      h(Card, { title: "Restore points", text: "Safety copies made automatically before a restore, and by the schedule. The newest " + (x ? x.keep : 7) + " are kept. Use one to go back." },
        !x ? null : !x.points.length ? h("p", { className: "ad-small ad-muted" }, "None yet.") :
          h("ul", { className: "ad-bk__pts" }, x.points.map(function (r) {
            return h("li", { key: r.id }, h("span", null, h("b", null, r.kind === "auto" ? "Scheduled backup" : "Before a restore"), h("span", { className: "ad-small ad-muted" }, " · " + new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · " + ((r.counts && r.counts.vehicle) || 0) + " vehicles")),
              h(A.Button, { variant: "secondary", size: "s", icon: "clock", onClick: function () { setWord(""); setPt(r); } }, "Go back to this"));
          }))),
      pt ? h(Modal, { title: "Go back to this restore point?", onClose: function () { setPt(null); } },
        h("p", { className: "ad-muted" }, "This replaces the current data. The current data is saved as a new restore point first. Type RESTORE to continue."),
        h(A.TextField, { label: "Type RESTORE", value: word, onChange: function (e) { setWord(e.target.value); } }),
        h("div", { className: "ad-row ad-row--end" }, h(A.Button, { variant: "ghost", onClick: function () { setPt(null); } }, "Cancel"), h(A.Button, { variant: "danger", loading: rb, disabled: word.trim() !== "RESTORE", onClick: restorePoint }, "Restore"))) : null);
  }

  /* ------------------------------------------------------------ overview */
  function greet() { var h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }
  function Chip(p) { return h("button", { type: "button", className: cx("ad-ovchip", p.on && "is-on"), onClick: p.onClick }, h("span", { className: "ad-ovchip__dot", "aria-hidden": true }), h("span", null, h("small", null, p.label), p.value)); }
  function RecentList(p) {
    var d = useLoad(p.url);
    var rows = (d.data || []).slice(0, 5);
    return h("section", { className: "ad-card ad-recent" },
      h("div", { className: "ad-row ad-row--between" }, h("h3", { className: "ad-h3" }, p.title), h(A.Button, { variant: "ghost", size: "s", iconRight: "arrow-right", onClick: function () { p.go(p.mod); } }, "See all")),
      d.error ? h(Err, { text: d.error }) : !d.data ? h("p", { className: "ad-muted ad-small" }, "Loading…") : !rows.length ? h("p", { className: "ad-muted ad-small" }, p.empty) :
        h("ul", { className: "ad-recent__list" }, rows.map(function (r) {
          return h("li", { key: r.id }, h("button", { type: "button", onClick: function () { p.go(p.mod); } },
            h("span", { className: "ad-avatar" }, (r.name || "?").slice(0, 2)),
            h("span", { className: "ad-recent__t" }, h("b", null, r.name || "Customer"), h("span", { className: "ad-small ad-muted" }, (r.kind || p.kind) + " · " + day(r.created_at))),
            r.status === 0 ? h(A.Badge, { tone: "accent" }, "New") : h("span", { className: "ad-small ad-muted" }, "Handled")));
        })));
  }
  var DIRECTORY = [
    ["Cars and catalogue", "car", [["vehicles", "Vehicles", "Add, edit, price, photos, status"], ["manufacturers", "Brands", "Names and logos"], ["models", "Models", "Models for each brand"], ["types", "Body types", "Sedan, SUV, van…"], ["colours", "Colours", "Colour list"], ["features", "Features", "Options such as sunroof"]]],
    ["Customers", "users", [["inquiries", "Inquiries", "Messages and stock quotes"], ["requests", "Auction requests", "Track each import"], ["customers", "Customers", "Accounts"], ["admins", "Admins", "Who can open the admin"], ["newsletters", "Newsletter", "Subscribers"]]],
    ["Website content", "layers", [["home", "Home page", "Sections and wording"], ["testimonials", "Testimonials", "Customer reviews"], ["buy", "How to buy", "Steps and deposit answer"], ["about", "About us", "Values and banner"], ["contact", "Contact & locations", "Showrooms and offices"], ["glossary", "Vocabulary", "Import terms"]]],
    ["Look and feel", "palette", [["appearance", "Colours & fonts", "Themes, own colours, font"], ["seasons", "Seasons", "Christmas, Easter, Deepavali…"], ["site", "Site details", "Phone, WhatsApp, address, SEO"]]],
    ["Safety", "lock", [["backup", "Backup & restore", "Download, email, restore"]]]
  ];
  function Overview(p) {
    var d = useLoad("/api/admin/stats");
    var x = d.data, site = A.site || {}, season = A.seasonState(site), name = (p.user && (p.user.name || p.user.email) || "there").split("@")[0];
    var font = A.fonts[site.fontTheme] ? A.fonts[site.fontTheme].name : "Standard";
    var theme = site.theme && A.themes[site.theme] ? A.themes[site.theme].name : site.theme === "custom" ? "Your own colours" : "Forest";
    var kpis = x ? [["car", "On the website", x.published, "of " + x.vehicles + " vehicles", "vehicles"], ["check", "Ready to drive", x.in_stock, "available now", "vehicles"], ["users", "Customers", x.customers, "registered", "customers"], ["mail", "Subscribers", x.subscribers, "newsletter", "newsletters"]] : [];
    var attn = x ? [
      ["doc", x.new_inquiries, "new inquiries", x.new_inquiries ? "Waiting for a reply" : "All caught up", "inquiries", x.new_inquiries > 0],
      ["gavel", x.open_requests, "open auction requests", x.open_requests ? "Need bidding or an update" : "Nothing open", "requests", x.open_requests > 0],
      ["ship", x.in_transit, "cars on the way", x.in_transit ? "Shipping from Japan" : "None in transit", "vehicles", false]] : [];
    return h(Frag, null,
      h("section", { className: "ad-ovhero" },
        h("div", { className: "ad-ovhero__t" }, h("div", { className: "ad-label" }, new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })), h("h3", null, greet() + ", " + name), h("p", null, "Here’s how the business looks today. Everything on the website can be changed from this admin, no developer needed.")),
        h("div", { className: "ad-row ad-ovhero__a" }, h(A.Button, { variant: "secondary", icon: "globe", onClick: p.exit }, "View website"), h(A.Button, { icon: "plus", onClick: function () { p.go("vehicles"); } }, "Add a vehicle"))),
      d.error ? h(Err, { text: d.error }) : null,
      h("div", { className: "ad-attn" }, !x && !d.error ? [0, 1, 2].map(function (i) { return h("div", { key: i, className: "ad-attn__c is-load" }); }) : attn.map(function (c) {
        return h("button", { key: c[2], type: "button", className: cx("ad-attn__c", c[5] && "is-hot"), onClick: function () { p.go(c[4]); } },
          h("span", { className: "ad-attn__ic" }, h(A.Icon, { name: c[0], size: 22 })), h("span", { className: "ad-attn__n" }, c[1]), h("span", { className: "ad-attn__l" }, c[2]), h("span", { className: "ad-small" }, c[3]));
      })),
      h("div", { className: "ad-kpirow" }, kpis.map(function (c) {
        return h("button", { key: c[1], type: "button", className: "ad-kpi2", onClick: function () { p.go(c[4]); } }, h("span", { className: "ad-kpi2__ic" }, h(A.Icon, { name: c[0], size: 18 })), h("b", null, c[2]), h("span", null, c[1]), h("small", { className: "ad-muted" }, c[3]));
      })),
      h("div", { className: "ad-ov2" },
        h(RecentList, { title: "Latest inquiries", url: "/api/admin/inquiries", mod: "inquiries", kind: "Inquiry", empty: "No inquiries yet.", go: p.go }),
        h(RecentList, { title: "Latest auction requests", url: "/api/admin/live-inquiries", mod: "requests", kind: "Auction request", empty: "No auction requests yet.", go: p.go })),
      h(Card, { title: "Website at a glance", text: "What visitors see right now. Click any item to change it." },
        h("div", { className: "ad-ovchips" },
          h(Chip, { label: "Colours", value: theme, on: true, onClick: function () { p.go("appearance"); } }), h(Chip, { label: "Font", value: font, on: true, onClick: function () { p.go("appearance"); } }),
          h(Chip, { label: "Season", value: season ? season.def.name + " is on" : "None", on: !!season, onClick: function () { p.go("seasons"); } }),
          h(Chip, { label: "WhatsApp button", value: site.showWhatsapp === false ? "Hidden" : "Shown", on: site.showWhatsapp !== false, onClick: function () { p.go("site"); } }),
          h(Chip, { label: "Email alerts", value: CAPS.email.enabled ? "On" : "Off", on: CAPS.email.enabled, onClick: function () { p.go("inquiries"); } }),
          h(Chip, { label: "Reviews", value: A.on("showReviews") ? "Shown" : "Hidden", on: A.on("showReviews"), onClick: function () { p.go("home"); } }))),
      h("div", { className: "ad-dir" },
        h("div", { className: "ad-card__h" }, h("h3", { className: "ad-h3" }, "Everything you can edit"), h("p", { className: "ad-small ad-muted" }, "Pick what you want to change.")),
        h("div", { className: "ad-dir__grid" }, DIRECTORY.map(function (g) {
          return h("section", { key: g[0], className: "ad-card ad-dir__g" }, h("h4", null, h("span", { className: "ad-dir__ic" }, h(A.Icon, { name: g[1], size: 18 })), g[0]),
            h("ul", null, g[2].map(function (it) { return h("li", { key: it[0] }, h("button", { type: "button", onClick: function () { p.go(it[0]); } }, h("b", null, it[1]), h("span", { className: "ad-small ad-muted" }, it[2]), h(A.Icon, { name: "chevron-right", size: 16 }))); })));
        }))));
  }

  /* ------------------------------------------------------------ "find what to edit" search */
  var FIND = [
    ["vehicles", "Vehicles", "car cars price photo photos sales status label badge ex stock new arrival mileage year sold"],
    ["manufacturers", "Brands", "brand brands logo toyota honda make left bar"], ["models", "Models", "model models"], ["types", "Body types", "body type sedan suv van hatchback"],
    ["colours", "Colours list", "car colour color list"], ["features", "Features", "feature options sunroof"],
    ["inquiries", "Inquiries", "inquiry inquiries messages quote email alerts"], ["requests", "Auction requests", "auction request bid track stage"],
    ["customers", "Customers", "customer accounts users"], ["admins", "Admins", "admin admins add email access sign in"], ["newsletters", "Newsletter", "newsletter subscribers"],
    ["home", "Home page", "home hero search bar section heading text wording show hide live auction ready to drive cta banner"], ["testimonials", "Testimonials", "review reviews testimonial customer says"],
    ["buy", "How to buy", "how to buy steps deposit"], ["about", "About us", "about us values banner"], ["contact", "Contact & locations", "contact showroom office location map"],
    ["glossary", "Vocabulary", "vocabulary glossary terms"], ["appearance", "Colours & fonts", "colour color theme font logo style dark light"],
    ["seasons", "Seasons", "season christmas easter deepavali snow santa hat"], ["site", "Site details", "phone whatsapp address footer header seo social instagram facebook hours logo"],
    ["backup", "Backup & restore", "backup restore download data safe"]
  ];
  // Every editable text on the website: [key, label, page, section, built-in wording].
  var SET_TEXT = [
    ["phone", "Phone", "site", "Contact details"], ["email", "Email", "site", "Contact details"], ["whatsapp", "WhatsApp number", "site", "Contact details"],
    ["hours", "Opening hours", "site", "Contact details"], ["address", "Address / locations (top bar)", "site", "Contact details"], ["instagram", "Instagram link", "site", "Contact details"],
    ["whatsappMessage", "WhatsApp first message", "site", "WhatsApp button", "Hi Direct Auto, I have a question about importing a car."],
    ["liveAuctionUrl", "Auction viewer link", "site", "Live auction", "https://jpcenter.ru/on?classic"], ["liveAuctionHint", "Notice above the auction viewer", "site", "Live auction"],
    ["seoTitle", "Google title", "site", "Google and link previews", "Japanese auction car imports for Sri Lanka"], ["seoDescription", "Google description", "site", "Google and link previews", "Browse imported cars in stock or let Direct Auto bid for your exact car at Japanese auctions"],
    ["topbarText", "Top bar message", "site", "Header and footer text", "Japan auction imports for Sri Lanka"], ["footerText", "Footer description", "site", "Header and footer text", "Japanese auction imports for Sri Lanka"],
    ["auctionTitle", "Live auction heading", "home", "Live auction section", "Watch Japan auctions live"], ["auctionLead", "Live auction sub-heading", "home", "Live auction section", "Browse live lots from Japanese auction houses without leaving Direct Auto."],
    ["reviewsTitle", "Reviews heading", "home", "Reviews section", "What our customers say"], ["ctaTitle", "Banner heading", "home", "Bottom banner", "Looking for one exact car?"],
    ["ctaText", "Banner text", "home", "Bottom banner", "Tell us the model, year and budget. We shortlist lots and send every sheet before bidding."],
    ["depositFaq", "Deposit answer", "buy", "Deposit", "Deposits are 100% refundable."], ["aboutCtaTitle", "About banner heading", "about", "Bottom banner", "Visit us in Malabe or Colombo 07"], ["aboutCtaText", "About banner text", "about", "Bottom banner", "See landed stock in person, or sit down with our LC desk."]
  ];
  var SET_LISTS = [
    ["buySteps", "buy", "Buying steps", [["t", "Title"], ["d", "Time"], ["body", "Text"]], "t"], ["aboutValues", "about", "Our values", [["title", "Title"], ["text", "Text"]], "title"],
    ["locationsList", "contact", "Showrooms and offices", [["name", "Name"], ["text", "Text"]], "name"], ["glossaryItems", "glossary", "Vocabulary", [["term", "Term"], ["def", "Meaning"], ["example", "Example"]], "term"],
    ["auctionPoints", "home", "Live auction points", [["title", "Title"], ["text", "Text"]], "title"]
  ];
  var PAGE_NAME = {}; FIND.forEach(function (x) { PAGE_NAME[x[0]] = x[1]; });
  function textIndex() {
    var site = A.site || {}, out = [];
    SET_TEXT.forEach(function (x) {
      var v = typeof site[x[0]] === "string" && site[x[0]].trim() ? site[x[0]] : (x[4] || "");
      out.push({ mod: x[2], label: x[1], where: PAGE_NAME[x[2]] + " › " + x[3], text: v, need: v });
    });
    SET_LISTS.forEach(function (l) {
      var rows = Array.isArray(site[l[0]]) && site[l[0]].length ? site[l[0]] : ((A.defaults || {})[l[0]] || []);
      rows.forEach(function (r) { l[3].forEach(function (f) { if (r[f[0]]) out.push({ mod: l[1], label: l[2] + " › " + (r[l[4]] || "") + " › " + f[1], where: PAGE_NAME[l[1]] + " › " + l[2], text: String(r[f[0]]), need: String(r[f[0]]) }); }); });
    });
    return out;
  }
  function recordIndex(rec, L) {
    var out = [];
    (L ? rec.vehicles || [] : []).forEach(function (v) { var t = vtitle(v, L); out.push({ mod: "vehicles", label: t, where: "Vehicles › " + "AD-" + String(v.id).padStart(4, "0"), text: [t, v.chassi_id, v.location, v.badge].filter(Boolean).join(" · "), need: t }); });
    (rec.reviews || []).forEach(function (r) { out.push({ mod: "testimonials", label: r.name, where: "Testimonials", text: [r.name, r.role, r.quote].filter(Boolean).join(" · "), need: r.name }); });
    [["manufacturers", "Brands"], ["models", "Models"], ["types", "Body types"], ["colours", "Colours list"], ["features", "Features"]].forEach(function (g) {
      var list = L ? (L[g[0] === "colours" ? "colors" : g[0]] || []) : [];
      list.forEach(function (x) { if (x.name) out.push({ mod: g[0], label: x.name, where: g[1], text: x.name, need: x.name }); });
    });
    return out;
  }
  function markIt(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return text.slice(0, 90);
    var from = Math.max(0, i - 30), to = Math.min(text.length, i + q.length + 50);
    return [from > 0 ? "…" : "", text.slice(from, i), h("mark", { key: "m" }, text.slice(i, i + q.length)), text.slice(i + q.length, to), to < text.length ? "…" : ""];
  }
  // After the page opens, scroll to the field that holds this text and flash it.
  function locate(need) {
    var n = String(need || "").trim().toLowerCase().slice(0, 80), tries = 0;
    if (!n) return;
    (function look() {
      var root = document.querySelector(".ad-admin__body"), el = null;
      if (root) {
        var fields = root.querySelectorAll("input:not([type=file]):not([type=checkbox]):not([type=search]), textarea");
        for (var i = 0; i < fields.length && !el; i++) { if ((fields[i].value || "").toLowerCase().indexOf(n) >= 0 || (!fields[i].value && (fields[i].placeholder || "").toLowerCase().indexOf(n) >= 0)) el = fields[i]; }
        if (!el) { var cells = root.querySelectorAll("td b, td, li b, h3, h4, p, .ad-vcard__t"); for (var j = 0; j < cells.length && !el; j++) { if (cells[j].children.length < 3 && (cells[j].textContent || "").toLowerCase().indexOf(n) >= 0) el = cells[j]; } }
      }
      if (el) {
        var box = el.closest(".ad-field, tr, li, section") || el;
        el.scrollIntoView({ block: "center", behavior: "smooth" }); box.classList.add("ad-flash");
        if (/INPUT|TEXTAREA/.test(el.tagName)) { try { el.focus({ preventScroll: true }); } catch (e) {} }
        setTimeout(function () { box.classList.remove("ad-flash"); }, 3200);
      } else if (++tries < 14) setTimeout(look, 250);
    })();
  }
  function FindBox(p) {
    var s = useState(""), q = s[0], setQ = s[1], r = useState(null), rec = r[0], setRec = r[1];
    var t = q.trim().toLowerCase();
    useEffect(function () {
      if (!t || rec) return;
      Promise.all([api.get("/api/admin/vehicles").catch(function () { return []; }), api.get("/api/admin/testimonials").catch(function () { return []; })]).then(function (x) { setRec({ vehicles: x[0], reviews: x[1] }); });
    }, [!!t]);
    var content = [], pages = [];
    if (t) {
      content = textIndex().concat(recordIndex(rec || {}, p.L)).filter(function (x) { return (x.label + " " + x.text).toLowerCase().indexOf(t) >= 0; }).slice(0, 8);
      pages = FIND.filter(function (x) { return (x[1] + " " + x[2]).toLowerCase().indexOf(t) >= 0; }).slice(0, 4);
    }
    function open(x, need) { setQ(""); p.go(x.mod || x[0]); if (need) locate(need); }
    var first = content[0] ? function () { open(content[0], content[0].need); } : pages[0] ? function () { open(pages[0]); } : null;
    return h("div", { className: "ad-find" },
      h("span", { className: "ad-find__ic", "aria-hidden": true }, h(A.Icon, { name: "search", size: 16 })),
      h("input", { type: "search", className: "ad-find__in", placeholder: "Find what to edit…", "aria-label": "Find what to edit", value: q, onChange: function (e) { setQ(e.target.value); },
        onKeyDown: function (e) { if (e.key === "Enter" && first) first(); if (e.key === "Escape") setQ(""); } }),
      t ? h("div", { className: "ad-find__list", role: "listbox" },
        content.length ? h("div", { className: "ad-label ad-find__h" }, "Found on your website") : null,
        content.map(function (x, i) { return h("button", { key: "c" + i, type: "button", className: "ad-find__hit", onClick: function () { open(x, x.need); } }, h("span", { className: "ad-find__t" }, x.label), h("span", { className: "ad-find__s" }, markIt(x.text, t)), h("span", { className: "ad-find__w" }, "Edit in: " + x.where)); }),
        pages.length ? h("div", { className: "ad-label ad-find__h" }, "Pages") : null,
        pages.map(function (x) { return h("button", { key: "p" + x[0], type: "button", className: "ad-find__hit ad-find__hit--p", onClick: function () { open(x); } }, h("span", { className: "ad-find__t" }, x[1]), h(A.Icon, { name: "chevron-right", size: 14 })); }),
        !content.length && !pages.length ? h("p", { className: "ad-small ad-muted ad-find__none" }, rec ? "Nothing found. Try another word." : "Searching…") : null) : null);
  }

  /* ------------------------------------------------------------ console shell */
  var NAV = [
    ["Start", [["overview", "home", "Overview"]]],
    ["Inventory", [["vehicles", "car", "Vehicles"], ["manufacturers", "tag", "Brands"], ["models", "layers", "Models"], ["types", "grid", "Body types"], ["colours", "palette", "Colours"], ["features", "check", "Features"]]],
    ["Customers", [["inquiries", "doc", "Inquiries"], ["requests", "send", "Auction requests"], ["customers", "users", "Customers"], ["admins", "lock", "Admins"], ["newsletters", "mail", "Newsletter"]]],
    ["Pages", [["buy", "ship", "How to buy"], ["about", "users", "About us"], ["contact", "pin", "Contact & locations"], ["glossary", "list", "Vocabulary"]]],
    ["Website", [["home", "layers", "Home page"], ["testimonials", "star", "Testimonials"], ["seasons", "bell", "Seasons"], ["site", "settings", "Site details"], ["appearance", "palette", "Colours & fonts"]]],
    ["Safety", [["backup", "lock", "Backup & restore"]]]
  ];
  var BLURB = {
    overview: "A quick look at the business.", backup: "Download everything, get backups by email, or restore. Updates to the site never delete your data.", home: "Turn home page sections on or off and change their wording.", testimonials: "Customer reviews on the home page.",
    admins: "Who can open this admin. Add an email here, no Firebase needed.", buy: "The five buying steps and the deposit answer.", about: "The About us page.", contact: "Showrooms and offices on the Contact page.", glossary: "The import terms explained on the Vocabulary page.",
    seasons: "Christmas snow, Santa hats and other festive looks for the whole website.", site: "Phone, WhatsApp, address, links and header/footer text.", appearance: "Choose the colours and font of the whole website."
  };
  function AdminTheme() {
    var s = useState(document.documentElement.getAttribute("data-theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")), t = s[0], setT = s[1];
    function flip() { var n = t === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem("ad-theme", JSON.stringify(n)); } catch (e) {} setT(n); }
    return h(A.Button, { variant: "ghost", size: "s", icon: t === "dark" ? "eye" : "eye-off", onClick: flip, "aria-label": "Switch to " + (t === "dark" ? "light" : "dark") + " mode" }, t === "dark" ? "Light mode" : "Dark mode");
  }
  function Console(p) {
    var s = useState("overview"), mod = s[0], setMod = s[1];
    var n = useState(null), note = n[0], setNote = n[1];
    var nv = useState(false), navOpen = nv[0], setNavOpen = nv[1];
    var l = useLoad("/api/admin/stats");
    var lk = useState(null), L = lk[0], setL = lk[1], ver = useState(0), lv = ver[0], setLv = ver[1];
    useEffect(function () {
      Promise.all(["types", "manufacturers", "models", "colors", "features"].map(function (k) { return api.get("/api/admin/taxonomy/" + k); }).concat([api.get("/api/locations"), api.get("/api/admin/me")]))
        .then(function (r) { CAPS.uploads = !!r[6].uploads; CAPS.sampleImages = !!r[6].sampleImages; CAPS.email = r[6].email || CAPS.email; setL({ types: r[0], manufacturers: r[1], models: r[2], colors: r[3], features: r[4], locations: r[5] }); }, function (e) { setNote({ text: e.message, tone: "danger" }); });
    }, [lv]);
    useEffect(function () { if (!note) return; var t = setTimeout(function () { setNote(null); }, note.tone === "danger" ? 7000 : 2600); return function () { clearTimeout(t); }; }, [note]);
    useEffect(function () { window.scrollTo(0, 0); }, [mod]);
    function say(text, tone) { setNote({ text: text, tone: tone || "ok" }); }
    function go(m) { setMod(m); setNavOpen(false); }
    var label = NAV.reduce(function (a, g) { return a.concat(g[1]); }, []).filter(function (x) { return x[0] === mod; })[0];
    var group = NAV.filter(function (g) { return g[1].some(function (x) { return x[0] === mod; }); })[0][0];
    var common = { user: p.user, exit: p.onExit, say: say, changed: p.onDataChanged || function () {}, L: L, reloadL: function () { setLv(lv + 1); }, refreshStats: l.reload, go: go };
    var body = mod === "overview" ? h(Overview, common) : mod === "appearance" ? h(Appearance, common) : mod === "site" ? h(SiteDetails, common) : mod === "home" ? h(HomeContent, common) : mod === "seasons" ? h(Seasons, common) : mod === "admins" ? h(Admins, common) : mod === "backup" ? h(Backup, common) : mod === "buy" ? h(BuyPage, common) : mod === "about" ? h(AboutPage, common) : mod === "contact" ? h(ContactPage, common) : mod === "glossary" ? h(GlossaryPage, common) : mod === "testimonials" ? h(Testimonials, common) :
      !L ? h("p", { className: "ad-muted" }, "Loading…") :
      mod === "vehicles" ? h(Vehicles, common) : TAX[mod] ? h(Taxonomy, Object.assign({ mod: mod, key: mod }, common)) :
      mod === "inquiries" || mod === "requests" ? h(Tracking, Object.assign({ mod: mod, key: mod }, common)) :
      mod === "customers" ? h(Customers, common) : h(Newsletters, common);
    var newInq = l.data ? l.data.new_inquiries : 0;
    return h("div", { className: cx("ad-admin", navOpen && "is-navopen") },
      h("aside", { className: "ad-admin__nav", "aria-label": "Admin menu" }, h("div", { className: "ad-admin__navin" },
        h("div", { className: "ad-admin__brand" }, h(A.Logo, { size: 18, inverse: true }), h("span", { className: "ad-admin__tag" }, "Admin")),
        NAV.map(function (g) {
          return h("div", { key: g[0], className: "ad-admin__group" }, h("div", { className: "ad-label" }, g[0]), g[1].map(function (x) {
            return h("button", { key: x[0], type: "button", className: cx("ad-admin__link", mod === x[0] && "is-on"), "aria-current": mod === x[0] ? "page" : undefined, onClick: function () { go(x[0]); } },
              h(A.Icon, { name: x[1], size: 18 }), x[2], x[0] === "inquiries" && newInq ? h("span", { className: "ad-admin__n" }, newInq) : null);
          }));
        }),
        h("div", { className: "ad-admin__group ad-admin__foot" },
          h("button", { type: "button", className: "ad-admin__link", onClick: p.onExit }, h(A.Icon, { name: "globe", size: 18 }), "View website"),
          h("button", { type: "button", className: "ad-admin__link", onClick: p.onSignOut }, h(A.Icon, { name: "logout", size: 18 }), "Sign out")))),
      navOpen ? h("div", { className: "ad-admin__scrim", onClick: function () { setNavOpen(false); } }) : null,
      h("div", { className: "ad-admin__main" },
        h("header", { className: "ad-admin__bar" },
          h("button", { type: "button", className: "ad-admin__burger", "aria-label": "Open menu", "aria-expanded": navOpen, onClick: function () { setNavOpen(!navOpen); } }, h(A.Icon, { name: "menu", size: 22 })),
          h("div", { className: "ad-admin__title" }, h("div", { className: "ad-label" }, group), h("h2", { className: "ad-h1" }, label[2])),
          h("div", { className: "ad-row ad-admin__tools" }, h(FindBox, { go: go, L: L }), h(AdminTheme, null), h(A.Button, { variant: "secondary", size: "s", icon: "globe", onClick: p.onExit, className: "ad-hide-sm" }, "View website"),
            h("span", { className: "ad-avatar", title: p.user && p.user.email }, ((p.user && (p.user.name || p.user.email)) || "A").slice(0, 2)))),
        h("div", { className: "ad-admin__body" },
          BLURB[mod] ? h("p", { className: "ad-muted ad-admin__blurb" }, BLURB[mod]) : null,
          note ? h("div", { className: cx("ad-note", note.tone === "danger" && "is-danger"), role: "status" }, h(A.Icon, { name: note.tone === "danger" ? "info" : "check", size: 16 }), note.text) : null,
          body)));
  }

  window.AD_ADMIN = { Console: Console };
})();
