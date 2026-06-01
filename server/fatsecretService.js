const FATSECRET_TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const FATSECRET_SEARCH_URL = "https://platform.fatsecret.com/rest/server.api";

const TURKISH_TO_ENGLISH_FOOD_MAP = {
  // Meyveler
  elma: "apple",
  armut: "pear",
  muz: "banana",
  portakal: "orange",
  mandalina: "tangerine",
  limon: "lemon",
  çilek: "strawberry",
  cilek: "strawberry",
  üzüm: "grape",
  uzum: "grape",
  karpuz: "watermelon",
  kavun: "melon",
  şeftali: "peach",
  seftali: "peach",
  kayısı: "apricot",
  kayisi: "apricot",
  kiraz: "cherry",
  vişne: "sour cherry",
  visne: "sour cherry",
  incir: "fig",
  nar: "pomegranate",
  ananas: "pineapple",
  avokado: "avocado",
  kivi: "kiwi",

  // Sebzeler
  domates: "tomato",
  salatalık: "cucumber",
  salatalik: "cucumber",
  biber: "pepper",
  patlıcan: "eggplant",
  patlican: "eggplant",
  kabak: "zucchini",
  havuç: "carrot",
  havuc: "carrot",
  patates: "potato",
  soğan: "onion",
  sogan: "onion",
  sarımsak: "garlic",
  sarimsak: "garlic",
  marul: "lettuce",
  ıspanak: "spinach",
  ispanak: "spinach",
  brokoli: "broccoli",
  karnabahar: "cauliflower",
  lahana: "cabbage",
  mantar: "mushroom",
  bezelye: "pea",
  fasulye: "bean",
  salata: "salad",

  // Proteinler
  tavuk: "chicken",
  hindi: "turkey",
  et: "meat",
  dana: "beef",
  biftek: "steak",
  köfte: "meatball",
  kofte: "meatball",
  balık: "fish",
  balik: "fish",
  somon: "salmon",
  ton: "tuna",
  tonbalığı: "tuna",
  tonbaligi: "tuna",
  yumurta: "egg",
  sucuk: "sausage",
  sosis: "sausage",

  // Süt ürünleri
  süt: "milk",
  sut: "milk",
  yoğurt: "yogurt",
  yogurt: "yogurt",
  ayran: "ayran",
  peynir: "cheese",
  kaşar: "cheddar cheese",
  kasar: "cheddar cheese",
  lor: "ricotta cheese",
  kefir: "kefir",
  tereyağı: "butter",
  tereyagi: "butter",
  krema: "cream",

  // Tahıllar / bakliyat
  ekmek: "bread",
  "beyaz ekmek": "white bread",
  "tam buğday ekmeği": "whole wheat bread",
  "tam bugday ekmegi": "whole wheat bread",
  pilav: "rice",
  pirinç: "rice",
  pirinc: "rice",
  bulgur: "bulgur",
  makarna: "pasta",
  yulaf: "oats",
  granola: "granola",
  mısır: "corn",
  misir: "corn",
  nohut: "chickpea",
  mercimek: "lentil",
  kuru_fasulye: "white bean",
  "kuru fasulye": "white bean",
  barbunya: "cranberry bean",
  kinoa: "quinoa",

  // İçecekler
  su: "water",
  kola: "cola",
  gazoz: "soda",
  "maden suyu": "sparkling mineral water",
  kahve: "coffee",
  çay: "tea",
  cay: "tea",
  meyve_suyu: "fruit juice",
  "meyve suyu": "fruit juice",
  smoothie: "smoothie",

  // Tatlı / atıştırmalık
  çikolata: "chocolate",
  cikolata: "chocolate",
  tatlı: "dessert",
  tatli: "dessert",
  kek: "cake",
  pasta: "cake",
  kurabiye: "cookie",
  bisküvi: "biscuit",
  biskuvi: "biscuit",
  dondurma: "ice cream",
  cips: "chips",
  kraker: "cracker",
  gofret: "wafer",
  baklava: "baklava",

  // Yemek isimleri
  çorba: "soup",
  corba: "soup",
  döner: "doner kebab",
  doner: "doner kebab",
  kebap: "kebab",
  pizza: "pizza",
  hamburger: "hamburger",
  tost: "toast",
  sandviç: "sandwich",
  sandvic: "sandwich",
  omlet: "omelette",
  menemen: "menemen",
};

function normalizeTurkishText(text = "") {
  return String(text)
    .trim()
    .toLowerCase()
    .replaceAll("İ", "i")
    .replaceAll("I", "ı");
}

function translateSearchQuery(query) {
  const normalized = normalizeTurkishText(query);

  return TURKISH_TO_ENGLISH_FOOD_MAP[normalized] || query;
}

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function getFatSecretCredentials() {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("FatSecret API bilgileri eksik.");
  }

  return { clientId, clientSecret };
}

async function getFatSecretAccessToken() {
  const now = Date.now();

  if (cachedToken && cachedTokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

  const { clientId, clientSecret } = getFatSecretCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("scope", "basic");

  const response = await fetch(FATSECRET_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[fatsecret-token]", data);
    throw new Error("FatSecret token alınamadı.");
  }
  

  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;

  return cachedToken;
}

function normalizeFood(food) {
  return {
    id: food.food_id,
    name: food.food_name,
    type: food.food_type,
    description: food.food_description,
    url: food.food_url,
  };
}

export async function searchFoodsFromFatSecret(query, maxResults = 10) {
  const searchText = String(query || "").trim();
  const translatedSearchText = translateSearchQuery(searchText);

  if (!searchText) {
    return [];
  }

  const token = await getFatSecretAccessToken();

  const body = new URLSearchParams();
body.set("method", "foods.search");
body.set("search_expression", translatedSearchText);
body.set("format", "json");
body.set("max_results", String(Math.min(Number(maxResults) || 10, 50)));
body.set("page_number", "0");

const response = await fetch(FATSECRET_SEARCH_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body,
});

  const data = await response.json();

  

  if (!response.ok) {
    console.error("[fatsecret-search]", data);
    throw new Error("FatSecret besin araması başarısız.");
  }
  

  const rawFoods = data?.foods?.food;

  if (!rawFoods) {
  return {
    originalQuery: searchText,
    searchedQuery: translatedSearchText,
    foods: [],
  };
}



  const foods = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

  return {
  originalQuery: searchText,
  searchedQuery: translatedSearchText,
  foods: foods.map(normalizeFood),
};
}