export const BACK_BASE_URL = 'https://ccd3-83-58-33-94.ngrok-free.app';

// CARDTRADER
// API
export const TOKEN =
  'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJjYXJkdHJhZGVyLXByb2R1Y3Rpb24iLCJzdWIiOiJhcHA6MTI5MzkiLCJhdWQiOiJhcHA6MTI5MzkiLCJleHAiOjQ4ODg3MTM1NjMsImp0aSI6ImFhMjMyZWVhLWE5ZDEtNGE1OC1hOWU1LTY1NjAwMGYyY2Y3MiIsImlhdCI6MTczMzAzOTk2MywibmFtZSI6IlNpbW9uVnRjZyBBcHAgMjAyNDEyMDEwODU3MTQifQ.PahD01K6eyOw21VpbC3DNE3n2G_nZ8Eho7lu_o5Xmx0gxUhH0NoLuwKEBdhbCUHHWOD9SMtexTlpgLkBgWiDGgDYITid9uCcZmKkuQDHXn4-NsL_No-4ClwTg5g4zAzJWLmsobt2rIzMiIHvRnRlupF6hbLDgfzxJ-MCx4hQkCNler_vHcag1EbhGN9QRDkJfcoDAmcv-umF153Z1PFWrtRRdo00QengRY3ZWwi8gkPW89h-Z0GrxTZ56bvseVq1f-2CHI93Py5Kas4R8CGQUqEa9VkHdmO0UL0_eX-nePB3rzYJFe9IugPBHwfOseNtP2YylHELrPHmVqMThMuPVA';

// export const TOKEN = TOKEN;

const BASE_URL = 'https://api.cardtrader.com/api/v2';
export const GAMES_URL = `${BASE_URL}/games`;
export const EXPANSIONS_URL = `${BASE_URL}/expansions`;
export const getExpansionsUrl = (game) =>
  `${EXPANSIONS_URL}?game_id=${game}`;
export const PRODUCT = `${BASE_URL}/products/export`;
export const BLUEPRINT_URL = `${BASE_URL}/blueprints/export`;
export const MKT_PRODUCT = `${BASE_URL}/marketplace/products`;

export const CART_URL = `${BASE_URL}/cart/add`;

// IDS
export const MTG_ID = 1;
export const PKM_ID = 5;
export const DBZ_ID = 9;
export const LORCANA_ID = 18;
export const SWU_ID = 20;
export const EXPANSION_FIRST_CHAPTHER = 3469;

export const LORCANA_RARITIES = {
  ENCHANTED: 'Enchanted',
  LEGENDARY: 'Legendary',
  SUPER_RARE: 'Super Rare',
  RARE: 'Rare',
  UNCOMMON: 'Uncommon',
  COMMON: 'Common',
};
export const LOR_RARITIES_ORDER = [
  LORCANA_RARITIES.ENCHANTED,
  LORCANA_RARITIES.LEGENDARY,
  LORCANA_RARITIES.SUPER_RARE,
  LORCANA_RARITIES.RARE,
  LORCANA_RARITIES.UNCOMMON,
  LORCANA_RARITIES.COMMON,
];
export const SWU_RARITIES = {
  // PROMO: "Promo",
  // SPECIAL: "Special",
  // LEGENDARY: "Legendary",
  RARE: 'Rare',
  // UNCOMMON: "Uncommon",
  // COMMON: "Common",
};
export const DBZ_RARITIES = {
  // LEADER: "Leader",
  // ALTER: "Alternate Art",
  GOD_RARE: 'God Rare',
  FEAT_RARE: 'Feature Rare',
  SECRET_RARE: 'Secret Rare',
  SUPER_RARE: 'Super Rare',
  RARE: 'Rare',
  // UNCOMMON: "Uncommon",
  // COMMON: "Common",
};
export const MTG_RARITIES = {
  MYTHIC: 'Mythic',
  RARE: 'Rare',
  // UNCOMMON: "Uncommon",
  // COMMON: "Common",
};
export const PKM_RARITIES = {
  // SECRET_RARE: 'Secret Rare',
  S_ULTRA_RARE: 'Shiny Ultra Rare',
  ULTRA_RARE: 'Ultra Rare',
  SP_ILL_RARE: 'Special Illustration Rare',
  ILL_RARE: 'Illustration Rare',
  // RARE_ACE: "Rare ACE",
  // DOUBLE_RARE: "Double Rare",
  // RARE: "Rare",
  // UNCOMMON: "Uncommon",
  // COMMON: "Common",
};
