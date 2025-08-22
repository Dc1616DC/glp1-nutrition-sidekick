'use client';

import { useState, useEffect } from 'react';
import { injectionService } from '@/services/injectionService';
import { MEDICATION_INFO, DoseSchedule } from '@/types/injection';

export default function DoseDisplay() {
  const [doseSchedule, setDoseSchedule] = useState<DoseSchedule | null>(null);
  const [canEscalate, setCanEscalate] = useState(false);
  const [pattern, setPattern] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const schedule = injectionService.getDoseSchedule();
    setDoseSchedule(schedule);
    
    if (schedule) {
      setCanEscalate(injectionService.canEscalateDose());
    }
    
    setPattern(injectionService.getInjectionPattern());
  };

  const handleEscalateDose = () => {
    if (!doseSchedule) return;
    
    const medicationInfo = MEDICATION_INFO[doseSchedule.medication];
    const currentIndex = medicationInfo.doses.indexOf(doseSchedule.dose);
    
    if (currentIndex < medicationInfo.doses.length - 1) {
      const newDose = medicationInfo.doses[currentIndex + 1];
      const nextEscalation = new Date();
      nextEscalation.setDate(nextEscalation.getDate() + 28); // 4 weeks minimum
      
      injectionService.saveDoseSchedule({
        ...doseSchedule,
        dose: newDose,
        startDate: new Date(),
        nextEscalationDate: nextEscalation
      });
      
      loadData();
      alert(`Dose escalated to ${newDose}${medicationInfo.unit}. Remember to use this dose for your next injection.`);
    }
  };

  if (!doseSchedule) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Dose Information</h3>
        <p className="text-sm text-gray-600">
          No dose schedule set. Log your first injection to start tracking.
        </p>
      </div>
    );
  }

  const medicationInfo = MEDICATION_INFO[doseSchedule.medication];
  const currentDoseIndex = medicationInfo.doses.indexOf(doseSchedule.dose);
  const isMaxDose = currentDoseIndex === medicationInfo.doses.length - 1;
  const nextDose = !isMaxDose ? medicationInfo.doses[currentDoseIndex + 1] : null;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Current Dose Schedule</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Medication:</span>
            <span className="font-medium" style={{ color: medicationInfo.color }}>
              {medicationInfo.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Dose:</span>
            <span className="font-medium text-gray-900">
              {doseSchedule.dose} {medicationInfo.unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Schedule:</span>
            <span className="font-medium text-gray-900">{medicationInfo.frequency}</span>
          </div>
        </div>
      </div>

      {/* Dose Progression */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dose Progression</h4>
        <div className="flex items-center gap-1">
          {medicationInfo.doses.map((dose, index) => {
            const isCurrent = dose === doseSchedule.dose;
            const isPast = index < currentDoseIndex;
            return (
              <div key={dose} className="flex items-center">
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isCurrent
                      ? 'bg-blue-500 text-white'
                      : isPast
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {dose}
                </div>
                {index < medicationInfo.doses.length - 1 && (
                  <span className="mx-1 text-gray-400">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Escalation Information */}
      {!isMaxDose && (
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Next Dose Escalation</h4>
          <p className="text-xs text-blue-700 mb-2">
            You can escalate to {nextDose} {medicationInfo.unit} after 4 weeks on current dose.
          </p>
          {canEscalate ? (
            <button
              onClick={handleEscalateDose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Escalate to {nextDose} {medicationInfo.unit}
            </button>
          ) : (
            <p className="text-xs text-blue-600">
              Available on: {doseSchedule.nextEscalationDate?.toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {isMaxDose && (
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ You're on the maximum dose for {medicationInfo.name}
          </p>
        </div>
      )}

      {/* Adherence Stats */}
      {pattern && pattern.consistency !== 'insufficient_data' && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Adherence Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Consistency:</span>
              <span className={`ml-2 font-medium ${
                pattern.consistency === 'excellent' ? 'text-green-600' :
                pattern.consistency === 'good' ? 'text-blue-600' :
                pattern.consistency === 'fair' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {pattern.consistency}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Adherence:</span>
              <span className="ml-2 font-medium">{pattern.adherenceRate}</span>
            </div>
            {pattern.missedDoses > 0 && (
              <div className="col-span-2">
                <span className="text-gray-600">Missed doses (30 days):</span>
                <span className="ml-2 font-medium text-yellow-600">{pattern.missedDoses}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}