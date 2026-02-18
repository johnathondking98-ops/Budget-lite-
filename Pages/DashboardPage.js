import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

// === MODAL IMPORTS ===
import { WeekDetailModal, BillsDetailModal, GroceryDetailModal } from '../components/DashboardModal';

const DashboardPage = ({ 
  width, 
  userName, 
  daysUntilPayday,
  nextPaydayDate, 
  netPay,      
  otPay,
  pensionAmount,
  periodTax,
  expensesTotal,
  weeklyStats,    
  cycleStart, 
  cycleEnd,
  onOpenReport, 
  onPrevPeriod,   
  onNextPeriod,   
  groceryTotal, 
  groceryBudget,
  recentShifts,
  calendarRules,
  onTogglePaid,
  groceryList,
  onToggleGrocery,
  onDeleteEntry,
  onDeleteArchiveItem,
  fuelTotal,
  onOpenFuel
}) => {

  // === 1. MODAL VISIBILITY STATE ===
  const [showWeek1, setShowWeek1] = useState(false);
  const [showWeek2, setShowWeek2] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [showGroceries, setShowGroceries] = useState(false);

  // === 2. DATA FILTERING LOGIC ===
  const todayStr = new Date().toISOString().split('T')[0];

  const isDateInPeriod = (dateStr) => {
    if (!dateStr || !cycleStart || !cycleEnd) return false;
    return dateStr >= cycleStart && dateStr <= cycleEnd;
  };

  // --- BILLS LOGIC ---
  const allPeriodBills = calendarRules.filter(
    r => (r.type === 'bill' || r.type === 'subscription') && isDateInPeriod(r.date)
  );

  const pastDueBills = allPeriodBills.filter(r => !r.paid && r.date < todayStr);
  const upcomingBills = allPeriodBills.filter(r => !r.paid && r.date >= todayStr);
  const paidBills = allPeriodBills.filter(r => r.paid);

  const pastDueTotal = pastDueBills.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const upcomingTotal = upcomingBills.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const expensesPaid = paidBills.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toFixed(2);

  // --- THE "FIXED" SURPLUS CALCULATION ---
  // Total obligations = everything owed this period, regardless of paid status
  const totalObligations = allPeriodBills.reduce(
    (sum, bill) => sum + (parseFloat(bill.amount) || 0), 
    0
  );

  // True Surplus = (Work + VA) - (All Bills) - (Current Grocery Spending)
  const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Use useMemo to prevent the UI from flickering or crashing during typing
const actualSurplus = React.useMemo(() => {
  const safeNet = parseFloat(netPay) || 0;
  const safeVA = parseFloat(pensionAmount) || 0;
  const safeObligations = parseFloat(totalObligations) || 0;
  const safeGrocery = parseFloat(groceryTotal) || 0;
  const safeFuel = parseFloat(fuelTotal) || 0;
  return (safeNet + safeVA - safeObligations - safeGrocery - safeFuel).toFixed(2);
}, [netPay, pensionAmount, totalObligations, groceryTotal, fuelTotal]);

  // --- SHIFTS LOGIC ---
  const week1Shifts = recentShifts.filter(s => {
    const dayDiff = (new Date(s.date) - new Date(cycleStart)) / (1000 * 60 * 60 * 24);
    return dayDiff >= 0 && dayDiff < 7;
  });
  const week2Shifts = recentShifts.filter(s => {
    const dayDiff = (new Date(s.date) - new Date(cycleStart)) / (1000 * 60 * 60 * 24);
    return dayDiff >= 7 && dayDiff < 14;
  });

  return (
    <SafeAreaView style={{ width: width, flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, paddingTop: 50, paddingBottom: 100 }}>
          
          {/* Header */}
          <View style={[GlobalStyles.headerContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }]}>
            <View>
              <Text style={GlobalStyles.welcomeText}>Welcome back,</Text>
              <Text style={GlobalStyles.userNameText}>{userName || 'John'}</Text>
            </View>
            
            <TouchableOpacity 
                onPress={onOpenReport}
                style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.primary,
                }}
              >
                <MaterialCommunityIcons name="file-chart" size={20} color={Colors.primary} />
                <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 12, marginLeft: 6 }}>Report</Text>
            </TouchableOpacity>
          </View>

          {/* 1. MAIN FINANCIAL CARD */}
          <View style={GlobalStyles.card}>
            <View style={{ position: 'absolute', top: 15, right: 15, alignItems: 'flex-end' }}>
              <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: 'bold' }}>NEXT PAYDAY</Text>
              <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: 'bold' }}>{daysUntilPayday} DAYS</Text>
              <Text style={{ color: Colors.textDim, fontSize: 10, marginTop: 2 }}>{nextPaydayDate}</Text>
            </View>

            {/* INCOME SECTION */}
            <View style={{ marginBottom: 15 }}>
              <Text style={GlobalStyles.cardTitle}>ESTIMATED WORK NET</Text>
              <Text style={GlobalStyles.cardBigValue}>
                ${formatCurrency(netPay)}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <MaterialCommunityIcons name="shield-check" size={14} color={Colors.success} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 16, color: Colors.success, fontWeight: 'bold' }}>
                  + ${formatCurrency(pensionAmount)}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textDim, marginLeft: 6 }}>VA DISABILITY</Text>
              </View>
            </View>

            {/* SURPLUS INDICATOR */}
            <View style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              borderRadius: 12, 
              padding: 12, 
              borderWidth: 1, 
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: 'bold' }}>PROJECTED REMAINING</Text>
                 <Text style={{ color: Colors.success, fontSize: 22, fontWeight: 'bold' }}>
                   ${formatCurrency(actualSurplus)}
                 </Text>
                </View>
                <MaterialCommunityIcons name="wallet-outline" size={28} color={Colors.success} opacity={0.6} />
              </View>
            </View>

            <View style={[GlobalStyles.cardDivider, { marginTop: 15 }]} />
            
            <View style={GlobalStyles.cardRow}>
               <View style={{ flex: 1, alignItems: 'flex-start' }}>
                 <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Overtime Pay</Text>
                 <Text style={{ color: Colors.success, fontWeight: 'bold', fontSize: 16 }}>+${otPay}</Text>
               </View>

               <View style={{ flex: 1, alignItems: 'center' }}>
                 <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Est. Tax</Text>
                 <Text style={{ color: Colors.danger, fontWeight: 'bold', fontSize: 16 }}>-${periodTax}</Text>
               </View>

               <View style={{ flex: 1, alignItems: 'flex-end' }}>
                 <Text style={{ color: Colors.textMuted, fontSize: 12, marginBottom: 4 }}>Pay Period</Text>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <TouchableOpacity onPress={onPrevPeriod}><MaterialCommunityIcons name="chevron-left" size={20} color={Colors.primary} /></TouchableOpacity>
                    <Text style={{ color: Colors.textDim, fontWeight: '600', fontSize: 10, textAlign: 'center' }}>{cycleStart.slice(5)}{"\n"}{cycleEnd.slice(5)}</Text>
                    <TouchableOpacity onPress={onNextPeriod}><MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} /></TouchableOpacity>
                 </View>
               </View>
            </View>
          </View>

          {/* 2. WEEKLY SUMMARY CARDS */}
          <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
            <TouchableOpacity onPress={() => setShowWeek1(true)} style={[GlobalStyles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={GlobalStyles.cardTitle}>WEEK 1</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, borderRadius: 4 }}>
                   <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: '700' }}>{week1Shifts.length} SHIFTS</Text>
                </View>
              </View>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 5 }}>
                {weeklyStats?.week1?.hours || 0} <Text style={{ fontSize: 14, color: Colors.textDim }}>hrs</Text>
              </Text>
              <Text style={{ color: Colors.success, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
                ${(weeklyStats?.week1?.gross || 0).toFixed(2)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowWeek2(true)} style={[GlobalStyles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={GlobalStyles.cardTitle}>WEEK 2</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, borderRadius: 4 }}>
                   <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: '700' }}>{week2Shifts.length} SHIFTS</Text>
                </View>
              </View>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 5 }}>
                {weeklyStats?.week2?.hours || 0} <Text style={{ fontSize: 14, color: Colors.textDim }}>hrs</Text>
              </Text>
              <Text style={{ color: Colors.success, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
                ${(weeklyStats?.week2?.gross || 0).toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* SPENDING ROW: GROCERIES & FUEL */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            
            {/* GROCERY CARD */}
            <TouchableOpacity 
              onPress={() => setShowGroceries(true)} 
              style={[GlobalStyles.card, { flex: 1, marginBottom: 0 }]}
            >
              <Text style={GlobalStyles.cardTitle}>GROCERIES</Text>
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                  ${parseFloat(groceryTotal || 0).toFixed(2)}
                </Text>
                <Text style={{ color: Colors.textDim, fontSize: 10 }}>of ${groceryBudget}</Text>
              </View>
              <View style={[GlobalStyles.progressContainer, { marginTop: 8, height: 4 }]}>
                <View style={{ 
                  height: '100%', 
                  width: `${Math.min((groceryTotal / groceryBudget) * 100, 100)}%`, 
                  backgroundColor: groceryTotal > groceryBudget ? Colors.danger : Colors.primary 
                }} />
              </View>
            </TouchableOpacity>

            {/* FUEL CARD (New) */}
            <TouchableOpacity 
              onPress={onOpenFuel} // Pass this prop from App.js
              style={[GlobalStyles.card, { flex: 1, marginBottom: 0 }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={GlobalStyles.cardTitle}>FUEL</Text>
                <MaterialCommunityIcons name="gas-station" size={16} color={Colors.primary} />
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                  ${parseFloat(fuelTotal || 0).toFixed(2)}
                </Text>
                <Text style={{ color: Colors.textDim, fontSize: 10 }}>This Period</Text>
              </View>
              {/* Visual indicator for fuel spending flow */}
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8 }}>
                <View style={{ height: '100%', width: '100%', backgroundColor: Colors.primary, opacity: 0.3 }} />
              </View>
            </TouchableOpacity>

             <TouchableOpacity onPress={() => setShowBills(true)} style={[GlobalStyles.card, { flex: 1, marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <Text style={GlobalStyles.cardTitle}>BILLS DUE</Text>
                   <MaterialCommunityIcons 
                     name={pastDueTotal > 0 ? "alert-circle" : "chevron-right"} 
                     size={18} 
                     color={pastDueTotal > 0 ? Colors.danger : Colors.textDim} 
                   />
                </View>

                <View>
                  <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: 'bold' }}>UPCOMING</Text>
                  <Text style={{ color: Colors.bill, fontWeight: 'bold', fontSize: 18 }}>
                    ${upcomingTotal.toFixed(2)}
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                   {pastDueTotal > 0 && (
                     <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: Colors.danger, fontSize: 10, fontWeight: 'bold' }}>PAST DUE</Text>
                        <Text style={{ color: Colors.danger, fontWeight: 'bold', fontSize: 20 }}>
                          ${pastDueTotal.toFixed(2)}
                        </Text>
                     </View>
                   )}
                   
                   <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="check-circle" size={12} color={Colors.success} />
                      <Text style={{ color: Colors.success, fontSize: 10, fontWeight: 'bold' }}>
                        ${expensesPaid} Paid
                      </Text>
                   </View>
                </View>
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* OVERLAYS */}
      <WeekDetailModal visible={showWeek1} onClose={() => setShowWeek1(false)} weekTitle="Week 1" stats={weeklyStats?.week1} shifts={week1Shifts} />
      <WeekDetailModal visible={showWeek2} onClose={() => setShowWeek2(false)} weekTitle="Week 2" stats={weeklyStats?.week2} shifts={week2Shifts} />
      <BillsDetailModal visible={showBills} onClose={() => setShowBills(false)} pastDue={pastDueBills} upcoming={upcomingBills} paid={paidBills} onTogglePaid={onTogglePaid} />
      <GroceryDetailModal 
        visible={showGroceries} 
        onClose={() => setShowGroceries(false)} 
        total={groceryTotal} 
        budget={groceryBudget} 
        groceryList={groceryList} 
        onToggle={onToggleGrocery}
        // 2. Add this logic to the onDelete prop:
        onDelete={(id) => {
          // Check if the item is archived or live and call the right function
          const item = groceryList.find(i => i.id === id);
          if (item?.isArchived) {
            onDeleteArchiveItem(id);
          } else {
            onDeleteEntry(id);
          }
        }}
        onEdit={(item) => {
          // Logic for opening an edit modal goes here later
          console.log("Edit item:", item);
        }}
      />
    </SafeAreaView>
  );
};

export default DashboardPage;