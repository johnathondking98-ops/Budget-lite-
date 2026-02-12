import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const FloatingActionGroup = ({ 
  currentView, 
  setCurrentView, 
  menuOpen, 
  setMenuOpen 
}) => {
  
  // Helper to render standard nav items
  const NavItem = ({ viewName, icon }) => {
    const isActive = currentView === viewName;
    return (
      <TouchableOpacity 
        onPress={() => setCurrentView(viewName)} 
        style={[GlobalStyles.navItem, isActive && GlobalStyles.navItemActive]}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={28} 
          color={isActive ? Colors.primary : Colors.textDim} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={GlobalStyles.navContainer}>
      
      {/* 1. Dashboard */}
      <NavItem viewName="dashboard" icon="view-dashboard" />

      {/* 2. Calendar (Center FAB) */}
      <NavItem viewName="calendar" icon="calendar-month" />

      {/* 3. Groceries */}
      <NavItem viewName="groceries" icon="cart" />
      
      {/* 4. Settings */}
      <NavItem viewName="settings" icon="cog" />

    </View>
  );
};

export default FloatingActionGroup;