'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import mealReminderService from '@/services/mealReminderService';
import styles from './medical-reminders.module.css';

// Type definitions
type ReminderStatus = 'scheduled' | 'sent' | 'completed' | 'skipped' | 'missed' | 'snoozed';

interface Reminder {
  id: string;
  mealType: string;
  scheduledTime: string;
  reminderTime: string;
  isCritical: boolean;
  status: ReminderStatus;
  createdAt: string;
  completedAt?: string;
  skippedAt?: string;
  missedAt?: string;
  snoozedAt?: string;
}

const MedicalRemindersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [initialized, setInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [reminderHistory, setReminderHistory] = useState<Reminder[]>([]);
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('12:30');
  const [dinnerTime, setDinnerTime] = useState('18:30');
  const [snackTime, setSnackTime] = useState('15:00');
  const [snackLabel, setSnackLabel] = useState('Afternoon Snack');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [testingInProgress, setTestingInProgress] = useState(false);

  // Initialize the reminder system
  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const initializeReminders = async () => {
      try {
        setLoading(true);
        console.log('🔔 Initializing reminder system...');
        const success = await mealReminderService.initialize();
        setInitialized(success);
        console.log(`🔔 Reminder system initialization ${success ? 'successful' : 'failed'}`);
        
        const permission = await mealReminderService.requestPermission();
        setHasPermission(permission);
        console.log(`🔔 Notification permission: ${permission ? 'granted' : 'denied'}`);
        
        // Load active reminders and history
        refreshReminderData();
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize reminder system:', err);
        setError('Failed to initialize the reminder system. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeReminders();
    
    // Set up event listener for reminder actions
    const handleReminderAction = () => {
      console.log('🔔 Reminder action detected, refreshing data');
      refreshReminderData();
    };
    
    window.addEventListener('glp1-reminder-action', handleReminderAction);
    
    return () => {
      window.removeEventListener('glp1-reminder-action', handleReminderAction);
    };
  }, [user, router]); // Restore dependencies but they should be stable now

  // Refresh reminder data from the service
  const refreshReminderData = () => {
    if (!initialized) return;
    
    console.log('🔔 Refreshing reminder data');
    const active = mealReminderService.getActiveReminders();
    const history = mealReminderService.getReminderHistory();
    
    console.log(`🔔 Found ${active.length} active reminders and ${history.length} historical reminders`);
    setActiveReminders(active);
    setReminderHistory(history);
  };

  // Schedule a single meal reminder
  const scheduleMealReminder = (mealType: string, timeString: string, isCritical = true) => {
    try {
      console.log(`🔔 Scheduling ${mealType} reminder for ${timeString} (Critical: ${isCritical})`);
      const reminderTime = mealReminderService.timeStringToDate(timeString);
      console.log(`🔔 Converted time to Date object: ${reminderTime.toLocaleString()}`);
      
      let reminderResult;
      
      switch (mealType.toLowerCase()) {
        case 'breakfast':
          console.log('🔔 Calling scheduleBreakfast()');
          reminderResult = mealReminderService.scheduleBreakfast(reminderTime, isCritical);
          break;
        case 'lunch':
          console.log('🔔 Calling scheduleLunch()');
          reminderResult = mealReminderService.scheduleLunch(reminderTime, isCritical);
          break;
        case 'dinner':
          console.log('🔔 Calling scheduleDinner()');
          reminderResult = mealReminderService.scheduleDinner(reminderTime, isCritical);
          break;
        default:
          console.log('🔔 Calling scheduleSnack()');
          reminderResult = mealReminderService.scheduleSnack(reminderTime, mealType, isCritical);
      }
      
      console.log('🔔 Reminder scheduled successfully:', reminderResult);
      setSuccessMessage(`${mealType} reminder scheduled successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      refreshReminderData();
      
      return reminderResult;
    } catch (err) {
      console.error('Failed to schedule reminder:', err);
      setError(`Failed to schedule ${mealType} reminder`);
      setTimeout(() => setError(''), 3000);
      return null;
    }
  };

  // Schedule all meals for today
  const scheduleAllMeals = () => {
    try {
      console.log('🔔 Scheduling all meals for today');
      const times = {
        breakfast: mealReminderService.timeStringToDate(breakfastTime),
        lunch: mealReminderService.timeStringToDate(lunchTime),
        dinner: mealReminderService.timeStringToDate(dinnerTime)
      };
      
      console.log('🔔 Meal times:', {
        breakfast: times.breakfast.toLocaleString(),
        lunch: times.lunch.toLocaleString(),
        dinner: times.dinner.toLocaleString()
      });
      
      const reminderIds = mealReminderService.scheduleFullDay(times);
      console.log('🔔 All meals scheduled:', reminderIds);
      
      // Schedule snack separately if time is provided
      if (snackTime && snackLabel) {
        console.log(`🔔 Also scheduling snack (${snackLabel}) for ${snackTime}`);
        const snackDate = mealReminderService.timeStringToDate(snackTime);
        mealReminderService.scheduleSnack(snackDate, snackLabel, false);
      }
      
      setSuccessMessage('All meal reminders scheduled for today');
      setTimeout(() => setSuccessMessage(''), 3000);
      refreshReminderData();
    } catch (err) {
      console.error('Failed to schedule all reminders:', err);
      setError('Failed to schedule meal reminders');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Clear all active reminders
  const clearAllReminders = () => {
    if (window.confirm('Are you sure you want to clear all active reminders?')) {
      console.log('🔔 Clearing all active reminders');
      mealReminderService.clearAllReminders();
      setSuccessMessage('All reminders cleared');
      setTimeout(() => setSuccessMessage(''), 3000);
      refreshReminderData();
    }
  };

  // Cancel a specific reminder
  const cancelReminder = (reminderId: string) => {
    console.log(`🔔 Cancelling reminder: ${reminderId}`);
    const success = mealReminderService.cancelReminder(reminderId);
    if (success) {
      console.log('🔔 Reminder cancelled successfully');
      setSuccessMessage('Reminder cancelled');
      setTimeout(() => setSuccessMessage(''), 3000);
      refreshReminderData();
    } else {
      console.error('🔔 Failed to cancel reminder');
      setError('Failed to cancel reminder');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Send an immediate test notification
  const sendTestNotification = () => {
    try {
      console.log('🔔 Sending immediate test notification');
      setTestingInProgress(true);
      
      // Create a date object for right now + 5 seconds
      const now = new Date();
      now.setSeconds(now.getSeconds() + 5);
      console.log(`🔔 Test notification scheduled for: ${now.toLocaleTimeString()}`);
      
      // Schedule an immediate test reminder
      const result = mealReminderService.scheduleSnack(now, 'Test Notification', true);
      console.log('🔔 Test notification scheduled:', result);
      
      setSuccessMessage('Test notification sent! You should receive it in 5 seconds.');
      setTimeout(() => {
        setSuccessMessage('');
        setTestingInProgress(false);
      }, 10000);
      
      // Refresh data after a short delay
      setTimeout(refreshReminderData, 6000);
      
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setError('Failed to send test notification');
      setTestingInProgress(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Quick test function - schedule a notification for 2 minutes from now
  const scheduleQuickTest = () => {
    try {
      const now = new Date();
      const testTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
      const timeString = testTime.toTimeString().slice(0, 5); // Format as HH:MM
      
      console.log(`🔔 [QUICK TEST] Scheduling test reminder for ${timeString} (${testTime.toLocaleString()})`);
      
      const reminderResult = mealReminderService.scheduleSnack(testTime, 'Test Snack', true);
      console.log('🔔 [QUICK TEST] Test reminder scheduled:', reminderResult);
      
      setSuccessMessage(`Quick test reminder scheduled for ${timeString} (2 minutes from now)`);
      setTimeout(() => setSuccessMessage(''), 5000);
      refreshReminderData();
      
      return reminderResult;
    } catch (err) {
      console.error('[QUICK TEST] Failed to schedule test reminder:', err);
      setError('Failed to schedule test reminder');
      setTimeout(() => setError(''), 3000);
      return null;
    }
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: ReminderStatus) => {
    switch (status) {
      case 'completed': return styles.statusCompleted;
      case 'skipped': return styles.statusSkipped;
      case 'missed': return styles.statusMissed;
      case 'scheduled': return styles.statusScheduled;
      case 'sent': return styles.statusSent;
      case 'snoozed': return styles.statusSnoozed;
      default: return '';
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    console.log('🔔 Requesting notification permission');
    const permission = await mealReminderService.requestPermission();
    setHasPermission(permission);
    console.log(`🔔 Permission result: ${permission ? 'granted' : 'denied'}`);
    
    if (!permission) {
      setError('Notification permission denied. Please enable notifications in your browser settings.');
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccessMessage('Notification permission granted');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Medical-Grade Meal Reminders</h1>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Initializing reminder system...</p>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className={styles.container}>
        <h1>Medical-Grade Meal Reminders</h1>
        <div className={styles.error}>
          <h2>System Initialization Failed</h2>
          <p>We couldn't initialize the reminder system. This could be because:</p>
          <ul>
            <li>Your browser doesn't support required features</li>
            <li>There was a problem loading the service worker</li>
            <li>You're using a private browsing mode that restricts certain features</li>
          </ul>
          <button onClick={() => window.location.reload()} className={styles.primaryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🍽️ Smart Meal Reminders</h1>
        <Link 
          href="/reminders" 
          style={{ 
            color: '#4A90E2', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Back to Simple Setup
        </Link>
      </div>
      
      {!hasPermission && (
        <div className={styles.permissionBanner}>
          <h2>Enable Notifications</h2>
          <p>
            Notifications help your sidekick remind you about meals at the perfect time.
            Without notifications, you may miss important meal reminders.
          </p>
          <button onClick={requestPermission} className={styles.primaryButton}>
            Enable Notifications
          </button>
        </div>
      )}
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      
      {/* Test Notification Section */}
      <div className={styles.reminderSection}>
        <h2>Test Notifications</h2>
        <p className={styles.medicalNote}>
          Having trouble with scheduled reminders? Use this button to send an immediate test notification.
          You should receive the notification within 5 seconds.
        </p>
        
        <div className={styles.testButtonContainer}>
          <button 
            onClick={sendTestNotification} 
            disabled={testingInProgress}
            className={styles.testButton}
          >
            {testingInProgress ? 'Sending Test...' : '🔔 Test Now (Immediate Notification)'}
          </button>
          <p className={styles.testInstructions}>
            If the test notification works but scheduled reminders don't, please check your browser's background process settings.
          </p>
        </div>
      </div>

      {/* Debug Information Section */}
      <details className={styles.reminderSection}>
        <summary><strong>📋 Debug Information (click to expand)</strong></summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '1rem' }}>
{JSON.stringify(
  {
    now: new Date().toLocaleString(),
    activeReminders,
    reminderHistoryCount: reminderHistory.length
  },
  null,
  2
)}</pre>
      </details>
      
      <div className={styles.reminderSection}>
        <h2>Schedule Meal Reminders</h2>
        <p className={styles.medicalNote}>
          Consistent meal timing is important for patients on GLP-1 medications to avoid hypoglycemia.
          Set up reminders for all your daily meals.
        </p>
        
        <div className={styles.reminderForm}>
          <div className={styles.formGroup}>
            <label htmlFor="breakfast">Breakfast Time:</label>
            <input
              type="time"
              id="breakfast"
              value={breakfastTime}
              onChange={(e) => setBreakfastTime(e.target.value)}
            />
            <button 
              onClick={() => scheduleMealReminder('Breakfast', breakfastTime)}
              className={styles.scheduleButton}
            >
              Schedule
            </button>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="lunch">Lunch Time:</label>
            <input
              type="time"
              id="lunch"
              value={lunchTime}
              onChange={(e) => setLunchTime(e.target.value)}
            />
            <button 
              onClick={() => scheduleMealReminder('Lunch', lunchTime)}
              className={styles.scheduleButton}
            >
              Schedule
            </button>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="dinner">Dinner Time:</label>
            <input
              type="time"
              id="dinner"
              value={dinnerTime}
              onChange={(e) => setDinnerTime(e.target.value)}
            />
            <button 
              onClick={() => scheduleMealReminder('Dinner', dinnerTime)}
              className={styles.scheduleButton}
            >
              Schedule
            </button>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="snackLabel">Snack Label:</label>
            <input
              type="text"
              id="snackLabel"
              value={snackLabel}
              onChange={(e) => setSnackLabel(e.target.value)}
              placeholder="e.g., Afternoon Snack"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="snackTime">Snack Time:</label>
            <input
              type="time"
              id="snackTime"
              value={snackTime}
              onChange={(e) => setSnackTime(e.target.value)}
            />
            <button 
              onClick={() => scheduleMealReminder(snackLabel, snackTime, false)}
              className={styles.scheduleButton}
              disabled={!snackLabel}
            >
              Schedule
            </button>
          </div>
          
          <div className={styles.buttonGroup}>
            <button onClick={scheduleAllMeals} className={styles.primaryButton}>
              Schedule All Meals
            </button>
            <button onClick={clearAllReminders} className={styles.secondaryButton}>
              Clear All Reminders
            </button>
            <button onClick={scheduleQuickTest} className={styles.testButton} style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              marginLeft: '10px'
            }}>
              🚀 Quick Test (2 min)
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.reminderSection}>
        <h2>Active Reminders</h2>
        {activeReminders.length === 0 ? (
          <p>No active reminders. Schedule some meals above.</p>
        ) : (
          <div className={styles.reminderList}>
            {activeReminders.map((reminder) => (
              <div key={reminder.id} className={styles.reminderCard}>
                <div className={styles.reminderHeader}>
                  <h3>{reminder.mealType}</h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(reminder.status)}`}>
                    {reminder.status}
                  </span>
                </div>
                <p>
                  <strong>Scheduled for:</strong> {formatDateTime(reminder.scheduledTime)}
                </p>
                <p>
                  <strong>Reminder at:</strong> {formatDateTime(reminder.reminderTime)}
                </p>
                {reminder.status === 'snoozed' && reminder.snoozedAt && (
                  <p>
                    <strong>Snoozed at:</strong> {formatDateTime(reminder.snoozedAt)}
                  </p>
                )}
                <div className={styles.reminderActions}>
                  <button 
                    onClick={() => cancelReminder(reminder.id)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.reminderSection}>
        <h2>Reminder History</h2>
        {reminderHistory.length === 0 ? (
          <p>No reminder history yet.</p>
        ) : (
          <div className={styles.historyTable}>
            <table>
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Completed/Skipped</th>
                </tr>
              </thead>
              <tbody>
                {reminderHistory
                  .filter(r => r.status === 'completed' || r.status === 'skipped' || r.status === 'missed')
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((reminder) => (
                    <tr key={reminder.id}>
                      <td>{reminder.mealType}</td>
                      <td>{formatDateTime(reminder.scheduledTime)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(reminder.status)}`}>
                          {reminder.status}
                        </span>
                      </td>
                      <td>
                        {reminder.completedAt ? formatDateTime(reminder.completedAt) : 
                         reminder.skippedAt ? formatDateTime(reminder.skippedAt) : 
                         reminder.missedAt ? formatDateTime(reminder.missedAt) : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className={styles.infoSection}>
        <h2>About Smart Meal Reminders</h2>
        <div className={styles.infoCard}>
          <h3>Why are these reminders helpful?</h3>
          <p>
            GLP-1 medications work best with consistent meal timing. Your sidekick helps ensure 
            you never miss an important meal, keeping you feeling your best.
          </p>
        </div>
        
        <div className={styles.infoCard}>
          <h3>How it works</h3>
          <ul>
            <li><strong>Offline Support:</strong> Reminders work even without internet connection</li>
            <li><strong>Escalation:</strong> Critical reminders will escalate if missed</li>
            <li><strong>Background Operation:</strong> Works even when the app is closed</li>
            <li><strong>Multiple Actions:</strong> Mark meals as eaten, snooze, or skip</li>
          </ul>
        </div>
        
        <div className={styles.infoCard}>
          <h3>Install as App</h3>
          <p>
            For the best experience, install this web app on your device. Look for the "Install" or "Add to Home Screen" 
            option in your browser menu.
          </p>
        </div>
      </div>
      
      <div className={styles.navigationLinks}>
        <Link href="/dashboard" className={styles.navLink}>
          Back to Dashboard
        </Link>
        <Link href="/reminders" className={styles.navLink}>
          Classic Reminders
        </Link>
      </div>
    </div>
  );
};

export default MedicalRemindersPage;
