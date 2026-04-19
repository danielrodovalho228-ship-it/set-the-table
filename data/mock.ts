import type { Product, Scenario, SlotId } from "@/types/domain";

// ---------- Images ----------
// Using Unsplash CDN for realistic-looking placeholders. Swap for real
// product photos when the catalog goes live.
const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

// Hero images (scenario covers)
const HERO = {
  thanksgiving: IMG("photo-1574672280600-4accfa5b6f98", 1200),
  christmas:    IMG("photo-1543589077-47d81606c1bf", 1200),
  birthday:     IMG("photo-1530103862676-de8c9debad1d", 1200),
  dinner_modern:IMG("photo-1528605248644-14dd04022da1", 1200),
  dinner_rustic:IMG("photo-1467003909585-2f8a72700288", 1200),
  easter:       IMG("photo-1589985270826-4b7bb135bc9d", 1200)
};

// ---------- Products ----------
// 4 products per slot = 40 total. Prices in cents.
export const PRODUCTS: Product[] = [
  // tablecloth (fixed)
  { id: "tc-linen-ivory",  name: "Washed Linen Tablecloth, Ivory",  category: "tablecloth", style: "classic", price_cents: 8900,  per_guest: false, image_url: IMG("photo-1618220179428-22790b461013") },
  { id: "tc-linen-sage",   name: "Washed Linen Tablecloth, Sage",   category: "tablecloth", style: "rustic",  price_cents: 8900,  per_guest: false, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "tc-cotton-white", name: "Hemmed Cotton Cloth, White",      category: "tablecloth", style: "minimal", price_cents: 3900,  per_guest: false, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "tc-jacquard-ruby",name: "Holiday Jacquard, Ruby",          category: "tablecloth", style: "festive", price_cents: 11900, per_guest: false, image_url: IMG("photo-1543589077-47d81606c1bf") },

  // runner (fixed)
  { id: "rn-burlap",   name: "Natural Burlap Runner",     category: "runner", style: "rustic",  price_cents: 2400, per_guest: false, image_url: IMG("photo-1467003909585-2f8a72700288") },
  { id: "rn-velvet",   name: "Velvet Runner, Forest",     category: "runner", style: "festive", price_cents: 5400, per_guest: false, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "rn-linen",    name: "Slub Linen Runner, Oat",    category: "runner", style: "classic", price_cents: 3900, per_guest: false, image_url: IMG("photo-1618220179428-22790b461013") },
  { id: "rn-minimal",  name: "Unbleached Cotton Runner",  category: "runner", style: "minimal", price_cents: 1900, per_guest: false, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },

  // charger (per guest)
  { id: "ch-gold",   name: "Gold Beaded Charger",  category: "charger", style: "festive", price_cents: 1400, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "ch-wood",   name: "Acacia Wood Charger",  category: "charger", style: "rustic",  price_cents: 1800, per_guest: true, image_url: IMG("photo-1467003909585-2f8a72700288") },
  { id: "ch-rattan", name: "Woven Rattan Charger", category: "charger", style: "modern",  price_cents: 1600, per_guest: true, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "ch-matte",  name: "Matte Black Charger",  category: "charger", style: "minimal", price_cents: 1200, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },

  // dinner_plate (per guest)
  { id: "dp-stone",  name: "Stoneware Dinner Plate, Cream",   category: "dinner_plate", style: "classic", price_cents: 2200, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "dp-matte",  name: "Matte Porcelain Plate, White",    category: "dinner_plate", style: "minimal", price_cents: 1800, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "dp-rim",    name: "Gold Rim Porcelain Plate",        category: "dinner_plate", style: "festive", price_cents: 2800, per_guest: true, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "dp-terra",  name: "Terracotta Hand-Thrown Plate",    category: "dinner_plate", style: "rustic",  price_cents: 2400, per_guest: true, image_url: IMG("photo-1467003909585-2f8a72700288") },

  // salad_plate (per guest)
  { id: "sp-stone",  name: "Stoneware Salad Plate, Cream",    category: "salad_plate", style: "classic", price_cents: 1600, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "sp-matte",  name: "Matte Porcelain Salad, White",    category: "salad_plate", style: "minimal", price_cents: 1400, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "sp-rim",    name: "Gold Rim Salad Plate",            category: "salad_plate", style: "festive", price_cents: 1900, per_guest: true, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "sp-terra",  name: "Terracotta Salad Plate",          category: "salad_plate", style: "rustic",  price_cents: 1700, per_guest: true, image_url: IMG("photo-1574672280600-4accfa5b6f98") },

  // napkin (per guest)
  { id: "np-linen-oat",  name: "Linen Napkin, Oat",       category: "napkin", style: "classic", price_cents: 900,  per_guest: true, image_url: IMG("photo-1618220179428-22790b461013") },
  { id: "np-linen-sage", name: "Linen Napkin, Sage",      category: "napkin", style: "rustic",  price_cents: 900,  per_guest: true, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "np-cotton-wht", name: "Cotton Napkin, White",    category: "napkin", style: "minimal", price_cents: 500,  per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "np-jacquard",   name: "Holiday Jacquard Napkin", category: "napkin", style: "festive", price_cents: 1200, per_guest: true, image_url: IMG("photo-1543589077-47d81606c1bf") },

  // flatware (per guest)
  { id: "fw-matte-gold", name: "Matte Gold 5-Piece Flatware",  category: "flatware", style: "festive", price_cents: 3400, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "fw-brushed",    name: "Brushed Steel Flatware",        category: "flatware", style: "modern",  price_cents: 2200, per_guest: true, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "fw-classic",    name: "Classic Silverplate Flatware",  category: "flatware", style: "classic", price_cents: 2800, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "fw-wood",       name: "Wood-Handle Flatware",          category: "flatware", style: "rustic",  price_cents: 3100, per_guest: true, image_url: IMG("photo-1467003909585-2f8a72700288") },

  // glasses (per guest) — bundle of water + wine as one "set"
  { id: "gl-crystal",  name: "Crystal Wine + Water Set",  category: "glasses", style: "classic", price_cents: 2600, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "gl-ribbed",   name: "Ribbed Glass Set",          category: "glasses", style: "modern",  price_cents: 2000, per_guest: true, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "gl-amber",    name: "Amber Tinted Glass Set",    category: "glasses", style: "festive", price_cents: 2400, per_guest: true, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "gl-simple",   name: "Simple Tumbler Set",        category: "glasses", style: "minimal", price_cents: 1400, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },

  // centerpiece (fixed)
  { id: "cp-eucalyptus", name: "Fresh Eucalyptus Garland",        category: "centerpiece", style: "rustic",  price_cents: 4500, per_guest: false, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "cp-pumpkins",   name: "Heirloom Pumpkin Arrangement",    category: "centerpiece", style: "festive", price_cents: 6800, per_guest: false, image_url: IMG("photo-1574672280600-4accfa5b6f98") },
  { id: "cp-roses",      name: "Blush Rose Low Bouquet",          category: "centerpiece", style: "classic", price_cents: 7400, per_guest: false, image_url: IMG("photo-1543589077-47d81606c1bf") },
  { id: "cp-branches",   name: "Bare Branch + Bud Vase Trio",     category: "centerpiece", style: "minimal", price_cents: 3900, per_guest: false, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },

  // candles (fixed)
  { id: "cd-tapers-ivory", name: "Ivory Taper Candles, Set of 6", category: "candles", style: "classic", price_cents: 1800, per_guest: false, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "cd-tapers-sage",  name: "Sage Tapers, Set of 6",         category: "candles", style: "rustic",  price_cents: 1800, per_guest: false, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "cd-pillars",      name: "Unscented Pillar Trio",         category: "candles", style: "minimal", price_cents: 2400, per_guest: false, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "cd-beeswax",      name: "Beeswax Tapers, Set of 4",      category: "candles", style: "festive", price_cents: 2200, per_guest: false, image_url: IMG("photo-1543589077-47d81606c1bf") },

  // ---------- Expansion: 20 new products (boho, coastal, scandi + variants) ----------

  // tablecloth (2)
  { id: "tc-linen-black",     name: "Washed Linen Tablecloth, Black",    category: "tablecloth", style: "festive", price_cents: 8900,  per_guest: false, image_url: IMG("photo-1530103862676-de8c9debad1d") },
  { id: "tc-stripes-coastal", name: "Blue & White Stripe Tablecloth",    category: "tablecloth", style: "coastal", price_cents: 5400,  per_guest: false, image_url: IMG("photo-1589985270826-4b7bb135bc9d") },

  // runner (2)
  { id: "rn-macrame",      name: "Hand-Knotted Macramé Runner",  category: "runner", style: "boho",    price_cents: 4900, per_guest: false, image_url: IMG("photo-1615715035708-c3b8e9f5e8aa") },
  { id: "rn-silver-satin", name: "Silver Satin Runner",           category: "runner", style: "festive", price_cents: 4800, per_guest: false, image_url: IMG("photo-1528605248644-14dd04022da1") },

  // charger (2)
  { id: "ch-bamboo",           name: "Woven Bamboo Charger",        category: "charger", style: "coastal", price_cents: 1500, per_guest: true, image_url: IMG("photo-1467003909585-2f8a72700288") },
  { id: "ch-hammered-silver",  name: "Hammered Silver Charger",     category: "charger", style: "festive", price_cents: 2200, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },

  // dinner_plate (2)
  { id: "dp-scandi-speckle", name: "Speckled Stoneware Plate, Grey", category: "dinner_plate", style: "scandi", price_cents: 2000, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "dp-earthenware",    name: "Glazed Earthenware Plate",       category: "dinner_plate", style: "boho",   price_cents: 2600, per_guest: true, image_url: IMG("photo-1467003909585-2f8a72700288") },

  // salad_plate (2)
  { id: "sp-scandi-speckle", name: "Speckled Salad Plate, Grey", category: "salad_plate", style: "scandi",  price_cents: 1500, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },
  { id: "sp-blue-rim",       name: "Blue Rim Porcelain Salad",   category: "salad_plate", style: "coastal", price_cents: 1700, per_guest: true, image_url: IMG("photo-1589985270826-4b7bb135bc9d") },

  // napkin (2)
  { id: "np-chambray-blue", name: "Chambray Napkin, Blue", category: "napkin", style: "coastal", price_cents: 800,  per_guest: true, image_url: IMG("photo-1589985270826-4b7bb135bc9d") },
  { id: "np-blush-linen",   name: "Blush Linen Napkin",    category: "napkin", style: "classic", price_cents: 1000, per_guest: true, image_url: IMG("photo-1618220179428-22790b461013") },

  // flatware (2)
  { id: "fw-hammered-silver", name: "Hammered Silver Flatware", category: "flatware", style: "festive", price_cents: 3600, per_guest: true, image_url: IMG("photo-1528605248644-14dd04022da1") },
  { id: "fw-matte-black",     name: "Matte Black Flatware",     category: "flatware", style: "modern",  price_cents: 3000, per_guest: true, image_url: IMG("photo-1513467535987-fd81bc7d62f8") },

  // glasses (2)
  { id: "gl-blue-rim", name: "Blue Rim Glassware Set", category: "glasses", style: "coastal", price_cents: 2200, per_guest: true, image_url: IMG("photo-1589985270826-4b7bb135bc9d") },
  { id: "gl-smoke",    name: "Smoked Glass Set",       category: "glasses", style: "scandi",  price_cents: 2400, per_guest: true, image_url: IMG("photo-1530103862676-de8c9debad1d") },

  // centerpiece (3)
  { id: "cp-peonies",     name: "Blush Peony Low Bouquet",            category: "centerpiece", style: "classic", price_cents: 8200, per_guest: false, image_url: IMG("photo-1618220179428-22790b461013") },
  { id: "cp-wildflowers", name: "Wildflower + Herb Arrangement",      category: "centerpiece", style: "coastal", price_cents: 4800, per_guest: false, image_url: IMG("photo-1467003909585-2f8a72700288") },
  { id: "cp-menorah",     name: "Brass Menorah + Votive Arrangement", category: "centerpiece", style: "festive", price_cents: 9400, per_guest: false, image_url: IMG("photo-1528605248644-14dd04022da1") },

  // candles (1)
  { id: "cd-silver-tapers", name: "Silver Taper Candles, Set of 6", category: "candles", style: "festive", price_cents: 2000, per_guest: false, image_url: IMG("photo-1528605248644-14dd04022da1") }
];

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export function productsForSlot(slot: SlotId, style?: string) {
  return PRODUCTS.filter((p) => p.category === slot && (!style || p.style === style));
}

// ---------- Scenarios ----------
export const SCENARIOS: Scenario[] = [
  {
    id: "s-thanksgiving-classic",
    slug: "classic-thanksgiving",
    title: "A Classic Thanksgiving",
    occasion: "thanksgiving",
    style: "classic",
    description:
      "Warm neutrals, gold-rimmed plates, and a low garland of eucalyptus. A timeless setting that invites the family to linger.",
    hero_image_url: HERO.thanksgiving,
    default_guest_count: 8,
    budget_tier: "250_500",
    items: {
      tablecloth:   "tc-linen-ivory",
      runner:       "rn-linen",
      charger:      "ch-gold",
      dinner_plate: "dp-rim",
      salad_plate:  "sp-rim",
      napkin:       "np-linen-oat",
      flatware:     "fw-classic",
      glasses:      "gl-crystal",
      centerpiece:  "cp-eucalyptus",
      candles:      "cd-tapers-ivory"
    }
  },
  {
    id: "s-christmas-festive",
    slug: "festive-christmas-dinner",
    title: "Festive Christmas Dinner",
    occasion: "christmas",
    style: "festive",
    description:
      "Deep reds, matte gold, and beeswax taper candles. Built for the big meal and the long conversation that follows.",
    hero_image_url: HERO.christmas,
    default_guest_count: 10,
    budget_tier: "500_plus",
    items: {
      tablecloth:   "tc-jacquard-ruby",
      runner:       "rn-velvet",
      charger:      "ch-gold",
      dinner_plate: "dp-rim",
      salad_plate:  "sp-rim",
      napkin:       "np-jacquard",
      flatware:     "fw-matte-gold",
      glasses:      "gl-amber",
      centerpiece:  "cp-pumpkins",
      candles:      "cd-beeswax"
    }
  },
  {
    id: "s-birthday-modern",
    slug: "modern-birthday-dinner",
    title: "Modern Birthday Dinner",
    occasion: "birthday",
    style: "modern",
    description:
      "Brushed steel flatware, ribbed glasses, rattan chargers. Crisp, considered, and celebratory without being fussy.",
    hero_image_url: HERO.birthday,
    default_guest_count: 6,
    budget_tier: "100_250",
    items: {
      tablecloth:   "tc-cotton-white",
      runner:       "rn-minimal",
      charger:      "ch-rattan",
      dinner_plate: "dp-matte",
      salad_plate:  "sp-matte",
      napkin:       "np-cotton-wht",
      flatware:     "fw-brushed",
      glasses:      "gl-ribbed",
      centerpiece:  "cp-roses",
      candles:      "cd-pillars"
    }
  },
  {
    id: "s-dinner-party-modern",
    slug: "minimal-dinner-party",
    title: "Minimal Dinner Party",
    occasion: "dinner_party",
    style: "minimal",
    description:
      "A pared-back setting for close friends. White porcelain, simple tumblers, and three pillar candles doing all the work.",
    hero_image_url: HERO.dinner_modern,
    default_guest_count: 4,
    budget_tier: "under_100",
    items: {
      tablecloth:   "tc-cotton-white",
      runner:       "rn-minimal",
      charger:      "ch-matte",
      dinner_plate: "dp-matte",
      salad_plate:  "sp-matte",
      napkin:       "np-cotton-wht",
      flatware:     "fw-brushed",
      glasses:      "gl-simple",
      centerpiece:  "cp-branches",
      candles:      "cd-pillars"
    }
  },
  {
    id: "s-dinner-party-rustic",
    slug: "rustic-harvest-supper",
    title: "Rustic Harvest Supper",
    occasion: "dinner_party",
    style: "rustic",
    description:
      "Sage linens, terracotta plates, wood-handle flatware, and eucalyptus. A table that feels like a slow evening in the country.",
    hero_image_url: HERO.dinner_rustic,
    default_guest_count: 8,
    budget_tier: "250_500",
    items: {
      tablecloth:   "tc-linen-sage",
      runner:       "rn-burlap",
      charger:      "ch-wood",
      dinner_plate: "dp-terra",
      salad_plate:  "sp-terra",
      napkin:       "np-linen-sage",
      flatware:     "fw-wood",
      glasses:      "gl-ribbed",
      centerpiece:  "cp-eucalyptus",
      candles:      "cd-tapers-sage"
    }
  },
  {
    id: "s-easter-brunch",
    slug: "easter-brunch",
    title: "Easter Brunch",
    occasion: "easter",
    style: "classic",
    description:
      "Soft blush roses, ivory tapers, gold-rim plates. A brunch table that holds up from mimosas to coffee.",
    hero_image_url: HERO.easter,
    default_guest_count: 6,
    budget_tier: "100_250",
    items: {
      tablecloth:   "tc-linen-ivory",
      runner:       "rn-linen",
      charger:      "ch-gold",
      dinner_plate: "dp-stone",
      salad_plate:  "sp-stone",
      napkin:       "np-linen-oat",
      flatware:     "fw-matte-gold",
      glasses:      "gl-crystal",
      centerpiece:  "cp-roses",
      candles:      "cd-tapers-ivory"
    }
  },

  // ---------- Expansion: 5 new occasions ----------

  {
    id: "s-halloween-gathering",
    slug: "halloween-gathering",
    title: "Halloween Gathering",
    occasion: "halloween",
    style: "festive",
    description:
      "Black linen, amber glassware, and a heirloom pumpkin trio. Moody, tactile, and just the right side of spooky.",
    hero_image_url: IMG("photo-1530103862676-de8c9debad1d", 1200),
    default_guest_count: 8,
    budget_tier: "250_500",
    items: {
      tablecloth:   "tc-linen-black",
      runner:       "rn-velvet",
      charger:      "ch-matte",
      dinner_plate: "dp-rim",
      salad_plate:  "sp-rim",
      napkin:       "np-jacquard",
      flatware:     "fw-matte-black",
      glasses:      "gl-amber",
      centerpiece:  "cp-pumpkins",
      candles:      "cd-beeswax"
    }
  },
  {
    id: "s-mothers-day-brunch",
    slug: "mothers-day-brunch",
    title: "Mother's Day Brunch",
    occasion: "mothers_day",
    style: "classic",
    description:
      "Blush linens, peonies, and gold flatware. A table built for slow Sundays and second cups of coffee.",
    hero_image_url: IMG("photo-1618220179428-22790b461013", 1200),
    default_guest_count: 6,
    budget_tier: "100_250",
    items: {
      tablecloth:   "tc-linen-ivory",
      runner:       "rn-linen",
      charger:      "ch-gold",
      dinner_plate: "dp-stone",
      salad_plate:  "sp-stone",
      napkin:       "np-blush-linen",
      flatware:     "fw-matte-gold",
      glasses:      "gl-crystal",
      centerpiece:  "cp-peonies",
      candles:      "cd-tapers-ivory"
    }
  },
  {
    id: "s-hanukkah-dinner",
    slug: "hanukkah-dinner",
    title: "Hanukkah Dinner",
    occasion: "hanukkah",
    style: "festive",
    description:
      "Silver satin, hammered flatware, and a brass menorah surrounded by votives. Ceremonial and warm.",
    hero_image_url: IMG("photo-1528605248644-14dd04022da1", 1200),
    default_guest_count: 8,
    budget_tier: "250_500",
    items: {
      tablecloth:   "tc-linen-ivory",
      runner:       "rn-silver-satin",
      charger:      "ch-hammered-silver",
      dinner_plate: "dp-matte",
      salad_plate:  "sp-matte",
      napkin:       "np-cotton-wht",
      flatware:     "fw-hammered-silver",
      glasses:      "gl-crystal",
      centerpiece:  "cp-menorah",
      candles:      "cd-silver-tapers"
    }
  },
  {
    id: "s-summer-bbq",
    slug: "summer-bbq-cookout",
    title: "Summer BBQ Cookout",
    occasion: "bbq_cookout",
    style: "coastal",
    description:
      "Blue-and-white stripes, bamboo chargers, and a wildflower jar. Casual outdoor entertaining that still feels set.",
    hero_image_url: IMG("photo-1467003909585-2f8a72700288", 1200),
    default_guest_count: 10,
    budget_tier: "100_250",
    items: {
      tablecloth:   "tc-stripes-coastal",
      runner:       "rn-burlap",
      charger:      "ch-bamboo",
      dinner_plate: "dp-stone",
      salad_plate:  "sp-blue-rim",
      napkin:       "np-chambray-blue",
      flatware:     "fw-wood",
      glasses:      "gl-blue-rim",
      centerpiece:  "cp-wildflowers",
      candles:      "cd-pillars"
    }
  },
  {
    id: "s-rehearsal-dinner",
    slug: "wedding-rehearsal-dinner",
    title: "Wedding Rehearsal Dinner",
    occasion: "rehearsal",
    style: "classic",
    description:
      "Ivory linens, gold-rim plates, and a long table of blush peonies. Refined, romantic, and ready for toasts.",
    hero_image_url: IMG("photo-1543589077-47d81606c1bf", 1200),
    default_guest_count: 12,
    budget_tier: "500_plus",
    items: {
      tablecloth:   "tc-linen-ivory",
      runner:       "rn-linen",
      charger:      "ch-gold",
      dinner_plate: "dp-rim",
      salad_plate:  "sp-rim",
      napkin:       "np-blush-linen",
      flatware:     "fw-matte-gold",
      glasses:      "gl-crystal",
      centerpiece:  "cp-peonies",
      candles:      "cd-tapers-ivory"
    }
  }
];

export const SCENARIO_BY_SLUG: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.slug, s])
);

/** Expand a scenario's slot map into a full Setup object. */
export function setupForScenario(scenarioSlug: string) {
  const scenario = SCENARIO_BY_SLUG[scenarioSlug];
  if (!scenario) return null;
  const setup: Record<string, Product> = {};
  for (const [slot, productId] of Object.entries(scenario.items)) {
    const p = PRODUCT_BY_ID[productId];
    if (p) setup[slot] = p;
  }
  return setup as import("@/types/domain").Setup;
}
