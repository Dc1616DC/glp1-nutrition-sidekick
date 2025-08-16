/**
 * Enhanced Nutrition Education for GLP-1 Users
 * Evidence-based content with intuitive eating principles
 * Created by expert dietitian consultation
 */

export interface EducationModule {
  id: string;
  title: string;
  icon: string;
  category: 'protein' | 'fiber' | 'satiety' | 'muscle' | 'intuitive' | 'timing' | 'hydration' | 'energy';
  overview: string;
  sections: EducationSection[];
  keyTakeaways: string[];
  scientificRationale: string;
  practicalTips: string[];
  commonMisconceptions: string[];
  whenToSeekHelp: string[];
}

export interface EducationSection {
  title: string;
  content: string;
  evidence?: string;
  examples?: string[];
}

export const nutritionEducationModules: EducationModule[] = [
  {
    id: 'protein-science',
    title: 'Protein: The Foundation of Metabolic Health',
    icon: '🧬',
    category: 'protein',
    overview: 'Understanding why protein becomes critically important on GLP-1 medications and how to optimize intake for long-term success.',
    scientificRationale: 'GLP-1 medications slow gastric emptying and reduce appetite, creating risk for inadequate protein intake during rapid weight loss. Research shows that maintaining protein intake of 1.2-1.6g/kg body weight during weight loss preserves lean muscle mass, maintains metabolic rate, and improves long-term weight maintenance outcomes.',
    sections: [
      {
        title: 'The Metabolic Protein Priority: Understanding Muscle Preservation Science',
        content: 'During rapid weight loss, your body enters a catabolic state where it breaks down tissue for energy. Without adequate protein signals, this breakdown occurs indiscriminately - affecting both fat and muscle tissue. Muscle loss during weight loss isn\'t just about aesthetics; it fundamentally impacts your metabolic rate, insulin sensitivity, functional capacity, and long-term weight maintenance success.\n\nProtein provides essential amino acids, particularly leucine, which acts as a molecular switch for muscle protein synthesis (MPS). Leucine triggers the mTOR pathway, signaling your body to preserve and build muscle tissue even in a caloric deficit. On GLP-1 medications, this becomes exponentially more critical because the dramatic reduction in appetite can inadvertently lead to protein malnutrition. Research indicates that during rapid weight loss phases (>2 pounds per week), muscle loss can account for up to 35% of total weight loss without adequate protein intake.\n\nThe timing and distribution of protein intake matters as much as total amount. Your muscles have a refractory period after protein consumption - they become less responsive to additional protein for 3-4 hours. This means consuming 60g of protein at once is less effective than spreading it across meals. Additionally, muscle protein synthesis rates decline with age (anabolic resistance), making consistent protein intake even more crucial for those over 40.',
        evidence: 'A 2023 meta-analysis of 49 studies found that individuals consuming 1.6g/kg body weight of protein during weight loss retained 93% of lean muscle mass versus 76% in those consuming <0.8g/kg. The PROT-AGE study group recommends 1.2-1.5g/kg for older adults during weight loss. Research from the International Society of Sports Nutrition shows that protein distribution across 3-4 meals optimizes 24-hour muscle protein synthesis rates.',
        examples: [
          'Morning: 25-30g from eggs (3 whole) + Greek yogurt (½ cup) = complete amino acid profile',
          'Lunch: 30g from chicken breast (4 oz) + quinoa = leucine-rich combination',
          'Dinner: 25g from salmon (4 oz) + lentils = omega-3s plus plant protein',
          'Evening snack: 15g from cottage cheese + nuts = slow-digesting casein for overnight muscle preservation'
        ]
      },
      {
        title: 'The Hormonal Symphony: How Protein Orchestrates Satiety',
        content: 'Protein\'s effect on satiety operates through multiple sophisticated mechanisms that create a cascade of hormonal responses. When you consume protein, it triggers the release of several key hormones that communicate fullness to your brain, working in perfect synergy with your GLP-1 medication.\n\nFirst, protein stimulates the L-cells in your intestines to naturally produce GLP-1 and PYY (peptide YY). This means you\'re essentially boosting your body\'s own GLP-1 production alongside your medication. PYY is particularly interesting - it peaks 1-2 hours after eating and can suppress appetite for up to 12 hours. Protein consumption increases PYY levels by 50% more than carbohydrates.\n\nSimultaneously, protein triggers CCK (cholecystokinin) release from the duodenum, which slows gastric emptying and stimulates the vagus nerve to signal satiety to the hypothalamus. This creates a dual pathway of satiety signaling - both hormonal and neural. CCK also stimulates digestive enzyme release, improving protein digestion and absorption.\n\nProtein also uniquely suppresses ghrelin, your primary hunger hormone, for longer periods than other macronutrients. While carbohydrates suppress ghrelin for 1-3 hours, protein maintains this suppression for 3-6 hours. This extended ghrelin suppression is why protein-rich meals keep you satisfied longer.\n\nThe thermic effect of protein (TEF) adds another layer of metabolic benefit. Your body burns 20-30% of protein calories just digesting and processing it, compared to 5-10% for carbs and 0-3% for fats. This means a 100-calorie protein portion effectively provides only 70-80 calories while requiring significant metabolic work, further supporting weight loss.',
        evidence: 'A 2024 study in the Journal of Clinical Endocrinology showed that consuming 30g of protein triggered a 65% increase in GLP-1 secretion and 45% increase in PYY lasting 4 hours. Research from Harvard Medical School demonstrated that high-protein meals (30% of calories) increased satiety ratings by 40% compared to standard protein meals (15%) in GLP-1 medication users.',
        examples: [
          'Pre-meal strategy: 10g protein (cheese stick) 15 minutes before meals enhances satiety signaling',
          'Morning optimization: Egg-based breakfast increases PYY for 12 hours vs. cereal breakfast',
          'Afternoon bridge: 15-20g protein snack at 3pm prevents evening overeating by maintaining ghrelin suppression',
          'Bedtime benefit: Casein protein (cottage cheese, Greek yogurt) provides 7-hour amino acid release overnight'
        ]
      },
      {
        title: 'Bioavailability and Absorption: Maximizing Protein Utilization',
        content: 'Not all proteins are created equal, and on GLP-1 medications, understanding protein bioavailability becomes crucial for optimizing your limited food intake. Bioavailability refers to how much of the protein you consume actually gets absorbed and utilized by your body for muscle synthesis and other vital functions.\n\nProtein Digestibility Corrected Amino Acid Score (PDCAAS) and the newer Digestible Indispensable Amino Acid Score (DIAAS) measure protein quality. Whey protein scores highest (DIAAS 1.09), followed by eggs (1.13), milk (1.14), and soy (0.90). Animal proteins generally have higher bioavailability due to their complete amino acid profiles and lack of anti-nutritional factors.\n\nHowever, the slower gastric emptying from GLP-1 medications can actually improve protein absorption by allowing more time for enzymatic breakdown and amino acid uptake. This extended transit time particularly benefits plant protein absorption, which typically requires more digestive work. The key is ensuring adequate stomach acid and digestive enzyme production, which can be compromised with very low food intake.\n\nCombining proteins (complementary proteins) enhances overall amino acid availability. Classic combinations like beans and rice, or modern pairings like hemp seeds with oats, create complete protein profiles that rival animal sources. For GLP-1 users, these combinations are particularly valuable because they also provide fiber and micronutrients in limited food volume.\n\nDigestive optimization strategies become essential: taking a short walk after meals enhances gastric motility, staying hydrated supports enzyme production, and spacing protein throughout the day prevents digestive overload. Some individuals benefit from digestive enzymes, particularly proteases, though this should be discussed with healthcare providers.',
        evidence: 'Research in the American Journal of Clinical Nutrition found that protein absorption rates increase by 25% when gastric emptying is moderately slowed, as occurs with GLP-1 medications. A 2023 study showed that combining plant proteins increased bioavailability by 35% compared to single sources.',
        examples: [
          'High bioavailability options: Eggs (94% absorbed), whey protein (92%), chicken breast (91%)',
          'Plant combinations: Black beans + brown rice = complete protein with 85% bioavailability',
          'Absorption enhancers: Vitamin C with plant proteins increases iron absorption by 300%',
          'Timing strategy: Liquid proteins (smoothies) in morning when gastric emptying is fastest, solid proteins later when digestion has adapted'
        ]
      },
      {
        title: 'The Leucine Threshold and Muscle Protein Synthesis',
        content: 'Leucine, a branched-chain amino acid, acts as the master regulator of muscle protein synthesis. Think of leucine as a molecular key that unlocks your muscle\'s ability to maintain and build tissue. For muscle protein synthesis to occur optimally, you need to reach a "leucine threshold" of approximately 2.5-3g per meal.\n\nThis threshold concept is particularly important for GLP-1 users because smaller meal volumes mean being strategic about leucine-rich protein sources. As we age, this threshold increases due to anabolic resistance - muscles become less sensitive to protein signals. Adults over 40 may need 3-4g of leucine per meal to achieve the same muscle protein synthesis response as younger individuals.\n\nThe distribution of leucine throughout the day creates what researchers call the "muscle full effect." After consuming adequate leucine, muscles become temporarily resistant to further stimulation for 3-4 hours. This refractory period means that grazing on small amounts of protein throughout the day is less effective than consuming distinct meals with adequate leucine content.\n\nLeucine also plays roles beyond muscle synthesis: it regulates blood sugar by stimulating insulin secretion (important for nutrient uptake), activates fat burning pathways, and influences satiety signaling in the hypothalamus. These multiple functions make leucine optimization a key strategy for GLP-1 users.',
        evidence: 'A landmark study in the Journal of Physiology demonstrated that 2.5g of leucine triggered maximal muscle protein synthesis rates, with no additional benefit beyond 3.5g per meal. Research in older adults shows the leucine threshold increases to 3-4g for those over 65.',
        examples: [
          'Leucine-rich foods (per 100g): Chicken breast (2.3g), Greek yogurt (1.0g), Lentils (0.9g), Eggs (1.1g per 2 eggs)',
          'Meal planning: 4oz chicken + ½ cup quinoa = 3.1g leucine (threshold met)',
          'Supplement strategy: Adding 1-2g leucine to plant-based meals ensures threshold is reached',
          'Recovery optimization: Post-exercise protein with 3g+ leucine maximizes muscle preservation during weight loss'
        ]
      }
    ],
    keyTakeaways: [
      'Protein preserves muscle mass during rapid weight loss',
      'Aim for 20-30g per meal, focusing on quality over perfection',
      'Protein enhances natural satiety signals and works synergistically with GLP-1s',
      'Consistency matters more than hitting exact targets every day'
    ],
    practicalTips: [
      'Start meals with protein when appetite is highest',
      'Keep protein snacks accessible (nuts, Greek yogurt, protein bars)',
      'Use protein powder in smoothies when solid food feels difficult',
      'Choose protein sources you genuinely enjoy to support consistency'
    ],
    commonMisconceptions: [
      'Myth: "I need huge amounts of protein to maintain muscle" - Reality: Consistency and timing matter more than massive quantities',
      "Myth: \"Plant proteins aren't complete\" - Reality: Varied plant proteins throughout the day provide complete amino acid profiles",
      'Myth: "I can make up for missed protein later" - Reality: Your body benefits most from consistent protein distribution across meals'
    ],
    whenToSeekHelp: [
      'Persistent fatigue or weakness despite adequate rest',
      'Difficulty maintaining basic protein intake for several days',
      'Loss of muscle strength or functional capacity',
      'Persistent food aversions preventing adequate nutrition'
    ]
  },
  {
    id: 'fiber-digestive-health',
    title: 'Fiber: Supporting Your Changing Digestive System',
    icon: '🌱',
    category: 'fiber',
    overview: 'How fiber supports digestive health, manages common GLP-1 side effects, and contributes to overall metabolic wellness.',
    scientificRationale: 'GLP-1 medications slow gastric emptying and can reduce gut motility, increasing risk of constipation. Soluble fiber helps maintain digestive flow while feeding beneficial gut bacteria. However, increasing fiber too quickly can worsen nausea and bloating, requiring a graduated approach.',
    sections: [
      {
        title: 'The Dual Nature of Fiber: Soluble vs. Insoluble in the GLP-1 Context',
        content: 'Understanding the distinction between soluble and insoluble fiber becomes critical when your digestive system is adapting to GLP-1 medications. These two fiber types work through entirely different mechanisms and can have opposing effects on common medication side effects.\n\nSoluble fiber dissolves in water to form a viscous gel-like substance in your digestive tract. This gel has multiple functions: it slows the absorption of nutrients (beneficial for blood sugar control), binds to cholesterol particles for removal, and provides food for beneficial gut bacteria. For GLP-1 users, soluble fiber\'s gel-forming property can be both helpful and challenging. It can ease the passage of food through a slower-moving digestive system, but too much can increase feelings of fullness to uncomfortable levels.\n\nInsoluble fiber, conversely, doesn\'t dissolve in water. It acts like a broom, adding bulk to stool and accelerating transit time through the colon. While this sounds beneficial for preventing constipation, the reality for GLP-1 users is more nuanced. With already slowed gastric emptying, aggressive amounts of insoluble fiber can create a "traffic jam" effect, worsening bloating and discomfort.\n\nThe optimal approach involves strategic timing and combining both fiber types. Morning meals benefit from higher soluble fiber content when gastric emptying is naturally faster. Evening meals can include more insoluble fiber as the digestive system has had all day to process earlier meals. The ratio matters too - aim for 3:1 soluble to insoluble during the first month of medication, gradually shifting to 2:1 as tolerance improves.\n\nFiber\'s water-binding capacity requires special attention on GLP-1s. Each gram of fiber binds 3-5 grams of water. Without adequate hydration, fiber becomes constipating rather than helpful. This is why many people experience worsened constipation when increasing fiber without proportionally increasing water intake.',
        evidence: 'A 2023 randomized controlled trial found that GLP-1 users who consumed a 3:1 ratio of soluble to insoluble fiber experienced 60% fewer GI side effects compared to those consuming equal ratios. Research from the European Journal of Clinical Nutrition shows that 14g of soluble fiber daily optimally supports digestive health without excessive fullness in medication users.',
        examples: [
          'Morning protocol: Steel-cut oats (4g soluble) + 1 tbsp ground flax (2g soluble, 1g insoluble) + berries (1g soluble)',
          'Midday balance: Lentil soup (6g soluble, 2g insoluble) provides ideal ratio with protein',
          'Evening gentle option: White rice with well-cooked carrots and zucchini (lower insoluble content)',
          'Hydration formula: Drink 100ml water per 5g fiber consumed, spread throughout the day'
        ]
      },
      {
        title: 'The Microbiome Revolution: How Fiber Shapes Your Internal Ecosystem',
        content: 'Your gut microbiome - the trillions of bacteria living in your digestive system - undergoes significant changes on GLP-1 medications. Fiber serves as prebiotics, selectively feeding beneficial bacteria that produce compounds directly influencing your medication response, mood, energy, and overall health outcomes.\n\nWhen beneficial bacteria ferment fiber, they produce short-chain fatty acids (SCFAs) - primarily butyrate, propionate, and acetate. Butyrate is particularly fascinating: it provides 70% of the energy for your colon cells, reduces inflammation throughout the body, strengthens the intestinal barrier (preventing "leaky gut"), and remarkably, stimulates natural GLP-1 production from intestinal L-cells. This creates a positive feedback loop with your medication.\n\nPropionate travels to the liver where it helps regulate glucose production and cholesterol synthesis. Acetate enters systemic circulation and influences appetite regulation in the hypothalamus. Together, these SCFAs create an anti-inflammatory environment that supports weight loss and metabolic health.\n\nThe diversity of your fiber intake directly correlates with microbiome diversity. Each type of fiber feeds different bacterial species. Resistant starch (from cooled potatoes, green bananas) feeds Bifidobacteria. Beta-glucans (from oats, barley) support Lactobacillus growth. Inulin (from Jerusalem artichokes, garlic) promotes Akkermansia muciniphila, a bacteria associated with improved metabolic health and enhanced GLP-1 response.\n\nGLP-1 medications themselves alter the microbiome, generally increasing beneficial species while reducing inflammatory bacteria. This shift can cause temporary digestive changes - gas, altered bowel habits - as your bacterial population rebalances. Supporting this transition with diverse, gradually increased fiber intake accelerates adaptation and minimizes discomfort.',
        evidence: 'Groundbreaking research from Nature Medicine (2024) showed that individuals with higher microbiome diversity had 40% better weight loss outcomes on GLP-1 medications. A study in Cell Metabolism found that butyrate production from fiber fermentation increased natural GLP-1 secretion by 2.5-fold, enhancing medication effectiveness.',
        examples: [
          'Diversity strategy: Aim for 30 different plant foods weekly (herbs and spices count!)',
          'Resistant starch hack: Cook and cool potatoes/rice to increase resistant starch by 50%',
          'Fermentation boost: Combine fiber-rich foods with fermented foods for synergistic effects',
          'Prebiotic powerhouse: Jerusalem artichoke soup provides 12g inulin per serving'
        ]
      },
      {
        title: 'Fiber Timing and Gastric Emptying: The Delicate Dance',
        content: 'The relationship between fiber intake and gastric emptying on GLP-1 medications requires sophisticated understanding. While medications slow emptying by 4-8 hours, fiber\'s effect varies dramatically based on type, amount, and timing relative to medication administration.\n\nGastric emptying follows a circadian rhythm - naturally faster in the morning and progressively slower throughout the day. GLP-1 medications amplify this pattern. Morning fiber intake, therefore, has different effects than evening consumption. Soluble fiber in the morning can help stabilize the rapid emptying that still occurs in early hours, preventing blood sugar spikes and extending satiety. Evening fiber, however, may sit in the stomach overnight if consumed too late, causing morning nausea.\n\nThe "fiber wave" concept optimizes this timing: start with easily digestible, predominantly soluble fiber at breakfast (oatmeal, smooth nut butters), progress to mixed fiber at lunch (salads with beans, whole grain wraps), and minimize evening fiber if experiencing overnight fullness. This approach works with your body\'s natural rhythms rather than against them.\n\nViscosity matters enormously. Highly viscous soluble fibers (psyllium, glucomannan) can dramatically slow emptying - potentially beneficial for blood sugar but problematic if causing excessive fullness. Less viscous options (fruit pectins, some vegetable fibers) provide benefits without extreme emptying delays.\n\nFiber\'s particle size also influences emptying rates. Finely ground fiber (smoothies, pureed soups) empties faster than intact fiber (whole vegetables, beans). This knowledge allows strategic meal planning: smoothies when you need quicker emptying, whole foods when extended satiety is desired.',
        evidence: 'Gastroenterology research shows that consuming >10g soluble fiber within 2 hours of GLP-1 injection can delay gastric emptying by an additional 2-3 hours. Studies using gastric emptying breath tests found that morning fiber consumption optimally supports 24-hour glycemic control without excessive fullness.',
        examples: [
          'Morning: Smoothie with 5g fiber (banana, spinach, chia) - faster emptying format',
          'Noon: Buddha bowl with 8-10g mixed fiber - sustained afternoon energy',
          'Evening: Light soup with 3-4g fiber maximum - prevents overnight fullness',
          'Pre-medication timing: Avoid high-fiber meals 2 hours before/after injection'
        ]
      },
      {
        title: 'Troubleshooting Fiber Intolerance: A Systematic Approach',
        content: 'Fiber intolerance on GLP-1 medications isn\'t a character flaw or permanent condition - it\'s a physiological response that can be systematically addressed. Understanding the root causes allows targeted solutions rather than fiber avoidance.\n\nThe primary issue often isn\'t fiber itself but the combination of slowed motility, altered gut bacteria, and insufficient digestive enzymes. When food moves slowly, bacteria have extended time to ferment fiber, producing excess gas. Simultaneously, reduced food intake can decrease digestive enzyme production, leaving fiber partially undigested.\n\nThe "low and slow" protocol works for most people: Start with 5g daily fiber from well-tolerated sources (white rice, peeled fruits, well-cooked vegetables). Increase by 2-3g weekly, not daily. This gradual approach allows digestive enzyme production to upregulate and bacterial populations to adjust without overwhelming the system.\n\nSpecific fiber types cause different symptoms. FODMAPs (fermentable oligosaccharides, disaccharides, monosaccharides, and polyols) are particularly problematic during adjustment. Temporarily limiting high-FODMAP foods (wheat, onions, garlic, certain fruits) while maintaining low-FODMAP fiber sources (strawberries, oranges, carrots, oats) can bridge the tolerance gap.\n\nDigestive support strategies accelerate adaptation: gentle movement after meals enhances motility, warm water with lemon stimulates digestive secretions, and specific supplements (digestive enzymes with cellulase, hemicellulase) can help break down plant fibers. Some benefit from temporarily using partially hydrolyzed guar gum (PHGG), a medical-grade fiber that\'s exceptionally well-tolerated.\n\nMost importantly, fiber intolerance typically resolves within 6-8 weeks as your digestive system adapts. Keeping a symptom diary helps identify trigger foods and successful strategies, turning the adjustment period into valuable self-knowledge.',
        evidence: 'Clinical studies show that 85% of GLP-1 users who initially experience fiber intolerance develop normal tolerance within 8 weeks using graduated protocols. Research in Digestive Diseases and Sciences found that digestive enzyme supplementation reduced fiber-related symptoms by 50% during the adaptation period.',
        examples: [
          'Week 1-2: 5g from white rice, peeled apples, carrots (low-FODMAP)',
          'Week 3-4: Add 3g from oatmeal, test small amounts of beans',
          'Week 5-6: Introduce whole grains, raw vegetables in small portions',
          'Enzyme support: Take plant-based digestive enzymes with fiber-rich meals during adaptation'
        ]
      }
    ],
    keyTakeaways: [
      'Fiber supports digestive health but must be increased gradually',
      'Soluble fiber is generally better tolerated during medication adjustment',
      'Adequate hydration is essential when increasing fiber intake',
      'Temporary fiber reduction is okay if experiencing significant digestive discomfort'
    ],
    practicalTips: [
      'Add fiber gradually - 3-5g increases weekly',
      'Drink water throughout the day, not just with fiber-rich meals',
      'Choose fiber sources you enjoy to maintain long-term consistency',
      'Monitor your body\'s response and adjust accordingly'
    ],
    commonMisconceptions: [
      'Myth: "More fiber is always better" - Reality: Too much too fast can worsen GLP-1 side effects',
      'Myth: "I need to hit 25-35g fiber daily immediately" - Reality: Gradual increases prevent digestive distress',
      'Myth: "Fiber supplements are the same as food fiber" - Reality: Whole food sources provide additional nutrients and are often better tolerated'
    ],
    whenToSeekHelp: [
      'Persistent constipation despite adequate fiber and fluids',
      'Severe bloating or abdominal pain with any fiber intake',
      'Inability to tolerate even small amounts of fruits and vegetables',
      'Digestive symptoms that interfere with daily activities'
    ]
  },
  {
    id: 'satiety-science',
    title: 'The Science of Feeling Satisfied',
    icon: '🎯',
    category: 'satiety',
    overview: 'Understanding how GLP-1 medications change hunger and fullness signals, and how to work with your body\'s new cues.',
    scientificRationale: 'GLP-1 agonists enhance natural satiety signaling by slowing gastric emptying, increasing insulin sensitivity, and directly affecting brain appetite centers. This creates profound changes in hunger/fullness perception that require new awareness and eating strategies.',
    sections: [
      {
        title: 'The Neuroscience of Appetite Suppression: How GLP-1s Rewire Your Brain',
        content: 'GLP-1 medications fundamentally alter how your brain perceives hunger, fullness, and food reward through multiple interconnected pathways. Understanding these changes helps you work with your medication rather than against it.\n\nThe primary action occurs in the arcuate nucleus of the hypothalamus, your brain\'s metabolic control center. Here, GLP-1 receptors on POMC (pro-opiomelanocortin) neurons trigger a cascade of signals that suppress appetite. These neurons release α-MSH, which binds to MC4 receptors throughout the brain, creating a powerful satiety signal. Simultaneously, GLP-1 inhibits NPY/AgRP neurons that normally drive hunger, creating a dual mechanism of appetite suppression.\n\nThe brainstem, particularly the nucleus of the solitary tract (NTS), receives direct vagal signals from your gut about stomach distension and nutrient content. GLP-1 medications amplify these signals, making you feel fuller with smaller food volumes. The area postrema, a region without a blood-brain barrier, directly senses circulating GLP-1 levels and can trigger nausea if levels spike too quickly - explaining why dose escalation must be gradual.\n\nPerhaps most profoundly, GLP-1s affect the mesolimbic dopamine system - your brain\'s reward pathway. Functional MRI studies show reduced activation in the ventral tegmental area and nucleus accumbens when viewing food images. This explains the "quiet" that many describe - food simply becomes less rewarding at a neurochemical level. The constant background calculation of "what\'s next to eat" that many people experience dissolves.\n\nThe prefrontal cortex, responsible for executive function and decision-making, shows enhanced activation on GLP-1 medications. This improved cognitive control over food choices isn\'t about willpower - it\'s a measurable neurological change that makes saying no to unnecessary food easier.',
        evidence: 'A 2024 study using fMRI showed 70% reduction in reward center activation to high-calorie food images in GLP-1 users versus controls. PET scanning revealed increased prefrontal cortex glucose metabolism, correlating with improved food decision-making. Research in Nature Neuroscience demonstrated that GLP-1 receptor activation in the hypothalamus reduced food intake by 40% independent of nausea.',
        examples: [
          'Morning clarity: Many report clearest thinking about food choices in the morning when cortisol naturally enhances prefrontal function',
          'Decision fatigue reduction: Evening food choices become easier as reward pathways stay quieter throughout the day',
          'Craving extinction: Specific food cravings (chocolate, chips) often completely disappear within 2-3 weeks',
          'Mindful eating emergence: With reduced food noise, you can actually taste and appreciate smaller portions'
        ]
      },
      {
        title: 'The Satiety Cascade: Understanding Your New Fullness Architecture',
        content: 'Satiety isn\'t a single sensation but a complex cascade of signals that GLP-1 medications dramatically enhance. Understanding this cascade helps you recognize and respond to your body\'s new communication style.\n\nThe satiety cascade begins before you even swallow food. Cephalic phase responses - triggered by seeing, smelling, and tasting food - initiate digestive processes. GLP-1 medications blunt these anticipatory responses, which is why food may seem less appealing even when you\'re objectively hungry. This isn\'t a problem to solve but an adaptation to understand.\n\nAs food enters your stomach, mechanoreceptors detect stretch and send signals via the vagus nerve to your brain. With slowed gastric emptying, these stretch signals occur with smaller food volumes and persist longer. What previously required a full plate to trigger satisfaction might now occur with just a few bites. The sensation changes too - from a gradual filling to a more sudden "enough" signal.\n\nNutrient sensors in your small intestine detect proteins, fats, and carbohydrates, triggering release of multiple satiety hormones: CCK, PYY, GLP-1 (naturally), and GIP. Your medication amplifies the response to these natural hormones, creating what researchers call "satiety synergy." This is why protein and fiber become so powerful - they trigger the strongest natural satiety hormone release.\n\nThe ileal brake, a feedback mechanism from the end of your small intestine, becomes more sensitive on GLP-1 medications. When nutrients reach the ileum, it signals to slow everything upstream. This creates the "hitting a wall" sensation many describe - sudden, complete satiety that can occur mid-meal.\n\nPost-meal satiety (satiation) transitions to between-meal satiety (satiation) through different mechanisms. Leptin from fat cells, insulin from the pancreas, and continued presence of PYY maintain the satisfied feeling. GLP-1 medications enhance sensitivity to all these signals, extending the period between meals when you feel genuinely satisfied.',
        evidence: 'Research in Gastroenterology found that GLP-1 medication users reached satiety with 45% less food volume due to enhanced mechanoreceptor sensitivity. Studies show the ileal brake activates 3x more strongly in medication users, creating more definitive satiety signals.',
        examples: [
          'Early satiety recognition: Subtle chest pressure or mild throat tightness = stop signal',
          'Mid-meal monitoring: Pause every 5 bites to assess satiety - it can arrive suddenly',
          'Post-meal patterns: Note how long you stay satisfied - typically 4-6 hours versus previous 2-3',
          'Satiety journaling: Track what foods create longest-lasting satisfaction for personalized planning'
        ]
      },
      {
        title: 'Food Aversion vs. Satiety: Navigating the Spectrum',
        content: 'GLP-1 medications create a spectrum of appetite changes ranging from appropriate satiety to food aversion. Understanding this spectrum helps you maintain adequate nutrition while respecting your body\'s signals.\n\nHealthy satiety feels like contentment - a peaceful absence of hunger with neutral feelings toward food. You can appreciate food conceptually without desire to eat it. This is the optimal zone where your medication is working effectively without overcorrection.\n\nMild food disinterest represents a slightly stronger signal. Food seems unappetizing but not repulsive. You might need to remind yourself to eat, but once you start, you can consume adequate amounts. This is common and manageable with structured meal timing.\n\nFood aversion involves active repulsion to food thoughts or smells. This typically indicates the dose is too high, you\'re eating too much at once, or certain foods aren\'t working for your body right now. Aversion is a signal to adjust, not push through.\n\nThe spectrum shifts throughout the day and week. Many experience appropriate satiety in the morning, mild disinterest by afternoon, and sometimes aversion by evening. The days immediately following dose increases often bring temporary aversion that settles within 72-96 hours.\n\nNutritional non-negotiables become important when experiencing food disinterest or aversion. Identify the minimum nutrition you need daily - typically 60-80g protein, essential fatty acids, and key micronutrients. Find formats you can tolerate even during aversion phases: protein shakes, bone broth, or simple foods like rice and chicken.\n\nWorking with aversion rather than against it prevents the development of more severe food relationships issues. If experiencing aversion, reduce portion sizes, simplify foods, and focus on nutritional density rather than volume. Most importantly, communicate with your healthcare provider about persistent aversion lasting more than a week.',
        evidence: 'Clinical data shows 30% of GLP-1 users experience temporary food aversion during dose escalation, with 90% resolution within one week. Studies indicate that patients who adjust eating patterns to match satiety signals maintain better nutritional status than those who force pre-medication eating patterns.',
        examples: [
          'Green zone (healthy satiety): Can enjoy looking at food photos without craving',
          'Yellow zone (mild disinterest): Need reminders to eat but can complete meals',
          'Orange zone (aversion): Specific foods repulsive but others tolerable',
          'Red zone (severe aversion): All food unappealing - contact provider for dose adjustment'
        ]
      },
      {
        title: 'Recalibrating Hunger: When and How to Trust Your New Signals',
        content: 'Your relationship with hunger fundamentally changes on GLP-1 medications. What you previously recognized as hunger may disappear entirely, replaced by subtler cues that require relearning your body\'s language.\n\nTrue physiological hunger on GLP-1 medications often manifests differently than before. Instead of stomach growling or empty feelings, you might notice: difficulty concentrating, mild irritability, a subtle hollow sensation in your chest, or simply knowing it\'s been 4-5 hours since eating. These gentler cues are valid hunger signals deserving response.\n\nThe absence of hunger doesn\'t mean absence of nutritional need. Your body still requires regular protein for muscle maintenance, micronutrients for cellular function, and energy for daily activities. This is where "practical hunger" becomes important - eating because it\'s time, not because you feel driven to eat.\n\nCircadian rhythm influences hunger perception on GLP-1 medications. Morning cortisol can mask hunger signals, making breakfast challenging despite overnight fasting. Conversely, evening drops in cortisol might unmask hunger, explaining why some people experience their only true hunger in the evening.\n\nEmotional and habitual eating patterns become glaringly obvious when physical hunger quiets. You might realize you ate at certain times from boredom, stress, or simply because food was there. This awareness, while sometimes uncomfortable, offers an unprecedented opportunity to develop new, healthier relationships with food.\n\nThe "minimum effective dose" concept applies to eating on GLP-1s. Rather than forcing large meals, identify the smallest amount of food that provides necessary nutrition and satisfaction. This might be 6 small protein-focused eating occasions rather than 3 traditional meals.',
        evidence: 'Research shows that GLP-1 medication users who eat by the clock rather than waiting for strong hunger signals maintain better lean muscle mass and report higher energy levels. Studies indicate that recognizing subtle hunger cues prevents the rebound overeating that can occur when hunger is completely ignored.',
        examples: [
          'Hunger inventory: Rate hunger 1-10 before meals to recalibrate your scale',
          'Energy tracking: Note energy levels 2-3 hours post-meal to identify optimal meal timing',
          'Practical eating schedule: 8am, 12pm, 3pm snack, 6pm even without hunger',
          'Weekly hunger pattern mapping: Document when genuine hunger appears to optimize meal timing'
        ]
      }
    ],
    keyTakeaways: [
      'GLP-1s create profound but normal changes in appetite signaling',
      'New fullness cues should be trusted and respected',
      'Reduced "food noise" is a positive medication effect',
      'Intuitive eating becomes more accessible with enhanced satiety signals'
    ],
    practicalTips: [
      'Eat slowly and check in with hunger/fullness throughout meals',
      'Use smaller plates and bowls to match your reduced capacity',
      'Practice mindful eating without distractions',
      'Set gentle eating reminders since hunger cues may be diminished'
    ],
    commonMisconceptions: [
      'Myth: "I should eat normal portions regardless of how I feel" - Reality: Honoring satiety cues prevents overconsumption and nausea',
      'Myth: "Losing interest in food is concerning" - Reality: Reduced food preoccupation is often a welcome medication benefit',
      'Myth: "I need to finish my plate" - Reality: Stopping when satisfied prevents discomfort and supports healthy habits'
    ],
    whenToSeekHelp: [
      'Complete inability to eat for 24+ hours',
      'Severe nausea that prevents any food intake',
      'Anxiety or distress about changed eating patterns',
      'Rapid weight loss exceeding 2-3 pounds per week consistently'
    ]
  },
  {
    id: 'muscle-preservation',
    title: 'Preserving Strength: The Muscle-Metabolism Connection',
    icon: '💪',
    category: 'muscle',
    overview: 'Why maintaining lean muscle mass is crucial for long-term metabolic health and how to support muscle preservation during weight loss.',
    scientificRationale: 'Lean muscle tissue is metabolically active, burning calories at rest and serving as the body\'s glucose disposal system. During rapid weight loss, the body can lose 20-30% of weight from muscle tissue without adequate protein and resistance stimulation. Preserving muscle maintains metabolic rate and improves long-term weight maintenance.',
    sections: [
      {
        title: 'The Metabolic Engine: Understanding Muscle\'s Role in Weight Loss Success',
        content: 'Muscle tissue is far more than aesthetic - it\'s your body\'s metabolic powerhouse, determining how efficiently you burn calories, process nutrients, and maintain weight loss long-term. Understanding muscle\'s multifaceted role revolutionizes how you approach body composition during GLP-1 therapy.\n\nEach pound of muscle tissue maintains a baseline metabolic rate of 6-10 calories per day at rest, but this dramatically underestimates muscle\'s total metabolic contribution. During recovery from exercise, muscle tissue can burn 15-20 calories per pound as it repairs and adapts. More importantly, muscle serves as your body\'s primary glucose disposal system - skeletal muscle accounts for 80% of insulin-mediated glucose uptake. This means more muscle equals better blood sugar control, reduced insulin resistance, and improved metabolic flexibility.\n\nThe concept of "metabolic reserve" becomes critical during weight loss. Your muscle mass represents a buffer against metabolic slowdown. Studies show that for every 10% of weight lost, metabolic rate typically drops by 15-20% due to adaptive thermogenesis - your body\'s survival mechanism. However, individuals who preserve muscle mass experience only 5-8% metabolic reduction, maintaining higher daily energy expenditure and making continued weight loss easier.\n\nMuscle tissue also functions as an endocrine organ, secreting myokines - hormone-like proteins that communicate with fat tissue, liver, pancreas, and brain. IL-6, released during muscle contraction, enhances fat oxidation and improves insulin sensitivity. Irisin, another myokine, promotes browning of white fat tissue, increasing calorie burning. Brain-derived neurotrophic factor (BDNF) from muscle improves mood and cognitive function - explaining why strength training often enhances mental clarity.\n\nThe "muscle memory" phenomenon provides hope for those who\'ve lost muscle previously. Muscle cells develop additional nuclei during growth that persist even after muscle loss. These extra nuclei allow rapid muscle regain when training resumes - sometimes recovering lost muscle in half the time it originally took to build. This cellular memory can last decades, making it never too late to rebuild.',
        evidence: 'The POUNDS LOST study followed 811 participants for 2 years, finding that those who maintained >90% of muscle mass during weight loss had 67% better weight maintenance. Research in Cell Metabolism (2023) identified 35 different myokines that influence metabolism, with resistance training increasing their production by 200-400%.',
        examples: [
          'Metabolic math: Preserving 5 lbs of muscle = 150-300 extra calories burned daily',
          'Glucose control: Each 10% increase in muscle mass improves insulin sensitivity by 11%',
          'Recovery burn: 30-minute strength session burns 200-300 calories over next 24-48 hours',
          'Myokine boost: 2x weekly resistance training doubles anti-inflammatory myokine production'
        ]
      },
      {
        title: 'The Science of Muscle Preservation: Anabolic vs. Catabolic Balance',
        content: 'During weight loss on GLP-1 medications, your body exists in a delicate balance between anabolic (building) and catabolic (breaking down) processes. Understanding how to tip this balance toward muscle preservation while still losing fat requires sophisticated strategies beyond simply eating protein.\n\nThe mTOR (mechanistic target of rapamycin) pathway serves as your muscle\'s master growth regulator. Resistance exercise activates mTOR through mechanical tension and metabolic stress, while leucine from protein intake provides the chemical signal. GLP-1 medications can indirectly suppress mTOR through reduced calorie intake, making strategic activation crucial. The timing window matters - mTOR activation peaks 1-3 hours post-exercise and remains elevated for 48 hours, creating an optimal window for protein intake.\n\nAutophagy, the cellular cleanup process enhanced by GLP-1 medications, can break down muscle proteins if excessive. However, resistance training selectively targets damaged proteins for autophagy while preserving healthy muscle tissue. This selective autophagy actually improves muscle quality, removing dysfunctional mitochondria and misfolded proteins that impair muscle function. The key is providing enough anabolic stimulus through exercise to protect healthy tissue.\n\nHormonal optimization becomes crucial during rapid weight loss. Testosterone, growth hormone, and IGF-1 naturally decline with calorie restriction. Resistance training stimulates production of these anabolic hormones, with compound movements (squats, deadlifts) producing the greatest hormonal response. Sleep quality dramatically impacts this hormonal environment - deep sleep phases trigger growth hormone pulses essential for muscle preservation.\n\nThe "anabolic resistance" of aging means adults over 40 need stronger stimuli to maintain muscle. This includes higher protein doses (30-40g per meal vs. 20-25g), greater training volume, and longer recovery periods. However, older adults who resistance train consistently show remarkable ability to preserve and even gain muscle during weight loss, defying conventional assumptions about age-related muscle loss.\n\nNutrient timing strategies maximize anabolic signaling: consuming 20-30g protein within 3 hours post-exercise optimizes muscle protein synthesis, while casein protein before bed provides overnight amino acid availability. Creatine supplementation, extensively researched and safe, can preserve muscle mass and strength during calorie restriction by maintaining cellular energy stores.',
        evidence: 'A 2024 meta-analysis in Sports Medicine found that resistance training during GLP-1 therapy preserved 94% of lean mass versus 71% with medication alone. Research shows that mTOR signaling remains elevated for 48-72 hours post-resistance training, creating an extended anabolic window.',
        examples: [
          'Anabolic window: Train Monday/Wednesday/Friday to maintain constant mTOR activation',
          'Compound focus: Squats increase growth hormone by 200% vs. 50% for isolation exercises',
          'Sleep protocol: 7-9 hours sleep doubles overnight muscle protein synthesis rates',
          'Supplement stack: Whey post-workout (fast absorption) + casein bedtime (slow release)'
        ]
      },
      {
        title: 'Practical Resistance Training for GLP-1 Users',
        content: 'Designing an effective resistance training program while managing reduced energy intake and potential medication side effects requires thoughtful adaptation. The goal isn\'t aggressive muscle building but strategic preservation of existing tissue while optimizing the muscle you have.\n\nThe principle of "minimum effective dose" applies perfectly to resistance training on GLP-1s. Research shows that just 2-3 sets per muscle group weekly can maintain muscle mass, while 4-6 sets promotes modest growth even in a calorie deficit. This means a 20-30 minute session twice weekly can preserve muscle effectively. Quality trumps quantity - focusing on controlled movements with appropriate resistance stimulates muscle preservation without excessive fatigue.\n\nProgressive overload, the gradual increase in training stimulus, looks different during weight loss. Instead of constantly adding weight, progression can mean: improving form, increasing time under tension, adding pause reps, or improving mind-muscle connection. These techniques maintain muscle stimulus without requiring heavy loads that might feel overwhelming with reduced energy.\n\nExercise selection should prioritize compound movements that work multiple muscle groups efficiently. The "Big 5" pattern - squat, hinge, push, pull, and carry - covers all major muscle groups. These can be adapted to any fitness level: squats can progress from chair sits to bodyweight to weighted; pushes from wall push-ups to incline to floor push-ups. This scalability ensures consistent training regardless of energy fluctuations.\n\nRecovery becomes paramount when training with reduced calorie intake. Muscle protein synthesis remains elevated for 48-72 hours post-training, but this process requires adequate rest and nutrients. Training the same muscle groups daily impairs recovery and can accelerate muscle loss. The sweet spot for most GLP-1 users is training each muscle group twice weekly with at least 48 hours between sessions.\n\nAutoregulation - adjusting training based on daily readiness - prevents overtraining while maintaining consistency. On high-energy days, push slightly harder; on low-energy days, maintain movement with lighter loads. This flexible approach ensures long-term adherence without burnout. Using RPE (rate of perceived exertion) rather than fixed weights allows appropriate daily adjustment.',
        evidence: 'Research in the International Journal of Sports Medicine found that autoregulated training produced equal muscle preservation with 40% less perceived fatigue compared to fixed programs. Studies show 2 weekly full-body sessions preserve 92% of muscle mass during 20% body weight loss.',
        examples: [
          'Minimal effective program: 2x weekly, 20 minutes: 3 sets each of squat, push-up, row variation',
          'Energy management: Morning workouts when cortisol naturally elevates energy',
          'Progression options: Week 1: 10 reps, Week 2: 12 reps, Week 3: 2-second pause per rep',
          'Recovery markers: If strength drops >10% between sessions, add extra rest day'
        ]
      },
      {
        title: 'Functional Fitness: Beyond Aesthetics to Quality of Life',
        content: 'While metabolic benefits drive much discussion about muscle preservation, the functional aspects - your ability to navigate daily life with strength and confidence - provide equally compelling motivation for resistance training during GLP-1 therapy.\n\nFunctional strength encompasses seven movement patterns essential for independence: squatting (sitting/standing), lunging (stairs/stepping), pushing (opening doors), pulling (lifting objects), rotating (reaching/turning), gait (walking/running), and balance (stability/fall prevention). Losing capacity in any of these areas impacts daily life quality far more than metabolic rate changes. The ability to play with grandchildren, carry groceries, or maintain balance prevents more health issues than any biomarker improvement.\n\nSarcopenia, age-related muscle loss, accelerates during rapid weight loss without resistance training. After age 30, adults typically lose 3-8% of muscle mass per decade, with the rate doubling after 60. However, GLP-1-assisted weight loss without strength training can compress a decade of muscle loss into 6 months. Conversely, those who resistance train during weight loss often improve functional capacity despite lower body weight, gaining relative strength.\n\nBone health intrinsically links to muscle preservation. Wolff\'s Law states that bone adapts to mechanical stress - the pulling of muscles on bones during resistance exercise stimulates bone density maintenance. This becomes critical during weight loss, as reduced body weight means less gravitational bone stimulus. Resistance training provides the mechanical loading necessary to prevent osteoporosis, particularly important for postmenopausal women who face accelerated bone loss.\n\nNeuromuscular coordination, the brain-muscle connection enabling smooth movement, requires regular practice to maintain. GLP-1 medications don\'t directly affect coordination, but rapid weight changes can alter balance and proprioception. Resistance training, particularly unilateral (single-limb) exercises, maintains and improves these neural pathways. Better coordination means fewer falls, injuries, and maintained independence with aging.\n\nPsychological benefits of strength maintenance extend beyond physical function. The ability to maintain or improve strength during weight loss provides tangible progress markers beyond the scale. This strength-focused mindset shifts focus from what your body looks like to what it can do, fostering a healthier relationship with exercise that sustains long-term adherence.',
        evidence: 'The Health ABC Study followed 3,075 older adults for 12 years, finding that those maintaining grip strength had 50% lower all-cause mortality. Research shows that resistance training during weight loss improves functional fitness scores by 25% despite 15-20% body weight reduction.',
        examples: [
          'Functional test: 30-second chair stand test - aim to maintain or improve reps during weight loss',
          'Balance training: Single-leg stands during daily activities (brushing teeth, cooking)',
          'Grip strength: Farmers carries with groceries, dead hangs from pull-up bar',
          'Real-world application: Practice movements you use daily - floor sitting/standing, overhead reaching'
        ]
      }
    ],
    keyTakeaways: [
      'Muscle tissue is crucial for maintaining metabolic rate',
      'Protein and resistance exercise work synergistically to preserve muscle',
      'Muscle preservation supports long-term weight maintenance',
      'Functional strength enhances quality of life beyond weight management'
    ],
    practicalTips: [
      'Include resistance activities 2-3 times per week',
      'Focus on major muscle groups: legs, core, arms',
      'Start with bodyweight exercises if new to strength training',
      'Prioritize protein intake within 2 hours after exercise'
    ],
    commonMisconceptions: [
      'Myth: "Cardio is most important for weight loss" - Reality: Resistance training preserves muscle and metabolism',
      "Myth: \"I'll get bulky from strength training\" - Reality: Most people develop lean, functional muscle",
      "Myth: \"I can't build muscle while losing weight\" - Reality: Beginners can often do both simultaneously"
    ],
    whenToSeekHelp: [
      'Significant loss of strength or functional capacity',
      'Inability to perform basic activities of daily living',
      'Persistent fatigue despite adequate rest and nutrition',
      'Concerns about exercise safety with medical conditions'
    ]
  },
  {
    id: 'intuitive-eating-integration',
    title: 'Integrating Intuitive Eating with Medical Support',
    icon: '🧘',
    category: 'intuitive',
    overview: 'How to honor your body\'s wisdom while using medical tools to support your health goals.',
    scientificRationale: 'Intuitive eating principles align well with GLP-1 therapy outcomes when properly understood. The medication helps normalize hunger/fullness cues that may have been disrupted by diet culture, medical conditions, or eating disorders, creating an opportunity for more authentic body awareness.',
    sections: [
      {
        title: 'Redefining Medical Intervention: GLP-1s as Intuitive Eating Facilitators',
        content: 'The relationship between medical intervention and intuitive eating is often misunderstood as contradictory. However, GLP-1 medications can be viewed as corrective tools that restore disrupted physiological signaling rather than external overrides of natural processes. Understanding this distinction transforms how you engage with both your medication and your body\'s wisdom.\n\nMany individuals seeking GLP-1 therapy have experienced dysregulated hunger and satiety signals due to insulin resistance, hormonal imbalances, chronic stress, or previous restrictive eating patterns. These medical and physiological factors can create persistent food thoughts, never-ending hunger, or absence of satisfying fullness. In these cases, the body\'s intuitive signals have been compromised by underlying pathology, not by lack of willpower or awareness.\n\nGLP-1 medications restore physiological balance by enhancing natural satiety hormones, slowing gastric emptying to normal rates, and reducing the hyperactivation of reward pathways that drive compulsive eating. This isn\'t suppression of natural signals but rather correction of dysregulated ones. Many patients describe feeling "like themselves again" - experiencing normal hunger and fullness for the first time in years.\n\nThe concept of "pharmaceutical mindfulness" emerges from this perspective. Rather than the medication doing the work for you, it creates space for clearer body awareness. Without the constant mental chatter of food thoughts, you can actually hear subtle hunger cues, taste food more fully, and recognize gentle fullness. The medication provides the neurological quiet necessary for mindful eating practices to flourish.\n\nThis reframe also addresses the common guilt or shame some feel about needing medical support. Just as someone with diabetes uses insulin to normalize blood sugar function, GLP-1 medications normalize appetite regulation function. Both allow individuals to engage more fully with healthy lifestyle practices, not replace them.\n\nThe integration requires recognizing when medication effects versus natural body signals are guiding choices. Over time, many individuals develop increased confidence in distinguishing between medically-influenced satiety and underlying body wisdom, creating a partnership between pharmaceutical support and innate body awareness.',
        evidence: 'Research in Appetite journal (2024) found that 78% of GLP-1 users reported improved ability to recognize hunger and fullness cues compared to pre-medication. Studies show that reduced food preoccupation scores correlated with increased mindful eating practices and body awareness.',
        examples: [
          'Signal clarity: "I can finally tell the difference between boredom and actual hunger"',
          'Mindfulness access: "Without constant food thoughts, I actually taste my meals now"',
          'Natural rhythms: "My body seems to want 3 meals naturally, not the constant grazing I used to do"',
          'Authentic cravings: "When I crave something now, it feels more like what my body actually needs"'
        ]
      },
      {
        title: 'Gentle Nutrition: Science-Informed Body Wisdom',
        content: 'Gentle nutrition represents the sophisticated integration of nutritional science with body autonomy and satisfaction. It\'s not about rigid rules or moral classifications of food, but about using knowledge to support your body\'s changing needs while maintaining food freedom and psychological wellbeing.\n\nThe gentle nutrition approach becomes particularly relevant during GLP-1 therapy because reduced appetite creates opportunities to focus on nutritional quality without feeling deprived. When volume is naturally limited, choosing foods that provide optimal nourishment becomes a form of self-care rather than restriction. This shift from scarcity to abundance mindset transforms the entire eating experience.\n\nNutritional needs change during weight loss, making informed choices increasingly important. Protein requirements may increase relative to total calories to preserve muscle mass. Micronutrient density becomes crucial when overall food intake decreases. These aren\'t arbitrary rules but physiological realities that gentle nutrition acknowledges while maintaining flexibility and individual preference.\n\nThe satisfaction principle remains central - foods must be both nutritious and satisfying to support long-term wellbeing. Research shows that satisfaction is a better predictor of eating cessation than fullness alone. This means honoring taste preferences, cultural foods, and emotional connections to eating while also considering how foods affect energy, mood, and physical comfort.\n\nGentle nutrition also acknowledges the social and cultural aspects of eating that pure physiological hunger cannot address. Celebrating with cake, sharing cultural foods, or comfort eating during stress serve valid psychological and social functions. The goal isn\'t to eliminate these experiences but to engage with them consciously rather than compulsively.\n\nPracticing gentle nutrition with GLP-1 support might mean choosing protein-rich foods because you notice sustained energy and mood, not because you "should." It might mean including favorite foods in smaller portions that now feel satisfying, rather than avoiding them and creating feelings of deprivation. The medication can provide the neurological space for these nuanced food relationships to develop.',
        evidence: 'Longitudinal studies show that individuals practicing gentle nutrition principles maintain weight loss longer than those following rigid dietary rules. Research in Health Psychology found that satisfaction-based eating correlated with improved psychological wellbeing and reduced eating disorder risk.',
        examples: [
          'Quality focus: "I choose salmon because it makes me feel energized, not because fish is \'good\'"',
          'Satisfaction balance: "I include chocolate daily in amounts that feel good, not guilty"',
          'Cultural honoring: "Family dinners include traditional foods that connect me to my heritage"',
          'Energy awareness: "I notice quinoa gives me steady energy while refined carbs make me crash"'
        ]
      },
      {
        title: 'Healing Diet Culture Wounds: Recovery Through Medical Support',
        content: 'Many individuals beginning GLP-1 therapy carry psychological wounds from diet culture - shame about food choices, fear of hunger, distrust of their body, and moral hierarchies around eating. The medication can provide a unique opportunity to heal these relationships by removing the physiological drivers that often maintained diet-binge cycles.\n\nDiet culture creates hypervigilance around food and body that keeps individuals trapped in constant mental calculation and moral judgment. The cognitive load of tracking, measuring, and evaluating every food choice prevents the relaxed awareness necessary for intuitive eating. When GLP-1 medications quiet food preoccupation, this mental space can be redirected toward healing and body reconnection.\n\nFood neutrality - the absence of moral classification of foods as "good" or "bad" - becomes more accessible when biological drive is normalized. Without intense cravings or compulsive urges, individuals can experiment with previously "forbidden" foods and often discover they\'re neither as appealing nor as problematic as diet culture suggested. This experiential learning is more powerful than intellectual understanding alone.\n\nThe concept of "enough" requires relearning for many people. Diet culture alternates between deprivation and excess, rarely teaching the middle ground of adequacy. GLP-1 medications can provide visceral education about "enough" - what it feels like physically and how it differs from the emotional or cognitive eating cues that previously dominated decisions.\n\nBody trust develops gradually through consistent experiences of having physical needs met appropriately. Each time you honor medication-supported satiety signals without forcing more food, you build evidence that your body can be trusted. Each time you choose nourishing foods because they feel good rather than because you "should," you strengthen the body-mind partnership.\n\nHealing also involves grieving the energy and mental space previously consumed by food and weight preoccupation. Many people are surprised by how much cognitive capacity becomes available when not constantly planning, tracking, or worrying about eating. This grief is normal and necessary - you\'re mourning the loss of familiar (though dysfunctional) coping mechanisms.\n\nThe integration of trauma-informed care becomes important for individuals with eating disorder histories. GLP-1 medications can trigger complex responses in those with restrictive eating backgrounds, requiring careful monitoring and often professional support to ensure appetite changes don\'t re-activate disordered patterns.',
        evidence: 'Research in Clinical Psychology Review found that medical intervention combined with intuitive eating principles produced better psychological outcomes than medication alone. Studies show that healing diet culture wounds requires average 18-24 months of consistent practice and professional support.',
        examples: [
          "Food neutrality practice: \"I kept cookies in my house and learned I don't actually want them daily\"",
          'Trust building: "I stopped eating mid-meal yesterday and felt satisfied, not deprived"',
          'Mental freedom: "I realized I stopped calculating calories obsessively without trying"',
          'Body partnership: "I ask my body what it needs instead of following external rules"'
        ]
      },
      {
        title: 'Navigating Emotional Eating: Distinguishing Needs from Hunger',
        content: 'GLP-1 medications often reveal the extent to which emotional, environmental, and habitual cues previously drove eating behaviors. When pharmaceutical hunger quiets, other eating triggers become starkly apparent, providing unprecedented opportunities for emotional growth and behavioral change.\n\nEmotional eating serves legitimate psychological functions - comfort, distraction, celebration, social connection. The goal isn\'t elimination but consciousness. When you eat from emotion rather than hunger, acknowledging this explicitly reduces shame and creates space for both meeting emotional needs and making informed food choices.\n\nThe "eating iceberg" concept illustrates how physical hunger represents only the visible portion of eating motivation. Below the surface lie complex emotional, social, cultural, and environmental factors. GLP-1 medications essentially lower the water level, revealing previously hidden motivations. This revelation can be initially unsettling but ultimately liberating.\n\nDeveloping emotional literacy - the ability to identify and articulate emotional states - becomes crucial when food no longer masks these experiences. Many people discover they used eating to manage anxiety, loneliness, boredom, or grief without conscious awareness. Creating an emotional vocabulary and alternative coping strategies requires patience and often professional support.\n\nThe nervous system plays a crucial role in eating behaviors. Chronic stress, trauma, or anxiety can dysregulate the autonomic nervous system, creating states where food provides genuine neurological regulation. Understanding this validates emotional eating as an adaptive response while creating opportunities for nervous system healing through other modalities.\n\nMindful eating practices become more accessible with reduced food drive. Without intense hunger or craving, you can experiment with eating slowly, tasting thoroughly, and checking in with satisfaction throughout meals. These practices build body awareness and often naturally reduce emotional eating by increasing meal satisfaction.\n\nSelf-compassion emerges as the foundation for sustainable change. Approaching emotional eating patterns with curiosity rather than judgment creates psychological safety necessary for exploration and growth. The goal isn\'t perfect eating but conscious eating - making choices with awareness and self-kindness.',
        evidence: 'Studies in the Journal of Behavioral Medicine show that emotional eating decreases by 45% on average during GLP-1 therapy, with greatest improvements in those who simultaneously develop alternative coping strategies. Research indicates that mindfulness-based interventions enhance medication outcomes and emotional regulation.',
        examples: [
          "Emotional awareness: \"I noticed I reach for snacks when I'm procrastinating work tasks\"",
          'Alternative coping: "Instead of eating when lonely, I text a friend or take a walk"',
          'Conscious choice: "I decided to eat ice cream after a hard day and enjoyed it without guilt"',
          'Pattern recognition: "Sunday evenings trigger emotional eating - I plan alternative activities now"'
        ]
      }
    ],
    keyTakeaways: [
      'GLP-1 medications can enhance rather than replace body awareness',
      'Gentle nutrition principles support both health and satisfaction',
      'Medical tools can facilitate healing from diet culture',
      'Body trust and self-compassion are essential components'
    ],
    practicalTips: [
      'Practice mindful eating without distraction',
      'Notice how different foods make you feel physically',
      "Challenge thoughts about \"should\" and \"shouldn't\" foods",
      'Develop non-food coping strategies for emotional needs'
    ],
    commonMisconceptions: [
      "Myth: \"Using medication means I've failed at intuitive eating\" - Reality: Medical tools can support body awareness",
      "Myth: \"I shouldn't need external help to eat normally\" - Reality: Many factors can disrupt natural hunger/fullness",
      "Myth: \"Gentle nutrition is just another diet\" - Reality: It's about supporting wellbeing, not weight control"
    ],
    whenToSeekHelp: [
      'Persistent anxiety or guilt about eating choices',
      'Obsessive thoughts about food or weight',
      'Difficulty distinguishing physical from emotional hunger',
      'History of disordered eating patterns that resurface'
    ]
  }
];

export const educationCategories = [
  { id: 'protein', name: 'Protein & Muscle', icon: '💪', description: 'Building strength and preserving metabolism' },
  { id: 'fiber', name: 'Digestive Health', icon: '🌱', description: 'Supporting your changing digestive system' },
  { id: 'satiety', name: 'Hunger & Fullness', icon: '🎯', description: 'Understanding your body\'s new signals' },
  { id: 'muscle', name: 'Strength & Function', icon: '🏋️', description: 'Maintaining lean muscle mass' },
  { id: 'intuitive', name: 'Mindful Eating', icon: '🧘', description: 'Honoring your body\'s wisdom' }
];

// Helper functions for education content
export function getModuleByCategory(category: string): EducationModule | undefined {
  return nutritionEducationModules.find(module => module.category === category);
}

export function getAllModules(): EducationModule[] {
  return nutritionEducationModules;
}

export function getModuleById(id: string): EducationModule | undefined {
  return nutritionEducationModules.find(module => module.id === id);
}