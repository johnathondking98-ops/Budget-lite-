import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStorage = () => {
  // Use this hook if you need to access raw storage, 
  // though most logic is handled in App.js via useEffects.

  const saveItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to storage', e);
    }
  };

  const getItem = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch from storage', e);
      return null;
    }
  };

  return {
    saveItem,
    getItem
  };
};