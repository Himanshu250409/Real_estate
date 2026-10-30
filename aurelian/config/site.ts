/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIG — the ONLY file you need to edit to re-skin the
 *  template for another project. Search for "REPLACE" markers.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  name: "Eden Court",
  byline: "by Silverbill Properties",
  city: "Saily, Silvassa",
  region: "Dadra & Nagar Haveli",
  // Full address (taken from the brochure)
  address: "Survey No. 2229, Alok Pada, Village Saily, Silvassa, Daman & Diu and Dadra & Nagar Haveli, PIN 396240",
  locality: "Rakholi, Saily, Silvassa",
  tagline: "Make room for a different rhythm.",
  poeticLine: "A step into the world of luxury.",
  reraNumber: "PR3000002600273", // MahaRERA registration from brochure
  reraUrl: "https://maharera.mahaonline.gov.in",
  phone: "+91 99749 48800",
  whatsapp: "919974948800", // digits only, with country code
  email: "edencourt@silverbillgroup.com",
  brochureUrl: "/brochure.pdf", // REPLACE: your full brochure PDF in /public
  disclaimer:
    "Pictures, visuals, perspective views, plans and furnishings are indicative and for representation only. Subject to approval of competent authorities and RERA rules.",

  // Palette is mirrored in app/globals.css (:root). Keep both in sync.
  colors: {
    ivory: "#F4EFE6",
    ink: "#0A0A0A",
    forest: "#1B2620",
    gold: "#C2A878",
    stone: "#D9D2C5",
  },

  // Building structure (from brief): Ground = stilt parking, L1 = podium parking,
  // L2–L13 residences, L14 = amenities on the top floor.
  building: {
    stiltLevel: 0,
    podiumLevel: 1,
    firstResidential: 2,
    lastResidential: 13,
    amenityLevel: 14,
  },

  // Image paths — REPLACE placeholders with real photography in /public/images
  images: {
    hero: "/images/tower-night.jpg",
    dusk: "/images/tower-dusk.jpg",
    day: "/images/tower-day.jpg",
    // Lifestyle photos are NOT in the brochure. Drop files here to replace the
    // gradient placeholders (each falls back gracefully if missing).
    // All cut from the supplied brochure renders (native resolution; swap in originals for true 4K).
    interiorA: "/images/interior-living.jpg",
    interiorB: "/images/interior-suite.jpg",
    wellness: "/images/courtyard.jpg",
    lifestyle: "/images/clubhouse.jpg",
    collage: ["/images/interior-master.jpg", "/images/interior-kitchen.jpg", "/images/interior-dining.jpg"],
    whyCity: "/images/tower-left-day.jpg",
    complex: "/images/complex-night.jpg",
    pattern: "/images/brand-pattern.jpg",
    // Facade strips mapped onto the 3D tower (components/tower/Floor.tsx)
    facadeFront: "/images/facade-front.jpg",
    facadeSide: "/images/facade-side.jpg",
    // Photo for each amenity card in the horizontal scroller (cycled)
    amenityCards: ["/images/courtyard.jpg", "/images/clubhouse.jpg", "/images/interior-balcony.jpg", "/images/tower-left-day.jpg", "/images/interior-bedroom.jpg", "/images/complex-night.jpg"],
    gallery: [
      { src: "/images/courtyard.jpg", caption: "The courtyard, from the lawn", span: "md:col-span-8 md:row-span-2 aspect-[16/10]" },
      { src: "/images/clubhouse.jpg", caption: "Clubhouse arrival canopy", span: "md:col-span-4 aspect-[4/3]" },
      { src: "/images/interior-balcony.jpg", caption: "Balcony living", span: "md:col-span-4 aspect-[4/3]" },
      { src: "/images/complex-night.jpg", caption: "The towers after dark", span: "md:col-span-7 aspect-[16/10]" },
      { src: "/images/interior-bedroom.jpg", caption: "Quiet bedrooms", span: "md:col-span-5 aspect-[4/3]" },
    ],
  },
  video: { src: "/media/walkthrough.mp4", poster: "/images/tower-dusk.jpg" }, // REPLACE

  stats: [
    // REPLACE with verified project facts
    { value: 13, suffix: "", label: "Levels above podium" },
    { value: 4, suffix: "", label: "Residence types" },
    { value: 24, suffix: "", label: "Lifestyle amenities" },
  ],

  whyCity: {
    title: ["Why", "Silvassa"],
    body: "A calm, green gateway between Gujarat and Maharashtra, with wide roads, rolling hills and the Damanganga close by. Eden Court gives you the quiet of the valley with the whole region within reach.",
  },

  // Neighbourhood drive times — REPLACE with verified values
  neighbourhood: [
    { name: "Eden Court", minutes: 0, x: 50, y: 52, home: true },
    { name: "Silvassa town", minutes: 15, x: 66, y: 38 },
    { name: "Vapi railway station", minutes: 35, x: 24, y: 28 },
    { name: "Daman beaches", minutes: 50, x: 20, y: 74 },
    { name: "Mumbai highway (NH48)", minutes: 30, x: 80, y: 70 },
  ],

  // 12 ways to spend a day — mapped from the brochure's amenity icons
  amenities: [
    { title: "Swimming Pool", copy: "Slow mornings by the water." },
    { title: "Spa", copy: "Quiet rooms to reset." },
    { title: "Gym", copy: "Equipped for every routine." },
    { title: "Home Theatre", copy: "Cinema evenings at home." },
    { title: "Roof Top Sky Garden", copy: "Dinner under open sky." },
    { title: "Yoga Studio", copy: "Stillness above the city." },
    { title: "Cafe Dining", copy: "Coffee, without leaving home." },
    { title: "Garden & Seating Area", copy: "Green rooms outdoors." },
    { title: "Walking & Jogging Tracks", copy: "Laps in the open air." },
    { title: "Multipurpose Hall", copy: "Gatherings of every size." },
    { title: "Sports Courts", copy: "Football, cricket, badminton, basketball, pickleball." },
    { title: "Party Area & Pergola", copy: "Celebrations, beautifully hosted." },
  ],

  languages: ["en", "ar", "zh", "ru", "fr"] as const,
  currencies: {
    // REPLACE rates with a live source before launch
    INR: { symbol: "₹", rate: 1 },
    USD: { symbol: "$", rate: 0.012 },
    AED: { symbol: "AED ", rate: 0.044 },
    EUR: { symbol: "€", rate: 0.011 },
    GBP: { symbol: "£", rate: 0.0095 },
  },
} as const;

export type Lang = (typeof site.languages)[number];
export type Currency = keyof typeof site.currencies;
