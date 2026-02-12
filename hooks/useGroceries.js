import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGroceries = (groceryItems, setGroceryItems, history, setHistory) => {
  
  // 1. INITIAL LOAD (SAFETY PATCHED)
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedItems = await AsyncStorage.getItem('@grocery_items');
        const savedHistory = await AsyncStorage.getItem('@grocery_history');
        
        // Safety Check: Items
        if (savedItems) {
          const parsed = JSON.parse(savedItems);
          if (Array.isArray(parsed)) setGroceryItems(parsed);
        }
        
        // Safety Check: History
        if (savedHistory) {
          const parsedH = JSON.parse(savedHistory);
          // CRITICAL: If null, force it to []
          if (Array.isArray(parsedH)) {
            setHistory(parsedH);
          } else {
            console.log("Corrupted history found, resetting to empty.");
            setHistory([]); 
          }
        }
      } catch (e) {
        console.error("Failed to load groceries", e);
        setHistory([]); // Fail-safe
      }
    };
    loadData();
  }, [setGroceryItems, setHistory]);

  // 2. SAVE ON CHANGE
  useEffect(() => {
    const saveData = async () => {
      try {
        // Safety: NEVER save 'null' to the phone
        const safeItems = Array.isArray(groceryItems) ? groceryItems : [];
        const safeHistory = Array.isArray(history) ? history : [];
        
        await AsyncStorage.setItem('@grocery_items', JSON.stringify(safeItems));
        await AsyncStorage.setItem('@grocery_history', JSON.stringify(safeHistory));
      } catch (e) {
        console.error("Failed to save groceries", e);
      }
    };
    saveData();
  }, [groceryItems, history]);

  // ... (Keep your addItem, deleteItem, etc. exactly the same as before) ...
  // (I will assume you have those functions from previous steps)
  
  // Just ensure handleCheckout uses the safety spread:
  const handleCheckout = () => {
    // ... logic ...
         const timestamp = new Date().toISOString().split('T')[0];
         const archived = checkedItems.map(i => ({ ...i, date: timestamp }));
         
         // SAFETY SPREAD
         setHistory(prev => [...(prev || []), ...archived]);
         setGroceryItems(prev => prev.filter(i => !i.checked));
    // ... logic ...
  };
  
  // ... rest of return statement ...
  const addItem = (name, price = '0', quantity = 1) => {
    const newItem = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      checked: false
    };
    setGroceryItems(prev => [...prev, newItem]);
  };
  
  const toggleCheck = (id) => {
    setGroceryItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  const deleteItem = (id) => {
    setGroceryItems(prev => prev.filter(item => item.id !== id));
  };
  
  const calculateTotal = () => {
    return groceryItems.reduce((sum, item) => {
      return sum + ((parseFloat(item.price) || 0) * (item.quantity || 1));
    }, 0).toFixed(2);
  };

  const [isScanning, setIsScanning] = useState(false);
  const simulateScan = (callback) => {
    setIsScanning(true);
    setTimeout(() => {
      addItem("Scanned Item", (Math.random() * 10).toFixed(2));
      setIsScanning(false);
      if (callback) callback(); 
      Alert.alert("Scanned!", "Item added to cart.");
    }, 1500);
  };

  return { addItem, toggleCheck, deleteItem, handleCheckout, calculateTotal, simulateScan, isScanning };
};