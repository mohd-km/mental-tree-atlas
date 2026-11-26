import { DOMAINS } from './domains.js';

// Curated mapping from mohammed-km.in/post/<slug> to Atlas domains and Knowledge Graph nodes.
const ESSAY_METADATA = {
  'neuromorphic-computing': {
    title: 'Neuromorphic Computing',
    domain: 'ai-computing',
    nodeIds: ['accelerating-returns', 'pattern-recognition-mind', 'cloud-neocortex']
  },
  'tools-of-coevolution': {
    title: 'Tools of Coevolution',
    domain: 'biology-longevity',
    nodeIds: ['bottom-up-evolution', 'biology-as-information', 'combinatorial-innovation']
  },
  'bayesian-intelligence': {
    title: 'Bayesian Intelligence',
    domain: 'systems-epistemology',
    nodeIds: ['hard-to-vary', 'pattern-recognition-mind', 'judgment-compounding']
  },
  'computable-vs-cantgotu-worlds': {
    title: 'Computable vs. Cantgotu Worlds',
    domain: 'systems-epistemology',
    nodeIds: ['universal-explainers', 'poetic-naturalism', 'strange-loops']
  },
  'self-reference-paradox': {
    title: 'Self-Reference Paradox',
    domain: 'ai-computing',
    nodeIds: ['strange-loops', 'universal-explainers', 'orthogonality-thesis']
  },
  'mapping-connectome': {
    title: 'Mapping the Connectome',
    domain: 'biology-longevity',
    nodeIds: ['pattern-recognition-mind', 'biology-as-information', 'sleep-glymphatic']
  },
  'reward-prediction-error': {
    title: 'Reward Prediction Error',
    domain: 'biology-longevity',
    nodeIds: ['dopamine-homeostasis', 'attention-architecture', 'emotional-regulation']
  },
  'fractal-theory': {
    title: 'Fractal Theory',
    domain: 'systems-epistemology',
    nodeIds: ['fractal-scale-invariance', 'wild-randomness', 'extremistan-fat-tails']
  },
  'cryptographic-history': {
    title: 'Cryptographic History',
    domain: 'ai-computing',
    nodeIds: ['permissionless-leverage', 'telemetry-closed-loop', 'civilizational-cycles']
  },
  'memetic-evolution': {
    title: 'Memetic Evolution',
    domain: 'biology-longevity',
    nodeIds: ['bottom-up-evolution', 'civilizational-cycles', 'combinatorial-innovation']
  },
  'genome-vs-epigenome': {
    title: 'Genome vs. Epigenome',
    domain: 'biology-longevity',
    nodeIds: ['biology-as-information', 'metabolic-flexibility', 'medicine-3-0']
  },
  'science-of-longevity': {
    title: 'Science of Longevity',
    domain: 'biology-longevity',
    nodeIds: ['medicine-3-0', 'centenarian-decathlon', 'metabolic-flexibility', 'apob-prevention']
  },
  'customer-trap': {
    title: 'Customer Trap',
    domain: 'economics-strategy',
    nodeIds: ['combinatorial-innovation', 'unit-economics-diligence', 'system-leverage-points']
  },
  'tale-of-two-commercials': {
    title: 'Tale of Two Commercials',
    domain: 'economics-strategy',
    nodeIds: ['specific-knowledge', 'radical-simplification', 'deliberate-ai-simplicity']
  },
  'accelerated-vaccine-development': {
    title: 'Accelerated Vaccine Development',
    domain: 'biology-longevity',
    nodeIds: ['biology-as-information', 'accelerating-returns', 'medicine-3-0']
  },
  'ecstasis-economy': {
    title: 'Ecstasis Economy',
    domain: 'character-craft',
    nodeIds: ['attention-architecture', 'dopamine-homeostasis', 'internal-self-mastery']
  },
  'hooked-model': {
    title: 'Hooked Model',
    domain: 'economics-strategy',
    nodeIds: ['dopamine-homeostasis', 'deliberate-ai-simplicity', 'feedback-delays']
  },
  'dissecting-genetic-code': {
    title: 'Dissecting the Genetic Code',
    domain: 'biology-longevity',
    nodeIds: ['biology-as-information', 'universal-explainers', 'poetic-naturalism']
  },
  'quantum-interference-manipulation': {
    title: 'Quantum Interference Manipulation',
    domain: 'physics-energy',
    nodeIds: ['quantum-simulation', 'emergent-spacetime', 'asymptotic-limits']
  },
  'evolutionary-epistemology': {
    title: 'Evolutionary Epistemology',
    domain: 'systems-epistemology',
    nodeIds: ['hard-to-vary', 'principle-of-optimism', 'universal-explainers']
  },
  'future-of-energy-storage': {
    title: 'Future of Energy Storage',
    domain: 'physics-energy',
    nodeIds: ['kardashev-energy', 'electrification-tco', 'first-principles-physics', 'asymptotic-limits']
  },
  'space-time-continuum': {
    title: 'Space-Time Continuum',
    domain: 'physics-energy',
    nodeIds: ['emergent-spacetime', 'poetic-naturalism', 'cosmic-humility']
  },
  'interesting-blockchain-applications': {
    title: 'Interesting Blockchain Applications',
    domain: 'economics-strategy',
    nodeIds: ['permissionless-leverage', 'skin-in-the-game', 'combinatorial-innovation']
  },
  'peak-end-rule': {
    title: 'Peak-End Rule Error',
    domain: 'character-craft',
    nodeIds: ['emotional-regulation', 'judgment-compounding', 'internal-self-mastery']
  },
  'dual-mental-systems': {
    title: 'Dual Mental Systems',
    domain: 'character-craft',
    nodeIds: ['emotional-regulation', 'judgment-compounding', 'internal-self-mastery']
  },
  'perils-of-iatrogenics': {
    title: 'Perils of Iatrogenics',
    domain: 'economics-strategy',
    nodeIds: ['antifragile-convexity', 'via-negativa', 'skin-in-the-game', 'medicine-3-0']
  },
  'rigid-theorization-problem': {
    title: 'Rigid Theorization Problem',
    domain: 'systems-epistemology',
    nodeIds: ['system-leverage-points', 'feedback-delays', 'extremistan-fat-tails', 'wild-randomness']
  },
  'organism-or-algorithms': {
    title: 'Organism or Algorithms?',
    domain: 'ai-computing',
    nodeIds: ['pattern-recognition-mind', 'biology-as-information', 'orthogonality-thesis', 'instrumental-convergence']
  },
  'world-of-intersubjective-realities': {
    title: 'World of Intersubjective Realities',
    domain: 'systems-epistemology',
    nodeIds: ['civilizational-cycles', 'poetic-naturalism', 'character-invariants']
  },
  'a-lesson-from-scientific-revolution': {
    title: 'A Lesson from the Scientific Revolution',
    domain: 'systems-epistemology',
    nodeIds: ['hard-to-vary', 'principle-of-optimism', 'civilizational-cycles', 'first-principles-physics']
  },
  'prisoners-to-old-brain': {
    title: 'Prisoners to Old Brain',
    domain: 'character-craft',
    nodeIds: ['dopamine-homeostasis', 'emotional-regulation', 'attention-architecture', 'internal-self-mastery']
  },
  'navigating-sunk-cost-effect': {
    title: 'Navigating the Sunk Cost Effect',
    domain: 'economics-strategy',
    nodeIds: ['judgment-compounding', 'via-negativa', 'unit-economics-diligence', 'five-step-algorithm']
  },
  'simplicity-is-the-ultimate-sophistication': {
    title: 'Simplicity Is the Ultimate Sophistication',
    domain: 'character-craft',
    nodeIds: ['radical-simplification', 'five-step-algorithm', 'deliberate-ai-simplicity', 'emergent-levels']
  }
};

function extractSlug(url) {
  try {
    const clean = String(url || '').replace(/\/+$/, '');
    const parts = clean.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

function toDisplayTitle(raw) {
  const minor = new Set(['of', 'the', 'vs', 'or', 'from', 'to', 'a', 'an', 'in', 'on', 'and']);
  return String(raw || '')
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minor.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatExcerpt(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (/[.!?]$/.test(text)) return text;
  // Trim any mid-word truncation from fixed-length excerpts
  const trimmed = text.replace(/\s+\S*$/, '').replace(/[,;:\-\u2014]+$/, '');
  return `${trimmed || text}...`;
}

function inferDomain(article) {
  const hay = `${article.title || ''} ${article.excerpt || ''}`.toLowerCase();
  if (/(quantum|energy|space time|relativity|physics|battery)/.test(hay)) return 'physics-energy';
  if (/(genome|genetic|longevity|vaccine|dopamine|connectome|evolution|biological)/.test(hay)) return 'biology-longevity';
  if (/(neuromorphic|algorithm|cryptograph|self-reference|ai\b|computing)/.test(hay)) return 'ai-computing';
  if (/(customer|commercial|hooked|blockchain|iatrogenic|sunk cost|business|market)/.test(hay)) return 'economics-strategy';
  if (/(ecstasis|peak-end|dual mental|old brain|simplicity|focus)/.test(hay)) return 'character-craft';
  return 'systems-epistemology';
}

export async function loadEssays() {
  const response = await fetch('./data/articles.json');
  if (!response.ok) {
    throw new Error(`Failed to load articles.json (${response.status})`);
  }
  const rawList = await response.json();
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item) => {
    const slug = extractSlug(item.url);
    const meta = ESSAY_METADATA[slug];
    return {
      slug,
      rawTitle: item.title || '',
      title: meta ? meta.title : toDisplayTitle(item.title),
      url: item.url,
      excerpt: formatExcerpt(item.excerpt),
      domain: meta ? meta.domain : inferDomain(item),
      nodeIds: meta ? meta.nodeIds : []
    };
  });
}

export function getEssaysForNode(essays, nodeId) {
  if (!Array.isArray(essays) || !nodeId) return [];
  return essays.filter((essay) => essay.nodeIds.includes(nodeId));
}

export function groupEssaysByDomain(essays) {
  const groups = new Map();
  for (const dom of DOMAINS) {
    groups.set(dom.id, []);
  }
  for (const essay of essays) {
    if (!groups.has(essay.domain)) {
      groups.set(essay.domain, []);
    }
    groups.get(essay.domain).push(essay);
  }
  return DOMAINS.map((dom) => ({
    domain: dom,
    essays: groups.get(dom.id) || []
  })).filter((g) => g.essays.length > 0);
}
