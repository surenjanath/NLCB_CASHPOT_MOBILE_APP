import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, History, Settings } from 'lucide-react-native';

interface TabItem {
  name: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
}

const tabs: TabItem[] = [
  {
    name: 'index',
    title: 'Home',
    icon: Home,
    route: '/',
  },
  {
    name: 'historical',
    title: 'Historical',
    icon: History,
    route: '/historical',
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: Settings,
    route: '/settings',
  },
];

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  const isActive = (tabName: string) => {
    if (tabName === 'index') {
      return pathname === '/';
    }
    return pathname === `/${tabName}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = isActive(tab.name);
          const IconComponent = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={1}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={18}
                  color={active ? '#1F2937' : '#FFFFFF'}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? '#1F2937' : '#FFFFFF' }
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: '50%',
    marginLeft: -150,
    zIndex: 9999,
    elevation: 15,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 25,
    height: 60,
    width: 300,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 2,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1F2937',
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
