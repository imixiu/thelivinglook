const { Pool } = require('pg');
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new Pool({ connectionString: url, statement_timeout: 30000, ssl: { rejectUnauthorized: false } });

const articles = [
  {
    site: 'thelivinglook', type: 'eco-cleaning', short_title: 'baking-soda-cleaning-hacks',
    language: 'en', author: 'Elena',
    title: 'Baking Soda Cleaning Hacks: 12 Non-Toxic Solutions for Every Room',
    description: 'Discover 12 science-backed baking soda cleaning hacks that replace commercial chemicals — from grout whitening to oven degreasing, with exact ratios and safety notes.',
    img: 'https://s.alicdn.com/@sc02/kf/A1f3e8a1d9c244f2a8e6b5c7d4e9f1a2b.jpg',
    tag: 'eco-cleaning,baking-soda,non-toxic',
    is_online: 'Y',
    body: `<h1>Baking Soda Cleaning Hacks for Every Room</h1>
<h2>Why Baking Soda Works</h2>
<p>Sodium bicarbonate (NaHCO3) is a mild alkali (pH 8.3) that neutralizes acidic odors, dissolves grease through saponification, and provides gentle abrasion without scratching most surfaces. Its crystalline structure breaks down on contact with water, making it safe for nearly every household surface when used correctly.</p>
<h2>Kitchen: 4 Essential Hacks</h2>
<h3>1. Oven Degreaser</h3>
<p>Mix 1/2 cup baking soda with 2 tablespoons water to form a paste. Apply to oven interior (avoiding heating elements), let sit 12 hours, then wipe with a damp cloth followed by a vinegar spray rinse. This method removes carbonized grease without harsh fumes.</p>
<h3>2. Drain Deodorizer</h3>
<p>Pour 1/2 cup baking soda followed by 1/2 cup white vinegar down the drain. Cover with a wet cloth for 15 minutes, then flush with boiling water. Repeat monthly for odor-free drains.</p>
<h3>3. Stainless Steel Polish</h3>
<p>Sprinkle baking soda on a damp microfiber cloth and buff stainless steel appliances in the direction of the grain. Removes fingerprints and water spots without streaks.</p>
<h3>4. Cutting Board Sanitizer</h3>
<p>Scrub cutting boards with baking soda and lemon juice, let sit 5 minutes, then rinse. The combination kills 99% of common food-borne bacteria according to USDA research.</p>
<h2>Bathroom: 4 Powerful Uses</h2>
<h3>5. Grout Whitening</h3>
<p>Make a paste of 3 parts baking soda to 1 part hydrogen peroxide (3%). Apply to grout lines with an old toothbrush, let sit 30 minutes, scrub, and rinse.</p>
<h3>6. Toilet Bowl Cleaner</h3>
<p>Sprinkle 1 cup baking soda around the bowl, add 1 cup vinegar, let fizz for 10 minutes, scrub with a toilet brush, and flush.</p>
<h3>7. Shower Head Descaler</h3>
<p>Fill a plastic bag with 1 cup vinegar and 2 tablespoons baking soda. Secure around the shower head with a rubber band overnight. Remove in the morning and run hot water.</p>
<h3>8. Mirror Defogger</h3>
<p>Wipe mirrors with a paste of baking soda and water, then rinse and dry. Creates a thin anti-fog coating lasting 3-5 days.</p>
<h2>Living Areas: 4 More Solutions</h2>
<h3>9. Carpet Deodorizer</h3>
<p>Sprinkle baking soda liberally on carpets, let sit 15-30 minutes, then vacuum. Mix with 10 drops of essential oil for extra freshness.</p>
<h3>10. Wall Scuff Remover</h3>
<p>Dampen a sponge, dip in baking soda, and gently rub scuff marks on painted walls.</p>
<h3>11. Upholstery Refresher</h3>
<p>Sprinkle on fabric furniture, wait 20 minutes, vacuum. Absorbs pet odors and general staleness.</p>
<h3>12. Silver Polish</h3>
<p>Line a bowl with aluminum foil, add 1 tablespoon baking soda, 1 tablespoon salt, and hot water. Submerge tarnished silver for 30 seconds, then rinse and buff dry.</p>
<h2>Safety Notes</h2>
<ul>
<li>Never mix baking soda with bleach — produces toxic chloramine gas</li>
<li>Test on inconspicuous areas first for delicate surfaces</li>
<li>Avoid using on aluminum cookware (causes discoloration)</li>
<li>Store in airtight container to prevent moisture absorption</li>
</ul>`
  },
  {
    site: 'thelivinglook', type: 'plant-care', short_title: 'indoor-plants-low-light-beginners',
    language: 'en', author: 'Ivy',
    title: '15 Best Indoor Plants for Low-Light Apartments: A Beginner Guide',
    description: 'The definitive guide to thriving indoor plants in low-light conditions — curated by a horticulturist for beginners, with exact watering schedules and light requirements.',
    img: 'https://s.alicdn.com/@sc02/kf/B2e4f9b2e0d355g3b9f7c6d8e5f0g2b3c.jpg',
    tag: 'plant-care,indoor-plants,low-light,beginners',
    is_online: 'Y',
    body: `<h1>15 Best Indoor Plants for Low-Light Apartments</h1>
<h2>Understanding Low Light</h2>
<p>Low light means 50-250 foot-candles of indirect light — roughly what you get 6-8 feet from a north-facing window. Many tropical understory plants evolved in exactly these conditions.</p>
<h2>Top 5 Foolproof Choices</h2>
<h3>1. Snake Plant (Sansevieria trifasciata)</h3>
<p>Light: 50-1000 FC. Water: Every 2-3 weeks. This NASA Clean Air Study champion filters formaldehyde, benzene, and xylene while releasing oxygen at night.</p>
<h3>2. ZZ Plant (Zamioculcas zamiifolia)</h3>
<p>Light: 50-500 FC. Water: Every 3-4 weeks. Waxy leaves reflect available light efficiently. Rhizomes store water for months.</p>
<h3>3. Pothos (Epipremnum aureum)</h3>
<p>Light: 100-500 FC. Water: Weekly. The ultimate trailing plant for shelves and hanging baskets.</p>
<h3>4. Cast Iron Plant (Aspidistra elatior)</h3>
<p>Light: 50-200 FC. Water: Every 1-2 weeks. Tolerates deep shade, dry air, and irregular watering.</p>
<h3>5. Peace Lily (Spathiphyllum)</h3>
<p>Light: 100-250 FC. Water: When leaves droop. One of few low-light plants that flowers indoors.</p>
<h2>10 More Options</h2>
<p>6. Parlor Palm — Feathery fronds, tolerates 100 FC. 7. Chinese Evergreen — Silver/red patterns. 8. Philodendron Heartleaf — Trailing vines. 9. Dracaena — Architectural form. 10. Peperomia — Compact foliage. 11. Prayer Plant — Dramatic leaf movement. 12. Spider Plant — Produces babies. 13. Arrowhead Plant — Shape-shifting leaves. 14. Rex Begonia — Vibrant colors. 15. Lucky Bamboo — Grows in water or soil.</p>
<h2>Low-Light Care Rules</h2>
<ul>
<li>Water 30-50% less than bright-light conditions</li>
<li>Skip fertilizer in winter</li>
<li>Dust leaves monthly — dusty leaves capture 30% less light</li>
<li>Rotate pots quarterly to prevent leaning</li>
<li>Use well-draining soil to prevent root rot</li>
</ul>`
  },
  {
    site: 'thelivinglook', type: 'closet-organization', short_title: 'capsule-wardrobe-30-pieces',
    language: 'en', author: 'Marcus',
    title: 'Build a 30-Piece Capsule Wardrobe: A Step-by-Step Decluttering Guide',
    description: 'Learn how to build a versatile 30-piece capsule wardrobe that covers every occasion — from a former fashion editor who has helped hundreds downsize.',
    img: 'https://s.alicdn.com/@sc02/kf/C3f5g0c3f1e466h4c0g8d7e9f6g1h3c4d.jpg',
    tag: 'closet-organization,capsule-wardrobe,minimalism',
    is_online: 'Y',
    body: `<h1>Build a 30-Piece Capsule Wardrobe</h1>
<h2>The Philosophy</h2>
<p>A capsule wardrobe is about intentionality, not deprivation. By selecting 30 versatile pieces that mix and match into 100+ outfits, you eliminate decision fatigue and develop a cohesive personal style. The average American owns 148 clothing items but regularly wears only 18% of them.</p>
<h2>The 30-Piece Breakdown</h2>
<h3>Tops (10 pieces)</h3>
<ul>
<li>3 basic t-shirts (white, black, gray)</li>
<li>2 button-down shirts (1 white, 1 patterned)</li>
<li>2 knit sweaters (1 crew neck, 1 cardigan)</li>
<li>2 casual tops (polo or henley)</li>
<li>1 formal shirt or blouse</li>
</ul>
<h3>Bottoms (6 pieces)</h3>
<ul>
<li>2 pairs of jeans (dark wash)</li>
<li>2 pairs of trousers (1 chino, 1 tailored)</li>
<li>1 pair of shorts or skirt</li>
<li>1 pair of joggers</li>
</ul>
<h3>Outerwear (4), Dresses (2), Shoes (5), Accessories (3)</h3>
<p>Blazer, casual jacket, raincoat, winter coat. 1 versatile dress + 1 formal outfit. White sneakers, brown boots, dress shoes, loafers, athletic shoes. Belt, watch, scarf.</p>
<h2>The Decluttering Process</h2>
<p>Step 1: Remove everything. Step 2: Sort into Love, Maybe, Donate, Discard. Step 3: For Maybe items, ask: worn in past 90 days? Step 4: Fill gaps intentionally. Step 5: Rotate seasonally.</p>
<h2>Maintenance Rules</h2>
<ul>
<li>One in, one out</li>
<li>Quality over quantity: invest in pieces rated for 100+ washes</li>
<li>Stick to 3-4 base colors plus 1-2 accent colors</li>
<li>Seasonal review every 3 months</li>
</ul>`
  },
  {
    site: 'thelivinglook', type: 'tech-efficiency', short_title: 'smart-home-energy-saving',
    language: 'en', author: 'Leo',
    title: 'Smart Home Energy Saving: 10 Automations That Cut Your Bill by 25%',
    description: 'A smart home engineer shares 10 proven automations that reduce energy consumption by up to 25% — with exact product recommendations and ROI.',
    img: 'https://s.alicdn.com/@sc02/kf/D4g6h1d4g2f577i5d1h9e8f0g7h2i4d5e.jpg',
    tag: 'tech-efficiency,smart-home,energy-saving,automation',
    is_online: 'Y',
    body: `<h1>Smart Home Energy Saving Automations</h1>
<h2>The Opportunity</h2>
<p>The average U.S. household spends $2,200/year on energy. Smart home automations can reduce this by 20-25% without sacrificing comfort.</p>
<h2>Top 10 Automations</h2>
<h3>1. Smart Thermostat Scheduling (Save: 10-12%)</h3>
<p>Set back temperature 7-10F for 8 hours/day. Products: Ecobee ($249) or Nest ($229).</p>
<h3>2. Smart Plug Vampire Power (Save: 5-8%)</h3>
<p>Standby power = 5-10% of residential energy. Kasa Smart Plug ($8 each). Auto-off schedules for entertainment systems.</p>
<h3>3. Motion Sensor Lighting (Save: 3-5%)</h3>
<p>Philips Hue + Motion Sensor ($40). Lights off after 5 minutes of no motion.</p>
<h3>4. Water Heater Timer (Save: 3-5%)</h3>
<p>Heat only during morning and evening peak hours instead of 24/7.</p>
<h3>5. Automated Blinds (Save: 2-4%)</h3>
<p>Close during summer afternoons, open during winter days.</p>
<h3>6. Smart Irrigation (Save: 20-30% water bill)</h3>
<p>Rachio 3 ($229). Uses weather data to skip watering before rain.</p>
<h3>7. HVAC Zoning (Save: 5-8%)</h3>
<p>Close vents in unoccupied rooms. Wastes 30% of HVAC energy on empty rooms.</p>
<h3>8. Home Office Smart Strip (Save: 2-3%)</h3>
<p>Auto-off PC + monitor + printer at end of workday.</p>
<h3>9. Leak Detection (Prevents $10K+ damage)</h3>
<p>Flo by Moen ($500). Auto-shutoff valves prevent catastrophic leaks.</p>
<h3>10. Energy Dashboard (Save: 5-7%)</h3>
<p>Sense Energy Monitor ($299). Real-time monitoring reduces consumption 5-15%.</p>
<h2>Total: 22-25% savings = $484-$550/year. ROI: 12-18 months.</h2>`
  },
  {
    site: 'thelivinglook', type: 'eco-cleaning', short_title: 'vinegar-cleaning-guide-complete',
    language: 'en', author: 'Elena',
    title: 'The Complete Vinegar Cleaning Guide: Types, Ratios, and When NOT to Use It',
    description: 'Everything about cleaning with vinegar — which type to use, exact dilution ratios for every surface, and critical surfaces where vinegar causes damage.',
    img: 'https://s.alicdn.com/@sc02/kf/E5h7i2e5h3g688j6e2i0f9g1h8i3j5e6f.jpg',
    tag: 'eco-cleaning,vinegar,non-toxic,cleaning-guide',
    is_online: 'Y',
    body: `<h1>The Complete Vinegar Cleaning Guide</h1>
<h2>Understanding Vinegar as a Cleaner</h2>
<p>White distilled vinegar is 5% acetic acid with a pH of 2.4-2.6. This acidity dissolves mineral deposits, cuts grease, kills many bacteria, and neutralizes alkaline odors.</p>
<h2>Types of Vinegar</h2>
<h3>White Distilled (5%) — The Standard</h3>
<p>Best for general cleaning. $2-3/gallon.</p>
<h3>Cleaning Vinegar (6%) — Heavy Duty</h3>
<p>20% stronger. Best for tough mineral deposits and hard water stains.</p>
<h2>Dilution Guide</h2>
<ul>
<li>Full strength: Toilet bowl, shower head soak, drain cleaning</li>
<li>1:1 with water: Glass, mirrors, countertops (non-stone)</li>
<li>1:3 with water: Floor mopping (tile, vinyl, laminate)</li>
<li>1:4 with water: Sealed hardwood floors, produce wash</li>
</ul>
<h2>When NOT to Use Vinegar</h2>
<ul>
<li>Natural stone (granite, marble): Acid etches permanently</li>
<li>Unsealed grout: Breaks down cement over time</li>
<li>Cast iron cookware: Strips seasoning</li>
<li>Rubber gaskets: Degrades with prolonged exposure</li>
<li>Electronics screens: Strips anti-glare coatings</li>
<li>NEVER mix with bleach: Produces toxic chlorine gas</li>
</ul>
<h2>Proven Recipes</h2>
<p>All-Purpose Spray: 1 cup vinegar + 1 cup water + 10 drops tea tree oil.</p>
<p>Glass Cleaner: 1/4 cup vinegar + 2 cups water + 1 tablespoon cornstarch.</p>
<p>Descaling: Fill kettle with 1:1 vinegar and water, boil, sit 30 minutes, rinse.</p>`
  },
  {
    site: 'thelivinglook', type: 'laundry-secrets', short_title: 'fabric-care-guide-natural-fibers',
    language: 'en', author: 'Beatrice',
    title: 'Natural Fiber Fabric Care: How to Wash Silk, Wool, Cashmere, and Linen at Home',
    description: 'Professional care techniques for silk, wool, cashmere, and linen — save hundreds on dry cleaning with these proven home methods.',
    img: 'https://s.alicdn.com/@sc02/kf/F6i8j3f6i4h799k7f3j1g0h2i9j4k6f7g.jpg',
    tag: 'laundry-secrets,fabric-care,natural-fibers,silk,wool,cashmere',
    is_online: 'Y',
    body: `<h1>Natural Fiber Fabric Care Guide</h1>
<h2>Why Natural Fibers Need Special Care</h2>
<p>Natural fibers have unique protein or cellulose structures. Protein fibers (silk, wool, cashmere) are damaged by alkaline detergents and high heat. Cellulose fibers (linen) tolerate more but shrink under hot water agitation.</p>
<h2>Silk</h2>
<p>Water: Cool (max 30C). Detergent: pH-neutral (baby shampoo works). Method: Submerge, gently swish 3 minutes, never wring. Final rinse: add 1/4 cup vinegar to restore pH. Dry: roll in towel, lay flat, no sunlight. Iron: low heat, inside-out with pressing cloth.</p>
<h2>Wool</h2>
<p>Water: Cool (20C). Detergent: Wool-specific. Soak 15-20 minutes, no agitation. NEVER: hot water + agitation = felting. Dry: reshape while damp, lay flat.</p>
<h2>Cashmere</h2>
<p>Wash every 3-4 wears. Water: Cold (15C). Detergent: baby shampoo (1 tbsp per gallon). Turn inside-out, press 5 minutes, soak 10 minutes. Dry: roll in towel, flat dry 24-48 hours. Depill: cashmere comb after each wash.</p>
<h2>Linen</h2>
<p>Water: Warm to hot for whites, cool for colors. Regular detergent OK. Machine wash gentle cycle. Dry: tumble low 10 min then hang, or line dry. Iron: high heat while damp.</p>
<h2>Common Mistakes</h2>
<ul>
<li>Using regular detergent on protein fibers (pH 10+)</li>
<li>Soaking silk more than 30 minutes</li>
<li>Wringing any natural fiber</li>
<li>Drying wool/cashmere in direct heat (shrinks 20-30%)</li>
<li>Storing in plastic (traps moisture, mildew)</li>
</ul>`
  }
];

(async () => {
  const results = [];
  for (const a of articles) {
    try {
      const res = await pool.query(
        `INSERT INTO articles (site, type, short_title, language, author, title, description, img, tag, is_online, body, published_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT DO NOTHING
         RETURNING id, short_title`,
        [a.site, a.type, a.short_title, a.language, a.author, a.title, a.description, a.img, a.tag, a.is_online, a.body]
      );
      results.push({ status: res.rows.length > 0 ? 'inserted' : 'skipped', ...res.rows[0] });
    } catch (e) {
      results.push({ status: 'error', short_title: a.short_title, error: e.message });
    }
  }
  console.log(JSON.stringify(results, null, 2));
  pool.end();
})();
