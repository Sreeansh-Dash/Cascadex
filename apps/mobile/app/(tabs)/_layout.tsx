/**
 * Tab Layout — Biopunk v2 Glass Membrane Tab Bar
 * 4 tabs: Network, Scan, Alerts, Timeline
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';

/** Tab icon with optional active glow halo */
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Network: '⬡',
    Scan: '⎔',
    Alerts: '⚠',
    Timeline: '◷',
  };

  return (
    <View style={styles.iconContainer}>
      {focused && <View style={styles.activeGlow} />}
      <Text
        style={[
          styles.icon,
          { color: focused ? COLORS.primary : COLORS.text.muted },
        ]}
      >
        {icons[name] || '●'}
      </Text>
      <Text
        style={[
          styles.label,
          { color: focused ? COLORS.primary : COLORS.text.muted },
        ]}
      >
        {name.toUpperCase()}
      </Text>
    </View>
  );
};

/** Bottom tab navigator with glass-membrane styling */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Network',
          tabBarIcon: ({ focused }) => <TabIcon name="Network" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon name="Scan" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon name="Alerts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ focused }) => <TabIcon name="Timeline" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 72,
    backgroundColor: 'rgba(10, 15, 24, 0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    elevation: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  activeGlow: {
    position: 'absolute',
    top: -2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glow.teal,
    opacity: 0.3,
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.5,
  },
});
