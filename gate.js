(() => {
  "use strict";

  const CFG = {
    passHash: "59b925a8ec28afa47191d0e58f0e62da06c122fbf89bb78570e3645009018ea9",
    storageKey: "abc-order-review-hub-access",
  };

  document.documentElement.classList.add("share-gate-locked");

  const encode = (value) => new TextEncoder().encode(value);
  const toHex = (buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

  const isConfigured = CFG.passHash !== "PUBLICATION_CONFIGURATION_PENDING";
  const isUnlocked = () =>
    isConfigured && sessionStorage.getItem(CFG.storageKey) === CFG.passHash;

  if (isUnlocked()) {
    document.documentElement.classList.remove("share-gate-locked");
    document.documentElement.dataset.shareGate = "open";
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.createElement("div");
    overlay.className = "share-gate";

    if (!isConfigured) {
      overlay.innerHTML = `
        <main class="share-gate__panel" aria-labelledby="share-gate-title">
          <p class="share-gate__eyebrow">ABC Supply + Microsoft</p>
          <h1 id="share-gate-title">Review site is being configured</h1>
          <p>This page is locked until its owner completes access setup.</p>
        </main>`;
    } else {
      overlay.innerHTML = `
        <main class="share-gate__panel" aria-labelledby="share-gate-title">
          <p class="share-gate__eyebrow">ABC Supply + Microsoft</p>
          <h1 id="share-gate-title">Order Review resource center</h1>
          <p>Enter the passphrase shared with you to continue.</p>
          <form class="share-gate__form">
            <label for="share-gate-passphrase">Passphrase</label>
            <input id="share-gate-passphrase" name="passphrase" type="password" autocomplete="current-password" required>
            <button type="submit">Continue</button>
            <p class="share-gate__error" role="alert" hidden>The passphrase did not match. Please try again.</p>
          </form>
        </main>`;
    }

    const style = document.createElement("style");
    style.textContent = `
      html.share-gate-locked body > :not(.share-gate) { visibility: hidden !important; }
      .share-gate { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 24px; background: var(--cp-bg); color: var(--cp-text); }
      .share-gate__panel { width: min(100%, 440px); padding: 32px; border: 1px solid var(--cp-border); border-radius: 10px; background: var(--cp-surface); box-shadow: var(--cp-shadow); }
      .share-gate__eyebrow { margin: 0 0 8px; color: var(--cp-accent); font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .share-gate h1 { margin: 0 0 12px; font-size: 32px; line-height: 1.1; }
      .share-gate p { line-height: 1.55; }
      .share-gate__form { display: grid; gap: 12px; margin-top: 24px; }
      .share-gate label { font-weight: 700; }
      .share-gate input { min-height: 44px; padding: 10px 12px; border: 1px solid var(--cp-border-strong); border-radius: 8px; background: var(--cp-surface); color: var(--cp-text); font: inherit; }
      .share-gate button { min-height: 44px; padding: 10px 16px; border: 0; border-radius: 8px; background: var(--cp-accent); color: var(--cp-accent-fg); font: inherit; font-weight: 700; cursor: pointer; }
      .share-gate input:focus-visible, .share-gate button:focus-visible { outline: 3px solid var(--cp-link); outline-offset: 3px; }
      .share-gate__error { margin: 0; color: var(--cp-danger); font-weight: 700; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    if (!isConfigured) {
      document.documentElement.dataset.shareGate = "pending";
      return;
    }

    const form = overlay.querySelector("form");
    const input = overlay.querySelector("input");
    const error = overlay.querySelector("[role='alert']");
    input.focus();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const digest = await crypto.subtle.digest("SHA-256", encode(input.value));
      if (toHex(digest) !== CFG.passHash) {
        error.hidden = false;
        input.select();
        return;
      }

      sessionStorage.setItem(CFG.storageKey, CFG.passHash);
      document.documentElement.classList.remove("share-gate-locked");
      document.documentElement.dataset.shareGate = "open";
      overlay.remove();
      style.remove();
    });
  });
})();
