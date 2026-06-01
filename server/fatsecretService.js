const FATSECRET_TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const FATSECRET_SEARCH_URL = "https://platform.fatsecret.com/rest/server.api";

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

  if (!searchText) {
    return [];
  }

  const token = await getFatSecretAccessToken();

  const body = new URLSearchParams();
body.set("method", "foods.search");
body.set("search_expression", searchText);
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

  console.log("[fatsecret-search-response]", JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error("[fatsecret-search]", data);
    throw new Error("FatSecret besin araması başarısız.");
  }
  

  const rawFoods = data?.foods?.food;

  if (!rawFoods) return [];

  const foods = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

  return foods.map(normalizeFood);
}