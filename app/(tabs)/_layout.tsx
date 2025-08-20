import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide the default tab bar
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="historical" />
        <Tabs.Screen name="settings" />
      </Tabs>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});