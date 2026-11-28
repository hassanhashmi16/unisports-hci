// The symbols repeat alongside written labels on the board, event pages and receipts.
const paths = {
  badminton: '<path d="m8 12 5 5-3 3a3.5 3.5 0 0 1-5-5zM8 12l5-9 2 2 3-2 1 4 3 1-9 9m-3-6 5-6m-3 8 7-6"/>',
  ludo: '<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="currentColor" stroke="none"><circle cx="7.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="7.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></g>',
  football: '<circle cx="12" cy="12" r="9.5"/><path d="m12 7 5 3-2 5H9l-2-5zM12 7V3m5 7 4-1m-6 6 3 4m-9-4-3 4m1-9L3 9"/>',
  'table-tennis': '<path d="M9 5c3-3 8-3 11 0s2 8-1 11c-2 2-5 3-8 2l-5 4-3-3 5-5C6 11 6 8 9 5ZM8 10l8 8"/><circle cx="3.5" cy="5" r="2"/>',
  cricket: '<path d="m14 9 5-6 2 2-5 6m-2-3 3 3c1 1 1 2 0 3l-8 8-6-5 8-9c1-1 2-1 3 0Z"/><circle cx="5" cy="5" r="2.4"/>',
  volleyball: '<circle cx="12" cy="12" r="9.5"/><path d="M12 12C8 8 9 5 10 3m2 9c5 1 7 4 7 6m-7-6c-1 5-5 7-7 7m-1-8c4 1 6 3 6 5m3-13c-1 4 0 7 2 10m6 2c-4 1-7 0-9-1"/>',
  chess: '<path d="M5 21h14M7 18h10c0-3 1-4 1-7 0-5-4-8-8-9l1 4-3 1-4 6 3 2 4-3-2 6"/><path d="M10 9h.1"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4zM15 5v2m0 3v4m0 3v2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
};

export function icon(name) {
  return `<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

export function sportMark(sport) {
  return `<span class="sport-mark mark-${sport.id}" aria-hidden="true">${icon(sport.id)}</span>`;
}
