'use client';

import { useState, useEffect } from 'react';
import { injectionService } from '@/services/injectionService';
import { MEDICATION_INFO } from '@/types/injection';
import InjectionLogger from './InjectionLogger';

export default function InjectionWidget() {
  const [daysSinceInjection, setDaysSinceInjection] = useState<number>(-1);
  const [isInjectionDue, setIsInjectionDue] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [lastInjection, setLastInjection] = useState<any>(null);
  const [currentMedication, setCurrentMedication] = useState<string>('ozempic');
  const [adherenceRate, setAdherenceRate] = useState<string>('N/A');

  useEffect(() => {
    const loadData = async () => {
      try {
        const last = await injectionService.getLastInjection();
        if (last) {
          setLastInjection(last);
          setCurrentMedication(last.medication);
          
          const days = await injectionService.getDaysSinceLastInjection();
          setDaysSinceInjection(days);
          
          const isDue = await injectionService.isInjectionDue(last.medication);
          setIsInjectionDue(isDue);
          
          // Get adherence rate
          const pattern = await injectionService.getInjectionPattern();
          setAdherenceRate(pattern.adherenceRate || 'N/A');
        } else {
          setDaysSinceInjection(-1);
          setIsInjectionDue(true);
        }
      } catch (error) {
        console.error('Error loading injection data:', error);
      }
    };

    loadData();
    // Refresh every hour
    const interval = setInterval(loadData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectionLogged = async () => {
    // Refresh data after logging
    try {
      const last = await injectionService.getLastInjection();
      if (last) {
        setLastInjection(last);
        setCurrentMedication(last.medication);
        setDaysSinceInjection(0);
        setIsInjectionDue(false);
      }
    } catch (error) {
      console.error('Error refreshing injection data:', error);
    }
    setShowLogger(false);
  };

  const getMedicationInfo = () => {
    return MEDICATION_INFO[currentMedication as keyof typeof MEDICATION_INFO] || MEDICATION_INFO.ozempic;
  };

  const getStatusColor = () => {
    if (daysSinceInjection === -1) return 'bg-gray-100 border-gray-300';
    if (isInjectionDue) return 'bg-red-50 border-red-300';
    if (daysSinceInjection <= 2) return 'bg-green-50 border-green-300';
    return 'bg-yellow-50 border-yellow-300';
  };

  const getStatusText = () => {
    if (daysSinceInjection === -1) return 'No injections logged';
    if (isInjectionDue) return 'Injection due!';
    if (daysSinceInjection === 0) return 'Injected today';
    if (daysSinceInjection === 1) return '1 day ago';
    return `${daysSinceInjection} days ago`;
  };

  const medicationInfo = getMedicationInfo();

  return (
    <>
      <div className={`rounded-lg border-2 ${getStatusColor()} p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
           onClick={() => setShowLogger(true)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-2xl">💉</div>
              <h3 className="font-semibold text-gray-900">Injection Tracker</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Last injection: <span className="font-medium text-gray-900">{getStatusText()}</span>
              </p>
              
              {lastInjection && (
                <>
                  <p className="text-xs text-gray-500">
                    {medicationInfo.name} {lastInjection.dose}{medicationInfo.unit}
                  </p>
                  <p className="text-xs text-gray-500">
                    Site: {lastInjection.site.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                </>
              )}
              
              {isInjectionDue && daysSinceInjection !== -1 && (
                <p className="text-sm font-medium text-red-600 animate-pulse">
                  Time for your {medicationInfo.frequency} injection!
                </p>
              )}
            </div>
          </div>

          <button className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Log Injection
          </button>
        </div>

        {/* Quick stats */}
        {lastInjection && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Next due: {medicationInfo.frequency === 'daily' ? 'Tomorrow' : `${7 - daysSinceInjection} days`}</span>
              <span>Adherence: {adherenceRate}</span>
            </div>
          </div>
        )}
      </div>

      {showLogger && (
        <InjectionLogger
          onClose={() => setShowLogger(false)}
          onSave={handleInjectionLogged}
          defaultMedication={currentMedication}
          lastDose={lastInjection?.dose}
        />
      )}
    </>
  );
}