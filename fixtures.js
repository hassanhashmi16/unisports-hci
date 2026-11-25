import { clock, dayOf, getCategory, getSport, matches, sports } from "./data.js";
import { enableSharing, href, longDate, shareControl, shortDate, timeLabel } from "./ui.js";

const byStart = (a, b) => Date.parse(a.when) - Date.parse(b.when);
const isPending = match => match.status === "Delayed";
const labelDate = date => longDate.format(new Date(date));
const stamp = date => `${shortDate.format(new Date(date))}, ${timeLabel(date)}`;

export function matchRow(match, params, includeDate = false) {
  const start = includeDate ? stamp(match.when) : timeLabel(match.when);
  const timeMarkup = isPending(match) ? "<strong>Revised time pending</strong>" :
    `<time datetime="${match.when}">${start}</time>`;
  return `<li><a class="fixture-row match-link" href="${href("/matches/" + match.id, params)}">
    <div class="fixture-line"><span>${getSport(match.sport).name} · ${match.round}</span>
    <span class="status ${match.status.toLowerCase()}">${match.status}</span></div>
    <strong>${match.sides.join(" vs ")}</strong>
    <div class="fixture-line fixture-time">${timeMarkup}
    <span>${isPending(match) ? "Original venue: " : ""}${match.venue}</span></div>
    ${match.result ? `<span class="outcome">${match.result}</span>` : ""}
  </a></li>`;
}

export function scheduleFilters(query) {
  const params = new URLSearchParams();
  if (query.get("view") === "results") params.set("view", "results");
  if (getSport(query.get("sport"))) params.set("sport", query.get("sport"));
  if (query.get("q")?.trim()) params.set("q", query.get("q").slice(0, 100));
  if (/^\d{4}-\d{2}-\d{2}$/.test(query.get("date"))) params.set("date", query.get("date"));
  return params;
}

export function renderFixtures(main, params) {
  const results = params.get("view") === "results";
  main.innerHTML = `<div class="page-heading"><h1 tabindex="-1">Fixtures &amp; Results</h1>
    <time datetime="${dayOf(clock)}">${longDate.format(clock)}</time></div>
    <nav class="schedule-views" aria-label="Match lists"></nav>
    <form class="filters schedule-filters" aria-label="Filter matches">
      <label><span id="sport-label">Sport</span><select name="sport" aria-labelledby="sport-label"><option value="">All sports</option>
        ${sports.map(sport => `<option value="${sport.id}">${sport.name}</option>`).join("")}</select></label>
      <label>Team or player<input type="search" name="q" maxlength="100"></label>
      <label>Match date<input type="date" name="date"></label>
      <button class="text-button" type="button" id="clear-filters">Clear filters</button>
      <span id="filter-summary" role="status"></span>
    </form><div id="match-list" class="match-list"></div>`;
  const form = main.querySelector("form");
  const reset = form.querySelector("button");
  for (const key of ["sport", "q", "date"]) form.elements[key].value = params.get(key) || "";

  function refresh() {
    const filters = new URLSearchParams();
    if (results) filters.set("view", "results");
    for (const [key, value] of new FormData(form)) if (value.trim()) filters.set(key, value);
    history.replaceState(null, "", href("/fixtures", filters));
    const nextView = new URLSearchParams(filters);
    if (results) nextView.delete("view");
    else nextView.set("view", "results");
    main.querySelector(".schedule-views").innerHTML = ["Upcoming", "Results"].map((label, index) => {
      const active = results === Boolean(index);
      return `<a ${active ? 'aria-current="page"' : ""} href="${href("/fixtures", active ? filters : nextView)}">${label}</a>`;
    }).join("");
    const sport = getSport(filters.get("sport"));
    const date = filters.get("date");
    const term = (filters.get("q") || "").trim().toLowerCase();
    reset.hidden = !sport && !date && !term;
    const published = matches.filter(match => !sport || match.sport === sport.id);
    const filtered = published.filter(match => {
      if (results !== (match.status === "Completed")) return false;
      if (!results && !isPending(match) && new Date(match.when) < clock) return false;
      if (date && dayOf(match.when) !== date) return false;
      return !term || match.sides.some(side => !side.startsWith("Winner of ") && side.toLowerCase().includes(term));
    }).sort((a, b) => results ? byStart(b, a) : byStart(a, b));
    main.querySelector("#filter-summary").textContent = `${filtered.length} ${filtered.length === 1 ? "match" : "matches"}`;
    const list = main.querySelector("#match-list");
    if (!filtered.length) {
      const message = !published.length ? `Fixtures for ${sport.name} have not been published.` :
        date || term ? "No matches match these filters." :
        results ? "No completed results yet." : "No upcoming fixtures.";
      list.innerHTML = `<p class="panel panel-message">${message} ${sport ? `<a href="#/tournaments/${sport.id}">View tournament</a>` : ""}</p>`;
      return;
    }
    const groups = new Map();
    for (const match of filtered) {
      const day = dayOf(match.when);
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day).push(match);
    }
    list.innerHTML = [...groups.values()].map(group => `<section class="panel">
      <header class="panel-heading"><h2>${labelDate(group[0].when)}</h2><p>Times in Lahore</p></header>
      <ul class="board-list">${group.map(match => matchRow(match, filters)).join("")}</ul></section>`).join("");
  }
  form.addEventListener("input", refresh);
  form.addEventListener("submit", event => event.preventDefault());
  reset.addEventListener("click", () => { form.reset(); form.elements.sport.focus(); refresh(); });
  refresh();
}

export function bracket(sport, category) {
  const entries = matches.filter(match => match.sport === sport.id && match.category === category.id)
    .sort((a, b) => a.roundOrder - b.roundOrder || byStart(a, b));
  const rounds = [...new Set(entries.map(match => match.round))];
  const params = new URLSearchParams({ sport: sport.id });
  return `<section class="panel bracket" aria-labelledby="bracket-title">
    <header class="panel-heading"><h2 id="bracket-title" tabindex="-1">Knockout bracket</h2>
      <p>${sport.name} · ${category.name}</p></header>
    ${rounds.length ? rounds.map(round => `<section class="round"><h3>${round}</h3>
      <ul class="board-list">${entries.filter(match => match.round === round)
        .map(match => matchRow(match, match.result ? new URLSearchParams({ sport: sport.id, view: "results" }) : params, true)).join("")}</ul></section>`).join("") :
      '<p class="panel-message">The draw has not been published.</p>'}
    <div class="share"><a class="back-link" href="${href("/fixtures", params)}">View fixtures</a></div>
  </section>`;
}

export function renderMatch(main, match, params) {
  const sport = getSport(match.sport);
  const category = getCategory(sport, match.category);
  const event = `/tournaments/${sport.id}/${category.id}`;
  const previous = match.previous ?? (isPending(match) ? match : null);
  main.innerHTML = `<a class="back-link" href="${href("/fixtures", params)}">Fixtures &amp; Results</a>
    <div class="page-heading detail-heading"><h1 tabindex="-1">${match.sides.join(" vs ")}</h1>
      <span class="status ${match.status.toLowerCase()}">${match.status}</span></div>
    <section class="panel"><header class="panel-heading"><h2>${sport.name} · ${match.round}</h2>
      <p>${category.name}</p></header><dl class="detail-list">
      ${match.result ? `<div><dt>Result</dt><dd><strong>${match.result}</strong></dd></div>` : ""}
      <div><dt>${isPending(match) ? "Match time" : "Start time"}</dt><dd><strong>${isPending(match) ? "Revised time pending" : stamp(match.when) + " Lahore time"}</strong></dd></div>
      ${!isPending(match) ? `<div><dt>Venue</dt><dd>${match.venue}</dd></div>` : ""}
      ${previous ? `<div><dt>Previously scheduled</dt><dd>${stamp(previous.when)} · ${previous.venue}</dd></div>` : ""}
      ${match.updated ? `<div><dt>Update posted</dt><dd>${stamp(match.updated)} Lahore time</dd></div>` : ""}
      </dl><div class="share"><a class="back-link" href="${href(event, new URLSearchParams({ section: "bracket" }))}">View tournament bracket</a></div>
      ${shareControl("match")}</section>`;
  enableSharing(main, "/matches/" + match.id, "Match");
}
