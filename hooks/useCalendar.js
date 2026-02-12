import { useState } from 'react';

export const useCalendar = (calendarRules, setCalendarRules, currentDate, setCurrentDate) => {

  // 1. Navigate Months
  const changeMonth = (n) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + n);
    setCurrentDate(newDate);
  };

  // 2. Save Entry (Add or Edit)
  // We accept the current global rates so we can "stamp" them onto new shifts
  const saveEntry = (entry, hourlyRate, overtimeRate) => {
    setCalendarRules(prev => {
      const newEntry = { ...entry };

      // SMART RATES: If this is a NEW shift (no rate saved yet), 
      // stamp it with the current settings.
      if (newEntry.type === 'shift' && !newEntry.rate) {
        newEntry.rate = hourlyRate; 
        newEntry.otRate = overtimeRate; 
      }

      // Check if updating or adding
      const exists = prev.find(item => item.id === newEntry.id);
      
      if (exists) {
        return prev.map(item => item.id === newEntry.id ? newEntry : item);
      } else {
        return [...prev, newEntry];
      }
    });
  };

  // 3. Delete Entry
  const deleteEntry = (id) => {
    setCalendarRules(prev => prev.filter(item => item.id !== id));
  };

  return {
    changeMonth,
    saveEntry,
    deleteEntry
  };
};