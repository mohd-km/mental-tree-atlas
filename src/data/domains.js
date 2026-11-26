export const DOMAINS = [
  {
    id: 'ai-computing',
    name: 'AI & Computing',
    short: 'AI & Compute',
    code: 'AIC',
    color: '#1d4ed8',
    glow: 'rgba(29, 78, 216, 0.14)',
    angle: -Math.PI / 2,
    description: 'Computational intelligence, pattern hierarchies, alignment, and software leverage.'
  },
  {
    id: 'physics-energy',
    name: 'Physics & Energy',
    short: 'Physics & Energy',
    code: 'PHY',
    color: '#b45309',
    glow: 'rgba(180, 83, 9, 0.14)',
    angle: -Math.PI / 6,
    description: 'Thermodynamic limits, quantum substrates, energy transitions, and industrial hardware.'
  },
  {
    id: 'biology-longevity',
    name: 'Biology & Longevity',
    short: 'Bio & Longevity',
    code: 'BIO',
    color: '#0f766e',
    glow: 'rgba(15, 118, 110, 0.14)',
    angle: Math.PI / 6,
    description: 'Medicine 3.0, metabolic architecture, evolutionary information, and neurochemical balance.'
  },
  {
    id: 'economics-strategy',
    name: 'Economics & Strategy',
    short: 'Econ & Strategy',
    code: 'ECO',
    color: '#c2410c',
    glow: 'rgba(194, 65, 12, 0.14)',
    angle: Math.PI / 2,
    description: 'Convexity, permissionless leverage, bottom-up innovation, and fat-tailed markets.'
  },
  {
    id: 'systems-epistemology',
    name: 'Systems & Epistemology',
    short: 'Systems & Epist.',
    code: 'SYS',
    color: '#0369a1',
    glow: 'rgba(3, 105, 161, 0.14)',
    angle: (5 * Math.PI) / 6,
    description: 'Hard-to-vary explanations, feedback loops, fractals, and self-referential structure.'
  },
  {
    id: 'character-craft',
    name: 'Character & Craft',
    short: 'Character & Craft',
    code: 'CHR',
    color: '#6d28d9',
    glow: 'rgba(109, 40, 217, 0.14)',
    angle: (-5 * Math.PI) / 6,
    description: 'Moral invariants, attention architecture, radical simplification, and civilizational perspective.'
  }
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));
