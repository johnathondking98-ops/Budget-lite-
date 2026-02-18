import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Switch,
  ScrollView
} from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const CalendarEntryModal = ({ 
  visible, 
  onClose, 
  onSave, 
  onDelete, 
  data,     
  mode      
}) => {
  
  // --- FORM STATE ---
  const [type, setType] = useState('shift'); 
  const [hours, setHours] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  // --- SMART LOGIC STATE ---
  const [isHoliday, setIsHoliday] = useState(false);
  const [isHolidayOff, setIsHolidayOff] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [repeatInterval, setRepeatInterval] = useState('1'); 
  const [repeatUnit, setRepeatUnit] = useState('weeks'); // 'days', 'weeks', 'months'

  // Reset or Load Data when Modal Opens
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && data) {
        setType(data.type || 'shift');
        setHours(data.hours ? String(data.hours) : '');
        setLabel(data.label || '');
        setAmount(data.amount ? String(data.amount) : '');
        setIsHoliday(data.isHoliday || false);
        setIsHolidayOff(data.isHolidayOff || false);
        setIsRecurring(data.recurrence?.active || false);
        setRepeatUntil(data.recurrence?.until || '');
      } else {
        setType('shift');
        setHours('');
        setLabel('');
        setAmount('');
        setIsHoliday(false);
        setIsHolidayOff(false);
        setIsRecurring(false);
        setRepeatUntil('');
      }
    }
  }, [visible, data, mode]);

  const handleSave = () => {
    // Validation
    if (type === 'shift' && !hours && !isHolidayOff) {
      Alert.alert("Missing Info", "Please enter hours worked.");
      return;
    }
    
    const payload = {
      ...(mode === 'edit' ? data : {}), 
      id: mode === 'edit' ? data.id : Date.now().toString(),
      date: data.date, 
      type,
      hours: type === 'shift' ? hours : null,
      label: (type === 'bill' || type === 'subscription') ? label : 'Work Shift',
      amount: (type === 'bill' || type === 'subscription') ? amount : null,
      isHoliday,
      isHolidayOff,
      isPaid: mode === 'edit' ? data.isPaid : false,
      recurrence: isRecurring ? {
        active: true,
        interval: parseInt(repeatInterval) || 1,
        unit: repeatUnit,
        until: repeatUntil || null
      } : null
    };

    onSave(payload);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={GlobalStyles.modalOverlay}
      >
        <View style={[GlobalStyles.modalContent, { maxHeight: '85%' }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <Text style={GlobalStyles.modalTitle}>{mode === 'edit' ? 'Edit Entry' : 'New Entry'}</Text>
            <Text style={{ color: Colors.textDim, marginBottom: 20, textAlign: 'center' }}>{data?.date}</Text>

            {/* TYPE SELECTOR */}
            <View style={GlobalStyles.typeSelector}>
              {['shift', 'bill', 'subscription'].map((t) => (
                <TouchableOpacity 
                  key={t}
                  style={[GlobalStyles.typeBtn, type === t && GlobalStyles.typeBtnActive]} 
                  onPress={() => setType(t)}
                >
                  <Text style={[GlobalStyles.typeText, type === t && GlobalStyles.typeTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FORM FIELDS */}
            {type === 'shift' ? (
              <View style={GlobalStyles.formGroup}>
                <Text style={GlobalStyles.modalLabel}>Hours Worked</Text>
                <TextInput
                  style={[GlobalStyles.input, { opacity: isHolidayOff ? 0.5 : 1 }]}
                  placeholder="e.g. 8.5"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={hours}
                  onChangeText={setHours}
                  editable={!isHolidayOff}
                />
                
                {/* Holiday Switches */}
                <View style={{ marginTop: 15, gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={GlobalStyles.modalLabel}>Working Holiday (2x)?</Text>
                    <Switch 
                      value={isHoliday} 
                      onValueChange={(val) => { setIsHoliday(val); if(val) setIsHolidayOff(false); }} 
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={GlobalStyles.modalLabel}>Holiday Bonus (8h Off)?</Text>
                    <Switch 
                      value={isHolidayOff} 
                      onValueChange={(val) => { 
                        setIsHolidayOff(val); 
                        if(val) { setIsHoliday(false); setHours('8'); } 
                      }} 
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={GlobalStyles.formGroup}>
                <Text style={GlobalStyles.modalLabel}>{type === 'bill' ? 'Bill' : 'Sub'} Name</Text>
                <TextInput style={GlobalStyles.input} value={label} onChangeText={setLabel} placeholder="e.g. Rent" placeholderTextColor="#9CA3AF" />
                <Text style={GlobalStyles.modalLabel}>Amount ($)</Text>
                <TextInput style={GlobalStyles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#9CA3AF" />
              </View>
            )}

            {/* RECURRENCE SECTION */}
<View style={{ borderTopWidth: 1, borderColor: Colors.border, marginTop: 15, paddingTop: 15 }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <Text style={GlobalStyles.modalLabel}>Repeat this entry?</Text>
    <Switch value={isRecurring} onValueChange={setIsRecurring} />
  </View>

  {isRecurring && (
    <View style={{ gap: 15 }}>
      {/* Row: [Every] [Numerical Input] [Unit Selector] */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ color: 'white' }}>Every</Text>
        <TextInput
          style={[GlobalStyles.input, { width: 60, marginBottom: 0, textAlign: 'center' }]}
          keyboardType="numeric"
          value={repeatInterval}
          onChangeText={setRepeatInterval}
        />
        
        {/* Unit Selector (Simple Pills) */}
        <View style={{ flexDirection: 'row', gap: 5, flex: 1 }}>
          {['days', 'weeks', 'months'].map((u) => (
            <TouchableOpacity 
              key={u}
              onPress={() => setRepeatUnit(u)}
              style={{
                flex: 1,
                paddingVertical: 8,
                backgroundColor: repeatUnit === u ? Colors.primary : '#374151',
                borderRadius: 5,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 11 }}>
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Until Date */}
      <View>
        <Text style={GlobalStyles.modalLabel}>Until (YYYY-MM-DD)</Text>
        <TextInput 
          style={GlobalStyles.input} 
          value={repeatUntil} 
          onChangeText={setRepeatUntil} 
          placeholder="2026-12-31" 
          placeholderTextColor="#9CA3AF" 
        />
      </View>
    </View>
  )}
</View>

            {/* ACTION BUTTONS */}
            <View style={[GlobalStyles.row, { marginTop: 20 }]}>
              <TouchableOpacity onPress={onClose} style={GlobalStyles.btnCancel}><Text style={GlobalStyles.btnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={GlobalStyles.btnSave}><Text style={GlobalStyles.btnText}>Save</Text></TouchableOpacity>
            </View>
            {mode === 'edit' && (
              <TouchableOpacity 
                onPress={() => {
                  onDelete(data.id); // Triggers the "Delete Series" alert in App.js
                  onClose();         // Closes the modal so you can see the alert
                }} 
                style={GlobalStyles.btnDelete}
              >
                <Text style={GlobalStyles.textDelete}>Delete Entry</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CalendarEntryModal;