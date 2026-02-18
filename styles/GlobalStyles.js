import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

// Calculate day width exactly like your original code to ensure fit
// (Screen Width - Padding/Gaps) / 7 days
const DAY_WIDTH = (width - 80) / 7; 

export const GlobalStyles = StyleSheet.create({
  // === BASE LAYOUT ===
  row: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  // === CARDS ===
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  v3Card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  cardTitle: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardBigValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  // === TEXT ===
  welcomeText: {
    fontSize: 16,
    color: Colors.textDim,
  },
  userNameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },

  // === CALENDAR GRID (FIXED) ===
 calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  calendarHeaderText: {
    color: '#F9FAFB', // textMain
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarNavText: {
    color: '#3B82F6', // primary
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDayCell: {
    flex: 1,
    height: 90,
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 8,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#9CA3AF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // RESTORED: Using fixed calculations + Fixed Height
  calendarDay: {
    width: (Dimensions.get('window').width - 110) / 7,
    height: 65, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary, 
  },
  calendarDayText: {
    fontSize: 15,
    color: Colors.textMain,
  },
  calendarDayTextSelected: {
    color: Colors.textMain,
    fontWeight: 'bold',
  },
  calendarDayEmpty: {
    width: (Dimensions.get('window').width - 110) / 7,
    height: 50,
  },
  
  // INDICATORS (Dots)
  calendarIndicatorContainer: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarIndicator: {
    width: 8,       
    height: 8,      
    borderRadius: 4,
    backgroundColor: Colors.textDim, 
  },
  indicatorText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },

  // === EVENT LIST & DETAILS ===
 detailCard: {
    marginTop: 10,
    backgroundColor: '#1F2937', // card
    padding: 20,
    borderRadius: 16,
    minHeight: 150,
  },
  detailHeader: {
    color: '#9CA3AF', // textDim
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  eventIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnAddItemText: {
    color: Colors.textDim,
    fontWeight: '600',
  },

  // === FORMS & INPUTS ===
  formRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    color: Colors.textDim,
    fontSize: 12,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#374151', // Lighter background than the modal card
    color: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4B5563', // Visible border
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 2,
    width: '100%',
  },
  typeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#3B82F6', // Colors.primary
  },
  typeText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  typeTextActive: {
    color: 'white',
  },

  // === BUTTONS ===
  btnPrimary: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  btnSave: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  btnDelete: {
    marginTop: 20,
    padding: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textDelete: {
    color: Colors.danger,
    fontSize: 14,
  },

  // === MODALS ===
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay to focus attention
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1F2937', // Dark Slate
    borderRadius: 20,
    padding: 25,
    // Remove alignItems: 'center' so inputs stretch full width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    alignSelf: 'flex-start',
    color: '#D1D5DB', // Lighter Gray for better readability
    marginBottom: 8,
    fontSize: 14,     // Bigger text
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // === MONTHLY REPORT ===
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  reportCardTitle: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportLabel: {
    color: 'white',
    fontSize: 16,
  },
  reportValue: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'monospace', 
  },
  reportDivider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
    opacity: 0.5,
  },

  // === NAVIGATION BAR ===
  navContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.card,
    borderRadius: 35,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  navFab: {
    backgroundColor: 'transparent',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },

  // === GROCERY STYLES ===
  groceryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groceryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
 toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  toggleLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleSubLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.textDim,
    fontWeight: 'bold',
    fontSize: 12,
  },
  toggleTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnAddItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#374151',
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  groceryName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1, 
    marginLeft: 10,
  },
  groceryPrice: {
    color: Colors.success,
    fontWeight: 'bold',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Colors.textDim,
  },
  groceryFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    alignItems: 'center',
  },
  groceryTotal: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  btnCheckout: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  btnCheckoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyDate: {
    color: Colors.textDim,
    fontSize: 12,
    width: 80,
  },
  btnClearHistory: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  textClearHistory: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // === MISC / SHARED ===
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listEmptyText: {
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  
  // === SCANNER ===
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  scannerContent: {
    alignItems: 'center',
    gap: 20,
  },
  scannerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  scannerSubText: {
    color: Colors.textDim,
    fontSize: 16,
  },
  scannerSimBtn: {
    marginTop: 50,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  scannerSimBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // === SIDEBAR ===
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: '75%',
    backgroundColor: '#111827',
    height: '100%',
    padding: 20,
    paddingTop: 50,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 20,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sidebarMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sidebarVersion: {
    color: Colors.textDim,
    textAlign: 'center',
    fontSize: 12,
  },
  
  // === SETTINGS ===
  settingsSection: {
    marginBottom: 25,
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsSectionTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  settingsLabel: {
    color: Colors.textDim,
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  settingsInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#F9FAFB',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  btnSaveSettings: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnSaveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnClearData: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderStyle: 'dashed',
    marginBottom: 50,
  },
  btnClearText: {
    color: Colors.danger,
    fontWeight: 'bold',
  },
  // === CHIPS (Improved Selectors) ===
  chipContainer: {
    flexDirection: 'row', 
    gap: 10, 
    flexWrap: 'wrap',
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 16,     // Wider touch area
    paddingVertical: 10,       // Taller touch area
    borderRadius: 25,          // Fully rounded capsule
    backgroundColor: '#374151', // Visible dark grey background (not transparent)
    borderWidth: 1,
    borderColor: '#4B5563',
    minWidth: 70,              // Minimum width for consistency
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary, // Solid Green background when active
    borderColor: Colors.primary,
  },
  chipText: {
    color: '#D1D5DB',          // Light grey text
    fontSize: 14,              // Larger font (was 12)
    fontWeight: '600',
  },
  chipTextActive: {
    color: 'white',            // White text on Green background
    fontWeight: 'bold',
  },
});