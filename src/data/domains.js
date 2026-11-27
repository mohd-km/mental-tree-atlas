export const DOMAINS = [
  {
    id: 'ai-computing',
    name: 'AI & Computers',
    short: 'AI',
    code: 'AIC',
    color: '#1d4ed8',
    glow: 'rgba(29, 78, 216, 0.14)',
    angle: -Math.PI / 2,
    description: 'How computers and AI work, what limits them, and what they mean for us.'
  },
  {
    id: 'physics-energy',
    name: 'Physics & Energy',
    short: 'Physics',
    code: 'PHY',
    color: '#b45309',
    glow: 'rgba(180, 83, 9, 0.14)',
    angle: -Math.PI / 6,
    description: 'Starting from the physics, the limits it sets, and where our energy comes from.'
  },
  {
    id: 'biology-longevity',
    name: 'Biology & Health',
    short: 'Biology',
    code: 'BIO',
    color: '#0f766e',
    glow: 'rgba(15, 118, 110, 0.14)',
    angle: Math.PI / 6,
    description: 'Genes, the brain, ageing well and how evolution shaped us.'
  },
  {
    id: 'economics-strategy',
    name: 'Business & Money',
    short: 'Business',
    code: 'BIZ',
    color: '#c2410c',
    glow: 'rgba(194, 65, 12, 0.14)',
    angle: Math.PI / 2,
    description: 'Why products stick, why companies fail, and how to decide under risk.'
  },
  {
    id: 'systems-epistemology',
    name: 'Thinking & Knowing',
    short: 'Thinking',
    code: 'THK',
    color: '#0369a1',
    glow: 'rgba(3, 105, 161, 0.14)',
    angle: (5 * Math.PI) / 6,
    description: 'How we learn what is true, and the mental traps along the way.'
  },
  {
    id: 'character-craft',
    name: 'Character & Habits',
    short: 'Character',
    code: 'CHR',
    color: '#6d28d9',
    glow: 'rgba(109, 40, 217, 0.14)',
    angle: (-5 * Math.PI) / 6,
    description: 'Focus, self-control, trust and learning that adds up over a lifetime.'
  }
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));
