// Four plain questions for checking an idea. Each lens draws on ideas from the map:
// good explanations, risk and fragility, deleting before automating, and fast feedback.
// Internal ids (deutsch, taleb, musk, meadows) are kept for stability; they are never shown.
export const LENS_META = [
  {
    id: 'deutsch',
    short: 'Reason',
    title: 'Is the reason solid?',
    term: 'good explanation test',
    color: '#0369a1',
    question: 'If you swapped out the key reason, would the idea fall apart? If not, the reason is a slogan, not an explanation.'
  },
  {
    id: 'taleb',
    short: 'Risk',
    title: 'What could break it?',
    term: 'risk and fragility',
    color: '#c2410c',
    question: 'Would a shock, like a price war, a platform change or a slow year, sink it, or could it come out stronger?'
  },
  {
    id: 'musk',
    short: 'Simplicity',
    title: 'What can you cut?',
    term: 'first principles',
    color: '#b45309',
    question: 'What do the raw parts really cost, and which steps should be deleted before anything is automated?'
  },
  {
    id: 'meadows',
    short: 'Feedback',
    title: 'Does it learn fast?',
    term: 'feedback loops',
    color: '#0f766e',
    question: 'Does it only tweak numbers like price or speed, or does it change how quickly people see results and who gains?'
  }
];

export const SAMPLE_THESES = [
  {
    id: 'ai-wrapper-saas',
    label: 'AI paperwork tool',
    tag: 'Software and AI',
    thesis:
      'An AI tool, built on top of big AI models from other companies, that drafts compliance paperwork and checks documents for mid-sized firms.',
    presetAnalysis: {
      deutsch: {
        summary:
          'The pain is real, but the reason it wins is weak. A thin layer on someone else\'s AI model is easy to copy, even by the model maker itself.',
        failureMode: 'The AI provider ships its own paperwork templates and the tool\'s value disappears overnight.',
        directive: 'Build on something hard to copy: rule checks that are always right, a private record of past audits, or deep links into the firm\'s own systems.',
        checks: [
          { label: 'Its core reason to exist is more than a clever AI prompt', pass: false, weight: 8 },
          { label: 'Explains why big existing players cannot simply do the same', pass: true, weight: 8 },
          { label: 'Has a clear accuracy test on real, messy cases', pass: false, weight: 5 },
          { label: 'Still valuable if AI models get twice as smart tomorrow', pass: false, weight: 4 }
        ]
      },
      taleb: {
        summary:
          'Fragile to the AI provider\'s prices and rules. Low running costs mean it will not go broke quickly, but customers can leave easily.',
        failureMode: 'It depends on one supplier and customers can switch cheaply, so a price war between AI providers hurts it badly.',
        directive: 'Remove weak points first: support several AI models and become the place where customers\' work is stored, so cheaper AI helps rather than hurts.',
        checks: [
          { label: 'No single supplier or platform can switch it off', pass: false, weight: 8 },
          { label: 'Costs are low enough to survive a year with no new sales', pass: true, weight: 6 },
          { label: 'Gets better, not worse, as AI gets cheaper', pass: false, weight: 6 },
          { label: 'Customers would lose real work if they left', pass: true, weight: 5 }
        ]
      },
      musk: {
        summary:
          'Big risk of automating a bloated old checklist instead of first deleting the steps nobody needs.',
        failureMode: 'Automating 14 review steps when 10 of them only exist because of outdated internal sign-offs.',
        directive: 'Name the person or law behind every step, delete the rest, merge what is left into one simple form, and only then add AI.',
        checks: [
          { label: 'Every step is traced to a real law or a named person', pass: true, weight: 7 },
          { label: 'At least 30% of old manual steps deleted before adding AI', pass: false, weight: 6 },
          { label: 'Cost per document is close to the lowest it could be', pass: true, weight: 7 },
          { label: 'Makes the work about ten times faster, not 15% faster', pass: false, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Mostly makes drafting faster (a number tweak). It would matter more if it showed mistakes to people the moment they happen.',
        leverageLevel: 'Only tweaks a number (faster drafting) for now',
        failureMode: 'Faster drafts just pile up in front of the same slow approval step.',
        directive: 'Show live warnings to the people doing the work, before any paperwork is even written.',
        checks: [
          { label: 'Changes how people get feedback, not just a number', pass: false, weight: 8 },
          { label: 'Shortens the time between a mistake and spotting it', pass: true, weight: 9 },
          { label: 'Gets better the more it is used', pass: false, weight: 4 },
          { label: 'Buyer, checker and daily user all want the same outcome', pass: false, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'ev-battery-swap',
    label: 'Battery swap stations',
    tag: 'Hardware and energy',
    thesis:
      'A network of city battery-swap stations for delivery scooter fleets, paid per swap, so riders never wait for a charge.',
    presetAnalysis: {
      deutsch: {
        summary:
          'A solid, physical reason: delivery riders lose income while charging, so swapping a battery attacks both waiting time and the upfront cost of the battery.',
        failureMode: 'Five to ten minute fast charging becomes cheap enough that swapping is no longer needed.',
        directive: 'Tighten the idea around station density, longer battery life in cooled cabinets, and charging when power is cheap.',
        checks: [
          { label: 'Directly solves waiting time and upfront battery cost', pass: true, weight: 7 },
          { label: 'Explains why fast charging will not replace it within 5 years', pass: false, weight: 6 },
          { label: 'A shared battery standard is agreed, not assumed', pass: true, weight: 6 },
          { label: 'The numbers work for each station, not just on average', pass: true, weight: 6 }
        ]
      },
      taleb: {
        summary:
          'Fragile if paid for with short-term loans. Lots of batteries and rented sites up front hurt badly if fewer riders show up than planned.',
        failureMode: 'Use falls 25% below plan while loan payments and battery wear stay the same, and cash runs out.',
        directive: 'Start small and safe: put stations inside existing partner sites, with fleets that commit to a minimum number of swaps.',
        checks: [
          { label: 'Uses partner sites instead of long, fixed leases', pass: false, weight: 7 },
          { label: 'Batteries are paid for with long-term finance, not burned cash', pass: false, weight: 6 },
          { label: 'Fleet contracts guarantee a minimum level of use', pass: true, weight: 7 },
          { label: 'Has a backup battery type if lithium prices jump', pass: false, weight: 5 }
        ]
      },
      musk: {
        summary:
          'The physics limits are energy per kilometre, battery lifetime and weight. Robot arms in stations are often worse than a 10 kg battery a rider slides in by hand.',
        failureMode: 'Building robot swap arms that jam in dust and rain instead of deleting them.',
        directive: 'Drop the robots for scooters, use one tough connector, keep station cooling simple and keep each swap under 45 seconds.',
        checks: [
          { label: 'Costs worked out down to the raw battery cell', pass: true, weight: 6 },
          { label: 'Unneeded robots and moving parts deleted', pass: true, weight: 6 },
          { label: 'Swap time and uptime tested in real street conditions', pass: false, weight: 8 },
          { label: 'Battery data spots a failing cell before it breaks', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Changes the rules of ownership: riders pay per swap instead of buying a battery, and stations can act as small power stores for the grid.',
        leverageLevel: 'Changes the rules (who owns the battery and who pays)',
        failureMode: 'Slow approvals from the power company and big fleet buyers pushing prices down squeeze the profit per swap.',
        directive: 'Link each battery\'s health data to cheaper night-time power prices so charging happens when it costs least.',
        checks: [
          { label: 'Changes who pays for what (buy once to pay per km)', pass: true, weight: 8 },
          { label: 'More stations bring more riders, which brings more stations', pass: true, weight: 6 },
          { label: 'Plans for slow permits and building delays', pass: false, weight: 7 },
          { label: 'Not at the mercy of one big fleet buyer', pass: true, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'longevity-clinic',
    label: 'Longevity Clinic',
    tag: 'Biology and health',
    thesis:
      'A membership clinic that prevents disease early, using regular blood tests, fitness tests, cholesterol tracking and AI-guided health plans.',
    presetAnalysis: {
      deutsch: {
        summary:
          'A strong reason: chronic disease builds over decades, so acting early on cholesterol, blood sugar and fitness is well grounded.',
        failureMode: 'Drifting from proven tests into unproven anti-ageing supplements, until it becomes a lifestyle spa.',
        directive: 'Keep proven and experimental advice clearly apart, and show members the level of evidence for each.',
        checks: [
          { label: 'Plans are based on tests that really predict disease', pass: true, weight: 8 },
          { label: 'Clearly separates proven medicine from hype', pass: true, weight: 6 },
          { label: 'Explains why members stay after the first year', pass: false, weight: 5 },
          { label: 'Results are tracked over years, not by stories', pass: true, weight: 6 }
        ]
      },
      taleb: {
        summary:
          'Low risk of becoming outdated, but real risk from medical mistakes and too few doctors. Testing too much without clear next steps can cause harm.',
        failureMode: 'Over-eager full-body scans find harmless things, leading to needless procedures and bad press.',
        directive: 'Remove risks first (poor sleep, inactivity, blood sugar) before adding unusual treatments, and set firm safety rules.',
        checks: [
          { label: 'Removes risks before adding more pills', pass: true, weight: 7 },
          { label: 'Firm screening rules limit false alarms and needless treatment', pass: false, weight: 6 },
          { label: 'Software and nurses mean profit does not depend on scarce doctor time', pass: false, weight: 6 },
          { label: 'Members stay long enough to cover what it cost to win them', pass: true, weight: 6 }
        ]
      },
      musk: {
        summary:
          'Normal clinics drown in scattered lab results, PDFs and repeated forms. There is a lot to delete between the test and the plan.',
        failureMode: 'Hiring lots of coordinators to glue broken lab portals together instead of removing the hand-offs.',
        directive: 'Do the blood draw, body scan and fitness test in one half-day visit, with results flowing in automatically.',
        checks: [
          { label: 'Repeated forms and manual lab matching deleted', pass: true, weight: 6 },
          { label: 'From test to plan in 48 hours, not weeks', pass: true, weight: 5 },
          { label: 'Affordable beyond the richest 0.5% of people', pass: false, weight: 9 },
          { label: 'Software tracks trends while doctors make the calls', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Changes the goal of healthcare itself: from billing for treatment when sick to keeping people healthy for longer.',
        leverageLevel: 'Changes the goal (from treating illness to keeping people well)',
        failureMode: 'Habits take decades to pay off, so members lose motivation without quick, visible progress.',
        directive: 'Give members short loops: check key blood markers, blood sugar and strength every 90 days so progress is visible.',
        checks: [
          { label: 'Changes the goal from billing visits to long-term health', pass: true, weight: 8 },
          { label: 'Turns decade-long results into 90-day check-ins', pass: true, weight: 7 },
          { label: 'Gets paid when members improve, not per visit', pass: true, weight: 6 },
          { label: 'Members keep the habits outside the clinic', pass: false, weight: 4 }
        ]
      }
    }
  },
  {
    id: 'robotics-warehouse',
    label: 'Warehouse robots',
    tag: 'Robotics',
    thesis:
      'Robots that pick items in mid-sized online-shopping warehouses, rented out and paid per item picked.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Convincing if the robots handle many kinds of items; weak if odd, floppy packaging still needs a human rescue every 20 minutes.',
        failureMode: '98% accuracy sounds great in a demo, but a 2% miss rate on 10,000 picks a day stops the line 200 times.',
        directive: 'Spell out which items the robot handles and how much human help it needs, as part of the core idea.',
        checks: [
          { label: 'Plans for the 1-2% of awkward items it will miss', pass: false, weight: 10 },
          { label: 'Price per pick beats the full cost of a human picker', pass: true, weight: 5 },
          { label: 'Hardware and software designed together, not bolted on', pass: true, weight: 5 },
          { label: 'Works without rebuilding the warehouse', pass: true, weight: 5 }
        ]
      },
      taleb: {
        summary:
          'Renting robots puts all the cost on the startup while customers can walk away freely. Risky without a minimum usage promise.',
        failureMode: 'In slow seasons the rented robots sit idle while their wear and repair costs keep running.',
        directive: 'Ask for multi-year minimum pick promises and use off-the-shelf parts to keep spare-part and repair risk small.',
        checks: [
          { label: 'Minimum-use contracts protect the business in slow months', pass: false, weight: 9 },
          { label: 'Uses standard parts where custom parts add nothing', pass: true, weight: 5 },
          { label: 'A remote human can take over to avoid long stoppages', pass: true, weight: 5 },
          { label: 'Every failure teaches every robot, not just one', pass: false, weight: 6 }
        ]
      },
      musk: {
        summary:
          'Tempting to build human-like hands when a simple suction gripper handles 85% of items at one-fifth of the parts cost.',
        failureMode: 'Automating rare, tricky grabs before fixing the messy way items are stored.',
        directive: 'Delete any movement used by fewer than 5% of items, speed up the common ones first, and leave odd items to people.',
        checks: [
          { label: 'Deleted unneeded joints and human-like complexity', pass: true, weight: 7 },
          { label: 'Parts cost on track to pay back within 18 months', pass: false, weight: 6 },
          { label: 'Set up at a new site in under 7 days, not months', pass: false, weight: 6 },
          { label: 'Broken parts swapped in under 15 minutes', pass: true, weight: 6 }
        ]
      },
      meadows: {
        summary:
          'Turns warehouse work into capacity that software can plan, and changes how fast problems get noticed.',
        leverageLevel: 'Changes how fast information flows (live capacity data)',
        failureMode: 'Faster robot picking just creates a queue if receiving and packing are still done by hand.',
        directive: 'Map the whole flow from delivery door to shipping door so robot speed matches the rest of the warehouse.',
        checks: [
          { label: 'Fits the slower steps before and after it', pass: false, weight: 6 },
          { label: 'Robots at every site learn from each other', pass: true, weight: 7 },
          { label: 'Paid by results, so seller and warehouse want the same thing', pass: true, weight: 6 },
          { label: 'Installs without months of IT work', pass: true, weight: 6 }
        ]
      }
    }
  },
  {
    id: 'industrial-microgrid',
    label: 'Factory solar and batteries',
    tag: 'Physics and energy',
    thesis:
      'Solar panels plus battery storage installed across industrial parks, to cut costly peak-hour power bills and make factory power cleaner.',
    presetAnalysis: {
      deutsch: {
        summary:
          'Grounded in physics and simple bill maths: factories use most power in daytime when the sun shines, and batteries cover the expensive peak hours.',
        failureMode: 'Relying on green subsidies instead of real cost savings leaves it exposed when policies change.',
        directive: 'Prove it pays on power-bill savings and replacing diesel backup alone, before counting any carbon credits.',
        checks: [
          { label: 'Pays for itself without subsidies', pass: true, weight: 8 },
          { label: 'Cloudy days and usage patterns modelled hour by hour', pass: true, weight: 7 },
          { label: 'Explains why the power company cannot easily copy it', pass: true, weight: 7 },
          { label: 'Grid connection rules checked for each region', pass: false, weight: 3 }
        ]
      },
      taleb: {
        summary:
          'Long power contracts give steady income, and the equipment can be moved if needed, but customer defaults and battery fire safety need care.',
        failureMode: 'A main factory customer stops paying, or the regulator adds a surprise standby charge mid-contract.',
        directive: 'Use standard battery containers that can be moved, and spread across many factories so no single closure hurts.',
        checks: [
          { label: 'Equipment can be moved if one customer fails', pass: true, weight: 6 },
          { label: 'Each project\'s debt is kept separate from the company', pass: true, weight: 6 },
          { label: 'Many factories per park spread the risk', pass: true, weight: 6 },
          { label: 'Battery fire risk is engineered out', pass: false, weight: 7 }
        ]
      },
      musk: {
        summary:
          'Paperwork, custom site design and contractor markups often cost more than the panels and batteries. The biggest win is a standard, pre-built kit.',
        failureMode: 'Custom engineering for every factory roof slows rollout to a crawl.',
        directive: 'Delete custom designs: ship standard pre-wired battery blocks that are switched on and managed remotely.',
        checks: [
          { label: 'Paperwork and custom design costs cut hard', pass: false, weight: 8 },
          { label: 'Cost of power tracked against raw panel and cell prices', pass: true, weight: 6 },
          { label: 'Software runs charging and discharging without staff', pass: true, weight: 6 },
          { label: 'Pre-wired kits make installation fast', pass: true, weight: 5 }
        ]
      },
      meadows: {
        summary:
          'Turns factories from passive power buyers into small power stations that react to prices on their own.',
        leverageLevel: 'Changes how the system organises itself (many small power sources)',
        failureMode: 'Waiting 12 to 18 months in the queue for a grid connection can stall the whole plan.',
        directive: 'Start with set-ups that use all their power on site, so they skip the slow approval for selling to the grid.',
        checks: [
          { label: 'Uses power on site to skip slow grid approvals', pass: true, weight: 7 },
          { label: 'Live power prices decide when to charge and discharge', pass: true, weight: 6 },
          { label: 'Turns factories into active power producers', pass: true, weight: 6 },
          { label: 'The factory\'s savings and its clean-energy goals line up', pass: true, weight: 4 }
        ]
      }
    }
  }
];

/**
 * Scores any idea the visitor types, entirely in the browser.
 * It looks for simple word signals (e.g. "battery", "AI", "delete", "data")
 * and fills in the same four-question checklist.
 */
export function analyzeCustomThesis(rawText) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // Word signals
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

  // Kind of idea
  let archetype = 'general idea';
  if (hasHardware && hasAI) archetype = 'hardware and AI idea';
  else if (hasHardware) archetype = 'hardware idea';
  else if (hasBio) archetype = 'health idea';
  else if (hasAI) archetype = 'software or AI idea';
  else if (hasMarket) archetype = 'marketplace idea';

  // 1. Is the reason solid?
  const deutschChecks = [
    {
      label: 'Names a clear "because", not just buzzwords',
      pass: isSpecific && !hasBuzzwords
    },
    {
      label: 'Includes numbers, limits or a specific customer that could be tested',
      pass: hasNumbers || words.length >= 16
    },
    {
      label: 'Explains why big existing players cannot easily copy it',
      pass: hasFeedbackLoop || (hasHardware && hasMechanism)
    },
    {
      label: 'Still works if the tools it relies on become free',
      pass: !hasPlatformDep
    }
  ];

  const deutschSummary = hasBuzzwords
    ? `This ${archetype} leans on big words. If the same sentence could describe ten different startups, the reason is too easy to swap out.`
    : isSpecific
      ? `This ${archetype} gives a clear reason. It holds up if you can show a simpler option cannot solve the same problem.`
      : 'Short and clear, but the reason is missing. Add the exact thing that makes this idea work.';

  const deutschFailure = hasPlatformDep
    ? 'The platform it is built on adds the same feature itself, and the idea loses its reason to exist.'
    : hasHardware
      ? 'A nearby technology (faster charging, cheaper sensors, ready-made parts) gets good enough to make it unnecessary.'
      : 'Rivals copy the same pitch with the same tools, and prices fall towards zero.';

  const deutschDirective =
    'Write one sentence that could prove the idea wrong: which single assumption, if false, breaks the whole thing?';

  // 2. What could break it?
  const talebChecks = [
    {
      label: 'No single platform, regulator or buyer can switch it off',
      pass: !hasPlatformDep && !hasBio
    },
    {
      label: 'Fixed costs or loans would not sink it after a 30% drop in sales',
      pass: !hasDebtOrCapex
    },
    {
      label: 'Small, capped downside with room for a big upside',
      pass: hasAI || hasFeedbackLoop
    },
    {
      label: 'Removes weak points before growing',
      pass: hasDeletion
    }
  ];

  const talebSummary = hasDebtOrCapex
    ? 'This needs a lot of money up front. Buildings, stock or equipment hurt badly if fewer customers arrive than planned.'
    : hasPlatformDep
      ? 'This depends on another company\'s platform. Low costs keep it alive for a while, but one rule change upstream could hurt a lot.'
      : 'Some fragility. Check for hidden debt, legal risk or reliance on one sales channel.';

  const talebFailure = hasDebtOrCapex
    ? 'Equipment and loan costs keep running during a slow period, forcing the business to raise money on bad terms.'
    : hasBio
      ? 'A small number of bad outcomes or false alarms causes big damage to trust and draws regulators in.'
      : 'Winning customers gets more expensive or a big rival cuts prices, and each sale starts losing money.';

  const talebDirective = hasDebtOrCapex
    ? 'Grow in small, safe steps: lock in key customers or use partners\' sites before taking on big fixed costs.'
    : 'Remove single points of failure: have more than one supplier for anything critical, and make sure you can survive a slow year.';

  // 3. What can you cut?
  const muskChecks = [
    {
      label: 'Breaks cost and time down to the raw parts',
      pass: hasNumbers || hasHardware
    },
    {
      label: 'Deletes old steps instead of automating them',
      pass: hasDeletion
    },
    {
      label: 'Simplifies before automating',
      pass: !hasBuzzwords && isSpecific
    },
    {
      label: 'Aims for about ten times better speed, cost or reliability',
      pass: hasAI || hasHardware || hasNumbers
    }
  ];

  const muskSummary = hasDeletion
    ? 'Good instinct to remove things. Make sure every remaining step has a named owner and a cost close to the raw minimum.'
    : 'Nothing here says what will be removed. New businesses often inherit lots of steps from the old way that nobody needs.';

  const muskFailure = hasAI
    ? 'Automating a broken process too early: impressive AI wrapped around steps that should not exist.'
    : 'Over-building custom parts before proving which parts customers actually value.';

  const muskDirective =
    'List every step the customer takes today, delete at least a third, simplify the rest, and only then automate.';

  // 4. Does it learn fast?
  const leverageLevel = hasFeedbackLoop
    ? 'Changes how fast people see results (feedback)'
    : hasHardware || hasMarket
      ? 'Changes the rules (who owns what and who pays)'
      : hasBio
        ? 'Changes the goal (aims at long-term results)'
        : 'Only tweaks a number like price or speed for now';

  const meadowsChecks = [
    {
      label: 'Changes feedback, rules or goals, not just a number',
      pass: hasFeedbackLoop || hasBio || hasMarket
    },
    {
      label: 'Shortens the time between a problem and fixing it',
      pass: hasFeedbackLoop || hasAI
    },
    {
      label: 'Gets better the more it is used (data, trust or size)',
      pass: hasFeedbackLoop || hasMarket
    },
    {
      label: 'Plans for pushback (rivals, rules, a full market)',
      pass: isSpecific && !hasBuzzwords
    }
  ];

  const meadowsSummary = `Where it pushes: ${leverageLevel}. Ideas that last change who sees results and how fast, not just the price.`;

  const meadowsFailure =
    'Slow onboarding, long approvals or a rival\'s price cut quietly soak up the early progress.';

  const meadowsDirective =
    'Find the slowest wait in your customer\'s day and design the product to shrink it from weeks to minutes.';

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
      band: 'Strong and sturdy',
      tone: 'high',
      summary:
        'A clear reason, limited downside, a lean design and fast feedback. Now it is about doing the work and measuring it.'
    };
  }
  if (totalScore >= 62) {
    return {
      band: 'Promising, with gaps',
      tone: 'mid-high',
      summary:
        'A solid core with one or two clear weak spots. Fix those before spending heavily.'
    };
  }
  if (totalScore >= 40) {
    return {
      band: 'Needs work',
      tone: 'mid',
      summary:
        'The problem is real, but the idea is easy to copy, risky, or only tweaks prices. Cut steps and sharpen what makes it different first.'
    };
  }
  return {
    band: 'Fragile for now',
    tone: 'low',
    summary:
      'The reason is easy to swap out, a single shock could sink it, and it changes little. Rebuild it from the raw costs and the real customer problem.'
  };
}
