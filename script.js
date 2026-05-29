const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const root = document.documentElement;
const themeButtons = document.querySelectorAll("[data-theme-btn]");
const THEME_KEY = "portfolio-theme";
const VALID_THEMES = new Set(["light", "dark", "cyber"]);
const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/036b2b909bb3489467da6984534bbdc4";

function applyTheme(theme, persist = true) {
  const activeTheme = VALID_THEMES.has(theme) ? theme : "light";
  root.setAttribute("data-theme", activeTheme);

  themeButtons.forEach((btn) => {
    const isActive = btn.dataset.themeBtn === activeTheme;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, activeTheme);
    } catch (_error) {
      // Ignore storage errors (private mode/restricted environments).
    }
  }
}

try {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || "cyber", false);
} catch (_error) {
  applyTheme("cyber", false);
}

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyTheme(btn.dataset.themeBtn || "light");
  });
});

const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");
const canUseCustomCursor =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (cursorDot && cursorRing && canUseCustomCursor) {
  document.body.classList.add("custom-cursor-enabled");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let targetRingScale = 1;
  let targetDotScale = 1;
  let ringScale = 1;
  let dotScale = 1;

  const setVisible = (visible) => {
    cursorDot.classList.toggle("visible", visible);
    cursorRing.classList.toggle("visible", visible);
  };

  const renderCursor = () => {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ringScale += (targetRingScale - ringScale) * 0.16;
    dotScale += (targetDotScale - dotScale) * 0.2;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    cursorDot.style.setProperty("--dot-scale", dotScale.toFixed(3));
    cursorRing.style.setProperty("--ring-scale", ringScale.toFixed(3));

    requestAnimationFrame(renderCursor);
  };

  requestAnimationFrame(renderCursor);

  let overInteractive = false;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    setVisible(true);
  });

  window.addEventListener("mouseleave", () => {
    setVisible(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      setVisible(false);
    }
  });

  window.addEventListener("mousedown", () => {
    targetRingScale = overInteractive ? 1.45 : 0.82;
    targetDotScale = 0.78;
  });

  window.addEventListener("mouseup", () => {
    targetRingScale = overInteractive ? 1.7 : 1;
    targetDotScale = overInteractive ? 1.12 : 1;
  });

  const interactiveItems = document.querySelectorAll(
    "a, button, input, textarea, .btn, .service-card, .work-card, .theme-btn"
  );

  interactiveItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      overInteractive = true;
      targetRingScale = 1.7;
      targetDotScale = 1.12;
    });

    item.addEventListener("mouseleave", () => {
      overInteractive = false;
      targetRingScale = 1;
      targetDotScale = 1;
    });
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const serviceLinks = document.querySelectorAll(".service-link");
const subjectInput = document.getElementById("f-subject");

serviceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!subjectInput) {
      return;
    }

    const subject = link.dataset.subject;
    if (subject) {
      subjectInput.value = subject;
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const allowMotion =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (allowMotion) {
  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach((card) => {
    const strength = Number(card.dataset.tiltStrength || 9);

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotY = (x - 0.5) * strength * 2;
      const rotX = (0.5 - y) * strength * 1.8;

      card.style.setProperty("--spot-x", `${x * 100}%`);
      card.style.setProperty("--spot-y", `${y * 100}%`);
      card.style.transform =
        `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", "50%");
    });
  });
}

async function sendMail(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameEl = document.getElementById("f-name");
  const emailEl = document.getElementById("f-email");
  const subjectEl = document.getElementById("f-subject");
  const messageEl = document.getElementById("f-msg");
  const statusEl = document.getElementById("form-status");
  const sendBtn = document.getElementById("btn-send");

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  if (!name || !email || !subject || !message) {
    statusEl.textContent = "Please fill in all fields before sending.";
    statusEl.className = "form-status error";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    statusEl.textContent = "Please enter a valid email address.";
    statusEl.className = "form-status error";
    return;
  }

  statusEl.textContent = "Sending from browser...";
  statusEl.className = "form-status";
  const previousBtnText = sendBtn.textContent;
  sendBtn.textContent = "Sending...";
  sendBtn.disabled = true;

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        _subject: `Portfolio Lead: ${subject}`,
        _template: "table",
        _captcha: "false"
      })
    });

    const result = await response.json().catch(() => null);
    const submissionSucceeded =
      response.ok && result && (result.success === true || result.success === "true");

    if (submissionSucceeded) {
      statusEl.textContent = "Message sent successfully. I will get back to you soon.";
      statusEl.className = "form-status success";
      nameEl.value = "";
      emailEl.value = "";
      subjectEl.value = "";
      messageEl.value = "";
    } else {
      const apiMessage = typeof result?.message === "string" ? result.message : "";
      const needsActivation = /activation/i.test(apiMessage);
      const needsServer = /web server|browsed as html files|file:\/\//i.test(apiMessage);

      if (needsActivation) {
        statusEl.textContent =
          "Activation pending: open the latest FormSubmit email and click its 'Activate Form' button (do not manually use /confirm URL), then submit again.";
      } else if (needsServer) {
        statusEl.textContent =
          "Run the portfolio through a local web server URL (for example http://127.0.0.1:5500), then submit again.";
      } else if (apiMessage) {
        statusEl.textContent = apiMessage;
      } else {
        statusEl.textContent =
          "Could not send right now. Please try again or email alby.u.tomy@gmail.com directly.";
      }
      statusEl.className = "form-status error";
    }
  } catch (_error) {
    statusEl.textContent =
      "Could not send right now. Please try again or email alby.u.tomy@gmail.com directly.";
    statusEl.className = "form-status error";
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = previousBtnText;
  }
}

window.sendMail = sendMail;
