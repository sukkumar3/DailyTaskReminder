import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="checklist" size={80} color={COLORS.textLight} />
      <Text style={styles.title}>No Tasks Yet</Text>
      <Text style={styles.subtitle}>
        Tap the + button to add your first task{'\n'}and set up reminders
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
