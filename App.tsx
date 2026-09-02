import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { loadPersistedState } from './src/store/index-react-native';
import './src/i18n/config'; // Initialize i18n

// Polyfill: Make Event.NONE and related DOM Event constants configurable
// to prevent "Cannot assign to read-only property 'NONE'" error from
// event-target-shim (used by abort-controller → fetch).
(function patchEventConstants() {
  if (typeof Event !== 'undefined' && Event.prototype) {
    ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'].forEach(function(name) {
      try {
        Object.defineProperty(Event, name, { configurable: true, writable: true, value: 0 }); // value replaced below
      } catch (_) {}
      try {
        var desc = Object.getOwnPropertyDescriptor(Event, name) ||
                   Object.getOwnPropertyDescriptor(Event.prototype, name);
        if (desc && !desc.configurable) {
          Object.defineProperty(Event, name, { configurable: true, writable: true, value: desc.value });
          Object.defineProperty(Event.prototype, name, { configurable: true, writable: true, value: desc.value });
        }
      } catch (_) {}
    });
  }
})();

export default function App() {
  useEffect(() => {
    loadPersistedState(); // Call load function on mount
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
