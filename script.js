// Website interactions: navigation, tabs, form validation, demo score, and footer year.

// ===== 1. RESPONSIVE MENU =====
// Clicking the ☰ button adds/removes the "open" class. The CSS does the rest.
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", isOpen);
});

// Close the menu after tapping a link (useful on phones)
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

// ===== 2. NAVBAR SHADOW, ACTIVE LINK, BACK-TO-TOP BUTTON =====
const navbar = document.getElementById("navbar");
const topBtn = document.getElementById("topBtn");
const sections = document.querySelectorAll("main section[id]");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
  topBtn.classList.toggle("show", window.scrollY > 500);

  // Find which section is on screen and highlight its menu link
  let current = "home";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.querySelectorAll("a:not(.nav-cta)").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});

topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
// (Smooth scrolling for all # links is done in CSS with: html { scroll-behavior: smooth; })

// ===== 3. ANIMATED NUMBER COUNTERS (dataset cards) =====
function animateCount(el) {
  const target = Number(el.dataset.count);
  const duration = 1200; // milliseconds
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===== 4. SCROLL REVEAL (IntersectionObserver watches what is visible) =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll("[data-count]").forEach(animateCount);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll("#dataset, #performance").forEach((sec) => {
  sec.classList.add("reveal");
  observer.observe(sec);
});

// ===== 5. MODEL INFORMATION TABS =====
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ===== 6. DEMO FORM: VALIDATION =====
const form = document.getElementById("demoForm");
const resultBox = document.getElementById("result");

// Each rule: the input id, the allowed range, and a friendly name
const rules = [
  { id: "age", min: 1, max: 120, label: "Age" },
  { id: "bp", min: 50, max: 250, label: "Blood pressure" },
  { id: "chol", min: 50, max: 700, label: "Cholesterol" },
  { id: "hr", min: 40, max: 230, label: "Maximum heart rate" },
];

function setError(id, message) {
  const input = document.getElementById(id);
  document.getElementById(id + "Err").textContent = message;
  input.closest(".field").classList.toggle("invalid", message !== "");
}

function validateForm() {
  let valid = true;

  // Number fields: must be filled and inside the allowed range
  rules.forEach((r) => {
    const raw = document.getElementById(r.id).value.trim();
    const value = Number(raw);
    if (raw === "") {
      setError(r.id, r.label + " is required.");
      valid = false;
    } else if (value < r.min || value > r.max) {
      setError(r.id, `${r.label} must be between ${r.min} and ${r.max}.`);
      valid = false;
    } else {
      setError(r.id, "");
    }
  });

  // Dropdown fields: must pick an option
  ["sex", "cp"].forEach((id) => {
    if (document.getElementById(id).value === "") {
      setError(id, "Please choose an option.");
      valid = false;
    } else {
      setError(id, "");
    }
  });

  return valid;
}

// ===== 7. DEMO FORM: SAMPLE (NOT REAL ML) LOGIC =====
// This adds simple "risk points". It is NOT a trained model.
// A real Logistic Regression model would use weights learned from data.
function demoScore() {
  const age = Number(document.getElementById("age").value);
  const bp = Number(document.getElementById("bp").value);
  const chol = Number(document.getElementById("chol").value);
  const hr = Number(document.getElementById("hr").value);
  const sex = document.getElementById("sex").value;
  const cp = document.getElementById("cp").value;
  const angina = document.getElementById("angina").checked;

  let points = 0;
  if (age >= 55) points += 2; else if (age >= 45) points += 1;
  if (sex === "male") points += 1;
  if (cp === "typical") points += 2; else if (cp === "atypical") points += 1;
  if (bp >= 140) points += 1;
  if (chol >= 240) points += 1;
  if (hr < 120) points += 1;
  if (angina) points += 2;

  const maxPoints = 10;
  return Math.round((points / maxPoints) * 100); // sample score from 0 to 100
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  if (!validateForm()) {
    const firstBad = form.querySelector(".invalid input, .invalid select");
    if (firstBad) firstBad.focus();
    return;
  }

  const score = demoScore();
  const high = score >= 50;

  resultBox.className = "result show " + (high ? "high" : "low");
  resultBox.innerHTML = `
    <span class="tag">Demonstration output</span>
    <h3>${high ? "Sample logic: higher score" : "Sample logic: lower score"}</h3>
    <p>Demo score: <strong>${score} / 100</strong></p>
    <div class="meter"><div id="meterFill"></div></div>
    <p><strong>This is not a medical prediction.</strong> It comes from simple example rules in JavaScript, not from a trained machine learning model. Do not use it to make medical decisions. Please speak to a qualified doctor for any health concern.</p>
  `;
  // Small delay so the CSS width transition plays
  setTimeout(() => (document.getElementById("meterFill").style.width = score + "%"), 50);
});

// Live clean-up: remove the red error as soon as the user edits a field
form.addEventListener("input", (e) => {
  if (e.target.id && document.getElementById(e.target.id + "Err")) setError(e.target.id, "");
});

// ===== 8. RESET BUTTON =====
document.getElementById("resetBtn").addEventListener("click", () => {
  form.reset();
  [...rules.map((r) => r.id), "sex", "cp"].forEach((id) => setError(id, ""));
  resultBox.className = "result";
  resultBox.innerHTML = '<p class="placeholder">Fill in the form and press <strong>Predict</strong>. The demo result will appear here.</p>';
});

// ===== 9. FOOTER YEAR =====
document.getElementById("year").textContent = new Date().getFullYear();
