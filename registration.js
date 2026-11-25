import { fees, isOpen } from "./data.js";
import { shortDate, timeLabel, escapeText } from "./ui.js";
import { canEditRoster, findEntry, saveEntry } from "./entries.js";

// Drafts belong to this tab and event. Only a later submission creates an entry.
const drafts = new Map();
const blankPlayer = () => ({ name: "", roll: "" });

export const registerLabel = {
  solo: "Register as an individual", pair: "Register a pair", team: "Register a team",
};

function playerLabel(kind, index) {
  if (kind === "team") return index === 0 ? "Player 1 · Captain" : `Player ${index + 1}`;
  if (kind === "pair" && index === 1) return "Your partner";
  return "Your details";
}

function errorsFor(draft, sport, kind) {
  const errors = new Map();
  if (kind === "team" && !draft.team.trim()) errors.set("team", "Enter your team name.");
  const seen = new Map();
  draft.players.forEach((player, index) => {
    if (!player.name.trim()) errors.set(`name-${index}`, "Enter the player’s name.");
    const roll = player.roll.trim().toUpperCase();
    if (!/^\d{2}L-\d{4}$/.test(roll)) {
      errors.set(`roll-${index}`, "Enter a Lahore roll number in the format 24L-0123.");
    } else if (seen.has(roll)) {
      errors.set(`roll-${index}`, `Player ${seen.get(roll) + 1} already has this roll number. Check both players’ details.`);
    } else {
      seen.set(roll, index);
    }
  });
  if (kind === "team" && draft.players.length < sport.min) {
    errors.set("add-player", `Add at least ${sport.min - draft.players.length} more to reach ${sport.min} players.`);
  }
  return errors;
}

function field(id, label, value, limit) {
  return `<div class="entry-field"><label for="${id}">${label}</label>
    <input id="${id}" type="text" required maxlength="${limit}" value="${escapeText(value)}">
    <span class="field-error" id="${id}-error"></span></div>`;
}

export function renderRegistration(main, sport, category, step, query, editing = false) {
  const event = `${sport.id}/${category.id}`;
  const key = event + (editing ? "/edit-roster" : "");
  const base = `#/register/${key}`;
  const stored = findEntry(sport, category);
  const receipt = stored && "#/entries/" + encodeURIComponent(stored.id);
  const eventLink = editing && receipt ? receipt : `#/tournaments/${event}`;
  const kind = category.kind;
  const team = kind === "team";
  const fee = fees[kind];
  if (editing ? !canEditRoster(stored, sport, category) : stored) {
    document.title = "Entry status · UniSports";
    main.innerHTML = `<h1 tabindex="-1">${editing ? "Roster editing unavailable" : "Entry already received"}</h1>
      <p>${editing ? "The team entry must be pending and registration still open. Contact the Student Centre for corrections." : "You have an entry in this category."}</p>
      <a class="back-link" href="${receipt || eventLink}">${receipt ? "View my entry" : "Tournament details"}</a>`;
    return "h1";
  }
  if (!isOpen(sport)) {
    document.title = `Registration closed · ${sport.name} · UniSports`;
    main.innerHTML = `<h1 tabindex="-1">Registration closed</h1>
      <p>The deadline for ${sport.name} has passed.</p><a class="back-link" href="${eventLink}">View tournament</a>`;
    return "h1";
  }
  if (!drafts.has(key)) {
    const count = team ? sport.min : kind === "pair" ? 2 : 1;
    drafts.set(key, editing ? { team: stored.team, players: structuredClone(stored.players), original: stored } :
      { team: "", players: Array.from({ length: count }, blankPlayer) });
  }
  const draft = drafts.get(key);
  const reviewing = step === "review" && errorsFor(draft, sport, kind).size === 0;
  if (step === "review" && !reviewing) history.replaceState(null, "", base);
  document.title = `${reviewing ? "Review entry" : "Registration"} · ${sport.name} · UniSports`;
  const summary = `<aside class="panel entry-summary" aria-label="Event information">
    <header class="panel-heading"><h2>${sport.name}</h2><p>${category.name}</p></header>
    <dl class="detail-list">
      <div><dt>Entry fee</dt><dd><strong>${fee.amount} ${fee.unit}</strong></dd></div>
      ${category.eligibility === "mixed" ? "<div><dt>Pair eligibility</dt><dd>One man and one woman, both enrolled at FAST Lahore.</dd></div>" : ""}
      <div><dt>Deadline</dt><dd>${shortDate.format(new Date(sport.closes))}, ${timeLabel(sport.closes)} Lahore time</dd></div>
      <div><dt>Payment</dt><dd>After submission, pay at the Student Centre and give staff your entry reference.</dd></div>
    </dl></aside>`;
  main.innerHTML = `<a class="back-link" href="${eventLink}">${editing ? "View saved entry" : "Back to " + sport.name}</a>
    <div class="page-heading"><h1 tabindex="-1">${reviewing ? "Review entry" : editing ? "Edit roster" : "Registration details"}</h1>
      <span>${sport.name} · ${category.name}</span></div>
    <ol class="entry-progress" aria-label="Registration progress">
      ${["Details", "Review", "Receipt"].map((name, i) => `<li ${i === Number(reviewing) ? 'aria-current="step"' : ""}>${i + 1}. ${name}</li>`).join("")}
    </ol><div class="entry-layout">${summary}<section class="panel entry-body"></section></div>`;
  const body = main.querySelector(".entry-body");
  if (reviewing) {
    body.innerHTML = `<header class="panel-heading"><h2>${team ? "Team entry" : kind === "pair" ? "Pair entry" : "Individual entry"}</h2>
      <p>${editing ? "Check your changes before saving the roster." : "Submitting creates an entry pending Student Centre verification."}</p></header>
      ${team ? `<div class="review-row"><div><small>Team name</small><strong>${escapeText(draft.team)}</strong></div>
        <a href="${base}?edit=team">Edit team name</a></div>` : ""}
      ${draft.players.map((player, index) => `<div class="review-row">
        <div><small>${playerLabel(kind, index)}</small><strong>${escapeText(player.name.trim())}</strong>
        <span>${escapeText(player.roll.trim().toUpperCase())}</span></div>
        <a href="${base}?edit=roll-${index}" aria-label="Edit details for ${escapeText(player.name.trim())}">Edit details</a>
      </div>`).join("")}
      <div class="entry-actions"><button type="button" class="primary-action" id="save-entry">${editing ? "Save changes" : "Submit entry"}</button>
      ${editing ? '<button type="button" class="text-button" id="cancel-edit">Cancel changes</button>' : ""}
      <span role="status" id="save-status"></span></div>`;
    body.querySelector("#cancel-edit")?.addEventListener("click", () => {
      drafts.delete(key);
      location.hash = receipt;
    });
    const save = body.querySelector("#save-entry");
    const status = body.querySelector("#save-status");
    save.addEventListener("click", async () => {
      if (save.disabled) return;
      save.disabled = true;
      status.textContent = "Saving…";
      try {
        const result = await saveEntry(sport, category, draft, draft.original);
        if (!result.entry) {
          status.textContent = result.message;
          if (result.existing) {
            drafts.delete(key);
            const link = document.createElement("a");
            link.href = "#/entries/" + encodeURIComponent(result.existing.id);
            link.textContent = "View my entry";
            status.append(" ", link);
          }
          return;
        }
        drafts.delete(key);
        if (save.isConnected) location.replace("#/entries/" + encodeURIComponent(result.entry.id) + (editing ? "?updated=1" : ""));
      } catch {
        status.textContent = "Couldn’t save on this browser. Your details are still here.";
        save.textContent = "Try again";
        save.disabled = false;
      }
    });
    return "h1";
  }

  body.innerHTML = `<form class="entry-form" novalidate>
    <header class="panel-heading"><h2>${team ? "Team roster" : kind === "pair" ? "Pair details" : "Participant details"}</h2>
    <p>${team ? `Enter ${sport.min}–${sport.max} players, including the captain.` : kind === "pair" ? "One player enters both partners’ details." : "Enter the details of the player taking part."}
    Use the roll-number format 24L-0123.</p></header>
    ${team ? `<div class="team-field">${field("team", "Team name", draft.team, 80)}</div>` : ""}
    <div class="player-list"></div>
    ${team ? `<div class="roster-controls"><span id="count"></span>
      <button type="button" class="text-button" id="add-player">Add player</button>
      <button type="button" class="text-button" id="undo-remove" hidden>Undo removal</button>
      <span class="field-error" id="add-player-error"></span></div>` : ""}
    <p role="status" class="entry-feedback"></p>
    <div class="entry-actions"><button type="submit" class="primary-action">Continue to review</button>
    <button type="button" class="text-button" id="discard-entry">${editing ? "Cancel changes" : "Discard entry"}</button></div></form>
    <dialog aria-labelledby="discard-title"><h2 id="discard-title">${editing ? "Discard roster changes?" : "Discard this entry?"}</h2>
      <p>${editing ? "Your previously submitted roster will be kept." : `This clears the details entered for ${sport.name} · ${category.name}.`}</p>
      <form method="dialog" class="entry-actions"><button class="primary-action" value="keep" autofocus>Keep editing</button>
      <button class="text-button" value="discard">${editing ? "Discard changes" : "Discard entry"}</button></form></dialog>`;
  const form = body.querySelector(".entry-form");
  const feedback = form.querySelector(".entry-feedback");
  let removed;
  let attempted = false;

  function markErrors() {
    const errors = errorsFor(draft, sport, kind);
    for (const error of form.querySelectorAll(".field-error")) {
      const id = error.id.slice(0, -6);
      const control = document.getElementById(id);
      error.textContent = errors.get(id) || "";
      if (errors.has(id)) {
        control.setAttribute("aria-invalid", "true");
        control.setAttribute("aria-describedby", error.id);
      } else {
        control.removeAttribute("aria-invalid");
        control.removeAttribute("aria-describedby");
      }
    }
    return errors;
  }

  function drawPlayers() {
    form.querySelector(".player-list").innerHTML = draft.players.map((player, index) => `<fieldset class="player-fields">
      <legend>${playerLabel(kind, index)}</legend>
      ${field(`name-${index}`, "Full name", player.name, 100)}
      ${field(`roll-${index}`, "Roll number", player.roll, 20)}
      ${team && index ? `<button type="button" class="text-button" data-remove="${index}" aria-label="Remove player ${index + 1}">Remove</button>` : ""}
    </fieldset>`).join("");
    if (team) {
      form.querySelector("#count").textContent = `${draft.players.length} roster places · maximum ${sport.max}`;
      form.querySelector("#add-player").disabled = draft.players.length >= sport.max;
      form.querySelector("#undo-remove").hidden = !removed;
    }
    if (attempted) markErrors();
  }
  drawPlayers();
  form.addEventListener("input", ({ target }) => {
    if (target.id === "team") draft.team = target.value;
    else {
      const [property, index] = target.id.split("-");
      draft.players[index][property] = target.value;
    }
    if (attempted) { markErrors(); feedback.textContent = ""; }
  });
  form.addEventListener("click", ({ target }) => {
    if (target.id === "add-player" && draft.players.length < sport.max) {
      draft.players.push(blankPlayer());
      removed = undefined;
      drawPlayers();
      document.getElementById(`name-${draft.players.length - 1}`).focus();
      feedback.textContent = "Player added.";
    } else if (target.dataset.remove !== undefined) {
      const index = Number(target.dataset.remove);
      removed = { index, player: draft.players.splice(index, 1)[0] };
      drawPlayers();
      form.querySelector("#undo-remove").focus();
      feedback.textContent = `Player ${index + 1} removed.`;
    } else if (target.id === "undo-remove" && removed) {
      const { index, player } = removed;
      draft.players.splice(index, 0, player);
      removed = undefined;
      drawPlayers();
      document.getElementById(`name-${index}`).focus();
      feedback.textContent = "Player restored.";
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    attempted = true;
    const errors = markErrors();
    if (errors.size) {
      feedback.textContent = "Check the highlighted fields before continuing.";
      document.getElementById(errors.keys().next().value).focus();
      return;
    }
    draft.team = draft.team.trim();
    for (const player of draft.players) {
      player.name = player.name.trim();
      player.roll = player.roll.trim().toUpperCase();
    }
    location.hash = base + "/review";
  });
  const dialog = body.querySelector("dialog");
  form.querySelector("#discard-entry").addEventListener("click", () => {
    dialog.returnValue = "";
    dialog.showModal();
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "discard") {
      drafts.delete(key);
      location.hash = eventLink;
    }
  });
  const edit = query.get("edit");
  if (edit && /^(team|(name|roll)-\d+)$/.test(edit) && document.getElementById(edit)) return "#" + edit;
  return "h1";
}
