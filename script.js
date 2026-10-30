/* Winny Jute Emporium: behavior
   1) Edit the SETTINGS block when the phone number or address changes.
   2) Everything else works without changes. */

// ---------- SETTINGS: edit these ----------
var SETTINGS = {
  whatsappNumber: "919493590999",        // country code + number, digits only
  phoneDisplay: "+919493590999",       // how the number is shown on the page
  phoneTel: "+919493590999",             // used by the "Call the shop" button
  shopName: "Winny Jute Emporium"
};
// -------------------------------------------

(function () {
  "use strict";

  /* ---------- Picture generator (placeholder bags) ----------
     data-art="color:pattern, color:pattern"
     Colors:   coral, mustard, teal, sky, plum, berry, natural, jute
     Patterns: arcs, dots, leaf, stripes, zigzag, heart, panel, none
     Pouch illustrations removed; only rectangular bag illustrations remain. */
  var COLORS = {
    coral: "#E8574A", mustard: "#F0A500", teal: "#1B8A7A", sky: "#4A8FD6",
    plum: "#7A3B8F", berry: "#C2185B", natural: "#D9C59C", jute: "#CDB07E"
  };
  var NAMES = {
    coral: "Coral", mustard: "Mustard", teal: "Teal", sky: "Sky blue",
    plum: "Plum", berry: "Berry", natural: "Natural", jute: "Jute"
  };

  function pattern(kind, ink) {
    switch (kind) {
      case "arcs":
        return '<g fill="none" stroke="' + ink + '" stroke-width="5"><path d="M30 120A29 29 0 0 1 88 120"/><path d="M39 120A20 20 0 0 1 79 120"/><path d="M48 120A11 11 0 0 1 70 120"/></g>';
      case "dots":
        var d = "";
        [68, 92, 116].forEach(function (y) { [38, 59, 80].forEach(function (x) { d += '<circle cx="' + x + '" cy="' + y + '" r="5"/>'; }); });
        return '<g fill="' + ink + '">' + d + "</g>";
      case "leaf":
        return '<g><path d="M59 122V66" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
          '<path d="M59 112C45 110 41 99 43 91 54 93 59 101 59 112Z" fill="' + ink + '"/><path d="M59 112C73 110 77 99 75 91 64 93 59 101 59 112Z" fill="' + ink + '"/>' +
          '<path d="M59 92C48 90 45 82 47 76 55 78 59 84 59 92Z" fill="' + ink + '"/><path d="M59 92C70 90 73 82 71 76 63 78 59 84 59 92Z" fill="' + ink + '"/>' +
          '<path d="M59 70C52 64 53 56 59 52 65 56 66 64 59 70Z" fill="' + ink + '"/></g>';
      case "stripes":
        var s = "";
        [33, 45, 57, 69, 81].forEach(function (x) { s += '<rect x="' + x + '" y="64" width="6" height="56"/>'; });
        return '<g fill="' + ink + '">' + s + "</g>";
      case "zigzag":
        return '<g fill="none" stroke="' + ink + '" stroke-width="4.5"><path d="M32 76L45.5 64 59 76 72.5 64 86 76"/><path d="M32 96L45.5 84 59 96 72.5 84 86 96"/><path d="M32 116L45.5 104 59 116 72.5 104 86 116"/></g>';
      case "heart":
        return '<path d="M59 118C32 99 34 70 59 83 84 70 86 99 59 118Z" fill="' + ink + '"/>';
      case "panel":
        return '<rect x="31" y="64" width="56" height="58" rx="3" fill="none" stroke="' + ink + '" stroke-width="2" stroke-dasharray="5 4"/>';
      default:
        return "";
    }
  }

  function bag(color, kind) {
    var body = COLORS[color] || COLORS.natural;
    var plain = color === "natural" || color === "jute";
    var side = color === "natural" ? "#C2A877" : color === "jute" ? "#B89A66" : "#F6EFE2";
    var handle = plain ? "#EFE7D2" : "#F6EFE2";
    var ink = plain ? (color === "natural" ? "#7A5A33" : "#6B4B28") : "#FFFFFF";
    var stripes = "";
    if (color === "natural") {
      for (var x = 22; x < 98; x += 8) stripes += '<rect x="' + x + '" y="38" width="3.2" height="104" fill="#CDB68A"/>';
    }
    var label = (NAMES[color] || "Jute") + " jute bag" + (kind && kind !== "none" ? " with a " + (kind === "panel" ? "blank print panel" : kind + " pattern") : "");
    return '<svg viewBox="0 0 124 150" role="img" aria-label="' + label + '">' +
      '<path d="M36 42C36 4 84 4 84 42" fill="none" stroke="' + handle + '" stroke-width="5.5" stroke-linecap="round"/>' +
      '<rect x="16" y="38" width="86" height="104" rx="2" fill="' + body + '"/>' + stripes +
      '<polygon points="102,38 114,32 114,134 102,142" fill="' + side + '"/>' +
      '<rect x="16" y="38" width="86" height="7" fill="#000" fill-opacity="0.12"/>' +
      pattern(kind, ink) + "</svg>";
  }


  function renderArt() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-art]"), function (host) {
      var html = host.getAttribute("data-art").split(",").map(function (raw) {
        var item = raw.trim();
        var inner;
        var parts = item.split(":");
        inner = bag(parts[0].trim(), (parts[1] || "none").trim());
        return '<div class="art-item">' + inner + "</div>";
      }).join("");
      host.innerHTML = html;
    });
  }

  /* ---------- WhatsApp message builder ---------- */
  var form = document.getElementById("quoteForm");
  var occ = document.getElementById("f-occasion");
  var bagSel = document.getElementById("f-bag");
  var qty = document.getElementById("f-qty");
  var dateEl = document.getElementById("f-date");
  var nameEl = document.getElementById("f-name");
  var notes = document.getElementById("f-notes");
  var preview = document.getElementById("preview");
  var send = document.getElementById("sendWa");
  var chipsBox = document.getElementById("qtyChips");
  var status = document.getElementById("copyStatus");
  var QTYS = [50, 100, 200, 500];

  function niceDate(value) {
    if (!value) return "date not fixed yet";
    var p = value.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  function waLink(text) {
    return "https://wa.me/" + SETTINGS.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  function buildMessage() {
    var lines = [
      "Hello " + SETTINGS.shopName + ", I would like a quote.",
      "",
      "Occasion: " + occ.value,
      "Bag type: " + bagSel.value,
      "Quantity: " + (qty.value ? qty.value + " pieces" : "not sure yet"),
      "Needed by: " + niceDate(dateEl.value)
    ];
    if (nameEl.value.trim()) lines.push("Name: " + nameEl.value.trim());
    if (notes.value.trim()) lines.push("Print notes: " + notes.value.trim());
    var msg = lines.join("\n");
    preview.value = msg;
    send.href = waLink(msg);
    Array.prototype.forEach.call(chipsBox.children, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-q") === String(qty.value)));
    });
  }

  function setupForm() {
    chipsBox.innerHTML = QTYS.map(function (q) {
      return '<button type="button" class="chip" data-q="' + q + '" aria-pressed="false">' + q + "</button>";
    }).join("");
    chipsBox.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-q]");
      if (!b) return;
      qty.value = b.getAttribute("data-q");
      buildMessage();
    });
    [occ, bagSel, qty, dateEl, nameEl, notes].forEach(function (el) {
      el.addEventListener("input", buildMessage);
      el.addEventListener("change", buildMessage);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });

    // Quote buttons on the occasion cards fill the form
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-occasion]");
      if (!a) return;
      occ.value = a.getAttribute("data-occasion");
      if (a.getAttribute("data-bag")) bagSel.value = a.getAttribute("data-bag");
      buildMessage();
    });

    // Earliest date = today
    var t = new Date();
    dateEl.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");

    // Copy button with a fallback for browsers that block clipboard access
    document.getElementById("copyMsg").addEventListener("click", function () {
      function fallback() {
        preview.focus();
        preview.select();
        status.textContent = "Copy is blocked here. The message is selected, so press Ctrl+C (or long-press) to copy it.";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(preview.value).then(function () {
          status.textContent = "Message copied. Paste it into WhatsApp.";
        }, fallback);
      } else {
        fallback();
      }
    });

    buildMessage();
  }

  /* ---------- Fill in numbers from SETTINGS ---------- */
  function applySettings() {
    var general = "Hello " + SETTINGS.shopName + ", I saw your website and would like to know more about your gift bags.";
    Array.prototype.forEach.call(document.querySelectorAll("a[data-wa]"), function (a) { a.href = waLink(general); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-phone]"), function (el) { el.textContent = SETTINGS.phoneDisplay; });
    var call = document.getElementById("callLink");
    if (call) call.href = "tel:" + SETTINGS.phoneTel;
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  renderArt();
  applySettings();
  setupForm();
})();
