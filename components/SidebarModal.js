import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const SidebarModal = ({ 
  visible, 
  onClose, 
  navigateToDashboard, 
  navigateToCalendar, 
  navigateToGroceries, 
  navigateToSettings 
}) => {
  
  const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={GlobalStyles.sidebarMenuItem}>
      <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
      <Text style={GlobalStyles.sidebarMenuText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={GlobalStyles.sidebarOverlay}>
          <TouchableWithoutFeedback>
            <View style={GlobalStyles.sidebarContainer}>
              
              {/* Header */}
              <View style={GlobalStyles.sidebarHeader}>
                <Text style={GlobalStyles.sidebarTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.textDim} />
                </TouchableOpacity>
              </View>

              <View style={GlobalStyles.sidebarDivider} />

              {/* Navigation Links */}
              <MenuItem 
                icon="view-dashboard" 
                label="Dashboard" 
                onPress={navigateToDashboard} 
              />
              
              <MenuItem 
                icon="calendar-month" 
                label="Calendar" 
                onPress={navigateToCalendar} 
              />
              
              <MenuItem 
                icon="cart" 
                label="Groceries" 
                onPress={navigateToGroceries} 
              />

              <MenuItem 
                icon="cog" 
                label="Settings" 
                onPress={navigateToSettings} 
              />

              {/* Spacer to push version to bottom */}
              <View style={{ flex: 1 }} />
              
              <Text style={GlobalStyles.sidebarVersion}>Budget App v4.1</Text>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SidebarModal;