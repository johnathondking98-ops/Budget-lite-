import React, { useState, useMemo } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const { height } = Dimensions.get('window');

const ArchiveModal = ({ 
  visible, 
  onClose, 
  archive = [], 
  onDelete, // New prop from App.js
  onEdit    // New prop from App.js
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // --- SORTING & FILTERING LOGIC ---
  const filteredAndSortedArchive = useMemo(() => {
    let result = archive;
    if (searchQuery) {
      result = archive.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.store?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...result];
    
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'price') {
      sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'store') {
      sorted.sort((a, b) => (a.store || '').localeCompare(b.store || ''));
    } else if (sortBy === 'frequency') {
      const counts = archive.reduce((acc, item) => {
        const name = item.name?.toLowerCase().trim();
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
      sorted.sort((a, b) => (counts[b.name?.toLowerCase().trim()] || 0) - (counts[a.name?.toLowerCase().trim()] || 0));
    }

    return sorted;
  }, [searchQuery, archive, sortBy]);

  const SortChip = ({ label, value, icon }) => (
    <TouchableOpacity 
      onPress={() => setSortBy(value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: sortBy === value ? Colors.primary : 'rgba(255,255,255,0.05)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: sortBy === value ? Colors.primary : 'rgba(255,255,255,0.1)'
      }}
    >
      <MaterialCommunityIcons name={icon} size={14} color={sortBy === value ? 'white' : Colors.textDim} style={{ marginRight: 4 }} />
      <Text style={{ color: sortBy === value ? 'white' : Colors.textDim, fontWeight: 'bold', fontSize: 11 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: height * 0.9, padding: 25, borderTopWidth: 1, borderColor: '#333', flex: 1 }}>
          
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>Archive</Text>
              <Text style={{ fontSize: 12, color: Colors.textDim }}>{archive.length} Items Total</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close-circle" size={28} color={Colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 15 }}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textDim} />
            <TextInput
              style={{ flex: 1, color: 'white', paddingVertical: 12, marginLeft: 10 }}
              placeholder="Search items or stores..."
              placeholderTextColor={Colors.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Sort Chips */}
          <View style={{ marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <SortChip label="DATE" value="date" icon="calendar" />
              <SortChip label="NAME" value="name" icon="sort-alphabetical-ascending" />
              <SortChip label="PRICE" value="price" icon="currency-usd" />
              <SortChip label="STORE" value="store" icon="storefront-outline" />
              <SortChip label="FREQ" value="frequency" icon="trending-up" />
            </ScrollView>
          </View>

          {/* List Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredAndSortedArchive.map((item, index) => (
              <View key={item.id || index} style={[GlobalStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: Colors.textDim, fontSize: 12 }}>{item.store} • {item.date}</Text>
                </View>
                
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>${parseFloat(item.price || 0).toFixed(2)}</Text>
                  
                  {/* RESTORED ACTION BUTTONS */}
                  <View style={{ flexDirection: 'row', gap: 15, marginTop: 5 }}>
                    <TouchableOpacity onPress={() => onEdit && onEdit(item)}>
                      <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.textDim} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete && onDelete(item.id)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            {filteredAndSortedArchive.length === 0 && (
              <Text style={{ color: Colors.textDim, textAlign: 'center', marginTop: 40 }}>No archived items found.</Text>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

export default ArchiveModal;