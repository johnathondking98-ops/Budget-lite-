import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CalendarEntryModal from '../components/CalendarEntryModal';

const CalendarPage = ({ 
  width, 
  currentDate, 
  setCurrentDate, 
  calendarRules, 
  checkPaySchedule, 
  selectedDate, 
  setSelectedDate, 
  setIsShiftModalVisible,
  setShiftModalMode, 
  setShiftModalData,
  overtimeRate,
  otThreshold,
  cycleStart,
  onSaveRule,
  onDeleteRule,
  isShiftModalVisible, 
  shiftModalData,      
  shiftModalMode       
}) => {

  // --- 1. SMART PAY CALCULATOR ---
  const calculateShiftPay = (targetShift) => {
    if (!targetShift || !cycleStart) return '0.00';

    const rate = parseFloat(targetShift.rate || 17.65);
    const otRateVal = parseFloat(targetShift.otRate || overtimeRate || (rate * 1.5));
    const h = parseFloat(targetShift.hours || 0);

    // Holiday Bonus (Not Worked): 8hrs straight pay, doesn't count for OT
    if (targetShift.isHolidayOff) return (8 * rate).toFixed(2);

    const parseDate = (dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return Date.UTC(y, m - 1, d, 12, 0, 0);
    };

    const targetDateMs = parseDate(targetShift.date);
    const cycleStartMs = parseDate(cycleStart);
    const msPerDay = 1000 * 60 * 60 * 24;
    const weekIndex = Math.floor(Math.floor((targetDateMs - cycleStartMs) / msPerDay) / 7);

    // Weekly OT Logic: Includes Worked Holidays, Excludes Bonus Days
    const weeklyShifts = calendarRules.filter(r => {
      if (r.type !== 'shift' || r.isHolidayOff) return false;
      const rDateMs = parseDate(r.date);
      const rWeek = Math.floor(Math.floor((rDateMs - cycleStartMs) / msPerDay) / 7);
      return rWeek === weekIndex;
    });

    weeklyShifts.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    let accumulatedHours = 0;
    let finalPay = 0;
    const limit = parseFloat(otThreshold || 40);

    for (let s of weeklyShifts) {
      const sHours = parseFloat(s.hours || 0);
      
      if (s.id === targetShift.id) {
        const roomForRegular = Math.max(0, limit - accumulatedHours);
        const regHours = Math.min(sHours, roomForRegular);
        const otHours = Math.max(0, sHours - regHours);
        
        let shiftTotal = (regHours * rate) + (otHours * otRateVal);

        // Add 1x "Premium" for Holiday Worked (The "24hr logic")
        if (targetShift.isHoliday) {
          shiftTotal += (sHours * rate);
        }

        finalPay = shiftTotal;
        break; 
      }
      accumulatedHours += sHours;
    }
    return finalPay.toFixed(2);
  };

  // --- 2. CALENDAR MATRIX LOGIC ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  const todayStr = new Date().toISOString().split('T')[0];

  const changeMonth = (inc) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + inc);
    setCurrentDate(newDate);
  };

  const handleEditItem = (item) => {
    setShiftModalMode('edit');
    setShiftModalData(item);
    setIsShiftModalVisible(true);
  };

  const handleAddItem = () => {
    setShiftModalMode('add');
    setShiftModalData({ date: selectedDate });
    setIsShiftModalVisible(true);
  };

  const generateMatrix = () => {
    let matrix = [weekDays];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    nDays[1] = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ? 29 : 28;

    const firstDay = new Date(year, month, 1).getDay();
    let counter = 1;
    for (let row = 1; row < 7; row++) {
      matrix[row] = [];
      for (let col = 0; col < 7; col++) {
        matrix[row][col] = (row == 1 && col >= firstDay) || (row > 1 && counter <= nDays[month]) ? counter++ : -1;
      }
    }
    return matrix;
  };

  const matrix = generateMatrix();

  // --- 3. UI RENDERING COMPONENTS ---
  const renderMarkers = (dateString) => {
    const items = calendarRules.filter(r => r.date === dateString);
    if (items.length === 0) return null;

    const hasHolidayWork = items.some(i => i.type === 'shift' && i.isHoliday);
    const hasHolidayBonus = items.some(i => i.type === 'shift' && i.isHolidayOff);
    const hasStandardShift = items.some(i => i.type === 'shift' && !i.isHoliday && !i.isHolidayOff);
    
    const billCount = items.filter(i => i.type === 'bill').length;
    const subCount = items.filter(i => i.type === 'subscription').length;

    return (
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {hasHolidayWork && <Text style={{ fontSize: 18, color: '#EAB308' }}>💼</Text>}
        {hasHolidayBonus && <Text style={{ fontSize: 18, color: '#EAB308', fontWeight: 'bold' }}>+</Text>}
        {hasStandardShift && <Text style={{ fontSize: 18 }}>💼</Text>}
        {billCount > 0 && <Text style={{ fontSize: 18 }}>📝</Text>}
        {subCount > 0 && <Text style={{ fontSize: 18 }}>🔄</Text>}
      </View>
    );
  };

  const renderCalendarItem = (row, col, item) => {
      if (item === -1) return <View key={`${row}-${col}`} style={GlobalStyles.calendarDayCell} />;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(item).padStart(2, '0')}`;
      
      const isSelected = selectedDate === dateString;
      const { isPayday, isCycleStart } = checkPaySchedule(dateString);
      const hasSubscription = calendarRules.some(r => r.date === dateString && r.type === 'subscription');

      let cellBg = isSelected ? Colors.primary : isPayday ? (Colors.paydayTint || '#D1FAE5') : isCycleStart ? (Colors.cycleTint || '#DBEAFE') : Colors.card;
      let textColor = (isCycleStart || isPayday) && !isSelected ? '#111827' : isSelected ? 'white' : Colors.textMain;

      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          onPress={() => isSelected ? handleAddItem() : setSelectedDate(dateString)}
          style={[GlobalStyles.calendarDayCell, { backgroundColor: cellBg, borderWidth: isSelected ? 2 : 0, borderColor: 'white' }]}
        >
          <Text style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: 16, color: textColor }}>{item}</Text>
          {renderMarkers(dateString)}
        </TouchableOpacity>
      );
  };

  const selectedItems = calendarRules.filter(r => r.date === selectedDate);

  return (
    <View style={{ width, flex: 1 }}>
      <ScrollView>
        <View style={{ padding: 15, paddingTop: 50, paddingBottom: 100 }}>
          <View style={GlobalStyles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}><Text style={GlobalStyles.calendarNavText}>← PREV</Text></TouchableOpacity>
            <Text style={GlobalStyles.calendarHeaderText}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}><Text style={GlobalStyles.calendarNavText}>NEXT →</Text></TouchableOpacity>
          </View>

          {matrix.map((row, rIdx) => (
            <View key={rIdx} style={GlobalStyles.calendarGridRow}>
              {row.map((item, cIdx) => rIdx === 0 ? <Text key={cIdx} style={GlobalStyles.calendarDayLabel}>{item}</Text> : renderCalendarItem(rIdx, cIdx, item))}
            </View>
          ))}

          <View style={GlobalStyles.detailCard}>
            <Text style={GlobalStyles.detailHeader}>Events for {selectedDate}</Text>
            {selectedItems.length === 0 ? <Text style={GlobalStyles.listEmptyText}>No events.</Text> : selectedItems.map((item, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleEditItem(item)} style={GlobalStyles.eventItem}>
                <View style={[GlobalStyles.eventIconBox, { backgroundColor: (item.isHoliday || item.isHolidayOff) ? 'rgba(234, 179, 8, 0.2)' : 'rgba(139, 92, 246, 0.2)' }]}>
                  <MaterialCommunityIcons name={item.isHoliday ? "briefcase-check" : item.isHolidayOff ? "plus-circle" : "clock-outline"} size={18} color={(item.isHoliday || item.isHolidayOff) ? '#EAB308' : Colors.shift} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.type === 'shift' ? (item.isHoliday ? `${item.hours} hrs Holiday` : item.isHolidayOff ? `Holiday Bonus` : `${item.hours} hrs Work`) : item.label}</Text>
                  <Text style={{ color: Colors.textDim, fontSize: 12 }}>{item.type === 'shift' ? `Est. Pay: $${calculateShiftPay(item)}` : `Amount: $${item.amount}`}</Text>
                </View>
                {item.type === 'shift' && <Text style={{ color: (item.isHoliday || item.isHolidayOff) ? '#EAB308' : Colors.success, fontWeight: 'bold' }}>${calculateShiftPay(item)}</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleAddItem} style={GlobalStyles.addItemBtn}><Text style={GlobalStyles.btnAddItemText}>+ ADD ITEM</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <CalendarEntryModal visible={isShiftModalVisible} onClose={() => setIsShiftModalVisible(false)} onSave={onSaveRule} onDelete={onDeleteRule} data={shiftModalData} mode={shiftModalMode} />
    </View>
  );
};

export default CalendarPage;