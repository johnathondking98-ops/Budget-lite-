import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// === IMPORTS ===
import { GlobalStyles } from './styles/GlobalStyles';
import { Colors } from './constants/Colors';

import { usePayroll } from './hooks/usePayroll';
import { useGroceries } from './hooks/useGroceries';
import { useCalendar } from './hooks/useCalendar';

import SidebarModal from './components/SidebarModal';
import CalendarEntryModal from './components/CalendarEntryModal';
import LogShiftModal from './components/LogShiftModal';
import MonthlyReportModal from './components/MonthlyreportModal';

import SettingsPage from './Pages/SettingsPage';
import FloatingActionGroup from './Pages/FloatingActionGroup';
import DashboardPage from './Pages/DashboardPage';
import CalendarPage from './Pages/CalendarPage';
import GroceryPage from './Pages/GroceryPage';
import ArchiveModalVisible from './components/ArchiveModal';
import FuelModal from './components/FuelModal';
import { db } from './firebase';


export default function App() {
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef(null);

  // #region === STATE MANAGEMENT ===
  const [userName, setUserName] = useState('User');
  const [hourlyRate, setHourlyRate] = useState('17.65');
  const [overtimeRate, setOvertimeRate] = useState('26.48');
  const [otThreshold, setOtThreshold] = useState('40');
  const [pensionAmount, setPensionAmount] = useState('0.00');

  const [taxRate, setTaxRate] = useState('11.2');
  const [preTaxDeductions, setPreTaxDeductions] = useState('0.00');
  const [postTaxDeductions, setPostTaxDeductions] = useState('0.00');
  const [salesTaxRate, setSalesTaxRate] = useState('0');
  const [taxedStores, setTaxedStores] = useState({}); 

  const [cycleStart, setCycleStart] = useState('2025-12-31');
  const [paydayDate, setPaydayDate] = useState('2026-01-02');
  const [cycleOffset, setCycleOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [isFuelModalVisible, setIsFuelModalVisible] = useState(false);
  const [calendarRules, setCalendarRules] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [groceryBudget, setGroceryBudget] = useState('400.00');
  const [archive, setArchive] = useState([]);
  const [isArchiveVisible, setIsArchiveVisible] = useState(false);
  const [productRegistry, setProductRegistry] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isQuickLogVisible, setIsQuickLogVisible] = useState(false);
  const [isEntryModalVisible, setIsEntryModalVisible] = useState(false);
  const [entryModalMode, setEntryModalMode] = useState('add'); 
  const [entryModalData, setEntryModalData] = useState(null);
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState(null); 
  const [shiftModalData, setShiftModalData] = useState(null);
  const [isReportVisible, setIsReportVisible] = useState(false);
  // #endregion

  // #region === HOOK INITIALIZATION ===
  const payroll = usePayroll({
    calendarRules, cycleOffset, hourlyRate, overtimeRate, otThreshold,
    preTaxDeductions, postTaxDeductions, taxRate, paydayDate, cycleStart,
    pensionAmount, groceryHistory: history, archive: archive
  });

  const grocery = useGroceries(groceryItems, setGroceryItems, history, setHistory);
  const calendar = useCalendar(calendarRules, setCalendarRules, currentDate, setCurrentDate);

  const getReport = (targetDate) => {
    const monthStr = targetDate.toISOString().substring(0, 7); // e.g. "2026-02"
    const monthName = targetDate.toLocaleString('default', { month: 'long' });

    // 1. Calculate Income (Shifts + Pension)
    const monthlyShifts = calendarRules.filter(r => r.type === 'shift' && r.date.startsWith(monthStr));
    const shiftIncome = monthlyShifts.reduce((sum, s) => sum + (parseFloat(s.calculatedPay) || 0), 0);
    const totalHours = monthlyShifts.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
    const totalOTPay = monthlyShifts.reduce((sum, s) => sum + (parseFloat(s.otPay) || 0), 0);
    
    // 2. Calculate Bills
    const monthlyBills = calendarRules.filter(r => r.type === 'bill' && r.date.startsWith(monthStr));
    const totalBills = monthlyBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    // 3. Calculate Groceries (From History and Archive)
    const allGroceries = [...(history || []), ...(archive || [])];
    const totalGroceries = allGroceries
      .filter(item => item.date?.startsWith(monthStr) && item.checked)
      .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    // 4. NEW: Calculate Fuel
    const totalFuel = (fuelLogs || [])
      .filter(log => log.date?.startsWith(monthStr))
      .reduce((sum, log) => sum + (parseFloat(log.totalCost) || 0), 0);

    // 5. Estimate Taxes (Simplified version of your pay cycle tax)
    const totalTax = (shiftIncome * (parseFloat(taxRate) / 100 || 0));

    const totalIncome = (shiftIncome + parseFloat(pensionAmount || 0));
    const netResult = totalIncome - totalBills - totalGroceries - totalFuel - totalTax;

    return {
      monthName,
      totalHours,
      totalOTPay: totalOTPay.toFixed(2),
      shiftIncome: shiftIncome.toFixed(2),
      pension: parseFloat(pensionAmount || 0).toFixed(2),
      totalIncome: totalIncome.toFixed(2),
      totalBills: totalBills.toFixed(2),
      totalGroceries: totalGroceries.toFixed(2),
      totalFuel: totalFuel.toFixed(2),
      totalTax: totalTax.toFixed(2),
      netResult: netResult.toFixed(2)
    };
  };
  // #endregion

  // #region === PERSISTENCE & HELPERS ===
  useEffect(() => {
    if (!db) {
      console.log("Waiting for Firebase...");
      return;
    }

    const sharedRef = db.ref('family_vault');

      db.ref('connection_test').set({ 
    last_try: new Date().toISOString() 
  })
  .then(() => alert("CONNECTED! Look at your browser now!"))
  .catch((err) => alert("CONNECTION FAILED: " + err.message));

    const handleSync = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Settings
        if (data.userName) setUserName(data.userName);
        if (data.hourlyRate !== undefined) setHourlyRate(data.hourlyRate);
        if (data.overtimeRate !== undefined) setOvertimeRate(data.overtimeRate);
        if (data.taxRate !== undefined) setTaxRate(data.taxRate);
        if (data.salesTaxRate !== undefined) setSalesTaxRate(data.salesTaxRate);
        if (data.groceryBudget !== undefined) setGroceryBudget(data.groceryBudget);
        if (data.preTaxDeductions !== undefined) setPreTaxDeductions(data.preTaxDeductions);
        if (data.postTaxDeductions !== undefined) setPostTaxDeductions(data.postTaxDeductions);
        if (data.pensionAmount !== undefined) setPensionAmount(data.pensionAmount);
        if (data.cycleStart) setCycleStart(data.cycleStart);
        if (data.paydayDate) setPaydayDate(data.paydayDate);
        
        // Arrays/Lists
        if (data.calendarRules) setCalendarRules(data.calendarRules);
        if (data.taxedStores) setTaxedStores(data.taxedStores);
        if (data.archive) setArchive(data.archive);
        if (data.productRegistry) setProductRegistry(data.productRegistry);
        if (data.fuelLogs) setFuelLogs(data.fuelLogs);
        if (data.history) setHistory(data.history);
        
        console.log("✅ Cloud Sync Active");
      }
    };

    sharedRef.on('value', handleSync);
    return () => sharedRef.off('value', handleSync);
  }, [db]);

  // Add this inside your useEffect after the sharedRef.on line:

  // #endregion

  // #region === LOGIC BLOCKS ===
  const nextPaydayStats = useMemo(() => {
    if (!paydayDate) return { days: 0, date: '' };
    const getMs = (dStr) => { const [y, m, d] = dStr.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
    const anchorMs = getMs(paydayDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    const periodMs = 14 * msPerDay;
    let targetMs = anchorMs;
    if (targetMs < todayMs) {
      const diff = todayMs - targetMs;
      const cycles = Math.ceil(diff / periodMs);
      targetMs += cycles * periodMs;
    }
    const days = Math.ceil((targetMs - todayMs) / msPerDay);
    const targetDate = new Date(targetMs);
    const dateString = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { days: days >= 0 ? days : 0, date: dateString };
  }, [paydayDate]);

  const finalGrocerySpent = useMemo(() => {
    const { cycleStart: start, cycleEnd: end } = payroll.getPayPeriodDates();
    const taxMultiplier = (parseFloat(salesTaxRate) || 0) / 100;
    const allItems = [...(history || []), ...(archive || [])];
    return allItems.reduce((sum, item) => {
      const itemDate = item.date;
      const isWithinPeriod = itemDate >= start && itemDate <= end;
      if (item.checked && isWithinPeriod) {
        const itemPrice = parseFloat(item.price) || 0;
        const isStoreTaxed = taxedStores[item.store || 'Other'];
        const taxAmt = isStoreTaxed ? itemPrice * taxMultiplier : 0;
        return sum + itemPrice + taxAmt;
      }
      return sum;
    }, 0);
  }, [history, archive, salesTaxRate, taxedStores, payroll]);

  const periodGroceryList = useMemo(() => {
    const { cycleStart: start, cycleEnd: end } = payroll.getPayPeriodDates();
    const combined = [
      ...(history || []).map(i => ({ ...i, isArchived: false })),
      ...(archive || []).map(i => ({ ...i, isArchived: true, checked: true }))
    ];
    return combined
      .filter(item => item.date >= start && item.date <= end)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history, archive, payroll]);

  // Fuel Calculation
  const periodFuelSpent = useMemo(() => {
    const { cycleStart: start, cycleEnd: end } = payroll.getPayPeriodDates();  
    return (fuelLogs || []).reduce((sum, log) => {
      if (log.date >= start && log.date <= end) {
        return sum + (parseFloat(log.totalCost) || 0);
      }
      return sum;
    }, 0);
  }, [fuelLogs, payroll]);
  // #endregion

  const handleAddFuel = async (newLog) => {
    const updatedLogs = [newLog, ...(fuelLogs || [])];
    setFuelLogs(updatedLogs);
    // Push to Cloud
    if (db) db.ref('family_vault').update({ fuelLogs: updatedLogs });
  };

  const checkPaySchedule = (dateObj) => {
    if (!cycleStart || !paydayDate) return { isCycleStart: false, isPayday: false };
    const getMs = (str) => { const [y, m, d] = str.split('-').map(Number); return Date.UTC(y, m - 1, d, 12, 0, 0); };
    const currentMs = getMs(dateObj);
    const startMs = getMs(cycleStart);
    const payMs = getMs(paydayDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffStart = Math.round((currentMs - startMs) / msPerDay);
    const diffPay = Math.round((currentMs - payMs) / msPerDay);
    return { isCycleStart: diffStart % 14 === 0, isPayday: diffPay % 14 === 0 };
  };

  const handleSaveRule = (newItem) => {
    const calculateShiftValues = (item) => {
      const hrs = parseFloat(item.hours) || 0;
      const base = parseFloat(hourlyRate) || 0;
      const ot = parseFloat(overtimeRate) || 0;
      let gross = 0; let otP = 0;
      if (item.isHoliday) { gross = hrs * base * 2; otP = (hrs * base); }
      else if (item.isHolidayOff) { gross = 8 * base; otP = 0; }
      else { const bHrs = Math.min(hrs, 16); const oHrs = Math.max(0, hrs - 16); gross = (bHrs * base) + (oHrs * ot); otP = (oHrs * ot); }
      return { calculatedPay: gross.toFixed(2), otPay: otP.toFixed(2) };
    };
    const addTime = (d, i, u) => {
      const [y, m, day] = d.split('-').map(Number); const s = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
      if (u === 'days') s.setUTCDate(s.getUTCDate() + i); if (u === 'weeks') s.setUTCDate(s.getUTCDate() + (i * 7)); if (u === 'months') s.setUTCMonth(s.getUTCMonth() + i);
      return s.toISOString().split('T')[0];
    };
    const fin = newItem.type === 'shift' ? calculateShiftValues(newItem) : {};
    const en = { ...newItem, ...fin };
    const filtered = calendarRules.filter(r => r.id !== newItem.id && r.parentId !== newItem.id);
    let toAdd = [en];
    if (en.recurrence?.active) {
      let cur = en.date; const inv = parseInt(en.recurrence.interval) || 1; const u = en.recurrence.unit || 'weeks';
      const limit = en.recurrence.until || new Date(Date.now() + 31536000000).toISOString().split('T')[0];
      for (let i = 1; i <= 50; i++) {
        const nxt = addTime(cur, inv, u); if (nxt > limit) break;
        const [y, m, d] = nxt.split('-').map(Number); const hol = (m === 1 && d === 1) || (m === 7 && d === 4) || (m === 12 && d === 25);
        const temp = { ...en, date: nxt, isHoliday: hol }; const rep = en.type === 'shift' ? calculateShiftValues(temp) : {};
        toAdd.push({ ...temp, ...rep, id: `${en.id}_rep_${i}`, parentId: en.id, recurrence: null }); cur = nxt;
      }
    }
    setCalendarRules([...filtered, ...toAdd]); setIsShiftModalVisible(false);
  };

  const saveSettings = async (newSettings) => {
    // 1. Update local states immediately so the UI feels fast
    if (newSettings.userName !== undefined) setUserName(newSettings.userName);
    if (newSettings.hourlyRate !== undefined) setHourlyRate(newSettings.hourlyRate);
    if (newSettings.taxRate !== undefined) setTaxRate(newSettings.taxRate);
    if (newSettings.preTaxDeductions !== undefined) setPreTaxDeductions(newSettings.preTaxDeductions);
    if (newSettings.postTaxDeductions !== undefined) setPostTaxDeductions(newSettings.postTaxDeductions);

    // 2. Guard for Firebase
    if (!db) return;

    try {
      // 3. Bundle everything to ensure the cloud matches your phone exactly
      const updates = {
        userName: newSettings.userName ?? userName,
        hourlyRate: newSettings.hourlyRate ?? hourlyRate,
        overtimeRate: newSettings.overtimeRate ?? overtimeRate,
        taxRate: newSettings.taxRate ?? taxRate,
        salesTaxRate: newSettings.salesTaxRate ?? salesTaxRate,
        groceryBudget: newSettings.groceryBudget ?? groceryBudget,
        preTaxDeductions: newSettings.preTaxDeductions ?? preTaxDeductions,
        postTaxDeductions: newSettings.postTaxDeductions ?? postTaxDeductions,
        pensionAmount: newSettings.pensionAmount ?? pensionAmount,
        cycleStart: newSettings.cycleStart ?? cycleStart,
        paydayDate: newSettings.paydayDate ?? paydayDate,
      };

      await db.ref('family_vault').update(updates);
      console.log("✅ Settings synced to cloud!");
    } catch (e) {
      console.error("Firebase Sync Error:", e);
    }
  };

  const handleTogglePaid = (id) => {
    if (!db) {
      alert("Not connected to cloud yet.");
      return;
    }

    // 1. Update the local list
    const updatedRules = calendarRules.map(r => 
      r.id === id ? { ...r, paid: !r.paid } : r
    );
    
    // 2. Update local state (for instant feedback)
    setCalendarRules(updatedRules);

    // 3. Push to Firebase so it updates on your wife's phone
    db.ref('family_vault').update({ 
      calendarRules: updatedRules 
    })
    .catch(err => console.error("Sync error:", err));
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    const idx = view === 'dashboard' ? 0 : view === 'calendar' ? 1 : view === 'groceries' ? 2 : 3;
    scrollViewRef.current?.scrollTo({ x: width * idx, animated: true });
  };

  // --- PRODUCT REGISTRY: Remembers what you scanned ---
  const handleUpdateRegistry = async (upc, details) => {
    const newRegistry = { ...productRegistry, [upc]: details };
    setProductRegistry(newRegistry);
    try {
      await AsyncStorage.setItem('@product_registry', JSON.stringify(newRegistry));
    } catch (e) {
      console.error("Error saving to registry:", e);
    }
  };

  // --- GROCERY ITEM HANDLERS ---
  const toggleHistoryItem = async (id) => {
    const updatedHistory = (history || []).map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setHistory(updatedHistory);
    // Push to Cloud
    if (db) db.ref('family_vault').update({ history: updatedHistory });
  };

  const deleteHistoryItem = async (id) => {
    const updatedHistory = (history || []).filter(item => item.id !== id);
    setHistory(updatedHistory);
    if (db) db.ref('family_vault').update({ history: updatedHistory });
  };

  const updateHistoryItem = async (updatedItem) => {
    const updatedHistory = (history || []).map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setHistory(updatedHistory);
    await AsyncStorage.setItem('@grocery_history', JSON.stringify(updatedHistory));
  };

  // --- ARCHIVE ITEM HANDLERS ---
  const updateArchiveItem = async (updatedItem) => {
    const updatedArchive = (archive || []).map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setArchive(updatedArchive);
    await AsyncStorage.setItem('@grocery_archive', JSON.stringify(updatedArchive));
  };

  const deleteArchiveItem = async (id) => {
    const updatedArchive = (archive || []).filter(item => item.id !== id);
    setArchive(updatedArchive);
    await AsyncStorage.setItem('@grocery_archive', JSON.stringify(updatedArchive));
  };

  // --- ARCHIVE HANDLER: Moves current run to bi-weekly history ---
  const handleArchiveRun = async () => {
  if (!history || history.length === 0) return;

  const itemsToArchive = history.map(item => ({ ...item, checked: true, isArchived: true }));
  const updatedArchive = [...itemsToArchive, ...(archive || [])];
  
  setArchive(updatedArchive);
  setHistory([]); 

  // Push both changes to Cloud at once
  if (db) {
    await db.ref('family_vault').update({
      archive: updatedArchive,
      history: []
    });
  };

    Alert.alert(
      "Archive Run",
      "This will clear your current list and save it to your period history. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          onPress: async () => {
            try {
              // Mark everything as checked/archived
              const itemsToArchive = history.map(item => ({ 
                ...item, 
                checked: true, 
                isArchived: true 
              }));

              const updatedArchive = [...itemsToArchive, ...(archive || [])];
              
              // Update state
              setArchive(updatedArchive);
              setHistory([]); 

              // Save to storage
              await AsyncStorage.setItem('@grocery_archive', JSON.stringify(updatedArchive));
              await AsyncStorage.removeItem('@grocery_history');

              Alert.alert("Success", "Shopping run saved to your bi-weekly history.");
            } catch (e) {
              console.error("Archive Error:", e);
            }
          }
        }
      ]
    );
  };


  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, paddingTop: 50 }}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}><MaterialCommunityIcons name="menu" size={28} color={Colors.primary} /></TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' }}>{currentView}</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView ref={scrollViewRef} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <DashboardPage
            width={width} userName={userName} calendarRules={calendarRules}
            daysUntilPayday={nextPaydayStats?.days || 0} nextPaydayDate={nextPaydayStats?.date || ''}
            recentShifts={payroll.getEnrichedShifts()} netPay={payroll.calculateNet()}
            otPay={payroll.calculateTotalOTPay ? payroll.calculateTotalOTPay() : '0.00'}
            pensionAmount={pensionAmount} periodTax={payroll.calculateTax ? payroll.calculateTax() : '0.00'}
            expensesTotal={payroll.calculatePendingExpenses ? payroll.calculatePendingExpenses() : '0.00'}
            expensesPaid={payroll.calculatePaidExpenses ? payroll.calculatePaidExpenses() : '0.00'} 
            onTogglePaid={handleTogglePaid} weeklyStats={payroll.getWeeklyStats()}
            groceryTotal={finalGrocerySpent.toFixed(2)} groceryBudget={groceryBudget}
            groceryList={periodGroceryList} onToggleGrocery={toggleHistoryItem}
            onUpdateArchiveItem={updateArchiveItem}
            onDeleteArchiveItem={deleteArchiveItem}
            onDeleteEntry={deleteHistoryItem}
            onOpenReport={() => setIsReportVisible(true)} onPrevPeriod={() => setCycleOffset(c => c - 1)} 
            onNextPeriod={() => setCycleOffset(c => c + 1)}
            cycleStart={payroll.getPayPeriodDates().cycleStart} cycleEnd={payroll.getPayPeriodDates().cycleEnd}
            fuelTotal={periodFuelSpent}
            onOpenFuel={() => setIsFuelModalVisible(true)}
          />

          <CalendarPage
            width={width} currentDate={currentDate} setCurrentDate={setCurrentDate}
            calendarRules={calendarRules} checkPaySchedule={checkPaySchedule}
            isShiftModalVisible={isShiftModalVisible} setIsShiftModalVisible={setIsShiftModalVisible}
            shiftModalMode={shiftModalMode} setShiftModalMode={setShiftModalMode}
            shiftModalData={shiftModalData} setShiftModalData={setShiftModalData}
            onSaveRule={handleSaveRule} onDeleteRule={(id) => setCalendarRules(prev => prev.filter(r => r.id !== id))}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate} overtimeRate={overtimeRate}
            cycleStart={payroll.getPayPeriodDates().cycleStart}
          />

          <GroceryPage
            width={width} salesTaxRate={salesTaxRate} groceryBudget={groceryBudget}
            history={history} archive={archive} taxedStores={taxedStores} setTaxedStores={setTaxedStores}
            onOpenArchive={() => setIsArchiveVisible(true)} productRegistry={productRegistry}
            onUpdateRegistry={handleUpdateRegistry} onUpdateEntry={updateHistoryItem}
            onDeleteEntry={deleteHistoryItem} onToggleCheck={toggleHistoryItem}
            onClearHistory={handleArchiveRun}
            onAddEntry={(i) => setHistory(p => [i, ...(p || [])])} onUpdateBudget={(v) => { setGroceryBudget(v); saveSettings({ hourlyRate, overtimeRate, taxRate, salesTaxRate, groceryBudget: v, preTaxDeductions, postTaxDeductions, pensionAmount, cycleStart, paydayDate }); }}
          />

          <SettingsPage
            width={width} 
            hourlyRate={hourlyRate} 
            overtimeRate={overtimeRate} 
            taxRate={taxRate}
            salesTaxRate={salesTaxRate} 
            preTaxDeductions={preTaxDeductions} 
            postTaxDeductions={postTaxDeductions}
            pensionAmount={pensionAmount} 
            cycleStart={cycleStart} 
            paydayDate={paydayDate}
            groceryBudget={groceryBudget} 
            onSaveSettings={saveSettings} // Changed from onSave to onSaveSettings
            onReset={() => {}} 
            onRepair={() => {}} 
          />
        </ScrollView>
        <FloatingActionGroup currentView={currentView} setCurrentView={handleViewChange} />
      </SafeAreaView>

      <SidebarModal visible={menuOpen} onClose={() => setMenuOpen(false)} navigateToDashboard={() => handleViewChange('dashboard')} navigateToCalendar={() => handleViewChange('calendar')} navigateToGroceries={() => handleViewChange('groceries')} navigateToSettings={() => handleViewChange('settings')} />
      <MonthlyReportModal
        visible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
        calendarRules={calendarRules}
        history={history}
        archive={archive}
        fuelLogs={fuelLogs} // <--- Add this line
        pensionAmount={pensionAmount}
        getReport={getReport}
      />
      <ArchiveModalVisible
        visible={isArchiveVisible}
        onClose={() => setIsArchiveVisible(false)}
        archive={archive}
        onDelete={deleteArchiveItem} // Ensure this matches your App.js function name
        onEdit={(item) => {
          // You can set up a state to open an Edit Modal here
          setShiftModalData(item); 
          setShiftModalMode('edit');
          setIsShiftModalVisible(true);
        }}
      />`

      <FuelModal 
        visible={isFuelModalVisible} 
        onClose={() => setIsFuelModalVisible(false)} 
        onSave={handleAddFuel}
        fuelLogs={fuelLogs}
        periodTotal={periodFuelSpent}
      />

    </View>
  );
}