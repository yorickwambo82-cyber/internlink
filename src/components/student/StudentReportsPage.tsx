'use client';

import { useState, useCallback } from 'react';
import MyReports from './MyReports';
import SubmitReport from './SubmitReport';

type View = 'list' | 'submit';

export default function StudentReportsPage() {
  const [view, setView] = useState<View>('list');

  const handleShowSubmit = useCallback(() => setView('submit'), []);
  const handleShowList = useCallback(() => setView('list'), []);

  if (view === 'submit') {
    return <SubmitReport onComplete={handleShowList} />;
  }

  return <MyReports onSubmitNew={handleShowSubmit} />;
}
