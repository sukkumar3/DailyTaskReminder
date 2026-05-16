import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, CATEGORY_COLORS } from '../constants/colors';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;

  const formatReminderTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeFormatted = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Today at ${timeFormatted}`;
    if (isTomorrow) return `Tomorrow at ${timeFormatted}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeFormatted}`;
  };

  const getRepeatLabel = (repeat) => {
    switch (repeat) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return '';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, task.completed && styles.completedContainer]}
      onPress={() => onEdit(task)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons
          name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={26}
          color={task.completed ? COLORS.success : COLORS.textLight}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.title, task.completed && styles.completedTitle]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {task.category}
            </Text>
          </View>

          {task.reminderEnabled && task.reminderTime && (
            <View style={styles.reminderInfo}>
              <MaterialIcons name="notifications-active" size={14} color={COLORS.primary} />
              <Text style={styles.reminderText}>
                {formatReminderTime(task.reminderTime)}
              </Text>
            </View>
          )}

          {task.repeat && task.repeat !== 'none' && (
            <View style={styles.repeatBadge}>
              <MaterialIcons name="repeat" size={14} color={COLORS.textSecondary} />
              <Text style={styles.repeatText}>{getRepeatLabel(task.repeat)}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="delete-outline" size={22} color={COLORS.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completedContainer: {
    opacity: 0.6,
  },
  categoryBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  checkbox: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reminderText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  repeatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
});
