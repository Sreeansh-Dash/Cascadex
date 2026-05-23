import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export const ChipGroup = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
});
