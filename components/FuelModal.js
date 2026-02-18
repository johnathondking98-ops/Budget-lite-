import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const { height } = Dimensions.get('window');

const FuelModal = ({ visible, onClose, onSave, fuelLogs = [], periodTotal = 0 }) => {
  const [ppg, setPpg] = useState(''); // Price Per Gallon
  const [gallons, setGallons] = useState('');
  const [totalCost, setTotalCost] = useState('');

  // Auto-calculate Total Cost when PPG or Gallons change
  useEffect(() => {
    const p = parseFloat(ppg) || 0;
    const g = parseFloat(gallons) || 0;
    if (p > 0 && g > 0) {
      setTotalCost((p * g).toFixed(2));
    }
  }, [ppg, gallons]);

  const handleSave = () => {
    if (!totalCost || parseFloat(totalCost) <= 0) return;

    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ppg: ppg || '0',
      gallons: gallons || '0',
      totalCost: totalCost,
    };

    onSave(newLog);
    // Reset fields
    setPpg('');
    setGallons('');
    setTotalCost('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: Colors.background, 
          borderTopLeftRadius: 30, 
          borderTopRightRadius: 30, 
          maxHeight: height * 0.8, 
          padding: 25, 
          borderTopWidth: 1, 
          borderColor: '#333' 
        }}>
          
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="gas-station" size={28} color={Colors.primary} />
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>Fuel Logger</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close-circle" size={28} color={Colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Period Summary Card */}
          <View style={[GlobalStyles.card, { backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 20 }]}>
            <Text style={GlobalStyles.cardTitle}>PERIOD TOTAL</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary }}>${parseFloat(periodTotal).toFixed(2)}</Text>
          </View>

          {/* Input Section */}
          <View style={{ gap: 10, marginBottom: 25 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>PRICE PER GAL</Text>
                <TextInput 
                  style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 }}
                  placeholder="3.49" placeholderTextColor="#444" keyboardType="decimal-pad"
                  value={ppg} onChangeText={setPpg}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>GALLONS</Text>
                <TextInput 
                  style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 }}
                  placeholder="12.0" placeholderTextColor="#444" keyboardType="decimal-pad"
                  value={gallons} onChangeText={setGallons}
                />
              </View>
            </View>
            
            <View>
              <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>TOTAL COST</Text>
              <TextInput 
                style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.08)', padding: 15, borderRadius: 12, fontSize: 18, fontWeight: 'bold' }}
                placeholder="0.00" placeholderTextColor="#444" keyboardType="decimal-pad"
                value={totalCost} onChangeText={setTotalCost}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              style={{ backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Log Fuel Purchase</Text>
            </TouchableOpacity>
          </View>

          {/* Recent History */}
          <Text style={{ color: Colors.textDim, fontWeight: 'bold', fontSize: 12, marginBottom: 10 }}>RECENT LOGS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fuelLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' }}>
                <View>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{log.date}</Text>
                  <Text style={{ color: Colors.textDim, fontSize: 11 }}>{log.gallons} gal @ ${log.ppg}</Text>
                </View>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>${parseFloat(log.totalCost).toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FuelModal;