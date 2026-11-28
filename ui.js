import { icon } from "./graphics.js?v=6";

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

let activeDropdown = null;
let dropdownListenersBound = false;

function closeActiveDropdown(restoreFocus = false) {
  if (!activeDropdown) return;
  const current = activeDropdown;
  activeDropdown = null;
  current.close(restoreFocus);
}

function ensureDropdownListeners() {
  if (dropdownListenersBound) return;
  dropdownListenersBound = true;
  document.addEventListener("pointerdown", event => {
    if (!activeDropdown) return;
    if (!activeDropdown.root.isConnected || !activeDropdown.root.contains(event.target)) {
      closeActiveDropdown(false);
    }
  });
  document.addEventListener("keydown", event => {
    if (!activeDropdown) return;
    if (!activeDropdown.root.isConnected) {
      activeDropdown = null;
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeActiveDropdown(true);
    }
  });
}

export function enhanceSelects(container) {
  ensureDropdownListeners();
  for (const select of container.querySelectorAll("select")) {
    if (select.dataset.enhanced) continue;
    select.dataset.enhanced = "1";

    const label = select.closest("label");
    const root = document.createElement("div");
    root.className = "select-control";
    select.parentNode.insertBefore(root, select);
    root.appendChild(select);

    select.classList.add("select-native");
    select.hidden = true;
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    const listId = `listbox-${select.name || "field"}-${Math.random().toString(36).slice(2, 7)}`;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", listId);

    const labelledBy = select.getAttribute("aria-labelledby");
    if (labelledBy) {
      trigger.setAttribute("aria-labelledby", labelledBy);
    } else if (label) {
      const labelText = [...label.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join(" ");
      if (labelText) trigger.setAttribute("aria-label", labelText);
    }
    trigger.innerHTML = `<span class="select-value"></span>${icon("chevron")}`;

    const menu = document.createElement("ul");
    menu.className = "select-menu";
    menu.id = listId;
    menu.setAttribute("role", "listbox");
    menu.tabIndex = -1;
    menu.hidden = true;
    if (labelledBy) menu.setAttribute("aria-labelledby", labelledBy);
    else if (trigger.hasAttribute("aria-label")) menu.setAttribute("aria-label", trigger.getAttribute("aria-label"));

    const options = [...select.options];
    const items = options.map((opt, index) => {
      const li = document.createElement("li");
      li.className = "select-option";
      li.setAttribute("role", "option");
      li.id = `${listId}-opt-${index}`;
      li.dataset.value = opt.value;
      li.dataset.index = String(index);
      li.innerHTML = `<span>${escapeText(opt.textContent)}</span>${icon("check")}`;
      menu.appendChild(li);
      return li;
    });

    root.append(trigger, menu, select);

    let activeIndex = Math.max(0, select.selectedIndex);

    function setActive(index) {
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, i) => {
        if (i === activeIndex) item.dataset.active = "true";
        else delete item.dataset.active;
      });
      menu.setAttribute("aria-activedescendant", items[activeIndex]?.id || "");
      items[activeIndex]?.scrollIntoView?.({ block: "nearest" });
    }

    function sync() {
      const selected = options[Math.max(0, select.selectedIndex)] || options[0];
      trigger.querySelector(".select-value").textContent = selected ? selected.textContent : "";
      if (select.value) trigger.dataset.filtered = "true";
      else delete trigger.dataset.filtered;
      items.forEach((item, i) => {
        item.setAttribute("aria-selected", String(i === select.selectedIndex));
      });
    }

    function open(startIndex = Math.max(0, select.selectedIndex)) {
      if (activeDropdown && activeDropdown.root !== root) closeActiveDropdown(false);
      menu.hidden = false;
      menu.style.left = "";
      menu.style.right = "";
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth - 8) {
        menu.style.left = "auto";
        menu.style.right = "0";
      }
      trigger.setAttribute("aria-expanded", "true");
      setActive(startIndex);
      activeDropdown = api;
    }

    function close(restoreFocus = false) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      menu.removeAttribute("aria-activedescendant");
      for (const item of items) delete item.dataset.active;
      if (restoreFocus) trigger.focus();
    }

    function commit(index) {
      const opt = options[index];
      if (!opt) return;
      const changed = select.value !== opt.value;
      select.value = opt.value;
      sync();
      closeActiveDropdown(true);
      if (changed) {
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    const api = { root, close };

    trigger.addEventListener("click", event => {
      event.preventDefault();
      if (menu.hidden) open();
      else closeActiveDropdown(false);
    });

    trigger.addEventListener("keydown", event => {
      const isOpen = !menu.hidden;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) open(Math.max(0, select.selectedIndex));
        else setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) open(Math.max(0, select.selectedIndex));
        else setActive(activeIndex - 1);
      } else if (event.key === "Home" && isOpen) {
        event.preventDefault();
        setActive(0);
      } else if (event.key === "End" && isOpen) {
        event.preventDefault();
        setActive(items.length - 1);
      } else if ((event.key === "Enter" || event.key === " ") && isOpen) {
        event.preventDefault();
        commit(activeIndex);
      } else if (event.key === "Tab" && isOpen) {
        closeActiveDropdown(false);
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const ch = event.key.toLowerCase();
        const start = isOpen ? activeIndex + 1 : 0;
        const match = options.findIndex((_, offset) => {
          const idx = (start + offset) % options.length;
          return options[idx].textContent.trim().toLowerCase().startsWith(ch);
        });
        if (match !== -1) {
          if (!isOpen) open(match);
          else setActive(match);
        }
      }
    });

    menu.addEventListener("pointermove", event => {
      const option = event.target.closest(".select-option");
      if (option) setActive(Number(option.dataset.index));
    });

    menu.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const option = event.target.closest(".select-option");
      if (option) commit(Number(option.dataset.index));
    });

    if (label) {
      label.addEventListener("click", event => {
        if (root.contains(event.target)) return;
        event.preventDefault();
        trigger.focus();
        if (menu.hidden) open();
        else closeActiveDropdown(false);
      });
    }

    select.addEventListener("focus", () => trigger.focus());
    select.closest("form")?.addEventListener("reset", () => queueMicrotask(sync));

    sync();
  }
}
