export interface Injection {
  id: string;
  timestamp: Date;
  site: 'abdomen-left' | 'abdomen-right' | 'thigh-left' | 'thigh-right' | 'arm-left' | 'arm-right';
  dose: number;
  medication: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'saxenda' | 'victoza';
  notes?: string;
}

export interface DoseSchedule {
  startDate: Date;
  dose: number;
  medication: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'saxenda' | 'victoza';
  // Minimum 4 weeks before next escalation
  nextEscalationDate?: Date;
}

export interface InjectionSite {
  id: 'abdomen-left' | 'abdomen-right' | 'thigh-left' | 'thigh-right' | 'arm-left' | 'arm-right';
  label: string;
  lastUsed?: Date;
  isAvailable: boolean;
  coordinates: { x: number; y: number }; // For visual positioning on body map
}

export interface SharedDataContext {
  injections: Injection[];
  getCurrentDaysSinceInjection: () => number;
  getLastInjection: () => Injection | null;
  getSiteRotationWarnings: () => InjectionSite[];
}

// Medication dosing information
export const MEDICATION_INFO = {
  ozempic: {
    name: 'Ozempic',
    doses: [0.25, 0.5, 1.0, 2.0],
    unit: 'mg',
    frequency: 'weekly',
    color: '#00A6FB'
  },
  wegovy: {
    name: 'Wegovy',
    doses: [0.25, 0.5, 1.0, 1.7, 2.4],
    unit: 'mg',
    frequency: 'weekly',
    color: '#7209B7'
  },
  mounjaro: {
    name: 'Mounjaro',
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: 'mg',
    frequency: 'weekly',
    color: '#F72585'
  },
  zepbound: {
    name: 'Zepbound',
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: 'mg',
    frequency: 'weekly',
    color: '#3A0CA3'
  },
  saxenda: {
    name: 'Saxenda',
    doses: [0.6, 1.2, 1.8, 2.4, 3.0],
    unit: 'mg',
    frequency: 'daily',
    color: '#F77F00'
  },
  victoza: {
    name: 'Victoza',
    doses: [0.6, 1.2, 1.8],
    unit: 'mg',
    frequency: 'daily',
    color: '#06FFA5'
  }
} as const;