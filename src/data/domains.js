export const DOMAINS = [
  {
    id: 'ai-computing',
    name: 'AI & Computing',
    short: 'AI & Compute',
    code: 'AIC',
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.32)',
    angle: -Math.PI / 2,
    description: 'Computational intelligence, pattern hierarchies, alignment, and software leverage.'
  },
  {
    id: 'physics-energy',
    name: 'Physics & Energy',
    short: 'Physics & Energy',
    code: 'PHY',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.30)',
    angle: -Math.PI / 6,
    description: 'Thermodynamic limits, quantum substrates, energy transitions, and industrial hardware.'
  },
  {
    id: 'biology-longevity',
    name: 'Biology & Longevity',
    short: 'Bio & Longevity',
    code: 'BIO',
    color: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.30)',
    angle: Math.PI / 6,
    description: 'Medicine 3.0, metabolic architecture, evolutionary information, and neurochemical balance.'
  },
  {
    id: 'economics-strategy',
    name: 'Economics & Strategy',
    short: 'Econ & Strategy',
    code: 'ECO',
    color: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.30)',
    angle: Math.PI / 2,
    description: 'Convexity, permissionless leverage, bottom-up innovation, and fat-tailed markets.'
  },
  {
    id: 'systems-epistemology',
    name: 'Systems & Epistemology',
    short: 'Systems & Epist.',
    code: 'SYS',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.32)',
    angle: (5 * Math.PI) / 6,
    description: 'Hard-to-vary explanations, feedback loops, fractals, and self-referential structure.'
  },
  {
    id: 'character-craft',
    name: 'Character & Craft',
    short: 'Character & Craft',
    code: 'CHR',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.30)',
    angle: (-5 * Math.PI) / 6,
    description: 'Moral invariants, attention architecture, radical simplification, and civilizational perspective.'
  }
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));
