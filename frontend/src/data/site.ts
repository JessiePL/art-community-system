export const siteMoments = [
  {
    kicker: "Home",
    title: "Immersive brand landing",
    description:
      "Hero messaging, hot merch, and event entry points shape the first impression.",
  },
  {
    kicker: "Commerce",
    title: "Member-only ordering",
    description:
      "The storefront is open to everyone, but checkout is intentionally restricted.",
  },
  {
    kicker: "Community",
    title: "Offline activation",
    description:
      "Events are part of the core loop, not a hidden extra page.",
  },
];

export const characterHighlights = [
  {
    name: "Tanjiro Kamado",
    role: "Compassionate swordsman",
    story:
      "A warm-hearted protagonist whose resilience anchors the emotional tone of the collection.",
    signature: "Signature visual cue: water-breathing arcs, hanafuda earrings, crimson resolve.",
    tags: ["Determined", "Water Breathing", "Lead"],
  },
  {
    name: "Nezuko Kamado",
    role: "Demon sister with fierce grace",
    story:
      "Balances innocence and explosive power, making her a natural icon for expressive art drops.",
    signature: "Signature visual cue: bamboo muzzle, pink eyes, motion-heavy kick poses.",
    tags: ["Protective", "Demon Form", "Fan Favorite"],
  },
  {
    name: "Zenitsu Agatsuma",
    role: "Fearful genius under pressure",
    story:
      "Perfect for contrast-heavy illustrations that switch from comedy to lightning-fast intensity.",
    signature: "Signature visual cue: thunder streaks, sleep-state action, yellow gradients.",
    tags: ["Thunder", "Comedy", "Burst Damage"],
  },
  {
    name: "Inosuke Hashibira",
    role: "Wild instinct and raw motion",
    story:
      "Adds aggressive energy and kinetic posing to the universe, ideal for merch-forward compositions.",
    signature: "Signature visual cue: boar mask, dual blades, feral silhouette.",
    tags: ["Dual Blades", "Wild", "Chaos"],
  },
];

export const creatorCredits = {
  author: {
    kicker: "Original Author",
    name: "Koyoharu Gotouge",
    image: "/Koyoharu Gotouge.jpg",
    description:
      "Koyoharu Gotouge is the original manga creator of Demon Slayer. Their work established the emotional core, visual iconography, and character relationships that made the series resonate so strongly with readers.",
    detail:
      "This section focuses on the source creator behind the worldbuilding, sword styles, and dramatic tone that shaped the entire franchise.",
    tags: ["Manga Creator", "Original Story", "Kimetsu no Yaiba"],
  },
  studio: {
    kicker: "Animation Studio",
    name: "ufotable",
    image: "/Ufotable_logo.svg.png",
    description:
      "ufotable is the animation studio responsible for the anime adaptation. Their production elevated the series through cinematic compositing, lighting, battle choreography, and highly polished effects work.",
    detail:
      "This card highlights the studio side of the project: the team that transformed the manga into the anime version recognized for its visual spectacle.",
    tags: ["Anime Production", "Visual Effects", "Cinematic Adaptation"],
  },
};

export const merchandiseCatalog: Array<{
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
  note: string;
  lead?: string;
  detail?: string;
  sizeStock?: Partial<Record<"S" | "M" | "L" | "XL", number>>;
}> = [
  {
    id: "66f100000000000000000001",
    name: "Hashira Signal Tee",
    category: "T-shirt",
    price: 38,
    stock: 24,
    image: "/t-shirt.png",
    note: "Heavyweight cotton tee designed as a statement launch piece.",
    lead: "Wearable drop",
    detail:
      "A front-led apparel piece designed for daily styling, event wear, and statement fan looks.",
    sizeStock: {
      S: 5,
      M: 8,
      L: 7,
      XL: 4,
    },
  },
  {
    id: "66f100000000000000000002",
    name: "Nezuko Dawn Mug",
    category: "Mug",
    price: 24,
    stock: 31,
    image: "/mug.png",
    note: "Soft pink ceramic mug built for desk setups and collector shelves.",
    lead: "Desk collectible",
    detail:
      "A practical display item for home setups, shelves, and daily use without losing the anime visual identity.",
  },
  {
    id: "66f100000000000000000003",
    name: "Corps Canvas Carry",
    category: "Canvas Bag",
    price: 29,
    stock: 18,
    image: "/bag.png",
    note: "Utility-focused tote with bold icon framing and convention-ready size.",
    lead: "Carry essential",
    detail:
      "A roomy convention-ready tote built for sketchbooks, small purchases, and everyday fandom styling.",
  },
];

export const membershipPlans = [
  {
    kicker: "Entry",
    name: "Moonlight Pass",
    price: "$9 / month",
    summary:
      "For fans who want event reminders, profile history, and community updates.",
    benefits: ["Early event notices", "Saved favorites", "Community activity feed"],
  },
  {
    kicker: "Commerce",
    name: "Hashira Member",
    price: "$19 / month",
    summary:
      "Unlocks the main business rule of the MVP: member-only merch checkout.",
    benefits: [
      "Place merchandise orders",
      "Friendlier return policy",
      "Priority access to drops",
    ],
  },
  {
    kicker: "Creator Circle",
    name: "Studio Black Tier",
    price: "$39 / month",
    summary:
      "Adds premium access for future behind-the-scenes posts and artist sessions.",
    benefits: [
      "Limited-run previews",
      "Private process notes",
      "Reserved live sketch seats",
    ],
  },
];

export const eventShowcase = [
  {
    id: "event-mugen-night",
    date: "Apr 12",
    title: "Mugen Sketch Night",
    description:
      "An in-person drawing jam with pose prompts, soundtrack cues, and merch preview tables.",
    location: "Vancouver Art Lab",
    capacity: 60,
  },
  {
    id: "event-nezuko-popup",
    date: "May 03",
    title: "Nezuko Merch Pop-up",
    description:
      "Mini exhibition for new accessories, portrait wall pieces, and community photo moments.",
    location: "Granville Street Studio",
    capacity: 80,
  },
  {
    id: "event-hashira-panel",
    date: "Jun 21",
    title: "Hashira Visual World Panel",
    description:
      "A creator talk on character styling, fandom products, and how scenes become sellable art.",
    location: "Downtown Media Hall",
    capacity: 120,
  },
];

export const profileSnapshots = {
  guest: {
    title: "Public visitor view",
    description:
      "Guests can browse the world, characters, merch, and events, but protected actions remain blocked.",
    cards: [
      {
        kicker: "Orders",
        title: "Checkout locked",
        description: "Member verification is required before placing any merch order.",
      },
      {
        kicker: "Events",
        title: "Join flow locked",
        description: "Login is required before reserving a spot for any offline event.",
      },
    ],
  },
  fan: {
    title: "Logged-in fan dashboard",
    description:
      "A regular fan can manage profile basics, join events, and prepare for membership conversion.",
    cards: [
      {
        kicker: "Membership",
        title: "Upgrade recommended",
        description: "Switch to member status to unlock ordering and better return terms.",
      },
      {
        kicker: "Events",
        title: "Registration enabled",
        description: "This role can join and cancel event reservations normally.",
      },
    ],
  },
  member: {
    title: "Active member profile",
    description:
      "Members have access to order history, reduced friction on returns, and exclusive merch access.",
    cards: [
      {
        kicker: "Orders",
        title: "Member checkout open",
        description: "Your member identity satisfies the core MVP ordering rule.",
      },
      {
        kicker: "Returns",
        title: "Friendly return path",
        description: "Return requests can proceed without the standard non-member handling fee.",
      },
    ],
  },
  admin: {
    title: "Admin / creator control view",
    description:
      "Represents the future management side for products, events, characters, and community content.",
    cards: [
      {
        kicker: "Content",
        title: "Management-ready",
        description: "This role maps to the architecture note about protected creator-side controls.",
      },
      {
        kicker: "System",
        title: "API integration next",
        description: "The frontend is prepared for an eventual role-based backend contract.",
      },
    ],
  },
} as const;
type ProductCategory = "T-shirt" | "Mug" | "Canvas Bag";
