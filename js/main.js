// ==========================================================
// Emekpa Prosper — Portfolio scripts (plain JavaScript)
// 1. Mobile menu
// 2. Footer year
// 3. Contact form validation
// ==========================================================

// ---------- 1. Mobile menu ----------
const menuButton = document.querySelector(".menu-btn");
const siteNav = document.getElementById("site-nav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", isOpen);
    menuButton.textContent = isOpen ? "Close" : "Menu";
  });
}

// ---------- 2. Footer year ----------
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- 3. Contact form ----------
const form = document.getElementById("contact-form");

if (form) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const message = form.elements.message;
  const counter = form.querySelector(".counter");
  const status = form.querySelector(".form-status");
  const success = document.querySelector(".form-success");
  const submitButton = form.querySelector('[type="submit"]');

  // Each check returns an error message, or "" if the value is fine
  const checks = {
    name(value) {
      if (value === "") return "Please enter your name.";
      if (value.length < 2) return "Your name must be at least 2 characters.";
      return "";
    },
    email(value) {
      if (value === "") return "Please enter your email address.";
      if (!emailPattern.test(value)) return "That email address doesn't look right.";
      return "";
    },
    reason(value) {
      return value === "" ? "Please choose one option." : "";
    },
    message(value) {
      if (value === "") return "Please write a message.";
      if (value.length < 20) return `Please write at least 20 characters (${20 - value.length} to go).`;
      return "";
    },
  };

  // Show or clear the error for one field. Returns true when the field is valid.
  function validateField(name) {
    const value = form.elements[name].value.trim();
    const error = checks[name](value);
    const field = form.querySelector(`[data-field="${name}"]`);

    field.querySelector(".line-input, .checks").classList.toggle("is-invalid", error !== "");
    field.querySelector(".correction").textContent = error;
    return error === "";
  }

  // Once a field shows an error, re-check it as the user fixes it
  Object.keys(checks).forEach((name) => {
    form.querySelectorAll(`[name="${name}"]`).forEach((input) => {
      const recheck = () => {
        const field = form.querySelector(`[data-field="${name}"]`);
        if (field.querySelector(".is-invalid")) validateField(name);
      };
      input.addEventListener("input", recheck);
      input.addEventListener("change", recheck);
    });
  });

  // Character counter
  const updateCounter = () => {
    counter.textContent = `${message.value.length} / ${message.maxLength}`;
  };
  message.addEventListener("input", updateCounter);
  updateCounter();

  function showSuccess(text) {
    success.querySelector("[data-success-text]").textContent = text;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const invalidFields = Object.keys(checks).filter((name) => !validateField(name));

    if (invalidFields.length > 0) {
      status.textContent = `Please fix ${invalidFields.length} field(s) before sending.`;
      form.querySelector(`[name="${invalidFields[0]}"]`).focus();
      return;
    }
    status.textContent = "";

    // Honeypot: people never see this field, spam bots fill it in
    if (form.elements.website.value) return;

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const reason = form.elements.reason.value;

    // No form service yet: open the visitor's email app with the message filled in
    if (!form.getAttribute("action")) {
      const subject = `[Portfolio] ${reason} from ${name}`;
      const body = `${message.value.trim()}\n\n${name} (${email})`;
      window.location.href =
        `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showSuccess("Your email app should have opened with your message ready. Just press send.");
      return;
    }

    // A Formspree URL is in the form's action: send the message directly
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(response.status);
      showSuccess("Your message has been sent. I'll reply within two days.");
    } catch (error) {
      status.textContent = "Something went wrong. Please email me directly instead.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message →";
    }
  });

  // "Send another message" button
  document.querySelector("[data-reset]").addEventListener("click", () => {
    form.reset();
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    form.querySelectorAll(".correction").forEach((el) => (el.textContent = ""));
    updateCounter();
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
}
