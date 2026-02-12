import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles } from '../styles/GlobalStyles';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const ScannerModal = ({ visible, onClose, onScanComplete }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset local scan state when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
      setLoading(false);
      if (!permission || !permission.granted) {
        requestPermission();
      }
    }
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }) => {
    // Prevent multiple triggers during the fetch process
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // Fetch product data from Open Food Facts
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();

      let productData = {
        upc: data,
        name: '',
        brand: ''
      };

      if (result.status === 1) {
        productData.name = result.product.product_name || '';
        productData.brand = result.product.brands || '';
      }

      // Pass result back to GroceryPage.js handler
      onScanComplete(productData);
    } catch (error) {
      console.error("Scanner API Error:", error);
      // Fallback: pass UPC so the user can manually enter details
      onScanComplete({ upc: data, name: '', brand: '' });
    } finally {
      // Logic handled by GroceryPage closing the modal, but reset here just in case
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="fade" transparent={false}>
        <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="camera-off" size={64} color={Colors.danger} />
          <Text style={{ color: 'white', fontSize: 18, marginTop: 20, textAlign: 'center' }}>
            Camera access is required to scan barcodes.
          </Text>
          <TouchableOpacity 
            onPress={requestPermission} 
            style={{ marginTop: 20, backgroundColor: Colors.primary, padding: 15, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ color: Colors.textDim }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView
          style={{ height: height, width: width, position: 'absolute' }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"],
          }}
        />
        
        {/* Scanner Overlay UI */}
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Target Reticle */}
          <View style={{ 
            width: 280, 
            height: 200, 
            borderWidth: 2, 
            borderColor: scanned ? Colors.success : Colors.primary, 
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: scanned ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)'
          }}>
            {loading && <ActivityIndicator size="large" color={Colors.primary} />}
            {scanned && !loading && <MaterialCommunityIcons name="check-circle" size={48} color={Colors.success} />}
          </View>

          <Text style={{ color: 'white', marginTop: 30, fontSize: 14, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' }}>
            {loading ? "Searching Database..." : "Position Barcode in Frame"}
          </Text>

          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose} 
            style={{ position: 'absolute', top: 60, right: 30, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 5 }}
          >
            <MaterialCommunityIcons name="close-circle" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ScannerModal;