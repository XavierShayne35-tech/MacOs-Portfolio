(() => {
  "use strict";

  const PROJECTS = [
    {
      id: "Au Jardin",
      title: "Au Jardin",
      desc: "Questo è un sito web progettato per un buisness locale. Si tratta di un bar-gelateria-pasticceria a cui ho creato un sistema di prenotazione tavoli.",
      images: [
        "",
        "",
        "",
      ],
    },
    {
      id: "p2",
      title: "NOT READY FOR NOW",
      desc: "...",
      images: [
        "",
        "",
        "",
      ],
    },
    {
      id: "p3",
      title: "NOT READY FOR NOW",
      desc: "...",
      images: [
        "",
        "",
        "",
      ],
    },
    {
      id: "p4",
      title: "NOT READY FOR NOW",
      desc: "...",
      images: [
        "",
        "",
        "",
      ],
    },
    {
      id: "p5",
      title: "NOT READY FOR NOW",
      desc: "...",
      images: [
        "",
        "",
        "",
      ],
    },
  ];

  const VITE_NASA_API_KEY = mport.meta.env.VITE_NASA_API_KEY;
  const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${VITE_NASA_API_KEY}`;

  const wallpaperEl = document.getElementById("wallpaper");
  const loaderEl = document.getElementById("wallpaperLoader");

  function applyFallbackWallpaper() {
    wallpaperEl.style.backgroundImage =
      "radial-gradient(ellipse at 30% 20%, #1b2a6b 0%, #0b1020 55%, #050816 100%)";
    if (loaderEl) loaderEl.style.display = "none";
  }

  async function loadApodBackground() {
    try {
      const res = await fetch(APOD_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("APOD HTTP " + res.status);
      const data = await res.json();

      if (data && data.media_type === "image" && data.url) {
        const img = new Image();
        img.onload = () => {
          wallpaperEl.style.backgroundImage = `url("${data.url}")`;
          if (loaderEl) loaderEl.style.display = "none";
        };
        img.onerror = applyFallbackWallpaper;
        img.src = data.url;
      } else {
        applyFallbackWallpaper();
      }
    } catch (err) {
      console.warn("APOD non disponibile, uso fallback:", err);
      applyFallbackWallpaper();
    }
  }

  function startClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      el.textContent = `${hh}:${mm}`;
    };
    update();
    setInterval(update, 30_000);
  }

  const ICON_W = 96;
  const ICON_H = 110; 
  const SAFE_PAD = 16;

  function rectsOverlap(a, b) {
    return !(
      a.x + a.w <= b.x ||
      b.x + b.w <= a.x ||
      a.y + a.h <= b.y ||
      b.y + b.h <= a.y
    );
  }

  function placeIconsRandomly() {
    const container = document.getElementById("desktopIcons");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - ICON_W - SAFE_PAD);
    const maxY = Math.max(0, rect.height - ICON_H - SAFE_PAD);
    const placed = [];

    PROJECTS.forEach((p, i) => {
      let x = 0, y = 0, attempts = 0;
      do {
        x = SAFE_PAD + Math.random() * maxX;
        y = SAFE_PAD + Math.random() * maxY;
        attempts++;
        if (attempts > 200) break; // safety
      } while (placed.some((r) => rectsOverlap({ x, y, w: ICON_W, h: ICON_H }, r)));

      placed.push({ x, y, w: ICON_W, h: ICON_H });

      const el = document.createElement("button");
      el.className = "desktop-icon";
      el.type = "button";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.dataset.projectId = p.id;
      el.setAttribute("aria-label", `Apri ${p.title}`);
      el.innerHTML = `
        <span class="icon-image" aria-hidden="true">${p.title.charAt(0).toUpperCase()}</span>
        <span class="icon-label">${p.title}</span>
      `;
      el.addEventListener("click", () => openProjectWindow(p, el));
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        document.querySelectorAll(".desktop-icon.is-selected")
          .forEach((n) => n.classList.remove("is-selected"));
        el.classList.add("is-selected");
      });
      container.appendChild(el);
    });
  }

  const openWindows = new Map(); 
  let zIndexCounter = 1000;

  function bringToFront(win) {
    zIndexCounter += 1;
    win.style.zIndex = String(zIndexCounter);
  }

  function makeDraggable(win, handle) {
    let startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;
    const onDown = (e) => {
      if (e.target.closest(".window-controls")) return;
      dragging = true;
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      const rect = win.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      bringToFront(win);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      const nx = Math.max(0, Math.min(window.innerWidth - 60, originX + dx));
      const ny = Math.max(28, Math.min(window.innerHeight - 60, originY + dy));
      win.style.left = `${nx}px`;
      win.style.top = `${ny}px`;
    };
    const onUp = () => { dragging = false; };

    handle.addEventListener("mousedown", onDown);
    handle.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
  }

  function openProjectWindow(project, iconEl) {
    // Se già aperta, portala in primo piano
    if (openWindows.has(project.id)) {
      const existing = openWindows.get(project.id);
      bringToFront(existing);
      return;
    }

    const tpl = document.getElementById("windowTemplate");
    const node = tpl.content.firstElementChild.cloneNode(true);

    node.querySelector(".project-name").textContent = project.title;
    node.querySelector(".project-desc").textContent = project.desc;
    node.querySelector(".window-title").textContent = project.title;

    const galleryImgs = node.querySelectorAll(".project-gallery img");
    project.images.forEach((src, i) => {
      const img = galleryImgs[i];
      img.src = src;
      img.alt = `Screenshot ${i + 1} di ${project.title}`;
      img.addEventListener("error", () => {
        img.replaceWith(Object.assign(document.createElement("div"), {
          textContent: "Immagine non disponibile",
          style:
            "display:grid;place-items:center;background:#eef;color:#667;font-size:11px;border-radius:8px;border:1px solid #e1e1e3;aspect-ratio:4/3;",
        }));
      });
    });

    node.querySelector('[data-action="close"]').addEventListener("click", () => {
      node.remove();
      openWindows.delete(project.id);
    });
    node.querySelectorAll('[data-action="minimize"], [data-action="maximize"]')
      .forEach((b) => b.setAttribute("disabled", ""));

    makeDraggable(node, node.querySelector(".window-header"));
    node.addEventListener("mousedown", () => bringToFront(node));

    const offset = openWindows.size * 28;
    node.style.top = `${80 + offset}px`;
    node.style.left = `${80 + offset}px`;

    document.body.appendChild(node);
    openWindows.set(project.id, node);
    bringToFront(node);

    if (iconEl) {
      iconEl.classList.add("is-selected");
      setTimeout(() => iconEl.classList.remove("is-selected"), 600);
    }
  }

  function initNotesApp() {
    const app = document.getElementById("notesApp");
    const openBtn = document.getElementById("openNotes");
    if (!app || !openBtn) return;

    app.hidden = true;
    app.setAttribute("aria-hidden", "true");
    app.style.display = "none";
    openBtn.classList.remove("is-open");

    const closeBtn = app.querySelector('[data-action="close-notes"]');
    const items = app.querySelectorAll(".note-item");
    const articles = app.querySelectorAll("[data-note-content]");

    function showNote(name) {
      items.forEach((li) => li.classList.toggle("active", li.dataset.note === name));
      articles.forEach((a) => { a.hidden = a.dataset.noteContent !== name; });
      const sub = app.querySelector("#notesSubtitle");
      const active = app.querySelector(`.note-item[data-note="${name}"] .note-item-title`);
      if (sub && active) sub.textContent = active.textContent;
    }

    items.forEach((li) => {
      li.addEventListener("click", () => showNote(li.dataset.note));
    });

    const open = () => {
      app.hidden = false;
      app.setAttribute("aria-hidden", "false");
      app.style.display = "";
      openBtn.classList.add("is-open");
      bringToFront(app);
    };
    const close = () => {
      app.hidden = true;
      app.setAttribute("aria-hidden", "true");
      app.style.display = "none";
      openBtn.classList.remove("is-open");
    };

    openBtn.addEventListener("click", () => {
      if (app.hidden || app.style.display === "none") open();
      else bringToFront(app);
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    app.addEventListener("mousedown", () => bringToFront(app));

    makeDraggable(app, app.querySelector(".notes-header"));

    showNote("story");
  }

  function init() {
    startClock();
    placeIconsRandomly();
    initNotesApp();
    loadApodBackground();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const c = document.getElementById("desktopIcons");
        if (c) c.innerHTML = "";
        placeIconsRandomly();
      }, 200);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();