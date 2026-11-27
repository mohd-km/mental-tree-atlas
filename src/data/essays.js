import { DOMAINS } from './domains.js';

// Maps each essay on mohammed-km.in/post/<slug> to the graph ideas it covers.
const ESSAY_METADATA = {
  'neuromorphic-computing': {
    title: 'Neuromorphic Computing',
    domain: 'ai-computing',
    nodeIds: ['pattern-recognition-mind', 'memory-wall']
  },
  'tools-of-coevolution': {
    title: 'Tools of Coevolution',
    domain: 'biology-longevity',
    nodeIds: ['bottom-up-evolution', 'accelerating-returns']
  },
  'bayesian-intelligence': {
    title: 'Bayesian Intelligence',
    domain: 'systems-epistemology',
    nodeIds: ['bayesian-updating']
  },
  'computable-vs-cantgotu-worlds': {
    title: 'Computable vs. Cantgotu Worlds',
    domain: 'ai-computing',
    nodeIds: ['computable-universe', 'quantum-simulation']
  },
  'self-reference-paradox': {
    title: 'Self-Reference Paradox',
    domain: 'ai-computing',
    nodeIds: ['strange-loops']
  },
  'mapping-connectome': {
    title: 'Mapping the Connectome',
    domain: 'biology-longevity',
    nodeIds: ['connectome-map']
  },
  'reward-prediction-error': {
    title: 'Reward Prediction Error',
    domain: 'biology-longevity',
    nodeIds: ['dopamine-homeostasis']
  },
  'fractal-theory': {
    title: 'Fractal Theory',
    domain: 'systems-epistemology',
    nodeIds: ['fractal-scale-invariance']
  },
  'cryptographic-history': {
    title: 'Cryptographic History',
    domain: 'economics-strategy',
    nodeIds: ['blockchain-trust']
  },
  'memetic-evolution': {
    title: 'Memetic Evolution',
    domain: 'systems-epistemology',
    nodeIds: ['memetic-evolution', 'bottom-up-evolution']
  },
  'genome-vs-epigenome': {
    title: 'Genome vs. Epigenome',
    domain: 'biology-longevity',
    nodeIds: ['epigenome-switches', 'biological-age']
  },
  'science-of-longevity': {
    title: 'Science of Longevity',
    domain: 'biology-longevity',
    nodeIds: ['medicine-3-0', 'biological-age', 'centenarian-decathlon', 'metabolic-flexibility']
  },
  'customer-trap': {
    title: 'Customer Trap',
    domain: 'economics-strategy',
    nodeIds: ['customer-trap']
  },
  'tale-of-two-commercials': {
    title: 'Tale of Two Commercials',
    domain: 'economics-strategy',
    nodeIds: ['brand-story']
  },
  'accelerated-vaccine-development': {
    title: 'Accelerated Vaccine Development',
    domain: 'ai-computing',
    nodeIds: ['ai-protein-folding']
  },
  'ecstasis-economy': {
    title: 'Ecstasis Economy',
    domain: 'character-craft',
    nodeIds: ['flow-state']
  },
  'hooked-model': {
    title: 'Hooked Model',
    domain: 'economics-strategy',
    nodeIds: ['habit-loop', 'dopamine-homeostasis']
  },
  'dissecting-genetic-code': {
    title: 'Dissecting the Genetic Code',
    domain: 'biology-longevity',
    nodeIds: ['biology-as-information']
  },
  'quantum-interference-manipulation': {
    title: 'Quantum Interference Manipulation',
    domain: 'physics-energy',
    nodeIds: ['quantum-interference', 'quantum-simulation']
  },
  'evolutionary-epistemology': {
    title: 'Evolutionary Epistemology',
    domain: 'systems-epistemology',
    nodeIds: ['hard-to-vary']
  },
  'future-of-energy-storage': {
    title: 'Future of Energy Storage',
    domain: 'physics-energy',
    nodeIds: ['electrification-tco']
  },
  'space-time-continuum': {
    title: 'Space-Time Continuum',
    domain: 'physics-energy',
    nodeIds: ['curved-spacetime']
  },
  'interesting-blockchain-applications': {
    title: 'Interesting Blockchain Applications',
    domain: 'economics-strategy',
    nodeIds: ['blockchain-trust']
  },
  'peak-end-rule': {
    title: 'Peak-End Rule Error',
    domain: 'character-craft',
    nodeIds: ['peak-end']
  },
  'dual-mental-systems': {
    title: 'Dual Mental Systems',
    domain: 'systems-epistemology',
    nodeIds: ['dual-systems']
  },
  'perils-of-iatrogenics': {
    title: 'Perils of Iatrogenics',
    domain: 'economics-strategy',
    nodeIds: ['antifragile-convexity', 'via-negativa']
  },
  'rigid-theorization-problem': {
    title: 'Rigid Theorization Problem',
    domain: 'systems-epistemology',
    nodeIds: ['extremistan-fat-tails']
  },
  'organism-or-algorithms': {
    title: 'Organism or Algorithms?',
    domain: 'ai-computing',
    nodeIds: ['organisms-as-algorithms']
  },
  'world-of-intersubjective-realities': {
    title: 'World of Intersubjective Realities',
    domain: 'systems-epistemology',
    nodeIds: ['shared-stories']
  },
  'a-lesson-from-scientific-revolution': {
    title: 'A Lesson from the Scientific Revolution',
    domain: 'systems-epistemology',
    nodeIds: ['discovery-of-ignorance', 'accelerating-returns']
  },
  'prisoners-to-old-brain': {
    title: 'Prisoners to Old Brain',
    domain: 'character-craft',
    nodeIds: ['emotional-regulation']
  },
  'navigating-sunk-cost-effect': {
    title: 'Navigating the Sunk Cost Effect',
    domain: 'economics-strategy',
    nodeIds: ['sunk-cost']
  },
  'simplicity-is-the-ultimate-sophistication': {
    title: 'Simplicity Is the Ultimate Sophistication',
    domain: 'character-craft',
    nodeIds: ['radical-simplification']
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
