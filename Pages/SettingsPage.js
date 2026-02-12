import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsPage = ({ 
  hourlyRate, 
  overtimeRate, 
  taxRate, 
  preTaxDeductions, 
  postTaxDeductions, 
  salesTaxRate,
  cycleStart, 
  paydayDate, 
  pensionAmount,
  groceryBudget, 
  onSave, 
  onRepair, 
  onReset 
}) => {

  const [localHourly, setLocalHourly] = useState(hourlyRate || '');
  const [localOvertime, setLocalOvertime] = useState(overtimeRate || '');
  const [localTax, setLocalTax] = useState(taxRate || '');
  const [localSalesTax, setLocalSalesTax] = useState(salesTaxRate || '0'); 
  const [localPreTax, setLocalPreTax] = useState(preTaxDeductions || '');
  const [localPostTax, setLocalPostTax] = useState(postTaxDeductions || '');
  const [localCycleStart, setLocalCycleStart] = useState(cycleStart || '');
  const [localPayday, setLocalPayday] = useState(paydayDate || '');
  const [localPension, setLocalPension] = useState(pensionAmount || '0.00');
  const [localGroceryBudget, setLocalGroceryBudget] = useState(groceryBudget);

  // --- SYNC DATA WHEN PROPS CHANGE (On Load) ---
  useEffect(() => {
    setLocalHourly(hourlyRate || '');
    setLocalOvertime(overtimeRate || '');
    setLocalTax(taxRate || '');
    setLocalSalesTax(salesTaxRate || '0'); // <--- Added this to ensure it loads on reload
    setLocalPreTax(preTaxDeductions || '');
    setLocalPostTax(postTaxDeductions || '');
    setLocalPension(pensionAmount || '0.00');
    setLocalCycleStart(cycleStart || '');
    setLocalPayday(paydayDate || '');
    setLocalGroceryBudget(groceryBudget || '');
  }, [hourlyRate, overtimeRate, taxRate, salesTaxRate, preTaxDeductions, postTaxDeductions, pensionAmount, cycleStart, paydayDate, groceryBudget]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 48; 

  const handleSave = () => {
    onSave({
      hourlyRate: localHourly,
      overtimeRate: localOvertime,
      taxRate: localTax,      
      salesTaxRate: localSalesTax,
      preTaxDeductions: localPreTax,
      postTaxDeductions: localPostTax,
      groceryBudget: localGroceryBudget,      
      cycleStart: localCycleStart,
      paydayDate: localPayday,
      pensionAmount: localPension
    });
    console.log("Settings Saved. Sales Tax sent:", localSalesTax);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 50, alignItems: 'center' }}> 
          
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20, alignSelf: 'flex-start' }}>
            Settings
          </Text>

          {/* === SECTION 1: INCOME SOURCES === */}
          <View style={[GlobalStyles.settingsSection, { width: cardWidth }]}>
            <Text style={GlobalStyles.settingsSectionTitle}>INCOME SOURCES</Text>
            
            <View style={[GlobalStyles.card, { width: '100%' }]}>
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={{ flex: 1 }}>
                  <Text style={GlobalStyles.settingsLabel}>Hourly Rate ($)</Text>
                  <TextInput
                    style={GlobalStyles.settingsInput}
                    keyboardType="numeric"
                    value={localHourly}
                    onChangeText={setLocalHourly}
                    placeholder="0.00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={GlobalStyles.settingsLabel}>OT Rate ($)</Text>
                  <TextInput
                    style={GlobalStyles.settingsInput}
                    keyboardType="numeric"
                    value={localOvertime}
                    onChangeText={setLocalOvertime}
                    placeholder="0.00"
                  />
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={GlobalStyles.settingsLabel}>VA Disability (Monthly)</Text>
                <TextInput 
                  style={GlobalStyles.settingsInput}
                  value={localPension} 
                  onChangeText={setLocalPension}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text style={GlobalStyles.settingsLabel}>Grocery Budget ($)</Text>
                <TextInput
                  style={GlobalStyles.settingsInput}
                  placeholder="400.00"
                  keyboardType="decimal-pad"
                  value={localGroceryBudget?.toString()}
                  onChangeText={setLocalGroceryBudget}
                />
              </View>
            </View>
          </View>

          {/* === SECTION 2: TAXES & DEDUCTIONS === */}
          <View style={[GlobalStyles.settingsSection, { width: cardWidth }]}>
            <Text style={GlobalStyles.settingsSectionTitle}>TAXES & DEDUCTIONS</Text>

            <View style={[GlobalStyles.card, { width: '100%' }]}>
              <View style={{ marginBottom: 15 }}>
                <Text style={GlobalStyles.settingsLabel}>Income Tax Rate (%)</Text>
                <TextInput
                  style={GlobalStyles.settingsInput}
                  keyboardType="numeric"
                  value={localTax}
                  onChangeText={setLocalTax}
                  placeholder="0.0"
                />
              </View>

              {/* SALES TAX INPUT */}
              <View style={{ marginBottom: 15 }}>
                <Text style={GlobalStyles.settingsLabel}>Sales Tax Rate (Grocery %)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 10 }}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[GlobalStyles.settingsInput, { flex: 1, backgroundColor: 'transparent', borderWidth: 0 }]}
                    keyboardType="decimal-pad"
                    value={localSalesTax}
                    onChangeText={setLocalSalesTax}
                    placeholder="7.25"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 15 }}>
                <View style={{ flex: 1 }}>
                  <Text style={GlobalStyles.settingsLabel}>Pre-Tax ($)</Text>
                  <TextInput
                    style={GlobalStyles.settingsInput}
                    keyboardType="numeric"
                    value={localPreTax}
                    onChangeText={setLocalPreTax}
                    placeholder="0.00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={GlobalStyles.settingsLabel}>Post-Tax ($)</Text>
                  <TextInput
                    style={GlobalStyles.settingsInput}
                    keyboardType="numeric"
                    value={localPostTax}
                    onChangeText={setLocalPostTax}
                    placeholder="0.00"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* === SECTION 3: DATES === */}
          <View style={[GlobalStyles.settingsSection, { width: cardWidth }]}>
            <Text style={GlobalStyles.settingsSectionTitle}>CYCLE DATES</Text>
            <View style={[GlobalStyles.card, { width: '100%' }]}>
              <View style={{ marginBottom: 15 }}>
                <Text style={GlobalStyles.settingsLabel}>Cycle Start (YYYY-MM-DD)</Text>
                <TextInput
                  style={GlobalStyles.settingsInput}
                  value={localCycleStart}
                  onChangeText={setLocalCycleStart}
                  placeholder="2026-01-01"
                />
              </View>
              <View>
                <Text style={GlobalStyles.settingsLabel}>Next Payday (YYYY-MM-DD)</Text>
                <TextInput
                  style={GlobalStyles.settingsInput}
                  value={localPayday}
                  onChangeText={setLocalPayday}
                  placeholder="2026-01-12"
                />
              </View>
            </View>
          </View>

          {/* === ACTIONS === */}
          <TouchableOpacity 
            onPress={onRepair} 
            style={[GlobalStyles.card, { marginTop: 20, borderColor: Colors.primary, borderWidth: 1, width: cardWidth }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="wrench-outline" size={24} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Sync Historical Data</Text>
                <Text style={{ color: Colors.textDim, fontSize: 12 }}>Updates old shifts with new OT logic</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={[GlobalStyles.btnSaveSettings, { width: cardWidth, marginTop: 20 }]}>
            <Text style={GlobalStyles.btnSaveText}>Save All Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: Colors.primary, padding: 15, borderRadius: 10, margin: 10 }}
            onPress={async () => {
              if (!db) return alert("Wait for connection...");
              try {
                await db.ref('family_vault').set({
                  userName, hourlyRate, overtimeRate, taxRate, salesTaxRate,
                  groceryBudget, preTaxDeductions, postTaxDeductions,
                  pensionAmount, cycleStart, paydayDate, calendarRules,
                  taxedStores, archive, productRegistry, fuelLogs, history
                });
                alert("🚀 Vault Loaded! Check your Firebase browser now.");
              } catch (e) {
                alert("Error: " + e.message);
              }
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>INITIALIZE FAMILY CLOUD</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onReset} style={[GlobalStyles.btnClearData, { width: cardWidth, marginTop: 15 }]}>
            <Text style={GlobalStyles.btnClearText}>⚠️ Reset All Data</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsPage;