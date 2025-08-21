# NEXT FEATURE: GLP-1 Smart Injection Tracker

## The REAL Pain Point
60% of GLP-1 users quit within a year despite spending $500-1,350 monthly on medication that could transform their health. Why? Because unpredictable side effects derail their lives - they're vomiting during client presentations, too fatigued to parent, or developing painful lumps at injection sites that make them dread their weekly shot.

Users are desperate to understand the pattern: "Will I be sick for my daughter's recital?" "Should I inject Friday or Sunday for my Monday presentation?" They're paying over $1,000 monthly for medication but flying blind on when they'll feel human versus incapacitated.

## Technical Requirements
- React Native for mobile, Next.js for web PWA
- TypeScript throughout
- Local storage only (AsyncStorage/localStorage)
- Minimal UI with focus on quick logging
- Must pass injection data to existing symptom tracker component

## Data Model
```typescript
interface Injection {
  id: string;
  timestamp: Date;
  site: 'abdomen-left' | 'abdomen-right' | 'thigh-left' | 'thigh-right' | 'arm-left' | 'arm-right';
  dose: number;
  medication: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound';
}

interface DoseSchedule {
  startDate: Date;
  dose: number;
  // Minimum 4 weeks before next escalation
}

interface SharedDataContext {
  injections: Injection[];
  getCurrentDaysSinceInjection: () => number;
}
```

## Component Structure
1. **InjectionWidget.tsx** - Home screen card (days since last, next due, log button)
2. **InjectionLogger.tsx** - Quick logging modal (<10 second interaction)
3. **BodyMap.tsx** - Visual site selector with rotation warnings
4. **DoseDisplay.tsx** - Current dose info and escalation management

## Key Features
- Visual body map with 6 injection zones
- Automatic rotation warnings (red outline if site used <14 days)
- Integration with existing symptom tracker
- Pattern recognition ("Nausea logged 2 days post-injection")
- Dose escalation tracking (minimum 4 weeks between increases)

## What NOT to Build
- No meal plan modifications
- No automatic reminders/notifications
- No complex AI predictions
- No PDF export in V1
- No external dependencies

**Goal**: Make injection logging take <10 seconds while capturing data needed for symptom pattern analysis.

---
*Implement this after fixing the AI generator authentication issue*