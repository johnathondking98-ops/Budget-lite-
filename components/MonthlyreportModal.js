import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../constants/Colors';

export default function MonthlyReportModal({ visible, onClose, getReport }) {
  const [targetDate, setTargetDate] = useState(new Date());
  const [report, setReport] = useState(null);

 useEffect(() => {
    if (visible) {
      // 1. Call the actual logic function passed from App.js
      const data = getReport(targetDate); 
      
      // 2. Save that data into your 'report' state
      setReport(data); 
    }
  }, [visible, targetDate, getReport]);

  const changeMonth = (increment) => {
    const newDate = new Date(targetDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setTargetDate(newDate);
  };

  if (!report) return null;

  // --- NEW: COLOR LOGIC ---
  const net = parseFloat(report.netResult);
  const income = parseFloat(report.totalIncome);
  const threshold = income * 0.10; // 10% of Income

  let statusColor = Colors.success; // Default Green
  if (net < 0) {
    statusColor = Colors.danger; // Red
  } else if (net < threshold) {
    statusColor = Colors.warning; // Yellow (Warning)
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={GlobalStyles.modalOverlay}>
        <View style={GlobalStyles.modalContent}>
          
          {/* HEADER */}
          <View style={GlobalStyles.reportHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <MaterialCommunityIcons name="chevron-left" size={30} color="white" />
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={GlobalStyles.reportTitle}>{report.monthName} Report</Text>
              <Text style={{ color: Colors.textDim, fontSize: 12 }}>{targetDate.getFullYear()}</Text>
            </View>
            
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: 20 }}>
            
            {/* 0. WORK STATS */}
            <View style={[GlobalStyles.row, { justifyContent: 'space-around', marginBottom: 20 }]}>
               <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{report.totalHours}</Text>
                  <Text style={{ color: Colors.textDim, fontSize: 10, textTransform: 'uppercase' }}>Total Hours</Text>
               </View>
               <View style={{ height: '100%', width: 1, backgroundColor: '#374151' }} />
               <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.success, fontSize: 24, fontWeight: 'bold' }}>${report.totalOTPay}</Text>
                  <Text style={{ color: Colors.textDim, fontSize: 10, textTransform: 'uppercase' }}>Overtime Pay</Text>
               </View>
            </View>

            {/* 1. INCOME SECTION */}
            <View style={GlobalStyles.card}>
              <Text style={GlobalStyles.reportCardTitle}>INCOME</Text>
              
              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Shift Income</Text>
                <Text style={GlobalStyles.reportValue}>+ ${report.shiftIncome}</Text>
              </View>
              
              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Pension</Text>
                <Text style={GlobalStyles.reportValue}>+ ${report.pension}</Text>
              </View>

              <View style={[GlobalStyles.reportDivider, { backgroundColor: Colors.accent }]} />
              
              <View style={GlobalStyles.reportRow}>
                <Text style={[GlobalStyles.reportLabel, { color: Colors.accent, fontWeight:'bold' }]}>TOTAL INCOME</Text>
                <Text style={[GlobalStyles.reportValue, { color: Colors.accent, fontWeight:'bold' }]}>
                  ${report.totalIncome}
                </Text>
              </View>
            </View>

            {/* 2. EXPENSES SECTION */}
            <View style={GlobalStyles.card}>
              <Text style={GlobalStyles.reportCardTitle}>EXPENSES & TAXES</Text>
              
              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Bills & Subs</Text>
                <Text style={[GlobalStyles.reportValue, { color: Colors.danger }]}>- ${report.totalBills}</Text>
              </View>

              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Groceries</Text>
                <Text style={[GlobalStyles.reportValue, { color: Colors.danger }]}>- ${report.totalGroceries}</Text>
              </View>

              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Fuel Purchases</Text>
                <Text style={[GlobalStyles.reportValue, { color: Colors.danger }]}>- ${report.totalFuel}</Text>
              </View>

              <View style={GlobalStyles.reportRow}>
                <Text style={GlobalStyles.reportLabel}>Est. Taxes</Text>
                <Text style={[GlobalStyles.reportValue, { color: Colors.danger }]}>- ${report.totalTax}</Text>
              </View>              
            </View>

            {/* 3. RESULT SECTION (UPDATED COLOR) */}
            <View style={[GlobalStyles.card, { borderColor: statusColor, borderWidth: 1 }]}>
              <Text style={GlobalStyles.reportCardTitle}>NET CASH FLOW</Text>
              <Text style={{ 
                fontSize: 32, 
                fontWeight: 'bold', 
                color: statusColor,
                textAlign: 'center',
                marginVertical: 10
              }}>
                ${report.netResult}
              </Text>
              <Text style={{ textAlign: 'center', color: Colors.textDim, fontSize: 12 }}>
                (Income - Bills - Groceries - Fuel - Tax)
              </Text>
            </View>

          </ScrollView>

          {/* CLOSE BUTTON */}
          <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={onClose}>
            <Text style={GlobalStyles.btnText}>Close Report</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}