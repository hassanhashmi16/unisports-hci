export const boardDate = "2026-12-02";
const defaultClock = new Date(`${boardDate}T12:00:00+05:00`);
const laterClock = new Date("2026-12-05T12:00:00+05:00");

export const fees = {
  solo: { amount: "Rs 200", unit: "per player", instruction: "Rs 200 for your entry" },
  pair: { amount: "Rs 400", unit: "per pair", instruction: "Rs 400 for the pair" },
  team: { amount: "Rs 1,500", unit: "per team", instruction: "Rs 1,500 for the team" },
};

const category = (id, name, kind, eligibility = "open") => ({ id, name, kind, eligibility });
const racketCategories = [
  category("mens-singles", "Men’s singles", "solo", "men"),
  category("womens-singles", "Women’s singles", "solo", "women"),
  category("mens-doubles", "Men’s doubles", "pair", "men"),
  category("womens-doubles", "Women’s doubles", "pair", "women"),
];

export const sports = [
  { id: "badminton", name: "Badminton", venue: "Indoor Hall, Badminton Courts", closes: "2026-12-03T12:00:00+05:00",
    categories: [...racketCategories, category("mixed-doubles", "Mixed doubles", "pair", "mixed")] },
  { id: "ludo", name: "Ludo", venue: "Student Centre, Games Room", closes: "2026-12-03T14:00:00+05:00",
    categories: [category("open", "Open singles", "solo")], format: "Head-to-head knockout" },
  { id: "football", name: "Football", venue: "Football Ground", closes: "2026-12-03T16:00:00+05:00",
    categories: [category("open", "Open team", "team")], format: "Five-a-side knockout", min: 5, max: 8 },
  { id: "table-tennis", name: "Table tennis", venue: "Indoor Hall, Table Tennis Area", closes: "2026-12-04T12:00:00+05:00",
    categories: racketCategories },
  { id: "cricket", name: "Cricket", venue: "Cricket Ground", closes: "2026-12-04T16:00:00+05:00",
    categories: [category("open", "Open team", "team")], format: "Six-a-side knockout", min: 6, max: 9 },
  { id: "volleyball", name: "Volleyball", venue: "Volleyball Courts", closes: "2026-11-30T16:00:00+05:00",
    categories: [category("open", "Open team", "team")], format: "Six-a-side knockout", min: 6, max: 9 },
  { id: "chess", name: "Chess", venue: "Activity Room", closes: "2026-12-01T16:00:00+05:00",
    categories: [category("open", "Open singles", "solo")] },
];

export const matches = [
  { id: "volleyball-falcons-rovers", sport: "volleyball", category: "open", round: "Semifinal", roundOrder: 2,
    sides: ["Falcons", "Rovers"], when: "2026-12-02T16:30:00+05:00", venue: "Volleyball Courts, Court 2",
    status: "Rescheduled", previous: { when: "2026-12-02T15:00:00+05:00", venue: "Volleyball Courts, Court 1" },
    updated: "2026-12-02T11:15:00+05:00" },
  { id: "volleyball-spikers-orbit", sport: "volleyball", category: "open", round: "Semifinal", roundOrder: 2,
    sides: ["Spikers", "Orbit"], when: "2026-12-02T15:30:00+05:00", venue: "Volleyball Courts, Court 1", status: "Scheduled" },
  { id: "volleyball-final", sport: "volleyball", category: "open", round: "Final", roundOrder: 3,
    sides: ["Winner of Falcons vs Rovers", "Winner of Spikers vs Orbit"], when: "2026-12-06T16:00:00+05:00",
    venue: "Volleyball Courts, Court 1", status: "Scheduled" },
  { id: "chess-omar-meher", sport: "chess", category: "open", round: "Quarterfinal", roundOrder: 1,
    sides: ["Omar", "Meher"], when: "2026-12-02T10:00:00+05:00", venue: "Activity Room, Board 1",
    status: "Completed", result: "Omar won, 1–0", winner: "Omar" },
  { id: "chess-zoya-adil", sport: "chess", category: "open", round: "Quarterfinal", roundOrder: 1,
    sides: ["Zoya", "Adil"], when: "2026-12-02T13:00:00+05:00", venue: "Activity Room, Board 2",
    status: "Delayed", previous: { when: "2026-12-02T13:00:00+05:00", venue: "Activity Room, Board 2" },
    updated: "2026-12-02T11:40:00+05:00" },
  { id: "chess-semifinal", sport: "chess", category: "open", round: "Semifinal", roundOrder: 2,
    sides: ["Omar", "Winner of Zoya vs Adil"], when: "2026-12-05T14:00:00+05:00",
    venue: "Activity Room, Board 1", status: "Scheduled" },
  { id: "chess-sara-hadi", sport: "chess", category: "open", round: "Quarterfinal", roundOrder: 1,
    sides: ["Sara", "Hadi"], when: "2026-12-03T10:00:00+05:00", venue: "Activity Room, Board 1", status: "Scheduled" },
  { id: "chess-ali-noor", sport: "chess", category: "open", round: "Quarterfinal", roundOrder: 1,
    sides: ["Ali", "Noor"], when: "2026-12-03T10:00:00+05:00", venue: "Activity Room, Board 2", status: "Scheduled" },
  { id: "chess-second-semifinal", sport: "chess", category: "open", round: "Semifinal", roundOrder: 2,
    sides: ["Winner of Sara vs Hadi", "Winner of Ali vs Noor"], when: "2026-12-05T14:00:00+05:00",
    venue: "Activity Room, Board 2", status: "Scheduled" },
  { id: "chess-final", sport: "chess", category: "open", round: "Final", roundOrder: 3,
    sides: ["Winner of semifinal 1", "Winner of semifinal 2"], when: "2026-12-06T14:00:00+05:00",
    venue: "Activity Room, Board 1", status: "Scheduled" },
];

export const confirmedEntry = {
  id: "US-VB-1042", sport: "volleyball", category: "open", status: "Confirmed",
  team: "Falcons", match: "volleyball-falcons-rovers",
  players: [
    { name: "Hamza Ali", roll: "24L-0801" },
    { name: "Sameer Khan", roll: "24L-0802" },
    { name: "Daniyal Shah", roll: "24L-0803" },
    { name: "Umer Malik", roll: "24L-0804" },
    { name: "Bilal Ahmed", roll: "24L-0805" },
    { name: "Taha Raza", roll: "24L-0806" },
  ],
};

export const clock = new URLSearchParams(location.search).has("later") ? laterClock : defaultClock;
export const dayOf = date => typeof date === "string" ? date.slice(0, 10) :
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Karachi" }).format(date);
export const isOpen = sport => new Date(sport.closes) > clock;
export const getSport = id => sports.find(sport => sport.id === id);
export const getCategory = (sport, id) => sport?.categories.find(event => event.id === id);
export const getMatch = id => matches.find(match => match.id === id);
