(function () {
  var cfg = window.SITE_CONFIG || {};
  var repo = cfg.repo || "jayusop/Tablarion";
  var src = cfg.sourceRepo || repo;
  var branch = cfg.branch || "main";
  var base = "https://github.com/" + repo;
  var srcBase = "https://github.com/" + src;
  var links = {
    repo:     base,
    source:   srcBase,
    releases: base + "/releases",
    download: base + "/releases/latest/download/" + (cfg.pluginAsset || "Tablarion-macOS.zip"),
    "gm-bank": base + "/releases/latest/download/" + (cfg.bankAsset || "Tablarion-GM.sf2"),
    issues:   base + "/issues",
    license:  base + "/blob/" + branch + "/LICENSE",
    tpl:      base + "/blob/" + branch + "/THIRD_PARTY_LICENSES.txt",
    notices:  srcBase + "/blob/" + branch + "/THIRD_PARTY_NOTICES.md"
  };
  var texts = { source: srcBase, clone: srcBase + ".git", "repo-name": src.split("/")[1] };

  function applyLinks() {
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var href = links[a.getAttribute("data-link")];
      if (href) a.href = href;
    });
    document.querySelectorAll("[data-text]").forEach(function (el) {
      var t = texts[el.getAttribute("data-text")];
      if (t) el.textContent = t;
    });
  }
  applyLinks();

  // ---- language: ?lang=xx in the URL, then the visitor's earlier choice, then the browser language ----
  var root = document.documentElement;
  function setLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-set-lang") === l);
    });
    // the Korean licence guide sits next to the English original
    links.license = base + "/blob/" + branch + "/" + (l === "ko" ? "LICENSE.ko.md" : "LICENSE");
    applyLinks();
    showVersion();
  }
  function pick() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (q) return q.toLowerCase().indexOf("ko") === 0 ? "ko" : "en";
    var saved = null;
    try { saved = localStorage.getItem("tb-lang"); } catch (e) {}
    if (saved === "ko" || saved === "en") return saved;
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("ko") === 0 ? "ko" : "en";
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.getAttribute("data-set-lang");
      try { localStorage.setItem("tb-lang", l); } catch (e) {}
      try { var u = new URL(location.href); u.searchParams.delete("lang"); history.replaceState(null, "", u); } catch (e) {}
      setLang(l);
    });
  });

  // ---- latest release (version label only; download links use fixed asset names) ----
  var release = null;
  function showVersion() {
    var el = document.getElementById("ver");
    if (!el) return;
    var ko = root.getAttribute("data-lang") === "ko";
    if (release) {
      var d = new Date(release.published_at);
      var date = d.toLocaleDateString(ko ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
      el.textContent = (ko ? "최신 버전 " : "Latest ") + release.tag_name + " · " + date;
    } else {
      el.textContent = (ko ? "버전 " : "Version ") + (cfg.fallbackVersion || "");
    }
  }
  setLang(pick());

  if (window.fetch) {
    fetch("https://api.github.com/repos/" + repo + "/releases/latest")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.tag_name) { release = j; showVersion(); } })
      .catch(function () {});
  }

  // ---- copy buttons on code blocks ----
  document.querySelectorAll("pre").forEach(function (pre) {
    var b = document.createElement("button");
    b.className = "copy"; b.type = "button"; b.textContent = "copy";
    b.addEventListener("click", function () {
      var txt = pre.querySelector("code").innerText.split("\n")
        .filter(function (l) { return !/^\s*#/.test(l); }).join("\n").trim();
      navigator.clipboard && navigator.clipboard.writeText(txt).then(function () {
        b.textContent = "copied"; setTimeout(function () { b.textContent = "copy"; }, 1400);
      });
    });
    pre.appendChild(b);
  });
})();
