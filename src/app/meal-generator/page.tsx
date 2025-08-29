'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AIMealGenerator from '../../components/AIMealGenerator';

function MealGeneratorContent() {
  const searchParams = useSearchParams();
  const suggestedMeal = searchParams.get('meal');
  const symptom = searchParams.get('symptom');
  
  return <AIMealGenerator suggestedMeal={suggestedMeal} symptom={symptom} />;
}

export default function MealGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MealGeneratorContent />
    </Suspense>
  );
}
