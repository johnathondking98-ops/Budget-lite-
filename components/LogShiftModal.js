import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,           
  KeyboardAvoidingView, 
  Switch,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const LogShiftModal = ({ visible, onClose, onSave, onDelete, initialData, mode }) => {
  const [type, setType] = useState('shift'); 
  const [date, setDate] = useState('');
  
  // Shift Fields
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [isHolidayOff, setIsHolidayOff] = useState(false); 
  
  // Bill Fields
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  
  // --- NEW RECURRENCE STATE ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('1'); // "Every 1..."
  const [repeatUnit, setRepeatUnit] = useState('weeks'); // "...Weeks"
  const [repeatUntil, setRepeatUntil] = useState(''); // "Until..."

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setType(initialData.type || 'shift');
        setDate(initialData.date || '');
        setHours(initialData.hours ? String(initialData.hours) : '');
        setRate(initialData.rate ? String(initialData.rate) : '');
        setIsHoliday(initialData.isHoliday || false);
        setIsHolidayOff(initialData.isHolidayOff || false);
        setLabel(initialData.label || initialData.name || '');
        setAmount(initialData.amount ? String(initialData.amount) : '');
        
        // Load Recurrence Data if it exists
        // Note: We are assuming your backend/App.js handles the 'recurrence' object structure
        if (initialData.recurrence && typeof initialData.recurrence === 'object') {
          setIsRecurring(true);
          setRepeatInterval(String(initialData.recurrence.interval || '1'));
          setRepeatUnit(initialData.recurrence.unit || 'weeks');
          setRepeatUntil(initialData.recurrence.until || '');
        } else {
          // Reset if no complex recurrence found
          setIsRecurring(false);
          setRepeatInterval('1');
          setRepeatUnit('weeks');
          setRepeatUntil('');
        }
      } else {
        // Add Mode: Reset
        setType('shift');
        setDate(initialData?.date || new Date().toISOString().split('T')[0]);
        setHours('');
        setRate('');
        setIsHoliday(false);
        setLabel('');
        setAmount('');
        
        setIsRecurring(false);
        setRepeatInterval('1');
        setRepeatUnit('weeks');
        setRepeatUntil('');
      }
    }
  }, [visible, initialData, mode]);

  const handleHolidayOffChange = (val) => {
    setIsHolidayOff(val);
    if (val) {
      // If toggling ON "Not Worked", disable "Worked" toggle and force 8 hours
      setIsHoliday(false);
      setHours('8'); 
    } else {
      setHours(''); // Clear hours when untoggling
    }
  };

  const handleHolidayWorkChange = (val) => {
    setIsHoliday(val);
    if (val) {
      // If toggling ON "Worked", disable "Not Worked" toggle
      setIsHolidayOff(false);
    }
  };

  const handleSave = () => {
    const entry = {
      id: mode === 'edit' ? initialData.id : Date.now().toString(),
      type,
      date,
      // Save the complex recurrence object
      recurrence: isRecurring ? {
        active: true,
        interval: parseInt(repeatInterval) || 1,
        unit: repeatUnit, // 'days', 'weeks', 'months'
        until: repeatUntil || null
      } : null,
    };

    if (type === 'shift') {
      entry.hours = hours;
      if (rate) entry.rate = rate;
      entry.isHoliday = isHoliday;
      entry.isHolidayOff = isHolidayOff; 
    } else {
      entry.label = label; 
      entry.amount = amount;
      entry.paid = mode === 'edit' ? initialData.paid : false;
    }

    onSave(entry);
    onClose();
  };

  const renderRecurrenceOptions = () => (
    <View style={[GlobalStyles.formGroup, { backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }]}>
      
      {/* 1. Toggle Switch */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isRecurring ? 15 : 0 }}>
        <Text style={GlobalStyles.formLabel}>Repeat Entry?</Text>
        <Switch 
          value={isRecurring} 
          onValueChange={setIsRecurring}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={'#f4f3f4'}
        />
      </View>

      {/* 2. Advanced Options (Only if Recurring) */}
      {isRecurring && (
        <View style={{ gap: 10 }}>
          
          {/* Row: "Every [X] [Units]" */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: Colors.textDim }}>Every</Text>
            
            {/* Interval Number */}
            <TextInput
              style={[GlobalStyles.formControl, { width: 60, textAlign: 'center', padding: 8 }]}
              value={repeatInterval}
              onChangeText={setRepeatInterval}
              keyboardType="numeric"
              placeholder="1"
            />

            {/* Unit Selector (Simple Pills) */}
            <View style={{ flexDirection: 'row', gap: 5, flex: 1 }}>
              {['days', 'weeks', 'months'].map(u => (
                <TouchableOpacity 
                  key={u} 
                  onPress={() => setRepeatUnit(u)}
                  style={[
                    GlobalStyles.chip, 
                    repeatUnit === u && GlobalStyles.chipActive,
                    { paddingHorizontal: 8, paddingVertical: 8, flex: 1, alignItems: 'center' }
                  ]}
                >
                  <Text style={[GlobalStyles.chipText, repeatUnit === u && GlobalStyles.chipTextActive]}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Row: "Until [Date]" */}
          <View style={GlobalStyles.formGroup}>
            <Text style={GlobalStyles.formLabel}>Until Date (Optional)</Text>
            <TextInput
              style={GlobalStyles.formControl}
              value={repeatUntil}
              onChangeText={setRepeatUntil}
              placeholder="YYYY-MM-DD (e.g. 2026-12-31)"
              placeholderTextColor={Colors.textDim}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={GlobalStyles.modalOverlay}>
          <View style={[GlobalStyles.modalContainer, { maxHeight: '90%' }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
            
              {/* Header */}
              <View style={GlobalStyles.modalHeader}>
                <Text style={GlobalStyles.modalTitle}>
                  {mode === 'edit' ? 'Edit Entry' : 'New Entry'}
                </Text>
                <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Type Selector */}
              <View style={GlobalStyles.segmentContainer}>
                <TouchableOpacity style={[GlobalStyles.segmentBtn, type === 'shift' && GlobalStyles.segmentBtnActive]} onPress={() => setType('shift')}>
                  <Text style={[GlobalStyles.segmentText, type === 'shift' && GlobalStyles.segmentTextActive]}>Shift</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[GlobalStyles.segmentBtn, type === 'bill' && GlobalStyles.segmentBtnActive]} onPress={() => setType('bill')}>
                  <Text style={[GlobalStyles.segmentText, type === 'bill' && GlobalStyles.segmentTextActive]}>Bill</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[GlobalStyles.segmentBtn, type === 'subscription' && GlobalStyles.segmentBtnActive]} onPress={() => setType('subscription')}>
                  <Text style={[GlobalStyles.segmentText, type === 'subscription' && GlobalStyles.segmentTextActive]}>Sub</Text>
                </TouchableOpacity>
              </View>

              {/* Fields */}
              <View style={{ gap: 15 }}>
                <View style={GlobalStyles.formGroup}>
                  <Text style={GlobalStyles.formLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={GlobalStyles.formControl}
                    value={date}
                    onChangeText={setDate}
                    placeholder="2026-02-03"
                    placeholderTextColor={Colors.textDim}
                    keyboardType="numeric"
                  />
                </View>

                {type === 'shift' && (
                  <>
                  <View style={[GlobalStyles.formRow, { opacity: isHolidayOff ? 0.5 : 1 }]}>
                    <View style={[GlobalStyles.formGroup, { flex: 1 }]}>
                      <Text style={GlobalStyles.formLabel}>Hours</Text>
                      <TextInput
                        style={GlobalStyles.formControl}
                        value={hours}
                        onChangeText={setHours}
                        placeholder="8.0"
                        placeholderTextColor={Colors.textDim}
                        keyboardType="decimal-pad"
                        editable={!isHolidayOff}
                      />
                    </View>
                    <View style={[GlobalStyles.formGroup, { flex: 1 }]}>
                      <Text style={GlobalStyles.formLabel}>Rate (Optional)</Text>
                      <TextInput
                        style={GlobalStyles.formControl}
                        value={rate}
                        onChangeText={setRate}
                        placeholder="$17.65"
                        placeholderTextColor={Colors.textDim}
                        keyboardType="decimal-pad"
                        editable={!isHolidayOff}
                      />
                    </View>
                  </View>

                        {/* Holiday Toggle */}
                    <View style={[GlobalStyles.formGroup, { 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: isHoliday ? 'rgba(234, 179, 8, 0.15)' : 'transparent', // Yellow tint if active
                      padding: isHoliday ? 10 : 0,
                      borderRadius: 8,
                      opacity: isHolidayOff ? 0.3 : 1
                    }]}>
                      <View>
                        <Text style={[GlobalStyles.formLabel, isHoliday && { color: '#EAB308', fontWeight: 'bold' }]}>
                          Working on Holiday? (2x)
                        </Text>
                        {isHoliday && <Text style={{ fontSize: 10, color: '#EAB308' }}>Double time applied!</Text>}
                      </View>
                      <Switch 
                        value={isHoliday} 
                        onValueChange={setIsHoliday}
                        disabled={isHolidayOff}
                        trackColor={{ false: '#767577', true: '#EAB308' }} // Gold/Yellow color
                        thumbColor={'#f4f3f4'}
                      />
                    </View>

                    {/* --- OPTION 2: HOLIDAY NOT WORKED (8h Bonus) --- */}
                    <View style={[GlobalStyles.formGroup, { 
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: isHolidayOff ? 'rgba(59, 130, 246, 0.15)' : 'transparent', // Blue tint
                      padding: isHolidayOff ? 10 : 0, borderRadius: 8,
                      marginTop: 5,
                      opacity: isHoliday ? 0.3 : 1 // Dim if Holiday Work is selected
                    }]}>
                      <View>
                        <Text style={[GlobalStyles.formLabel, isHolidayOff && { color: '#60A5FA', fontWeight: 'bold' }]}>
                          Federal Holiday (Did Not Work)
                        </Text>
                        {isHolidayOff && <Text style={{ fontSize: 10, color: '#60A5FA' }}>+8 Hrs Pay (No OT impact)</Text>}
                      </View>
                      <Switch 
                        value={isHolidayOff} 
                        onValueChange={handleHolidayOffChange}
                        disabled={isHoliday}
                        trackColor={{ false: '#767577', true: '#3B82F6' }} // Blue color
                        thumbColor={'#f4f3f4'}
                      />
                    </View>


                  </>
                )}

                {(type === 'bill' || type === 'subscription') && (
                  <>
                    <View style={GlobalStyles.formGroup}>
                      <Text style={GlobalStyles.formLabel}>Name (e.g. Electric)</Text>
                      <TextInput
                        style={GlobalStyles.formControl}
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Enter name..."
                        placeholderTextColor={Colors.textDim}
                      />
                    </View>

                    <View style={GlobalStyles.formGroup}>
                      <Text style={GlobalStyles.formLabel}>Amount ($)</Text>
                      <TextInput
                        style={GlobalStyles.formControl}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="150.00"
                        placeholderTextColor={Colors.textDim}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </>
                )}

                {/* INSERT NEW RECURRENCE OPTIONS HERE */}
                {renderRecurrenceOptions()}
              </View>

              <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={handleSave}>
                <Text style={GlobalStyles.btnText}>SAVE ENTRY</Text>
              </TouchableOpacity>

              {mode === 'edit' && (
                <TouchableOpacity onPress={() => { onDelete(initialData.id); onClose(); }} style={{ marginTop: 15, alignSelf: 'center', padding: 10, marginBottom: 10 }}>
                  <Text style={{ color: Colors.danger, fontWeight: 'bold' }}>Delete Entry</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LogShiftModal;