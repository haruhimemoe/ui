// Fifty fake beatmaps for the provider demo. Not real osu! data.
const ARTISTS = [
  "Camellia",
  "xi",
  "LeaF",
  "DragonForce",
  "Yooh",
  "t+pazolite",
  "Kobaryo",
  "USAO",
  "Nhato",
  "Sota Fujimori",
];
const TITLES = [
  "Exit This Earth's Atomosphere",
  "Blue Zenith",
  "Aleph-0",
  "Through the Fire and Flames",
  "Ice Angel",
  "Chaos",
  "Galaxy Collapse",
  "Miracle 5ympho X",
  "Logos",
  "New Decade",
];

export type FakeBeatmap = { id: number; artist: string; title: string; stars: number };

export const BEATMAPS: FakeBeatmap[] = Array.from({ length: 50 }, (_, i) => ({
  id: 100000 + i * 37,
  artist: ARTISTS[i % ARTISTS.length] as string,
  title: `${TITLES[(i * 3) % TITLES.length]}${i >= TITLES.length ? ` (${Math.floor(i / TITLES.length) + 1})` : ""}`,
  stars: Math.round((3 + (i % 50) / 8) * 100) / 100,
}));
