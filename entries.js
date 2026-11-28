import { confirmedEntry, fees, getCategory, getMatch, getSport, isOpen, sports } from "./data.js?v=3";
import { escapeText, timeLabel, shortDate } from "./ui.js?v=3";

import { icon, sportMark } from "./graphics.js?v=3";

const prefix = "unisports.entries.v1/";
const pending = "Pending verification";
const storageKey = (sport, category) => prefix + sport.id + "/" + category.id;
const receiptLink = entry => "#/entries/" + encodeURIComponent(entry.id);

class UnreadableEntry extends Error {}

export function findEntry(sport, category) {
  if (sport.id === confirmedEntry.sport && category.id === confirmedEntry.category) return confirmedEntry;
  const raw = localStorage.getItem(storageKey(sport, category));
  if (raw === null) return null;
  let entry;
  try {
    entry = JSON.parse(raw);
  } catch {
    throw new UnreadableEntry("Saved entry data cannot be read.");
  }
  if (!entry || entry.sport !== sport.id || entry.category !== category.id ||
      typeof entry.id !== "string" || typeof entry.team !== "string" ||
      ![pending, "Confirmed"].includes(entry.status) || !Number.isInteger(entry.revision) ||
      !Array.isArray(entry.players) || !entry.players.length ||
      !entry.players.every(player => player && typeof player.roll === "string" && typeof player.name === "string")) {
    throw new UnreadableEntry("Saved entry data cannot be read.");
  }
  return entry;
}

export const canEditRoster = (entry, sport, category) =>
  entry?.status === pending && category.kind === "team" && isOpen(sport);

export async function saveEntry(sport, category, draft, original) {
  const key = storageKey(sport, category);
  // The lock may queue this write while the draft is still editable.
  const team = draft.team;
  const players = draft.players.map(player => ({ ...player }));
  function write() {
    const current = findEntry(sport, category);
    if (!isOpen(sport)) return { message: "Registration has closed. Contact the Student Centre for help." };
    if (original) {
      if (!canEditRoster(current, sport, category) || current.id !== original.id || current.revision !== original.revision) {
        return { message: "The saved entry has changed. Open the latest receipt before editing.", existing: current };
      }
    } else if (current) {
      return { message: "You already have an entry in this category.", existing: current };
    }
    const entry = {
      id: original?.id ?? "US-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      sport: sport.id, category: category.id, status: pending,
      revision: (current?.revision ?? 0) + 1, team, players,
    };
    localStorage.setItem(key, JSON.stringify(entry));
    return { entry };
  }
  // Serialize the check and write across tabs on the local server.
  return navigator.locks ? navigator.locks.request(key, write) : write();
}

function fixtureNotice(entry) {
  const match = getMatch(entry.match);
  if (!match) return "<p>No fixture assigned yet.</p>";
  const changed = match.status === "Rescheduled";
  const when = match.status === "Delayed" ? "Revised time pending" :
    shortDate.format(new Date(match.when)) + ", " + timeLabel(match.when);
  return `<div class="linked-match"><div><a class="back-link" href="#/matches/${match.id}">${match.sides.join(" vs ")}</a>
    <span class="status ${match.status.toLowerCase()}">${match.status}</span></div>
    <p>${icon("clock")} ${when}</p><p>${icon("pin")} ${changed ? "Current venue: " : ""}${match.venue}</p></div>`;
}

export function renderEntries(main, id, updated = false) {
  const entries = [];
  const unreadable = [];
  for (const sport of sports) {
    for (const category of sport.categories) {
      try {
        const entry = findEntry(sport, category);
        if (entry) entries.push(entry);
      } catch (error) {
        if (!(error instanceof UnreadableEntry)) throw error;
        unreadable.push(`${sport.name} · ${category.name}`);
      }
    }
  }
  const warning = unreadable.length ? `<div class="panel panel-message local-note">
    <strong>Some saved entries could not be read.</strong>
    <p>Affected categories: ${unreadable.join(", ")}. Contact the Student Centre if you need help verifying one of these entries.</p></div>` : "";
  document.title = (id ? "Entry receipt" : "My Entries") + " · UniSports";
  if (!id) {
    main.innerHTML = `<div class="page-heading"><h1 tabindex="-1">My Entries</h1></div>
      <p class="local-note">${icon("ticket")} Your entries on this browser. Clearing site data removes your saved registrations.</p>
      ${warning}
      ${entries.length ? '<ul class="board-list entries-list">' + entries.map(entry => {
        const sport = getSport(entry.sport);
        const category = getCategory(sport, entry.category);
        const participant = entry.team || entry.players.map(player => player.name).join(" & ");
        return `<li class="panel saved-entry"><div class="entry-card-head">${sportMark(sport)}
          <div><a class="receipt-link" href="${receiptLink(entry)}">${sport.name} · ${category.name} ${icon("arrow")}</a>
          <p>${escapeText(participant)}</p></div><span class="status ${entry.status === "Confirmed" ? "open" : "delayed"}">${entry.status}</span></div>
          <div class="entry-match"><h3>Your match</h3>${fixtureNotice(entry)}</div></li>`;
      }).join("") + "</ul>" : '<p>No entries yet. <a href="#/">Browse tournaments</a></p>'}`;
    return;
  }
  const entry = entries.find(record => record.id === id);
  if (!entry) {
    main.innerHTML = `<h1 tabindex="-1">Entry unavailable</h1><p>This reference is unavailable on this browser.</p>
      ${warning}<a class="back-link" href="#/entries">My Entries</a>`;
    return;
  }
  const sport = getSport(entry.sport);
  const category = getCategory(sport, entry.category);
  const event = sport.id + "/" + category.id;
  const verified = entry.status === "Confirmed";
  const editable = canEditRoster(entry, sport, category);
  main.innerHTML = `<a class="back-link" href="#/entries">My Entries</a>
    <div class="page-heading"><h1 tabindex="-1">${verified ? "Entry confirmed" : "Entry received"}</h1>
      <span class="status ${verified ? "open" : "delayed"}">${entry.status}</span></div>
    <ol class="entry-progress" aria-label="Registration progress"><li>1. Details</li><li>2. Review</li><li aria-current="step">3. Receipt</li></ol>
    ${updated ? '<p class="local-note" role="status">Roster updated.</p>' : ""}
    <div class="detail-grid receipt-layout"><section class="panel receipt"><header class="receipt-head">
    <span class="ticket-label">${icon("ticket")} Entry reference</span><strong>${escapeText(entry.id)}</strong>
    <h2>${sport.name} · ${category.name}</h2></header>
    <div class="panel-message">${verified ? "The Student Centre has verified your entry." :
      `If you haven’t paid yet, take your reference to the Student Centre and pay ${fees[category.kind].instruction}. The office confirms your entry after verification.`}
    </div><div class="share"><a class="back-link" href="#/tournaments/${event}">Tournament details</a></div>
    <div class="panel-heading"><h2>Your match</h2>${fixtureNotice(entry)}</div></section>
    <section class="panel"><header class="panel-heading"><h2>${escapeText(entry.team || "Participants")}</h2></header>
    <ul class="board-list">${entry.players.map((p, i) => `<li class="review-row"><div>
      <strong>${escapeText(p.name)}${category.kind === "team" && !i ? " · Captain" : ""}</strong>
      <span>${escapeText(p.roll)}</span></div></li>`).join("")}</ul>
    ${editable ? `<div class="entry-actions"><a class="primary-action" href="#/register/${event}/edit-roster">Edit roster</a></div>` :
      `<p class="panel-message">${!isOpen(sport) && !verified ? "Registration has closed. " : ""}For corrections, give the Student Centre your entry reference <strong>${escapeText(entry.id)}</strong> and the details to correct.</p>`}
    </section></div>`;
}
