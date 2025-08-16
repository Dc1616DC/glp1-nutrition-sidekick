'use client';

import { useState, useEffect } from 'react';
import { MealLogStats } from '../services/mealLoggingService';

interface GentleNutritionNudgeProps {
  stats?: MealLogStats | null;
  context?: 'meal-generator' | 'dashboard' | 'meal-log' | 'general';
  className?: string;
}

interface NudgeInsight {
  emoji: string;
  title: string;
  message: string;
  type: 'celebration' | 'gentle-suggestion' | 'awareness' | 'encouragement';
  context?: string[];
}

export default function GentleNutritionNudge({ stats, context = 'general', className = '' }: GentleNutritionNudgeProps) {
  const [currentNudge, setCurrentNudge] = useState<NudgeInsight | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateContextualNudges = (): NudgeInsight[] => {
    const nudges: NudgeInsight[] = [];
    const timeOfDay = new Date().getHours();
    const isEvening = timeOfDay >= 17;
    const isMorning = timeOfDay < 12;

    // Time-based gentle nudges
    if (isMorning) {
      nudges.push({
        emoji: '🌅',
        title: 'Morning Nourishment',
        message: 'What does your body feel like having this morning? Trust those gentle hunger cues.',
        type: 'awareness',
        context: ['dashboard', 'meal-generator']
      });
    }

    if (isEvening) {
      nudges.push({
        emoji: '🌙',
        title: 'Evening Check-in',
        message: 'How are you feeling after today\'s nourishment? Your awareness is growing beautifully.',
        type: 'encouragement',
        context: ['dashboard', 'meal-log']
      });
    }

    // Stats-based encouraging insights
    if (stats) {
      if (stats.streak >= 7) {
        nudges.push({
          emoji: '🔥',
          title: 'Amazing Streak!',
          message: `${stats.streak} days of mindful tracking! You\'re building wonderful body awareness habits.`,
          type: 'celebration'
        });
      }

      if (stats.proteinPercentage >= 80) {
        nudges.push({
          emoji: '💪',
          title: 'Protein Superstar',
          message: 'Your consistent protein nourishment is supporting your body beautifully. Keep trusting your choices!',
          type: 'celebration'
        });
      }

      if (stats.vegetablePercentage >= 70) {
        nudges.push({
          emoji: '🌈',
          title: 'Colorful Eating',
          message: 'Love the variety in your vegetable choices! Your body appreciates all those different nutrients.',
          type: 'celebration'
        });
      }

      if (stats.mealsLoggedToday >= 2) {
        nudges.push({
          emoji: '✨',
          title: 'Awareness Win',
          message: 'Great job staying present with your eating today. Each logged meal builds self-knowledge.',
          type: 'encouragement'
        });
      }

      // Gentle suggestions (never critical)
      if (stats.proteinPercentage < 50 && stats.totalMealsLogged >= 5) {
        nudges.push({
          emoji: '🥚',
          title: 'Protein Exploration',
          message: 'Consider exploring protein sources you enjoy - eggs, Greek yogurt, nuts, or whatever feels good to you.',
          type: 'gentle-suggestion',
          context: ['meal-generator']
        });
      }

      if (stats.vegetablePercentage < 40 && stats.totalMealsLogged >= 5) {
        nudges.push({
          emoji: '🥬',
          title: 'Veggie Adventures',
          message: 'Maybe try adding vegetables in ways that feel appealing - smoothies, soups, or roasted with your favorite seasonings.',
          type: 'gentle-suggestion',
          context: ['meal-generator']
        });
      }
    }

    // General encouraging nudges for new users
    if (!stats || stats.totalMealsLogged === 0) {
      nudges.push({
        emoji: '🌱',
        title: 'Welcome!',
        message: 'This journey is about awareness, not perfection. Every small step counts toward understanding your body better.',
        type: 'encouragement'
      });
    }

    // Context-specific nudges
    if (context === 'meal-generator') {
      nudges.push({
        emoji: '🎯',
        title: 'Intuitive Choices',
        message: 'What sounds satisfying and nourishing right now? Trust your body\'s wisdom alongside the helpful suggestions.',
        type: 'awareness',
        context: ['meal-generator']
      });
    }

    if (context === 'meal-log') {
      nudges.push({
        emoji: '📝',
        title: 'Gentle Tracking',
        message: 'Remember: this isn\'t about perfect logging. It\'s about building awareness of what makes you feel good.',
        type: 'awareness',
        context: ['meal-log']
      });
    }

    // Filter by context if specified
    return nudges.filter(nudge => 
      !nudge.context || nudge.context.includes(context)
    );
  };

  useEffect(() => {
    const nudges = generateContextualNudges();
    if (nudges.length > 0) {
      // Randomly select a nudge, but prefer celebrations and encouragements
      const priorityNudges = nudges.filter(n => n.type === 'celebration' || n.type === 'encouragement');
      const selectedNudge = priorityNudges.length > 0 
        ? priorityNudges[Math.floor(Math.random() * priorityNudges.length)]
        : nudges[Math.floor(Math.random() * nudges.length)];
      
      setCurrentNudge(selectedNudge);
      setIsVisible(true);
    }
  }, [stats, context]);

  if (!currentNudge || !isVisible) {
    return null;
  }

  const getStylesByType = (type: string) => {
    switch (type) {
      case 'celebration':
        return 'from-green-50 to-emerald-50 border-green-200 text-green-800';
      case 'encouragement':
        return 'from-blue-50 to-indigo-50 border-blue-200 text-blue-800';
      case 'gentle-suggestion':
        return 'from-amber-50 to-yellow-50 border-amber-200 text-amber-800';
      case 'awareness':
        return 'from-purple-50 to-pink-50 border-purple-200 text-purple-800';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getStylesByType(currentNudge.type)} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl flex-shrink-0">{currentNudge.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{currentNudge.title}</h4>
          <p className="text-sm leading-relaxed opacity-90">{currentNudge.message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sm opacity-60 hover:opacity-80 transition-opacity flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Hook for getting contextual insights
export const useGentleNutritionInsights = (stats?: MealLogStats | null) => {
  const getPersonalizedInsight = (): string => {
    if (!stats) return "Building awareness one meal at a time 🌱";
    
    const { proteinPercentage, vegetablePercentage, streak, totalMealsLogged } = stats;
    
    if (streak >= 14) return `${streak}-day awareness streak! You're developing beautiful habits 🔥`;
    if (proteinPercentage >= 90) return "Your protein awareness is exceptional! 💪";
    if (vegetablePercentage >= 80) return "Wonderful vegetable variety in your choices! 🌈";
    if (totalMealsLogged >= 50) return `${totalMealsLogged} meals logged - what incredible self-awareness! ✨`;
    if (streak >= 7) return `${streak} days of mindful tracking - you're building lasting awareness 🌟`;
    if (totalMealsLogged >= 10) return "You're developing great awareness of your eating patterns 📈";
    if (proteinPercentage >= 60) return "Nice protein mindfulness in your choices! 🥚";
    if (vegetablePercentage >= 50) return "Great job including vegetables in your meals! 🥬";
    
    return "Every meal logged builds your body awareness 🌱";
  };

  const getMotivationalQuote = (): string => {
    const quotes = [
      "Trust your body's wisdom - it knows what it needs 💚",
      "Progress, not perfection, builds lasting habits ✨",
      "Your awareness is growing with each mindful choice 🌱",
      "Small, consistent actions create big changes 🌟",
      "Nourishing yourself is an act of self-compassion 💜",
      "Listen to your body - it's your wisest teacher 🧘",
      "Every meal is a chance to practice gentle self-care 🌸"
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return {
    getPersonalizedInsight,
    getMotivationalQuote
  };
};