/*
  Honest Ride Parts - shows your items on any page.

  On a page, put this where you want the items to appear:

      <div data-items="accessories"></div>
      <script src="items.js"></script>

  "accessories" is the category name you choose in the admin page.
  Use data-items="cars" on cars.html, and so on.

  To make the items look exactly like the cards already on your page, add
  data-theme="site":

      <div data-items="accessories" data-theme="site"></div>
*/
(function () {
  // ======= SET THIS ONE LINE (your Worker address, no slash at the end) =======
  var API = "https://hrp-items.fservatjoo.workers.dev";
  // ===========================================================================

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safeUrl(u) {
    try {
      var x = new URL(u);
      return x.protocol === "https:" || x.protocol === "http:" ? x.href : "";
    } catch (e) { return ""; }
  }

  function youtubeId(u) {
    var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/.exec(u || "");
    return m ? m[1] : "";
  }

  var css =
    ".hrp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px;margin:16px 0}" +
    ".hrp-card{border:1px solid rgba(128,128,128,.35);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;background:rgba(128,128,128,.06)}" +
    ".hrp-card img.hrp-pic{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}" +
    ".hrp-video{position:relative;width:100%;aspect-ratio:16/9}" +
    ".hrp-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    ".hrp-body{padding:14px;display:flex;flex-direction:column;gap:8px;flex:1}" +
    ".hrp-body h3{margin:0;font-size:1.05rem}" +
    ".hrp-body p{margin:0;white-space:pre-line;font-size:.95rem;line-height:1.45}" +
    ".hrp-btn{margin-top:auto;align-self:flex-start;display:inline-block;padding:9px 16px;border-radius:8px;background:#e8590c;color:#fff!important;text-decoration:none;font-weight:600}" +
    ".hrp-empty{opacity:.7;padding:10px 0}";

  function addStyle() {
    if (document.getElementById("hrp-items-style")) return;
    var s = document.createElement("style");
    s.id = "hrp-items-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function card(it) {
    var html = '<div class="hrp-card">';
    var vid = youtubeId(it.video);
    if (vid) {
      html += '<div class="hrp-video"><iframe src="https://www.youtube-nocookie.com/embed/' + vid +
        '" title="' + esc(it.title) + '" loading="lazy" allowfullscreen></iframe></div>';
    } else if (it.image) {
      html += '<img class="hrp-pic" loading="lazy" src="' + esc(it.image) + '" alt="' + esc(it.title) + '">';
    }
    html += '<div class="hrp-body"><h3>' + esc(it.title) + '</h3>';
    if (it.description) html += '<p>' + esc(it.description) + '</p>';
    var link = safeUrl(it.link);
    if (link) {
      html += '<a class="hrp-btn" href="' + esc(link) + '" target="_blank" rel="sponsored noopener noreferrer">See it</a>';
    }
    html += '</div></div>';
    return html;
  }

  // Same markup as the cards already on honestrideparts.com pages,
  // so the page's own styles are used.
  function siteCard(it) {
    var html = '<article class="card">';
    var vid = youtubeId(it.video);
    if (vid) {
      html += '<div style="position:relative;width:100%;aspect-ratio:16/9"><iframe src="https://www.youtube-nocookie.com/embed/' + vid +
        '" title="' + esc(it.title) + '" loading="lazy" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>';
    } else if (it.image) {
      html += '<img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy">';
    }
    html += '<div class="body"><h3>' + esc(it.title) + '</h3>';
    if (it.description) html += '<p>' + esc(it.description) + '</p>';
    var link = safeUrl(it.link);
    if (link) {
      html += '<div class="btns"><a class="btn" href="' + esc(link) + '" target="_blank" rel="noopener sponsored">See it</a></div>';
    }
    html += '</div></article>';
    return html;
  }

  function fill(box) {
    var cat = box.getAttribute("data-items") || "";
    var url = API + "/items" + (cat ? "?category=" + encodeURIComponent(cat) : "");
    var site = box.getAttribute("data-theme") === "site";
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (!Array.isArray(items) || !items.length) {
        box.innerHTML = site ? "" : '<div class="hrp-empty">Coming soon.</div>';
        return;
      }
      box.innerHTML = site
        ? '<div class="grid">' + items.map(siteCard).join("") + '</div>'
        : '<div class="hrp-grid">' + items.map(card).join("") + '</div>';
    }).catch(function () {
      box.innerHTML = '<div class="hrp-empty">Could not load items right now.</div>';
    });
  }

  function start() {
    addStyle();
    var boxes = document.querySelectorAll("[data-items]");
    for (var i = 0; i < boxes.length; i++) fill(boxes[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
