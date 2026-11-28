import {
  clock, dayOf, fees, getCategory, getMatch, getSport, isOpen, matches, sports,
} from "./data.js?v=6";

import { bracket, matchRow, renderFixtures, renderMatch, scheduleFilters } from "./fixtures.js?v=6";
import { registerLabel, renderRegistration } from "./registration.js?v=6";
import { findEntry, renderEntries } from "./entries.js?v=6";
import { enableSharing, enhanceSelects, href, longDate, shareControl, shortDate, timeLabel } from "./ui.js?v=6";

import { icon, sportMark } from "./graphics.js?v=6";

const main = document.querySelector("main");
const eligibilityOptions = [
  ["open", "Open"], ["men", "Men’s"], ["women", "Women’s"], ["mixed", "Mixed"],
];
const eligibilityRules = {
  open: "Open to currently enrolled FAST Lahore students.",
  men: "Open to currently enrolled FAST Lahore men.",
  women: "Open to currently enrolled FAST Lahore women.",
  mixed: "One man and one woman per pair. Both must be currently enrolled FAST Lahore students.",
};

const deadline = sport => `${shortDate.format(new Date(sport.closes))}, ${timeLabel(sport.closes)}`;
const eventFee = kind => `${fees[kind].amount} ${fees[kind].unit}`;
const eventPath = (sport, category) => `/tournaments/${sport.id}${category ? `/${category.id}` : ""}`;
function readRoute() {
  const [rawPath, query] = location.hash.slice(1).split("?");
  const path = !rawPath || rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "");
  const params = new URLSearchParams(query);
  const filters = new URLSearchParams();
  if (getSport(params.get("sport"))) filters.set("sport", params.get("sport"));
  if (eligibilityOptions.some(([value]) => value === params.get("eligibility"))) {
    filters.set("eligibility", params.get("eligibility"));
  }
  return { path, filters, query: params };
}

function tournamentList(tournaments, filters) {
  return `<ul class="board-list">
    ${tournaments.map(({ sport, categories }) => {
      const feeLabels = [...new Set(categories.map(category => eventFee(category.kind)))];
      const category = filters.has("eligibility") && categories.length === 1 ? categories[0] : null;

      return `<li>
        <a class="tournament-row" href="${href(eventPath(sport, category), filters)}">
          ${sportMark(sport)}
          <span class="row-title">
            <strong>${sport.name}</strong>
            <span>${categories.length === 1 ? categories[0].name : `${categories.length} categories`}</span>
          </span>
          <span class="row-meta">
            <time datetime="${sport.closes}">${isOpen(sport) ? "Closes" : "Closed"} ${deadline(sport)}</time>
            <span>${feeLabels.join(" · ")}</span>
          </span>
          <span class="row-arrow">${icon("arrow")}</span>
        </a>
      </li>`;
    }).join("")}
  </ul>`;
}

function fixtureBoard() {
  const upcoming = matches
    .filter(match => match.status !== "Completed")
    .sort((first, second) => new Date(first.when) - new Date(second.when));
  const today = upcoming.filter(match => dayOf(match.when) === dayOf(clock));
  const fixtures = today.length ? today : upcoming.filter(match => dayOf(match.when) > dayOf(clock)).slice(0, 3);

  return `<section class="fixture-board panel" aria-labelledby="fixture-heading">
    <header class="panel-heading">
      <h2 id="fixture-heading">${today.length ? "Today’s fixtures" : "Upcoming fixtures"}</h2>
      <p>${icon("clock")} Lahore time</p>
    </header>
    ${fixtures.length ? `<ul class="board-list">
      ${fixtures.map(match => matchRow(match, null, !today.length)).join("")}
    </ul>` : '<p class="panel-message">No upcoming fixtures have been published.</p>'}
    <a class="panel-foot" href="#/fixtures">View full schedule ${icon("arrow")}</a>
  </section>`;
}

function renderBoard(filters) {
  const tournamentGroups = sports
    .filter(sport => !filters.has("sport") || sport.id === filters.get("sport"))
    .map(sport => ({
      sport,
      categories: sport.categories.filter(category =>
        !filters.has("eligibility") || category.eligibility === filters.get("eligibility")),
    }))
    .filter(group => group.categories.length)
    .sort((a, b) => new Date(a.sport.closes) - new Date(b.sport.closes));

  const open = tournamentGroups.filter(({ sport }) => isOpen(sport));
  const closed = tournamentGroups.filter(({ sport }) => !isOpen(sport));
  const seasonOpen = sports.some(isOpen);
  const openPanel = `<section class="panel directory" aria-labelledby="open-heading">
    <header class="panel-heading">
      <h2 id="open-heading">Open for registration</h2>
      <p>${open.length ? "Nearest deadline first" : "Registration dates in Lahore time"}</p>
    </header>
    ${open.length ? tournamentList(open, filters) :
      '<p class="panel-message">No open tournaments match these filters.</p>'}
  </section>`;

  document.querySelector("#filter-summary").textContent =
    `${tournamentGroups.length} ${tournamentGroups.length === 1 ? "tournament" : "tournaments"}`;
  document.querySelector("#clear-filters").hidden = !filters.size;
  const emptyPanel = `<section class="panel">
    <p class="panel-message">No tournaments match these filters.</p>
  </section>`;
  document.querySelector("#board").innerHTML = `${seasonOpen ? (tournamentGroups.length ? openPanel : emptyPanel) : ""}
    ${fixtureBoard()}
    ${closed.length ? `<section class="panel directory" aria-labelledby="closed-heading">
      <header class="panel-heading"><h2 id="closed-heading">Registration closed</h2></header>
      ${tournamentList(closed, filters)}
    </section>` : ""}
    ${!seasonOpen && !tournamentGroups.length ? emptyPanel : ""}`;
}

function renderHome(filters) {
  const next = sports.filter(isOpen).sort((a, b) => new Date(a.closes) - new Date(b.closes))[0];
  main.innerHTML = `<header class="programme">
    <div class="programme-title"><time class="dateline" datetime="${dayOf(clock)}">${icon("calendar")}${longDate.format(clock)}</time>
      <h1 tabindex="-1">Campus <span>tournaments</span></h1></div>
    <div class="lanes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    ${next ? `<a class="deadline-ticket" href="${href(eventPath(next))}"><span class="ticket-label">${icon("clock")} Next deadline</span>
      <strong>${next.name}</strong><span class="ticket-stub">${deadline(next)} ${icon("arrow")}</span></a>` :
      `<a class="deadline-ticket" href="#/fixtures"><span class="ticket-label">${icon("calendar")} Match schedule</span>
      <strong>Fixtures</strong><span class="ticket-stub">View matches ${icon("arrow")}</span></a>`}
  </header>
  <form class="filters" aria-label="Tournament filters">
    <label>Sport
      <select name="sport">
        <option value="">All sports</option>
        ${sports.map(sport => `<option value="${sport.id}">${sport.name}</option>`).join("")}
      </select>
    </label>
    <label>Category
      <select name="eligibility">
        <option value="">All categories</option>
        ${eligibilityOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
      </select>
    </label>
    <button type="button" class="text-button" id="clear-filters" hidden>Clear filters</button>
    <span id="filter-summary" role="status"></span>
  </form>
  <div class="board" id="board"></div>`;

  const form = main.querySelector("form");
  function updateFilters() {
    const next = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (value) next.set(key, value);
    history.replaceState(null, "", href("/", next));
    renderBoard(next);
  }
  form.addEventListener("change", updateFilters);
  form.addEventListener("submit", event => event.preventDefault());
  form.querySelector("#clear-filters").addEventListener("click", () => {
    form.reset();
    form.elements.sport.focus();
    updateFilters();
  });
  for (const [key, value] of filters) form.elements[key].value = value;
  enhanceSelects(form);
  renderBoard(filters);
}

function entryRule(sport, category) {
  switch (category.kind) {
    case "team": return `${sport.min}–${sport.max} players. The captain submits the roster and counts as one player.`;
    case "pair": return "Two players. Either partner can submit the entry for the pair.";
    default: return "One player per entry.";
  }
}

function renderTournament(sport, category, filters) {
  const open = isOpen(sport);
  let entry;
  try { entry = findEntry(sport, category); } catch { /* Tournament information is public even if storage is unavailable. */ }
  main.innerHTML = `<a class="back-link" href="${href("/", filters)}">All tournaments</a>
    <div class="page-heading detail-heading">
      <div class="event-name">${sportMark(sport)}<h1 tabindex="-1">${sport.name}</h1></div>
      <span class="status ${open ? "open" : "closed"}">${open ? "Registration open" : "Registration closed"}</span>
    </div>
    <div class="detail-grid event-layout">
      <section class="panel" aria-labelledby="category-heading">
        <header class="panel-heading"><h2 id="category-heading">Event categories</h2></header>
        <ul class="board-list category-list">
          ${sport.categories.map(option => `<li>
            <a class="tournament-row" href="${href(eventPath(sport, option), filters)}"
              ${option.id === category.id ? 'aria-current="true"' : ""}>
              <strong>${option.name}</strong>
              <span>${eventFee(option.kind)}</span>
            </a>
          </li>`).join("")}
        </ul>
      </section>
      <section class="panel category-details" aria-labelledby="details-heading">
        <header class="panel-heading"><h2 id="details-heading" tabindex="-1">${category.name}</h2></header>
        <dl class="event-terms">
          <div><dt>${icon("ticket")} Entry fee</dt><dd><strong>${fees[category.kind].amount}</strong> ${fees[category.kind].unit}</dd></div>
          <div><dt>${icon("clock")} Registration ${open ? "deadline" : "closed"}</dt><dd><time datetime="${sport.closes}">${deadline(sport)}</time> <small>Lahore time</small></dd></div>
        </dl>
        <dl class="detail-list">
          <div><dt>Eligibility</dt><dd>${eligibilityRules[category.eligibility]}</dd></div>
          <div><dt>Entry rules</dt><dd>${entryRule(sport, category)}</dd></div>
          <div><dt>Format</dt><dd>${sport.format || "Knockout"}</dd></div>
          <div><dt>Venue</dt><dd>${sport.venue}</dd></div>
          ${open ? "<div><dt>Payment</dt><dd>Pay at the Student Centre after submitting your entry.</dd></div>" : ""}
        </dl>
        ${entry || open ? `<div class="entry-actions"><a class="primary-action" href="${entry ? "#/entries/" + encodeURIComponent(entry.id) : "#/register/" + sport.id + "/" + category.id}">${entry ? "View my entry" : registerLabel[category.kind]}</a></div>` : ""}
        ${shareControl("event")}
      </section>
    </div>
    ${bracket(sport, category)}`;
  enableSharing(main, eventPath(sport, category), "Event");
}

let lastSport;

function renderRoute(moveFocus = false) {
  const { path, filters, query } = readRoute();
  const [, section, sportId, categoryId, extra] = path.split("/");
  const sport = getSport(sportId);
  const eligibility = filters.get("eligibility");
  const defaultCategory = sport?.categories.find(option => option.eligibility === eligibility) ?? sport?.categories[0];
  const category = categoryId ? getCategory(sport, categoryId) : defaultCategory;
  const changingCategory = sport && sport.id === lastSport;

  const entrySection = section === "entries" || (section === "register" && extra === "edit-roster");
  const active = entrySection ? "#/entries" : section === "matches" || path === "/fixtures" ? "#/fixtures" : "#/";
  for (const link of document.querySelectorAll(".primary-nav a")) {
    if (link.getAttribute("href") === active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
  let focusTarget = "h1";
  if (path === "/") {
    document.title = "Tournaments · UniSports";
    renderHome(filters);
  } else if ((section === "entries" && !categoryId) || (section === "register" && sport && categoryId && category &&
      /^\/register\/[^/]+\/[^/]+(?:\/edit-roster)?(?:\/review)?$/.test(path))) {
    try {
      if (section === "entries") {
        let entryId = sportId;
        if (entryId) {
          try { entryId = decodeURIComponent(entryId); } catch { entryId = "\0"; }
        }
        renderEntries(main, entryId, query.get("updated") === "1");
        if (query.has("updated")) history.replaceState(null, "", "#" + path);
      } else {
        focusTarget = renderRegistration(main, sport, category, path.endsWith("/review") ? "review" : "details", query, extra === "edit-roster");
      }
    } catch (error) {
      console.error("Unable to load entry", error);
      document.title = "Entries unavailable · UniSports";
      main.innerHTML = '<h1 tabindex="-1">Cannot load saved entries</h1><p>Check browser storage access, then try again.</p><button class="text-button">Try again</button>';
      main.querySelector("button").onclick = () => renderRoute(true);
    }
  } else if (section === "tournaments" && !extra && sport && category) {
    document.title = `${sport.name} · UniSports`;
    renderTournament(sport, category, filters);
    if (query.get("section") === "bracket") focusTarget = "#bracket-title";
    else if (changingCategory) focusTarget = "#details-heading";
  } else if (path === "/fixtures") {
    document.title = "Fixtures & Results · UniSports";
    renderFixtures(main, scheduleFilters(query));
  } else if (section === "matches") {
    const match = !categoryId && getMatch(sportId);
    if (match) {
      document.title = match.sides.join(" vs ") + " · UniSports";
      const params = scheduleFilters(query);
      if (match.result) params.set("view", "results");
      renderMatch(main, match, params);
    } else {
      document.title = "Match unavailable · UniSports";
      main.innerHTML = '<div class="page-heading"><h1 tabindex="-1">Match unavailable</h1></div><p><a href="#/fixtures">Browse fixtures and results</a></p>';
    }
  } else {
    document.title = "Page unavailable · UniSports";
    main.innerHTML = '<div class="page-heading"><h1 tabindex="-1">Page unavailable</h1></div><p>We couldn’t find this page. <a href="#/">Browse tournaments</a></p>';
  }

  if (moveFocus || focusTarget === "#bracket-title") main.querySelector(focusTarget)?.focus();
  lastSport = section === "tournaments" ? sport?.id : undefined;
}

document.querySelector(".skip-link").addEventListener("click", event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener("hashchange", () => renderRoute(true));
window.addEventListener("storage", () => {
  if (/^#\/(entries|tournaments)(\/|$)/.test(location.hash)) renderRoute();
});
renderRoute();
