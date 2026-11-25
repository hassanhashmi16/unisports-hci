const timeZone = "Asia/Karachi";
export const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone });
export const longDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone,
});
const time = new Intl.DateTimeFormat("en-PK", {
  hour: "numeric", minute: "2-digit", hour12: true, timeZone,
});
export const timeLabel = value => time.format(new Date(value)).toUpperCase();
export const href = (path, filters) => `#${path}${filters?.size ? `?${filters}` : ""}`;
export const escapeText = value => value.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function shareControl(label) {
  return `<div class="share">
    <button type="button" class="text-button" id="copy-link">Copy ${label} link</button>
    <p id="copy-status" role="status"></p>
    <label id="manual-copy" hidden>${label === "match" ? "Match" : "Event"} link <input readonly type="url"></label>
  </div>`;
}

export function enableSharing(main, path, label) {
  const button = main.querySelector("#copy-link");
  const status = main.querySelector("#copy-status");
  const manual = main.querySelector("#manual-copy");
  button.addEventListener("click", async () => {
    const url = new URL(location.href);
    url.hash = path;
    try {
      await navigator.clipboard.writeText(url.href);
      manual.hidden = true;
      status.textContent = `${label} link copied.`;
    } catch {
      manual.hidden = false;
      const input = manual.querySelector("input");
      input.value = url.href;
      status.textContent = "Select and copy this link.";
      input.focus();
      input.select();
    }
  });
}
