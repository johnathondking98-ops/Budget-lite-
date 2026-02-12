import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const { height } = Dimensions.get('window');

// === REUSABLE MODAL CONTAINER ===
const BaseModal = ({ visible, onClose, title, children, icon, color = Colors.primary }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
      <View style={{ 
        backgroundColor: Colors.background, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        maxHeight: height * 0.85, 
        padding: 25, 
        borderTopWidth: 1, 
        borderColor: '#333',
        flex: 1 
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              justifyContent: 'center', 
              alignItems: 'center', 
              backgroundColor: `${color}20` 
            }}>
              <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close-circle" size={28} color={Colors.textDim} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// === 1. WEEKLY SHIFTS MODAL ===
export const WeekDetailModal = ({ visible, onClose, weekTitle, stats, shifts }) => (
  <BaseModal visible={visible} onClose={onClose} title={`${weekTitle} Details`} icon="clock-outline" color={Colors.primary}>
    <View style={GlobalStyles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={GlobalStyles.cardTitle}>TOTAL HOURS</Text>
          <Text style={GlobalStyles.cardBigValue}>{stats?.hours || 0} hrs</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={GlobalStyles.cardTitle}>GROSS PAY</Text>
          <Text style={[GlobalStyles.cardBigValue, { color: Colors.success }]}>
            ${(stats?.gross || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
    <Text style={{ color: Colors.textDim, fontWeight: 'bold', marginVertical: 15, fontSize: 12, letterSpacing: 0.5 }}>SHIFTS LOGGED</Text>
    {shifts.length === 0 ? (
      <Text style={{ color: Colors.textDim, textAlign: 'center', marginTop: 20 }}>No shifts recorded.</Text>
    ) : (
      shifts.map((shift, index) => (
        <View key={index} style={[GlobalStyles.card, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }]}>
          <View>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{shift.date}</Text>
            <Text style={{ color: Colors.textDim, fontSize: 12 }}>{shift.isHoliday ? 'Holiday Shift (2x)' : 'Standard 24h'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{shift.hours} hrs</Text>
            <Text style={{ color: Colors.success, fontSize: 12 }}>+${shift.calculatedPay}</Text>
          </View>
        </View>
      ))
    )}
  </BaseModal>
);

// === 2. BILLS SPLIT MODAL ===
export const BillsDetailModal = ({ visible, onClose, pastDue = [], upcoming = [], paid = [], onTogglePaid }) => (
  <BaseModal visible={visible} onClose={onClose} title="Bills Breakdown" icon="file-document-outline" color={Colors.bill}>
    {pastDue.length > 0 && (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: Colors.danger, fontWeight: 'bold', marginVertical: 10, fontSize: 12 }}>⚠️ PAST DUE</Text>
        {pastDue.map((bill) => (
          <TouchableOpacity key={bill.id} onPress={() => onTogglePaid(bill.id)} style={[GlobalStyles.card, { flexDirection: 'row', justifyContent: 'space-between', borderColor: Colors.danger, borderWidth: 1, marginBottom: 10 }]}>
            <View><Text style={{ color: 'white', fontWeight: 'bold' }}>{bill.label || bill.name}</Text><Text style={{ color: Colors.danger, fontSize: 12 }}>Due: {bill.date}</Text></View>
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={28} color={Colors.danger} />
          </TouchableOpacity>
        ))}
      </View>
    )}
    <Text style={{ color: Colors.textDim, fontWeight: 'bold', marginVertical: 10, fontSize: 12 }}>UPCOMING</Text>
    {upcoming.map((bill) => (
      <TouchableOpacity key={bill.id} onPress={() => onTogglePaid(bill.id)} style={[GlobalStyles.card, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }]}>
        <View><Text style={{ color: 'white', fontWeight: 'bold' }}>{bill.label || bill.name}</Text><Text style={{ color: Colors.textDim, fontSize: 12 }}>{bill.date}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={{ color: 'white', fontWeight: 'bold' }}>${bill.amount}</Text><MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color={Colors.textDim} /></View>
      </TouchableOpacity>
    ))}
  </BaseModal>
);

// === 3. GROCERY MODAL ===
export const GroceryDetailModal = ({ 
  visible, 
  onClose, 
  total, 
  budget, 
  groceryList = [], 
  onToggle, 
  onEdit,   // New Prop
  onDelete  // New Prop
}) => {
  const budgetNum = parseFloat(budget) || 1;
  const totalNum = parseFloat(total) || 0; 
  const percent = Math.min((totalNum / budgetNum) * 100, 100);
  const remaining = budgetNum - totalNum;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: Colors.background, 
          borderTopLeftRadius: 30, 
          borderTopRightRadius: 30, 
          maxHeight: height * 0.85, 
          padding: 25, 
          borderTopWidth: 1, 
          borderColor: '#333',
          flex: 1
        }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                <MaterialCommunityIcons name="cart" size={24} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>Grocery Tracker</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close-circle" size={28} color={Colors.textDim} />
            </TouchableOpacity>
          </View>

          <View style={[GlobalStyles.card, { borderColor: Colors.primary, borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={GlobalStyles.cardTitle}>SPENT (INC. TAX)</Text>
              <Text style={{ color: remaining < 20 ? Colors.danger : Colors.success, fontWeight: 'bold' }}>
                ${remaining.toFixed(2)} Left
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>${totalNum.toFixed(2)}</Text>
              <Text style={{ fontSize: 16, color: Colors.textDim, marginLeft: 5 }}>/ ${budgetNum}</Text>
            </View>
            <View style={[GlobalStyles.progressContainer, { marginTop: 15, height: 8 }]}>
              <View style={[GlobalStyles.progressInner, { width: `${percent}%`, backgroundColor: totalNum > budgetNum ? Colors.danger : Colors.primary }]} />
            </View>
          </View>

          <Text style={{ color: Colors.textDim, fontWeight: 'bold', marginVertical: 15, marginLeft: 5, fontSize: 12 }}>PERIOD HISTORY</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {groceryList.length === 0 ? (
              <Text style={{ color: Colors.textDim, textAlign: 'center', marginTop: 20 }}>No items for this period.</Text>
            ) : (
              groceryList.map((item, index) => (
                <View 
                  key={item.id || index} 
                  style={[GlobalStyles.card, { 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 15, 
                    marginBottom: 10, 
                    opacity: item.isArchived ? 0.7 : 1 
                  }]}
                >
                  <TouchableOpacity onPress={() => !item.isArchived && onToggle && onToggle(item.id)}>
                    <MaterialCommunityIcons 
                      name={item.checked ? "checkbox-marked" : "checkbox-blank-outline"} 
                      size={24} 
                      color={item.checked ? Colors.primary : Colors.textDim} 
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textDecorationLine: item.checked ? 'line-through' : 'none' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: Colors.textDim, fontSize: 12 }}>{item.store} • {item.date}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={{ color: item.checked ? Colors.textDim : Colors.danger, fontWeight: 'bold', fontSize: 16 }}>
                      ${parseFloat(item.price || 0).toFixed(2)}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => onEdit(item)}>
                        <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.textDim} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDelete(item.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};