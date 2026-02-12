import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';
import ScannerModal from '../components/ScannerModal';

const { width } = Dimensions.get('window');

const GroceryPage = ({ 
  history = [],
  archive = [], 
  onAddEntry, 
  onDeleteEntry, 
  onUpdateEntry, 
  onToggleCheck, 
  onClearHistory, 
  groceryBudget,
  salesTaxRate, 
  taxedStores,    
  setTaxedStores, 
  onUpdateBudget, 
  onOpenArchive,
  productRegistry = {}, 
  onUpdateRegistry 
}) => {
  // --- ADD ITEM STATES ---
  const [amount, setAmount] = useState('');
  const [store, setStore] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1'); // Restored
  const [unit, setUnit] = useState('ea');       // Restored
  const [currentUPC, setCurrentUPC] = useState(null);

  // --- MODAL STATES ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --- EDIT TEMPORARY STATES ---
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('1');
  const [editPrice, setEditPrice] = useState('');

  // --- LOGIC: BUDGET & DATA ---
  const budgetNum = parseFloat(groceryBudget) || 0;
  const safeHistory = Array.isArray(history) ? history : [];
  const taxMultiplier = (parseFloat(salesTaxRate) || 0) / 100;

  const groupedData = safeHistory.reduce((acc, item) => {
    const storeName = item.store || 'Other';
    if (!acc[storeName]) {
      acc[storeName] = { items: [], subtotal: 0 };
    }
    acc[storeName].items.push(item);
    acc[storeName].subtotal += (parseFloat(item.price) || 0);
    return acc;
  }, {});

  const storeNames = Object.keys(groupedData).sort();

  const totalSpentWithTax = safeHistory.reduce((sum, item) => {
    if (!item.checked) return sum; 
    const itemPrice = parseFloat(item.price) || 0;
    const isStoreTaxed = taxedStores[item.store || 'Other'];
    const taxAmt = isStoreTaxed ? itemPrice * taxMultiplier : 0;
    return sum + itemPrice + taxAmt;
  }, 0);

  const remaining = budgetNum - totalSpentWithTax;
  const progressPercent = budgetNum > 0 ? (totalSpentWithTax / budgetNum) * 100 : 0;

  // --- INTELLIGENCE LOGIC (Restored) ---
  const getSuggestions = () => {
    const activeNames = safeHistory.map(i => i.name.toLowerCase());
    const fullHistory = [...safeHistory, ...(Array.isArray(archive) ? archive : [])];
    const counts = fullHistory.reduce((acc, item) => {
      if (item.checked || item.archived) { 
        acc[item.name] = (acc[item.name] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.keys(counts)
      .filter(name => !activeNames.includes(name.toLowerCase()))
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5);
  };
  const suggestions = getSuggestions();

  // --- HANDLERS ---
  const handleAdd = () => {
    if (!amount || !itemName) return;
    const unitPrice = parseFloat(amount);
    const qty = parseFloat(quantity) || 1;
    const newEntry = {
      id: Date.now().toString(),
      unitPrice: unitPrice,
      price: unitPrice * qty,
      name: itemName,
      store: store || 'Grocery Store',
      quantity: qty,
      unit: unit,
      date: new Date().toISOString().split('T')[0],
      checked: false,
    };
    if (onAddEntry) onAddEntry(newEntry);
    setItemName(''); setAmount(''); setStore(''); setQuantity('1'); setUnit('ea');
  };

  // --- EDIT HANDLERS ---
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQty(item.quantity?.toString() || '1');
    setEditPrice(item.unitPrice?.toString() || (item.price / (item.quantity || 1)).toString());
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const qty = parseFloat(editQty) || 1;
    const unitPrice = parseFloat(editPrice) || 0;
    
    const updatedItem = {
      ...editingItem,
      name: editName,
      quantity: qty,
      unitPrice: unitPrice,
      price: unitPrice * qty, // Recalculate total price based on new qty
    };

    if (onUpdateEntry) onUpdateEntry(updatedItem);
    setIsEditModalVisible(false);
    setEditingItem(null);
  };

  return (
    <View style={{ width: width, flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        
        {/* HEADER WITH ARCHIVE BUTTON */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Grocery Tracker</Text>
          <TouchableOpacity onPress={onOpenArchive} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}>
            <MaterialCommunityIcons name="history" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* BUDGET STATUS */}
        <View style={GlobalStyles.card}>
          <Text style={GlobalStyles.cardTitle}>BUDGET STATUS (INC. TAX)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 5 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>$</Text>
            <TextInput
              style={{ color: 'white', fontSize: 32, fontWeight: 'bold', paddingHorizontal: 5, minWidth: 100 }}
              keyboardType="decimal-pad"
              value={groceryBudget?.toString()}
              onChangeText={(val) => onUpdateBudget(val.replace(/[^0-9.]/g, ''))}
            />
          </View>
          <Text style={{ color: remaining < 50 ? Colors.danger : Colors.success, marginTop: 5 }}>
            ${remaining.toFixed(2)} Remaining
          </Text>
          <View style={[GlobalStyles.progressContainer, { marginTop: 15 }]}>
            <View style={[GlobalStyles.progressInner, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: totalSpentWithTax > budgetNum ? Colors.danger : Colors.primary }]} />
          </View>
        </View>

        {/* SUGGESTIONS (Restored) */}
        {suggestions.length > 0 && (
          <View style={{ marginBottom: 15 }}>
              <Text style={{ color: Colors.textDim, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 }}>SUGGESTED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {suggestions.map((name) => (
                    <TouchableOpacity
                      key={name}
                      onPress={() => {
                        const recentEntry = [...(archive || []), ...(history || [])]
                          .filter(item => item.name === name)
                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        setItemName(name);
                        if (recentEntry) {
                          setAmount(recentEntry.unitPrice?.toString() || recentEntry.price?.toString() || '');
                          setStore(recentEntry.store || '');
                          setUnit(recentEntry.unit || 'ea');
                        }
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}
                    >
                      <Text style={{ color: 'white', fontSize: 13 }}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
          </View>
        )}

        {/* LOG PURCHASE (With QTY and UNIT restored) */}
        <View style={GlobalStyles.card}>
          <Text style={GlobalStyles.cardTitle}>LOG PURCHASE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 }}>
            <TextInput style={{ flex: 1, color: 'white', fontSize: 18, borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 8 }} placeholder="Item Name" placeholderTextColor={Colors.textDim} value={itemName} onChangeText={setItemName} />
            <TouchableOpacity onPress={() => setIsScannerVisible(true)}><MaterialCommunityIcons name="barcode-scan" size={24} color={Colors.primary} /></TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TextInput style={{ flex: 2, color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }} placeholder="Price" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TextInput style={{ flex: 1, color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }} placeholder="Qty" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
            <TextInput style={{ flex: 1, color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }} placeholder="Unit" value={unit} onChangeText={setUnit} />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput style={{ flex: 1, color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }} placeholder="Store" value={store} onChangeText={setStore} />
            <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: Colors.primary, padding: 12, borderRadius: 8, justifyContent: 'center' }}>
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* GROCERY LIST */}
        <Text style={{ color: Colors.textDim, fontWeight: 'bold', marginVertical: 15 }}>GROCERY LIST</Text>
        {storeNames.map((storeName) => {
          const isTaxed = taxedStores[storeName];
          const storeSubtotal = groupedData[storeName].subtotal;
          const storeTax = isTaxed ? storeSubtotal * taxMultiplier : 0;
          const storeTotal = storeSubtotal + storeTax;

          return (
            <View key={storeName} style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setTaxedStores(prev => ({ ...prev, [storeName]: !prev[storeName] }))} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={isTaxed ? "percent-circle" : "percent-circle-outline"} size={20} color={isTaxed ? Colors.success : Colors.textDim} />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>{storeName.toUpperCase()}</Text>
                </TouchableOpacity>
                <Text style={{ color: isTaxed ? Colors.success : Colors.primary, fontWeight: 'bold' }}>${storeTotal.toFixed(2)}</Text>
              </View>

              {groupedData[storeName].items.map((item, index) => (
                <View key={item.id || index} style={[GlobalStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
                  <TouchableOpacity onPress={() => onToggleCheck(item.id)} style={{ marginRight: 15 }}>
                    <MaterialCommunityIcons name={item.checked ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={item.checked ? Colors.primary : Colors.textDim} />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: item.checked ? Colors.textDim : 'white', fontWeight: 'bold' }}>{item.name} <Text style={{ color: Colors.primary }}>x{item.quantity}</Text></Text>
                  </View>
                  <Text style={{ color: item.checked ? Colors.textDim : Colors.danger, fontWeight: 'bold', marginRight: 10 }}>-${item.price.toFixed(2)}</Text>
                  
                  {/* EDIT AND DELETE ICONS RESTORED */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => handleOpenEdit(item)}><MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.textDim} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => onDeleteEntry(item.id)}><MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} /></TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* ARCHIVE BUTTON AT BOTTOM */}
        {safeHistory.length > 0 && (
          <TouchableOpacity 
            onPress={onClearHistory}
            style={{ backgroundColor: Colors.card, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary }}
          >
            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Complete and Archive Run</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ScannerModal visible={isScannerVisible} onClose={() => setIsScannerVisible(false)} onScanComplete={(data) => {
        setIsScannerVisible(false);
        setItemName(data.brand ? `${data.brand} ${data.name}` : data.name);
      }} />

      {/* EDIT ITEM MODAL */}
      <Modal visible={isEditModalVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={[GlobalStyles.card, { backgroundColor: Colors.background, borderWidth: 1, borderColor: '#333' }]}>
            <Text style={[GlobalStyles.cardTitle, { marginBottom: 20 }]}>EDIT ITEM</Text>
            
            <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>ITEM NAME</Text>
            <TextInput 
              style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 15 }}
              value={editName}
              onChangeText={setEditName}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>PRICE (EA)</Text>
                <TextInput 
                  style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}
                  keyboardType="decimal-pad"
                  value={editPrice}
                  onChangeText={setEditPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.textDim, fontSize: 10, marginBottom: 5 }}>QUANTITY</Text>
                <TextInput 
                  style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}
                  keyboardType="numeric"
                  value={editQty}
                  onChangeText={setEditQty}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)}
                style={{ flex: 1, padding: 15, alignItems: 'center' }}
              >
                <Text style={{ color: Colors.textDim }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveEdit}
                style={{ flex: 2, backgroundColor: Colors.primary, padding: 15, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default GroceryPage;