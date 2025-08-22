'use client';

import { useState } from 'react';
import { injectionService } from '@/services/injectionService';
import { MEDICATION_INFO } from '@/types/injection';
import BodyMap from './BodyMap';

interface InjectionLoggerProps {
  onClose: () => void;
  onSave: () => void;
  defaultMedication?: string;
  lastDose?: number;
}

export default function InjectionLogger({ 
  onClose, 
  onSave, 
  defaultMedication = 'ozempic',
  lastDose 
}: InjectionLoggerProps) {
  const [medication, setMedication] = useState(defaultMedication);
  const [dose, setDose] = useState(lastDose || 0.25);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [injectionTime, setInjectionTime] = useState(new Date().toISOString().slice(0, 16));

  const medicationInfo = MEDICATION_INFO[medication as keyof typeof MEDICATION_INFO];

  const handleSave = () => {
    if (!selectedSite) {
      alert('Please select an injection site');
      return;
    }

    injectionService.saveInjection({
      timestamp: new Date(injectionTime),
      site: selectedSite as any,
      dose,
      medication: medication as any,
      notes: notes.trim() || undefined
    });

    // Save dose schedule if this is the first injection or dose changed
    const currentSchedule = injectionService.getDoseSchedule();
    if (!currentSchedule || currentSchedule.dose !== dose) {
      const nextEscalation = new Date(injectionTime);
      nextEscalation.setDate(nextEscalation.getDate() + 28); // 4 weeks minimum
      
      injectionService.saveDoseSchedule({
        startDate: new Date(injectionTime),
        dose,
        medication: medication as any,
        nextEscalationDate: nextEscalation
      });
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Log Injection</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Medication Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MEDICATION_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => {
                    setMedication(key);
                    setDose(info.doses[0]); // Reset to starting dose
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    medication === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: medication === key ? info.color : undefined
                  }}
                >
                  <div className="font-medium">{info.name}</div>
                  <div className="text-xs text-gray-500">{info.frequency}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dose Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dose (as prescribed by your provider)
            </label>
            <div className="flex flex-wrap gap-2">
              {medicationInfo.doses.map((d) => (
                <button
                  key={d}
                  onClick={() => setDose(d)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    dose === d
                      ? 'border-blue-500 bg-blue-50 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {d} {medicationInfo.unit}
                </button>
              ))}
            </div>
            {lastDose && dose !== lastDose && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2">
                <p className="text-xs text-amber-800">
                  ⚠️ Dose change detected. Please ensure this change was prescribed by your healthcare provider.
                </p>
              </div>
            )}
          </div>

          {/* Injection Site Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Injection Site
            </label>
            <BodyMap
              selectedSite={selectedSite}
              onSelectSite={setSelectedSite}
            />
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={injectionTime}
              onChange={(e) => setInjectionTime(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any reactions, symptoms, or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!selectedSite}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Save Injection
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}