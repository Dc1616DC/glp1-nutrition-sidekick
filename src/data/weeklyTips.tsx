import Link from 'next/link';
import { ReactNode } from 'react';

// Weekly motivational tips and intentions for GLP-1 users with relevant app links
export const WEEKLY_TIPS: ReactNode[] = [
  // Protein-focused tips
  <>This week, aim to include a palm-sized portion of protein in every meal you eat. <Link href="/meal-generator" className="text-emerald-600 hover:text-emerald-700 underline">Generate high-protein meals →</Link></>,
  <>Focus on eating your protein first this week—it will help you stay satisfied longer. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">Track your protein intake →</Link></>,
  <>Try adding Greek yogurt, eggs, or lean meats to meals where you usually skip protein. <Link href="/protein-fiber-foods" className="text-emerald-600 hover:text-emerald-700 underline">See protein guide →</Link></>,
  <>Remember: 20-30g of protein per meal helps maximize your GLP-1 medication's effectiveness. <Link href="/calculator" className="text-emerald-600 hover:text-emerald-700 underline">Calculate your targets →</Link></>,
  <>This week, experiment with plant-based proteins like beans, lentils, or quinoa. <Link href="/cookbook" className="text-emerald-600 hover:text-emerald-700 underline">Browse saved recipes →</Link></>,
  
  // Fiber and vegetables
  <>Challenge yourself to add one extra serving of vegetables to your plate each day. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">Track vegetables →</Link></>,
  <>This week, try to 'eat the rainbow'—include colorful vegetables in every meal. <Link href="/meal-generator" className="text-emerald-600 hover:text-emerald-700 underline">Get veggie-rich ideas →</Link></>,
  <>Fiber is your friend—aim for 4-6g per meal to support your digestive health. <Link href="/protein-fiber-foods" className="text-emerald-600 hover:text-emerald-700 underline">High-fiber foods guide →</Link></>,
  "Start each meal with a few bites of vegetables to enhance satiety signals.",
  <>This week, discover one new high-fiber food you've never tried before. <Link href="/shopping-list" className="text-emerald-600 hover:text-emerald-700 underline">Add to shopping list →</Link></>,
  
  // Mindful eating and portion control
  "Practice eating slowly this week—put your fork down between bites.",
  "Listen to your body's fullness cues; your GLP-1 medication is working to help you recognize them.",
  "This week, focus on quality over quantity—savor each bite mindfully.",
  "Try using smaller plates this week to naturally support appropriate portions.",
  "Remember: you can always have more later if you're still truly hungry.",
  
  // Hydration and timing
  "Stay hydrated this week—sometimes thirst masquerades as hunger.",
  "Try drinking water before meals to support digestion and satiety.",
  <>This week, establish consistent meal times to optimize your medication timing. <Link href="/reminders" className="text-emerald-600 hover:text-emerald-700 underline">Set meal reminders →</Link></>,
  "Remember to sip fluids throughout the day, not just during meals.",
  "Herbal teas count as hydration—find a flavor you enjoy this week.",
  
  // Progress and self-compassion
  <>Progress isn't perfection—celebrate every small victory this week. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">View your progress →</Link></>,
  <>This week, focus on how you feel rather than just what the scale says. <Link href="/symptoms" className="text-emerald-600 hover:text-emerald-700 underline">Track how you feel →</Link></>,
  "Your GLP-1 journey is unique—compare yourself only to yesterday's you.",
  "This week, practice self-compassion when meals don't go as planned.",
  "Remember: building sustainable habits takes time, and that's perfectly okay.",
  
  // Energy and mood
  <>Notice how balanced meals affect your energy levels throughout the week. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">Log meals & energy →</Link></>,
  <>This week, pay attention to foods that make you feel vibrant and satisfied. <Link href="/cookbook" className="text-emerald-600 hover:text-emerald-700 underline">Save your favorites →</Link></>,
  "Stable blood sugar leads to stable moods—fuel yourself consistently.",
  <>This week, identify which meal combinations keep you energized longest. <Link href="/analytics" className="text-emerald-600 hover:text-emerald-700 underline">View insights →</Link></>,
  "Remember: proper nutrition supports both your body and your mental clarity.",
  
  // Planning and preparation
  <>This week, try preparing one component of your meals in advance. <Link href="/shopping-list" className="text-emerald-600 hover:text-emerald-700 underline">Plan your shopping →</Link></>,
  <>Planning ahead reduces decision fatigue—batch prep what you can. <Link href="/pantry" className="text-emerald-600 hover:text-emerald-700 underline">Check your pantry →</Link></>,
  "This week, keep healthy snacks visible and less nutritious options out of sight.",
  <>Try meal planning for just 2-3 days ahead to reduce overwhelm. <Link href="/meal-generator" className="text-emerald-600 hover:text-emerald-700 underline">Generate meal ideas →</Link></>,
  <>This week, identify your 'danger times' for cravings and plan alternatives. <Link href="/settings" className="text-emerald-600 hover:text-emerald-700 underline">Try Evening Toolkit →</Link></>,
  
  // Social and lifestyle
  "This week, share your nutrition goals with someone who supports you.",
  "Practice advocating for your needs when eating with others.",
  "This week, find ways to make healthy eating enjoyable, not just functional.",
  "Remember: taking care of your nutrition is an act of self-respect.",
  "This week, notice how your food choices affect your sleep quality.",
  
  // Symptom management
  <>If you experience nausea, try eating smaller, more frequent meals this week. <Link href="/symptoms" className="text-emerald-600 hover:text-emerald-700 underline">Track symptoms →</Link></>,
  <>This week, identify foods that settle your stomach when you're feeling queasy. <Link href="/symptoms" className="text-emerald-600 hover:text-emerald-700 underline">Get AI insights →</Link></>,
  "Remember: some GLP-1 side effects improve as your body adjusts to better habits.",
  <>This week, track which foods make you feel your absolute best. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">Start tracking →</Link></>,
  "Listen to your body—it's learning to work with your medication, not against it.",
  
  // Medication synergy
  <>Your medication works best with consistent nutrition—make that your focus this week. <Link href="/education" className="text-emerald-600 hover:text-emerald-700 underline">Learn more →</Link></>,
  "This week, remember that GLP-1s enhance your natural hunger and fullness signals.",
  "Trust the process—your medication is helping retrain your relationship with food.",
  <>This week, notice how your appetite naturally adjusts with proper meal timing. <Link href="/reminders" className="text-emerald-600 hover:text-emerald-700 underline">Optimize timing →</Link></>,
  "Remember: you're not just taking medication, you're building a healthier lifestyle.",
  
  // Long-term perspective
  "This week, think of every meal as an investment in your future health.",
  "Small consistent choices create big transformations over time.",
  <>This week, focus on creating habits you can maintain for years, not just days. <Link href="/meal-log" className="text-emerald-600 hover:text-emerald-700 underline">Build habits →</Link></>,
  "Remember: sustainable change happens gradually, one meal at a time.",
  "This week, celebrate that you're taking proactive steps for your health.",
  
  // Flexibility and balance
  "This week, practice the 80/20 rule—aim for nutritious choices most of the time.",
  "Remember: one less-than-ideal meal doesn't derail your entire journey.",
  "This week, find ways to enjoy special occasions while honoring your health goals.",
  "Flexibility in your approach leads to long-term success—practice it this week.",
  "This week, remember that 'perfect' nutrition doesn't exist, but 'good enough' builds habits."
];

// Get tip based on week of year to ensure it changes weekly
export const getWeeklyTip = (): ReactNode => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekOfYear = Math.floor(diff / oneWeek);
  
  return WEEKLY_TIPS[weekOfYear % WEEKLY_TIPS.length];
};