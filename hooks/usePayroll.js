import { useMemo } from 'react';
import { useCallback } from 'react';

export const usePayroll = ({
  calendarRules = [],
  cycleOffset = 0,
  hourlyRate = '0',
  overtimeRate = '0',
  otThreshold = '40',
  preTaxDeductions = '0',
  postTaxDeductions = '0',
  taxRate = '0',
  paydayDate,
  cycleStart,
  pensionAmount = '0.00',
  groceryHistory = [],
  archive
}) => {

  // 1. GET CURRENT PAY PERIOD DATE RANGE
  const getPayPeriodDates = () => {
    if (!cycleStart) {
      const now = new Date();
      return { 
        cycleStart: now.toISOString().split('T')[0], 
        cycleEnd: now.toISOString().split('T')[0], 
        startMs: now.getTime(), 
        endMs: now.getTime() 
      };
    }

    const parseDate = (d) => {
      const [y, m, dVal] = d.split('-').map(Number);
      return Date.UTC(y, m - 1, dVal, 12, 0, 0);
    };

    const startMs = parseDate(cycleStart);
    const msPerDay = 1000 * 60 * 60 * 24;
    const periodLength = 14 * msPerDay; // Bi-weekly

    const today = Date.now();
    const diff = today - startMs;
    const currentPeriodIndex = Math.floor(diff / periodLength);
    
    const targetPeriodIndex = currentPeriodIndex + cycleOffset;

    const currentStartMs = startMs + (targetPeriodIndex * periodLength);
    const currentEndMs = currentStartMs + periodLength - msPerDay; 

    return {
      cycleStart: new Date(currentStartMs).toISOString().split('T')[0],
      cycleEnd: new Date(currentEndMs).toISOString().split('T')[0],
      startMs: currentStartMs,
      endMs: currentEndMs
    };
  };

  const { cycleStart: periodStart, cycleEnd: periodEnd, startMs, endMs } = getPayPeriodDates();

  // 2. FILTER ITEMS FOR THIS PERIOD
  const periodItems = useMemo(() => {
    return calendarRules.filter(item => {
      if (!item.date) return false;
      const [y, m, d] = item.date.split('-').map(Number);
      const itemMs = Date.UTC(y, m - 1, d, 12, 0, 0);
      return itemMs >= startMs && itemMs <= endMs;
    });
  }, [calendarRules, startMs, endMs]);

  // --- INTERNAL HELPER: ORGANIZE SHIFTS BY WEEK ---
  const getWeeklyShifts = () => {
    const shifts = periodItems.filter(i => i.type === 'shift');
    if (shifts.length === 0) return {};

    shifts.sort((a, b) => a.date.localeCompare(b.date));

    const weeklyBuckets = {};
    const msPerDay = 1000 * 60 * 60 * 24;

    shifts.forEach(shift => {
      const [y, m, d] = shift.date.split('-').map(Number);
      const shiftMs = Date.UTC(y, m - 1, d, 12, 0, 0);
      const daysSinceStart = Math.floor((shiftMs - startMs) / msPerDay);
      const weekIndex = Math.floor(daysSinceStart / 7);

      if (!weeklyBuckets[weekIndex]) weeklyBuckets[weekIndex] = [];
      weeklyBuckets[weekIndex].push(shift);
    });
    return weeklyBuckets;
  };

  // 3. SMART GROSS PAY CALCULATOR
const calculateGross = () => {
    const weeklyBuckets = getWeeklyShifts();
    let totalPay = 0;
    
    const limit = parseFloat(otThreshold) || 40;
    const baseRate = parseFloat(hourlyRate) || 0;
    const otRateVal = parseFloat(overtimeRate) || (baseRate * 1.5);

    Object.values(weeklyBuckets).forEach(weekShifts => {
      let hoursSoFar = 0;
      
      // Filter out 'Holiday Off' (8h bonus) from the OT bucket math
      const otBucketShifts = weekShifts.filter(s => !s.isHolidayOff);
      const bonusShifts = weekShifts.filter(s => s.isHolidayOff);

      // 1. Calculate Standard & OT Pay (Including Worked Holidays)
      otBucketShifts.forEach(shift => {
        const h = parseFloat(shift.hours) || 0;
        const sRate = shift.rate ? parseFloat(shift.rate) : baseRate;
        const sOtRate = shift.otRate ? parseFloat(shift.otRate) : otRateVal;

        const roomForRegular = Math.max(0, limit - hoursSoFar);
        const regHours = Math.min(h, roomForRegular);
        const otHours = Math.max(0, h - regHours);

        // Standard pay for this shift
        totalPay += (regHours * sRate) + (otHours * sOtRate);

        // 2. Add the Holiday Premium (Extra 1x straight time)
        if (shift.isHoliday) {
          totalPay += (h * sRate);
        }

        hoursSoFar += h;
      });

      // 3. Add Holiday Bonuses (Not Worked)
      bonusShifts.forEach(shift => {
        const sRate = shift.rate ? parseFloat(shift.rate) : baseRate;
        totalPay += (8 * sRate);
      });
    });

    return totalPay;
  };

  // 4. CALCULATE TAX ONLY (New Function)
  const calculateTax = () => {
    const gross = calculateGross();
    const pre = parseFloat(preTaxDeductions) || 0;
    // Tax is usually applied after pre-tax deductions
    const taxableIncome = Math.max(0, gross - pre);
    const tax = taxableIncome * (parseFloat(taxRate) / 100);
    return tax.toFixed(2);
  };

  // 5. CALCULATE EXPENSES (Helper)
  // A. Total Expenses (For Net Pay calculation - includes PAID bills)
  const calculateTotalExpenses = () => {
    const expenses = periodItems.filter(i => i.type === 'bill' || i.type === 'subscription');
    const total = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    return total.toFixed(2);
  };

  // B. Pending Expenses (For Dashboard Card - EXCLUDES paid bills)
  const calculatePendingExpenses = () => {
    const expenses = periodItems.filter(i => 
      (i.type === 'bill' || i.type === 'subscription') && !i.paid // <--- Filter out paid
    );
    const total = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    return total.toFixed(2);
  };

  // C. Paid (For "Bills Due" card - NEW)
  const calculatePaidExpenses = () => {
    const expenses = periodItems.filter(i => 
      (i.type === 'bill' || i.type === 'subscription') && i.paid // <--- Only Paid
    );
    const total = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    return total.toFixed(2);
  };

  // 6. CALCULATE NET PAY (Work-Only, Bi-Weekly)
  const calculateNet = () => {
    const gross = calculateGross(); 
    const preTax = parseFloat(preTaxDeductions) || 0;
    const postTax = parseFloat(postTaxDeductions) || 0;
    
    // 1. Calculate taxable base (Gross minus pre-tax stuff like medical/401k)
    const workTaxableIncome = gross - preTax;
    
    // 2. Calculate the tax amount
    const taxAmount = workTaxableIncome * (parseFloat(taxRate) / 100);
    
    // 3. Final Work Take-Home (Taxable Base - Tax - Union/Post-tax stuff)
    const workNet = workTaxableIncome - taxAmount - postTax;
    
    return workNet.toFixed(2);
  };

  // 7. CALCULATE TOTAL OT PAY ONLY
  const calculateTotalOTPay = () => {
    const weeklyBuckets = getWeeklyShifts();
    let totalOTPay = 0;

    const limit = parseFloat(otThreshold) || 40;
    const baseRate = parseFloat(hourlyRate) || 0;
    const otRateVal = parseFloat(overtimeRate) || (baseRate * 1.5);

    Object.values(weeklyBuckets).forEach(weekShifts => {
      let hoursSoFar = 0;
      weekShifts.forEach(shift => {
        const h = parseFloat(shift.hours) || 0;
        
        // Skip bonuses/holidays for "OT Pay" stats
        if (shift.isHolidayOff) return;
        if (shift.isHoliday) {
            // Count the "premium" half of the holiday pay as OT value
            const sRate = shift.rate ? parseFloat(shift.rate) : baseRate;
            totalOTPay += (h * sRate); 
            return;
        }

        const sOtRate = shift.otRate ? parseFloat(shift.otRate) : otRateVal;
        const roomForRegular = Math.max(0, limit - hoursSoFar);
        const regHours = Math.min(h, roomForRegular);
        const otHours = Math.max(0, h - regHours);
        totalOTPay += (otHours * sOtRate);
        hoursSoFar += h;
      });
    });
    return totalOTPay.toFixed(2);
  };

  // 8. NEW: GET WEEKLY BREAKDOWN STATS (Updated for Gross $)
  const getWeeklyStats = () => {
    const weeklyBuckets = getWeeklyShifts();
    // Default structure now includes gross
    const stats = { 
      week1: { hours: 0, gross: 0 }, 
      week2: { hours: 0, gross: 0 } 
    };
    
    const limit = parseFloat(otThreshold) || 40;
    const baseRate = parseFloat(hourlyRate) || 0;
    const otRateVal = parseFloat(overtimeRate) || (baseRate * 1.5);

    // Helper to calc a single week bucket
    const calculateBucket = (shifts) => {
      let hTotal = 0;
      let pTotal = 0;
      if (!shifts) return { h: 0, p: 0 };

      shifts.forEach(shift => {
        const h = parseFloat(shift.hours) || 0;
        const sRate = shift.rate ? parseFloat(shift.rate) : baseRate;
          if (shift.isHolidayOff) {
            pTotal += (8 * sRate);
            return; 
        }

        if (shift.isHoliday) {
          pTotal += (h * sRate * 2);
          hTotal += h;
          return;
        }
        const sOtRate = shift.otRate ? parseFloat(shift.otRate) : otRateVal;

        const roomForRegular = Math.max(0, limit - hTotal);
        const regHours = Math.min(h, roomForRegular);
        const otHours = Math.max(0, h - regHours);

        pTotal += (regHours * sRate) + (otHours * sOtRate);
        hTotal += h;
      });
      return { h: hTotal, p: pTotal };
    };

    const w1 = calculateBucket(weeklyBuckets[0]);
    stats.week1 = { hours: w1.h, gross: w1.p };

    const w2 = calculateBucket(weeklyBuckets[1]);
    stats.week2 = { hours: w2.h, gross: w2.p };

    return stats;
  };

  // 9. NEW: GET ENRICHED SHIFTS (List for Dashboard)
  const getEnrichedShifts = () => {
    const weeklyBuckets = getWeeklyShifts();
    const enrichedShifts = [];
    
    const limit = parseFloat(otThreshold) || 40;
    const baseRate = parseFloat(hourlyRate) || 0;
    const otRateVal = parseFloat(overtimeRate) || (baseRate * 1.5);

    Object.values(weeklyBuckets).forEach(weekShifts => {
      let hoursSoFar = 0;
      
      weekShifts.forEach(shift => {
        const h = parseFloat(shift.hours) || 0;
        const sRate = shift.rate ? parseFloat(shift.rate) : baseRate;
        const sOtRate = shift.otRate ? parseFloat(shift.otRate) : otRateVal;
        
        let thisShiftPay = 0;
        let isOt = false;

        // 1. HOLIDAY BONUS (Not Worked)
        if (shift.isHolidayOff) {
          thisShiftPay = (8 * sRate);
        } else {
          // 2. STANDARD & OT CALCULATION
          const roomForRegular = Math.max(0, limit - hoursSoFar);
          const regHours = Math.min(h, roomForRegular);
          const otHours = Math.max(0, h - regHours);

          thisShiftPay = (regHours * sRate) + (otHours * sOtRate);
          isOt = otHours > 0;

          // 3. ADD HOLIDAY PREMIUM (Extra 1x)
          if (shift.isHoliday) {
            thisShiftPay += (h * sRate);
          }

          hoursSoFar += h;
        }

        enrichedShifts.push({
          ...shift,
          calculatedPay: thisShiftPay.toFixed(2),
          isOtApplied: isOt
        });
      });
    });

    return enrichedShifts.sort((a, b) => a.date.localeCompare(b.date));
  };

  // 10. *** MONTHLY REPORT CALCULATOR (UPDATED) ***
  const getMonthlyReport = useCallback((targetDate = new Date()) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0 = Jan, 1 = Feb

    let totalShiftIncome = 0;
    let totalBills = 0;
    let totalHours = 0;
    let totalOTPay = 0;

    const baseRate = parseFloat(hourlyRate) || 0;

    // A. Process Shifts & Bills
    calendarRules.forEach(rule => {
      // Use UTC to ensure date alignment with how they are saved
      const d = new Date(rule.date);
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
        
        if (rule.type === 'bill' || rule.type === 'subscription') {
          totalBills += parseFloat(rule.amount) || 0;
        } 
        else if (rule.type === 'shift') {
          // 1. Sum the Hours
          const hrs = parseFloat(rule.hours) || 0;
          totalHours += hrs;

          // 2. Sum the Income
          // We use the pre-calculated gross pay saved on the shift.
          // Fallback to base math only if calculatedPay is missing.
          const shiftGross = parseFloat(rule.calculatedPay) || (hrs * baseRate);
          totalShiftIncome += shiftGross;

          // 3. Sum the Overtime
          // We pull the exact OT amount saved on the shift.
          // If it's a holiday, we calculate the premium as OT as well.
          let shiftOT = parseFloat(rule.otPay) || 0;
          
          if (rule.isHoliday) {
            // For holidays, the extra "half" or "double" is considered premium/OT
            const holidayPremium = shiftGross - (hrs * baseRate);
            totalOTPay += Math.max(shiftOT, holidayPremium);
          } else {
            totalOTPay += shiftOT;
          }
        }
      }
    });

    // B. Process Groceries
    const isTargetMonth = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    };

    // 1. Sum Active History
    const activeSum = (groceryHistory || []).reduce((sum, item) => {
      return isTargetMonth(item.date) ? sum + (parseFloat(item.price) || 0) : sum;
    }, 0);

    // 2. Sum Archive (The missing piece)
    const archiveSum = (archive || []).reduce((sum, item) => {
      return isTargetMonth(item.date) ? sum + (parseFloat(item.price) || 0) : sum;
    }, 0);

    const totalGroceries = activeSum + archiveSum;

    // C. Totals
    const pension = parseFloat(pensionAmount) || 0;
    const totalIncome = totalShiftIncome + pension;
    
    // Tax Estimation (Monthly)
    // Tax = (Total Income - (PreTax Deductions * 2?)) * Rate
    // Since PreTax is bi-weekly, let's assume ~2.17 pay periods in a month or just ignore dedux for simple estimate
    const estTax = totalShiftIncome * (parseFloat(taxRate) / 100);

    const netResult = totalIncome - totalBills - totalGroceries - estTax;

    return {
      monthName: targetDate.toLocaleString('default', { month: 'long' }),
      totalIncome: totalIncome.toFixed(2),
      totalBills: totalBills.toFixed(2),
      netResult: netResult.toFixed(2),
      pension: pension.toFixed(2),
      shiftIncome: totalShiftIncome.toFixed(2),
      
      // NEW METRICS
      totalHours: totalHours.toFixed(1),
      totalOTPay: totalOTPay.toFixed(2),
      totalTax: estTax.toFixed(2),
      totalGroceries: totalGroceries.toFixed(2)
    };
  }, [calendarRules, hourlyRate, taxRate, pensionAmount, groceryHistory, archive]); 

  // 11. CHECK PAY SCHEDULE (THIS WAS MISSING!)
  const checkPaySchedule = (dateStr) => {
    if (!cycleStart || !paydayDate) return { isPayday: false, isCycleStart: false };

    // Helper to parse "YYYY-MM-DD" safely to UTC noon
    const parse = (d) => {
      const [y, m, day] = d.split('-').map(Number);
      return Date.UTC(y, m - 1, day, 12, 0, 0);
    };

    const target = parse(dateStr);
    const start = parse(cycleStart);
    const pay = parse(paydayDate);
    
    const msPerDay = 1000 * 60 * 60 * 24;
    const fortnight = 14 * msPerDay;

    // Check Cycle Start (difference must be multiple of 14 days)
    const diffStart = Math.floor((target - start) / msPerDay);
    const isCycleStart = diffStart % 14 === 0;

    // Check Payday (difference must be multiple of 14 days)
    const diffPay = Math.floor((target - pay) / msPerDay);
    const isPayday = diffPay % 14 === 0;

    return { isCycleStart, isPayday };
  };

  return {
    getPayPeriodDates,
    calculateGross,
    calculateNet,
    calculateTax,
    calculateTotalExpenses,
    calculatePendingExpenses,
    calculatePaidExpenses, 
    calculateTotalOTPay, 
    getWeeklyStats,
    getEnrichedShifts,
    getMonthlyReport,
    checkPaySchedule,
    periodItems 
  };
};