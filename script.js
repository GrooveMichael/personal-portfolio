// 1) Lets you attach a profile photo. Stored locally in the browser
//    (localStorage) so it's remembered on this device between visits —
//    nothing is uploaded anywhere.
// 2) A tiny typewriter effect that cycles the role label in the hero.

(function photoUpload() {
  const STORAGE_KEY = "portfolio-photo";

  const frame = document.getElementById("photoFrame");
  const input = document.getElementById("photoInput");
  const img = document.getElementById("photoImg");
  const placeholder = document.getElementById("photoPlaceholder");
  const removeBtn = document.getElementById("photoRemove");

  // This page has no photo frame (only the homepage does) — nothing to do.
  if (!frame) return;

  function showPhoto(dataUrl) {
    img.src = dataUrl;
    img.hidden = false;
    placeholder.hidden = true;
    removeBtn.hidden = false;
  }

  function clearPhoto() {
    img.removeAttribute("src");
    img.hidden = true;
    placeholder.hidden = false;
    removeBtn.hidden = true;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) showPhoto(saved);
  } catch (err) {
    console.warn("Couldn't read saved photo:", err);
  }

  frame.addEventListener("click", () => input.click());
  frame.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      showPhoto(dataUrl);
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch (err) {
        console.warn("Couldn't save photo (it may be too large):", err);
      }
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearPhoto();
    input.value = "";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      /* ignore */
    }
  });
})();

(function roleTypewriter() {
  const el = document.getElementById("role");
  if (!el) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const roles = ["software developer", "JavaScript tinkerer", "problem solver", "builder of small tools"];

  if (prefersReducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      if (charIndex > current.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      if (charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
        setTimeout(tick, 300);
        return;
      }
    }

    el.textContent = current.slice(0, charIndex);
    setTimeout(tick, deleting ? 35 : 55);
  }

  setTimeout(tick, 1800);
})();
