export const LENS_META = [
  {
    id: 'deutsch',
    thinker: 'David Deutsch',
    framework: 'Hard-to-Vary Test',
    domain: 'Epistemology',
    color: '#0369a1',
    question: 'If you swap out a key mechanism, does the entire thesis collapse—or is it an interchangeable slogan?'
  },
  {
    id: 'taleb',
    thinker: 'Nassim Taleb',
    framework: 'Fragility & Tail Risk',
    domain: 'Risk Architecture',
    color: '#c2410c',
    question: 'Does volatility, platform change, or a demand shock break the balance sheet—or create asymmetric upside?'
  },
  {
    id: 'musk',
    thinker: 'Elon Musk',
    framework: '5-Step Deletion Algorithm',
    domain: 'First-Principles Engineering',
    color: '#b45309',
    question: 'What is the atomic/physics floor, and which requirements, parts, or steps should be deleted before automating?'
  },
  {
    id: 'meadows',
    thinker: 'Donella Meadows',
    framework: 'System Leverage Points',
    domain: 'Systems Dynamics',
    color: '#0f766e',
    question: 'Are you tweaking low-leverage parameters, or altering information flows, rules, goals, and feedback loops?'
  }
];

export const SAMPLE_THESES = [
  {
    id: 'ai-wrapper-saas',
    label: 'AI Wrapper SaaS',
    tag: 'Software / AI',
    thesis:
      'A vertical AI workflow SaaS built on frontier LLM APIs that drafts compliance filings and automates document review for mid-market firms.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Weak causal moat. The compliance bottleneck is real, but "built on frontier LLM APIs" is easy to vary—any competitor or the model provider itself can replicate a thin prompt layer.',
        failureMode: 'Model-provider absorption: the next frontier release ships native compliance templates, erasing wrapper margin overnight.',
        directive: 'Anchor the explanation in a hard-to-vary mechanism: deterministic rule-engine verification, private audit-trail ground truth, or deep ERP write-back.',
        checks: [
          { label: 'Causal mechanism cannot be swapped for a generic LLM prompt', pass: false, weight: 8 },
          { label: 'Explains why incumbents fail structurally, not just culturally', pass: true, weight: 8 },
          { label: 'Produces falsifiable accuracy benchmarks on real edge cases', pass: false, weight: 5 },
          { label: 'Value persists even if base model intelligence doubles tomorrow', pass: false, weight: 4 }
        ]
      },
      taleb: {
        summary:
          'Fragile to upstream API pricing, rate limits, and platform commoditization. Low fixed capex keeps immediate ruin risk bounded, but customer churn is convex downward.',
        failureMode: 'Platform dependency plus low switching cost creates negative convexity during model price wars.',
        directive: 'Apply via negativa: strip generic chat interfaces and lock into multi-model routing plus sticky system-of-record workflows so model deflation becomes a tailwind.',
        checks: [
          { label: 'No single upstream API or platform holds a kill-switch', pass: false, weight: 8 },
          { label: 'Fixed burn stays low enough to survive a 12-month sales freeze', pass: true, weight: 6 },
          { label: 'Gains from AI model deflation rather than losing margin to it', pass: false, weight: 6 },
          { label: 'Customers bear measurable switching cost via workflow state', pass: true, weight: 5 }
        ]
      },
      musk: {
        summary:
          'High risk of automating a bloated legacy compliance checklist instead of deleting redundant steps before introducing AI.',
        failureMode: 'Automating 14 manual review stages when 10 exist solely to satisfy outdated internal sign-off theatre.',
        directive: 'Run Steps 1-2 first: name the regulator or officer behind every field, delete non-statutory steps, simplify into one structured schema, then automate extraction.',
        checks: [
          { label: 'Every workflow requirement traced to a specific legal or human owner', pass: true, weight: 7 },
          { label: 'At least 30% of legacy manual steps deleted before AI automation', pass: false, weight: 6 },
          { label: 'Unit inference + human QA cost approaches the theoretical floor', pass: true, weight: 7 },
          { label: 'Cycle time compressed by an order of magnitude, not 15%', pass: false, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Intervenes mostly at Level 12 (parameters: faster drafting) rather than closing the real-time compliance feedback loop (Level 6: information flows).',
        leverageLevel: 'Level 12 — Parameters (faster drafting) unless closing Level 6 audit feedback',
        failureMode: 'Faster document generation increases downstream review congestion if the approval bottleneck remains untouched.',
        directive: 'Move up the leverage hierarchy: surface live violation telemetry directly to frontline operators before filings are ever generated.',
        checks: [
          { label: 'Intervenes above parameter-tweaking (alters feedback or rules)', pass: false, weight: 8 },
          { label: 'Shortens feedback delay between operational error and detection', pass: true, weight: 9 },
          { label: 'Creates a reinforcing data-quality loop as usage compounds', pass: false, weight: 4 },
          { label: 'Aligns buyer, compliance officer, and end-operator incentives', pass: false, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'ev-battery-swap',
    label: 'EV Battery Swap Network',
    tag: 'Hardware / Energy',
    thesis:
      'A capital-intensive urban battery-swapping station network serving commercial two-wheeler delivery fleets on a per-swap subscription.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Strong physical mechanism: commercial riders lose earnings during charging downtime, so decoupling battery ownership from the vehicle directly attacks both upfront capex and idle time.',
        failureMode: 'Fast-charging chemistry (5-10 min LFP) reaches cost parity, invalidating the core physical need for mechanical swap cabinets.',
        directive: 'Tighten the thesis around fleet density, thermal battery-life extension in climate-controlled cabinets, and grid peak-shaving arbitrage.',
        checks: [
          { label: 'Mechanism directly addresses physical downtime and capex barriers', pass: true, weight: 7 },
          { label: 'Explains why fast-charging will not obsolete swap stations in 5 years', pass: false, weight: 6 },
          { label: 'Pack standardization lock-in is specified rather than assumed', pass: true, weight: 6 },
          { label: 'Utilization math holds per station, not only in network averages', pass: true, weight: 6 }
        ]
      },
      taleb: {
        summary:
          'High balance-sheet fragility if financed with short-term debt. Heavy upfront battery inventory and real-estate leases create severe downside exposure if fleet utilization dips.',
        failureMode: 'Utilization falls 25% below forecast while debt service and battery degradation remain fixed, triggering a liquidity spiral.',
        directive: 'De-risk via barbell deployment: co-locate stations inside existing dark stores with anchor fleet take-or-pay contracts before expanding citywide.',
        checks: [
          { label: 'Asset-light or partner-hosted real estate avoids fixed lease ruin', pass: false, weight: 7 },
          { label: 'Battery capex matched to long-duration asset financing, not equity burn', pass: false, weight: 6 },
          { label: 'Anchor fleet contracts cover base station utilization floor', pass: true, weight: 7 },
          { label: 'Redundant pack chemistry roadmap hedges commodity lithium shocks', pass: false, weight: 5 }
        ]
      },
      musk: {
        summary:
          'Physics floor is set by kWh-per-km, cycle life, and pack weight. Mechanical robotics inside swap cabinets often violate the deletion algorithm when a 10 kg manual slide-in pack works faster.',
        failureMode: 'Over-engineering robotic swap arms that jam in dust and rain instead of deleting motorized linkages altogether.',
        directive: 'Delete robotic actuators for two-wheelers; standardize one rugged connector, simplify station thermal control, and keep swap turnaround under 45 seconds.',
        checks: [
          { label: 'Bill-of-materials modeled down to raw cell $/kWh and cycle-life floor', pass: true, weight: 6 },
          { label: 'Unnecessary mechanical/robotic station complexity deleted', pass: true, weight: 6 },
          { label: 'Station uptime and swap time verified in harsh field conditions', pass: false, weight: 8 },
          { label: 'Pack telemetry pinpoints cell degradation before field failure', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'High structural leverage at Level 5 (Rules of the System): decoupling battery-as-a-service changes vehicle ownership economics and turns stations into distributed grid buffers.',
        leverageLevel: 'Level 5 — Rules & Incentives (Battery-as-a-Service decoupling)',
        failureMode: 'Local utility tariff delays and fleet-aggregator bargaining power act as strong balancing loops compressing per-swap margin.',
        directive: 'Capture Level 6 information flows by linking pack state-of-health telemetry to dynamic off-peak charging tariffs.',
        checks: [
          { label: 'Changes economic rules of ownership (capex to per-km opex)', pass: true, weight: 8 },
          { label: 'Network density creates a reinforcing rider-availability loop', pass: true, weight: 6 },
          { label: 'Time delays in grid permits and station rollouts are buffered', pass: false, weight: 7 },
          { label: 'Avoids single-aggregator monopsony squeeze on swap pricing', pass: true, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'longevity-clinic',
    label: 'Longevity Clinic',
    tag: 'Biology / Health',
    thesis:
      'A membership-based Medicine 3.0 preventive clinic combining continuous biomarker panels, VO2 max diagnostics, ApoB management, and AI-guided protocols.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Hard-to-vary biological foundation: chronic disease develops over decades, so intervening early on ApoB, insulin sensitivity, and aerobic reserve is causally grounded.',
        failureMode: 'Drifting from evidence-based biomarkers into unverified anti-aging supplements erodes scientific credibility and turns the clinic into a lifestyle spa.',
        directive: 'Enforce strict epistemic hygiene: separate causal, randomized-backed interventions from speculative protocols with transparent evidence tiers.',
        checks: [
          { label: 'Core protocols anchored in causal biomarkers (ApoB, HbA1c, VO2 max)', pass: true, weight: 8 },
          { label: 'Clearly distinguishes proven medicine from speculative hype', pass: true, weight: 6 },
          { label: 'Explains why members stay after initial year-one test novelty fades', pass: false, weight: 5 },
          { label: 'Clinical outcomes are tracked longitudinally, not by anecdotes', pass: true, weight: 6 }
        ]
      },
      taleb: {
        summary:
          'Low technological obsolescence risk, but real clinical-liability tail risk and physician-labor bottlenecks. Over-testing without clear action thresholds creates iatrogenic harm.',
        failureMode: 'False positives from aggressive whole-body screening trigger unnecessary invasive follow-ups and reputational tail events.',
        directive: 'Apply via negativa first: eliminate metabolic, sleep, and cardiovascular risk factors before prescribing exotic compounds; standardize clinical guardrails.',
        checks: [
          { label: 'Prioritizes via negativa (removing risk) over polypharmacy', pass: true, weight: 7 },
          { label: 'Strict screening protocols cap false-positive iatrogenic harm', pass: false, weight: 6 },
          { label: 'Software & nurses decouple clinic margin from scarce MD hours', pass: false, weight: 6 },
          { label: 'High annual retention cushions customer acquisition cost', pass: true, weight: 6 }
        ]
      },
      musk: {
        summary:
          'Traditional clinics drown in fragmented labs, manual PDF reports, and redundant intake forms. Strong deletion opportunity in diagnostic turnaround and longitudinal charting.',
        failureMode: 'Hiring an army of concierge coordinators to glue together broken lab portals instead of deleting manual handoffs.',
        directive: 'Delete multi-visit diagnostic friction: unify blood draw, DEXA, VO2 max, and automated biomarker ingestion into a single half-day baseline loop.',
        checks: [
          { label: 'Redundant intake and lab-reconciliation steps deleted', pass: true, weight: 6 },
          { label: 'Diagnostic-to-protocol cycle compressed from weeks to 48 hours', pass: true, weight: 5 },
          { label: 'Unit economics work beyond the top 0.5% luxury concierge tier', pass: false, weight: 9 },
          { label: 'Software handles longitudinal synthesis while clinicians own judgment', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Operates at Level 3 (Goals of the System): shifts healthcare\'s objective function from reactive acute billing (Medicine 2.0) to longitudinal healthspan preservation.',
        leverageLevel: 'Level 3 — Goal of the System (Reactive billing to preventive healthspan)',
        failureMode: 'Long feedback delays (decades between habit change and mortality outcome) weaken member motivation without tight proximal loops.',
        directive: 'Engineer short-horizon Level 6 feedback loops (quarterly ApoB, CGM stability, strength benchmarks) so members see compounding progress every 90 days.',
        checks: [
          { label: 'Redefines the system goal from reactive billing to healthspan', pass: true, weight: 8 },
          { label: 'Compresses decade-long health lag into 90-day measurable loops', pass: true, weight: 7 },
          { label: 'Incentive structure rewards member improvement, not visit volume', pass: true, weight: 6 },
          { label: 'Protocol adherence survives outside the clinic walls', pass: false, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'robotics-warehouse',
    label: 'Autonomous Robotics Fleet',
    tag: 'Deep Tech / Robotics',
    thesis:
      'Vertically integrated mobile manipulation robots leased on a per-pick outcome contract to mid-sized e-commerce 3PL warehouses.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Compelling physical-economic thesis if vision-language-action models handle SKU diversity; weak if long-tail deformable packaging still forces human rescues every 20 minutes.',
        failureMode: '98% pick accuracy sounds impressive in demos, but a 2% exception rate across 10,000 daily picks halts the line 200 times a day.',
        directive: 'Define the exact SKU envelope and human-in-the-loop teleoperation recovery budget as an explicit part of the core mechanism.',
        checks: [
          { label: 'Explicitly accounts for the 1-2% long-tail grasping exception rate', pass: false, weight: 10 },
          { label: 'Per-pick pricing beats human fully-loaded labor cost with margin', pass: true, weight: 5 },
          { label: 'Hardware + control stack co-designed rather than bolted together', pass: true, weight: 5 },
          { label: 'Deployment requires zero structural warehouse renovation', pass: true, weight: 5 }
        ]
      },
      taleb: {
        summary:
          'Hardware-as-a-Service concentrates capex on the startup balance sheet while customers enjoy zero-commitment optionality—an asymmetric trap if contracts lack minimum volume floors.',
        failureMode: 'Seasonal e-commerce slumps leave leased fleets idle while hardware depreciation and field-service costs continue unabated.',
        directive: 'Require multi-year minimum pick commitments and modular off-the-shelf subassemblies to cap inventory and service tail risk.',
        checks: [
          { label: 'Minimum volume covenants protect fleet payback during slow quarters', pass: false, weight: 9 },
          { label: 'Hardware BOM uses commodity actuators where custom adds no moat', pass: true, weight: 5 },
          { label: 'Remote teleop fallback prevents catastrophic warehouse downtime', pass: true, weight: 5 },
          { label: 'Fleet telemetry makes every failure improve the entire installed base', pass: false, weight: 6 }
        ]
      },
      musk: {
        summary:
          'High temptation to build humanoid dexterity when a simpler suction plus parallel-jaw gantry handles 85% of SKUs at one-fifth the BOM cost.',
        failureMode: 'Automating rare edge-case grasps before deleting warehouse slotting chaos.',
        directive: 'Delete degrees of freedom that serve <5% of SKUs; optimize cycle speed on high-velocity bins first and leave oddball items to human lanes.',
        checks: [
          { label: 'Deleted unnecessary actuators and humanoid complexity for target SKUs', pass: true, weight: 7 },
          { label: 'Hardware BOM trajectory modeled to cross <18-month payback', pass: false, weight: 6 },
          { label: 'Site commissioning compressed from months to under 7 days', pass: false, weight: 6 },
          { label: 'Field-replaceable modules keep mean time to repair under 15 minutes', pass: true, weight: 6 }
        ]
      },
      meadows: {
        summary:
          'Targets Level 6 (Information Flows) and Level 8 (Balancing Loops) by turning physical warehouse throughput into deterministic, software-scheduled capacity.',
        leverageLevel: 'Level 6 — Information Flows & Capacity Feedback',
        failureMode: 'Optimizing robot pick speed while upstream receiving and downstream packing remain manual creates immediate queue bottlenecks.',
        directive: 'Map end-to-end dock-to-dock stock flows so robot throughput synchronizes with WMS slotting and carrier cutoffs.',
        checks: [
          { label: 'Synchronizes with upstream/downstream warehouse bottlenecks', pass: false, weight: 6 },
          { label: 'Fleet learning creates a reinforcing cross-site accuracy loop', pass: true, weight: 7 },
          { label: 'Outcome-based pricing aligns vendor and 3PL incentives', pass: true, weight: 6 },
          { label: 'Installation avoids multi-quarter IT integration delays', pass: true, weight: 6 }
        ]
      }
    }
  },
  {
    id: 'industrial-microgrid',
    label: 'Industrial Solar Microgrid',
    tag: 'Physics / Energy',
    thesis:
      'On-site solar plus LFP battery storage microgrids deployed across industrial parks to cut peak tariff charges and decarbonize manufacturing loads.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Grounded in hard thermodynamics and tariff arithmetic: industrial daytime load profiles match solar irradiance closely, and LFP storage shaves expensive peak demand spikes.',
        failureMode: 'Relying on green subsidies rather than unsubsidized levelized cost of energy (LCOE) parity leaves the thesis vulnerable to policy swings.',
        directive: 'Prove the unit economics strictly on unsubsidized tariff arbitrage and diesel-backup displacement before counting carbon credits.',
        checks: [
          { label: 'Economics close on unsubsidized tariff savings without policy handouts', pass: true, weight: 8 },
          { label: 'Load-profile mismatch and cloud intermittency modeled hourly', pass: true, weight: 7 },
          { label: 'Explains why utilities cannot trivially replicate the on-site dispatch', pass: true, weight: 7 },
          { label: 'Interconnection and net-metering rules verified per state/grid', pass: false, weight: 3 }
        ]
      },
      taleb: {
        summary:
          'Long-term power purchase agreements offer predictable cash flows, while containerized hardware retains salvage mobility—though counterparty credit and thermal safety require discipline.',
        failureMode: 'An anchor industrial tenant defaults or regulators impose punitive standby grid charges mid-contract.',
        directive: 'Standardize containerized, relocatable battery skids and diversify across multi-tenant industrial parks so assets retain salvage mobility.',
        checks: [
          { label: 'Modular containerized hardware can be redeployed if a tenant fails', pass: true, weight: 6 },
          { label: 'Project debt is non-recourse at the SPV level, isolating parent ruin', pass: true, weight: 6 },
          { label: 'Multi-tenant park demand hedges single-factory shutdown risk', pass: true, weight: 6 },
          { label: 'Battery warranty and thermal safety eliminate catastrophic fire tail risk', pass: false, weight: 7 }
        ]
      },
      musk: {
        summary:
          'Soft costs (permitting, custom site engineering, EPC markup) often exceed solar plus LFP hardware costs. Largest gains come from standardizing pre-engineered microgrid blocks.',
        failureMode: 'Bespoke civil and electrical engineering for every factory roof slows deployment to a crawl.',
        directive: 'Delete bespoke site designs: ship standardized 500 kWh modular skids with automated remote commissioning and predictive BMS telemetry.',
        checks: [
          { label: 'Soft-cost and bespoke EPC engineering overhead aggressively deleted', pass: false, weight: 8 },
          { label: 'LCOE tracked against raw polysilicon and LFP cell cost curves', pass: true, weight: 6 },
          { label: 'Automated EMS dispatch maximizes peak-shaving without manual operators', pass: true, weight: 6 },
          { label: 'Installation lead time compressed via pre-wired modular skids', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Operates at Level 4 (Self-Organization) and Level 6 (Information Flows) by turning passive industrial power consumers into active, price-responsive distributed energy nodes.',
        leverageLevel: 'Level 4 — Self-Organizing Distributed Architecture',
        failureMode: 'Grid interconnection queues act as a severe time delay (Level 9) that can stall capital deployment for 12-18 months.',
        directive: 'Prioritize behind-the-meter self-consumption configurations that bypass lengthy export-approval bottlenecks.',
        checks: [
          { label: 'Behind-the-meter architecture bypasses slow export-grid delays', pass: true, weight: 7 },
          { label: 'Real-time tariff telemetry drives automated charge/discharge loops', pass: true, weight: 6 },
          { label: 'Shifts industrial parks from passive buyers to self-organizing nodes', pass: true, weight: 6 },
          { label: 'Aligns factory CFO savings with decarbonization targets', pass: true, weight: 4 }
        ]
      }
    }
  }
];

/**
 * Deterministic client-side analyzer for any custom startup thesis or claim.
 * Zero external API calls. Parses lexical & structural signals to produce
 * tailored 4-lens diagnostics and an interactive 16-point rubric.
 */
export function analyzeCustomThesis(rawText) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // Structural signal detection
  const hasAI = /\b(ai|llm|gpt|agent|model|ml|neural|automation|copilot|wrapper|rag|saas|software|platform)\b/.test(lower);
  const hasHardware = /\b(hardware|battery|ev|robot|solar|grid|factory|manufacturing|energy|chip|sensor|drone|fleet|device|swap)\b/.test(lower);
  const hasBio = /\b(bio|health|clinic|longevity|drug|medical|patient|diagnostic|genomic|biomarker|hospital|therapy|fitness)\b/.test(lower);
  const hasMarket = /\b(marketplace|network|p2p|peer|fintech|lending|bank|crypto|payment|supply chain|logistics|b2b|smb|enterprise)\b/.test(lower);
  const hasBuzzwords = /\b(revolutionary|disrupt|uber for|next-gen|synergy|10x|ai-powered|blockchain|metaverse|seamless|all-in-one)\b/.test(lower);
  const hasMechanism = /\b(by|using|via|because|reduces|cuts|eliminates|measures|telemetry|data|unit economics|margin|latency|cost|workflow|protocol)\b/.test(lower);
  const hasNumbers = /\d+%|\$\d+|\d+x|\d+\s?(min|hr|day|week|month|year|kwh|mw|ms)/i.test(text);
  const hasDebtOrCapex = /\b(capex|fleet|infrastructure|lease|inventory|station|factory|real estate|clinic|warehouse|hardware)\b/.test(lower);
  const hasPlatformDep = /\b(api|wrapper|shopify|openai|google|meta|apple|amazon|app store|plugin|extension|whatsapp)\b/.test(lower);
  const hasFeedbackLoop = /\b(telemetry|loop|data|flywheel|compound|real-time|continuous|benchmark|feedback|network effect|switching)\b/.test(lower);
  const hasDeletion = /\b(remove|delete|eliminate|simple|minimal|no-code|zero|cut|skip|direct|automated|bypass)\b/.test(lower);
  const isSpecific = words.length >= 12 && hasMechanism;

  // Determine archetype label
  let archetype = 'General Venture Thesis';
  if (hasHardware && hasAI) archetype = 'Cyber-Physical / Deep-Tech System';
  else if (hasHardware) archetype = 'Physical Infrastructure / Hardware';
  else if (hasBio) archetype = 'Health / Bio-Systems Venture';
  else if (hasAI) archetype = 'Applied AI / Software System';
  else if (hasMarket) archetype = 'Network / Marketplace Architecture';

  // 1. Deutsch Lens
  const deutschChecks = [
    {
      label: 'Thesis names a concrete causal mechanism rather than broad buzzwords',
      pass: isSpecific && !hasBuzzwords
    },
    {
      label: 'Includes falsifiable constraints, metrics, or target operator segment',
      pass: hasNumbers || words.length >= 16
    },
    {
      label: 'Explains why the mechanism cannot be trivially copied by incumbents',
      pass: hasFeedbackLoop || (hasHardware && hasMechanism)
    },
    {
      label: 'Remains valid even if adjacent enabling tools become free commodities',
      pass: !hasPlatformDep
    }
  ];

  const deutschSummary = hasBuzzwords
    ? `Detected high-level narrative phrasing in this ${archetype.toLowerCase()}. Under Deutsch's criterion, claims that could describe ten unrelated startups are too easy to vary.`
    : isSpecific
      ? `Clear structural framing for a ${archetype.toLowerCase()}. The causal link is legible, though durability depends on proving the core bottleneck cannot be solved by a simpler substitute.`
      : `Concise thesis statement, but currently under-specified. Add the exact physical, economic, or workflow mechanism that forces this outcome to be true.`;

  const deutschFailure = hasPlatformDep
    ? 'Upstream platform absorption: if an underlying API or ecosystem adds this capability natively, the thesis loses its causal reason to exist.'
    : hasHardware
      ? 'Physical or chemistry substitution: an adjacent engineering curve (faster charging, cheaper sensors, off-the-shelf modules) bypasses the proposed architecture.'
      : 'Easy-to-vary differentiation: competitors adopt the same pitch with identical tools, compressing margins toward zero.';

  const deutschDirective =
    'Write a one-sentence falsifiable test: specify which single physical, behavioral, or economic assumption breaks the entire business if proven false.';

  // 2. Taleb Lens
  const talebChecks = [
    {
      label: 'No single upstream platform, regulator, or buyer holds a kill-switch',
      pass: !hasPlatformDep && !hasBio
    },
    {
      label: 'Fixed capital burn or debt covenants do not create ruin under a 30% shock',
      pass: !hasDebtOrCapex
    },
    {
      label: 'Architecture captures positive convexity (capped downside, asymmetric upside)',
      pass: hasAI || hasFeedbackLoop
    },
    {
      label: 'Applies via negativa by stripping fragile dependencies before scaling',
      pass: hasDeletion
    }
  ];

  const talebSummary = hasDebtOrCapex
    ? 'Capital-intensive footprint detected. Fixed infrastructure, inventory, or leases amplify negative convexity if utilization lags projections.'
    : hasPlatformDep
      ? 'Platform concentration detected. Low fixed burn limits immediate cash ruin, but upstream API or distribution policy changes create sharp tail exposure.'
      : 'Moderate structural fragility. Verify where hidden leverage, regulatory liability, or single-channel acquisition concentration sits in the model.';

  const talebFailure = hasDebtOrCapex
    ? 'Balance-sheet fragility: fixed depreciation and financing costs persist during a demand slump, forcing dilutive recapitalization.'
    : hasBio
      ? 'Clinical and reputational tail risk: a small rate of adverse outcomes or false positives triggers disproportionate regulatory and trust damage.'
      : 'Fragile unit economics: rising acquisition costs or sudden incumbent price cuts invert contribution margins.';

  const talebDirective = hasDebtOrCapex
    ? 'Structure a barbell rollout: secure anchor customer commitments or asset-light hosting before locking into long-term fixed capex.'
    : 'Remove single points of failure via negativa—multi-source critical dependencies and ensure survival through a 12-month demand trough.';

  // 3. Musk Lens
  const muskChecks = [
    {
      label: 'Decomposes cost and cycle time down to the physical or unit-economic floor',
      pass: hasNumbers || hasHardware
    },
    {
      label: 'Deletes unnecessary legacy workflow steps rather than automating bloat',
      pass: hasDeletion
    },
    {
      label: 'Simplifies interfaces and parts before investing in full automation',
      pass: !hasBuzzwords && isSpecific
    },
    {
      label: 'Targets an order-of-magnitude gain in speed, cost, or reliability',
      pass: hasAI || hasHardware || hasNumbers
    }
  ];

  const muskSummary = hasDeletion
    ? 'Strong subtractive instinct detected. Ensure every remaining step is tied to a named owner and validated against the raw unit-economics floor.'
    : 'No explicit deletion target detected in the thesis. Most ventures inherit 40-60% legacy process overhead when entering an existing industry.';

  const muskFailure = hasAI
    ? 'Premature automation of a broken human workflow—shipping impressive AI features wrapped around steps that should not exist.'
    : 'Over-engineering custom components before proving which parts of the bill-of-materials actually drive customer value.';

  const muskDirective =
    'Run Steps 1-3 strictly before Step 5: list every step the customer currently performs, delete at least one-third of them, simplify the core loop, and only then automate.';

  // 4. Meadows Lens
  const leverageLevel = hasFeedbackLoop
    ? 'Level 6 — Information Flows (tightening real-time feedback loops)'
    : hasHardware || hasMarket
      ? 'Level 5 — Rules & Incentives (restructuring ownership or exchange rules)'
      : hasBio
        ? 'Level 3 — System Goals (re-aligning objective toward long-term outcomes)'
        : 'Level 12 — Parameters (surface cost/speed tuning until feedback loop is defined)';

  const meadowsChecks = [
    {
      label: 'Intervenes above parameter-tweaking (alters feedback, rules, or goals)',
      pass: hasFeedbackLoop || hasBio || hasMarket
    },
    {
      label: 'Shortens feedback delays between field behavior and corrective action',
      pass: hasFeedbackLoop || hasAI
    },
    {
      label: 'Builds a reinforcing loop (data, trust, density, or scale) that compounds',
      pass: hasFeedbackLoop || hasMarket
    },
    {
      label: 'Accounts for balancing loops (incumbent response, regulation, saturation)',
      pass: isSpecific && !hasBuzzwords
    }
  ];

  const meadowsSummary = `Estimated intervention point: ${leverageLevel}. Durable ventures move beyond tweaking surface parameters to redesign who receives feedback and how incentives compound.`;

  const meadowsFailure =
    'Unmodeled time delays and balancing loops: customer onboarding lag, regulatory cycles, or incumbent price retaliation absorb early momentum.';

  const meadowsDirective =
    'Identify the slowest feedback delay in your customer\'s current system and design your product to collapse that lag from weeks to minutes.';

  return {
    archetype,
    deutsch: {
      summary: deutschSummary,
      failureMode: deutschFailure,
      directive: deutschDirective,
      checks: deutschChecks
    },
    taleb: {
      summary: talebSummary,
      failureMode: talebFailure,
      directive: talebDirective,
      checks: talebChecks
    },
    musk: {
      summary: muskSummary,
      failureMode: muskFailure,
      directive: muskDirective,
      checks: muskChecks
    },
    meadows: {
      summary: meadowsSummary,
      leverageLevel,
      failureMode: meadowsFailure,
      directive: meadowsDirective,
      checks: meadowsChecks
    }
  };
}

export function computeVerdict(totalScore) {
  if (totalScore >= 82) {
    return {
      band: 'Antifragile Compounder',
      tone: 'high',
      summary:
        'Tight causal mechanism, bounded downside, disciplined simplification, and high-leverage system design. Focus on disciplined execution and telemetry verification.'
    };
  }
  if (totalScore >= 62) {
    return {
      band: 'High-Conviction Wedge',
      tone: 'mid-high',
      summary:
        'Solid first-principles core with one or two clear structural vulnerabilities. Address the unchecked risk or leverage gaps before committing heavy fixed capital.'
    };
  }
  if (totalScore >= 40) {
    return {
      band: 'Linear Bet — Needs Structural Hardening',
      tone: 'mid',
      summary:
        'Plausible problem space, but exposed to commoditization, balance-sheet fragility, or low-leverage parameter competition. Apply deletion and moat tightening first.'
    };
  }
  return {
    band: 'Fragile Narrative',
    tone: 'low',
    summary:
      'Easy-to-vary thesis with unhedged tail risk and low system leverage. Rework the underlying causal mechanism from raw physical and economic primitives.'
  };
}
