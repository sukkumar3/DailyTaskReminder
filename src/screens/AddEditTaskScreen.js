import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, CATEGORIES, CATEGORY_COLORS, REPEAT_OPTIONS } from '../constants/colors';
import { loadTasks, saveTasks } from '../utils/storage';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notifications';

export default function AddEditTaskScreen({ task, onGoBack }) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [category, setCategory] = useState(task?.category || 'Personal');
  const [reminderEnabled, setReminderEnabled] = useState(task?.reminderEnabled || false);
  const [repeat, setRepeat] = useState(task?.repeat || 'none');
  const [notes, setNotes] = useState(task?.notes || '');

  // Date/time picker state
  const [reminderDate, setReminderDate] = useState(() => {
    if (task?.reminderTime) return new Date(task.reminderTime);
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingDatePart, setEditingDatePart] = useState(null); // 'year', 'month', 'day', 'hour', 'minute', 'ampm'

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title');
      return;
    }

    const tasks = await loadTasks();

    const taskData = {
      id: task?.id || Date.now().toString(),
      title: title.trim(),
      category,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderDate.toISOString() : null,
      repeat,
      notes: notes.trim(),
      completed: task?.completed || false,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updated;
    if (isEditing) {
      updated = tasks.map((t) => (t.id === task.id ? taskData : t));
    } else {
      updated = [taskData, ...tasks];
    }

    await saveTasks(updated);

    if (taskData.reminderEnabled && !taskData.completed) {
      await scheduleTaskNotification(taskData);
    } else {
      await cancelTaskNotification(taskData.id);
    }

    onGoBack();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const adjustDate = (field, delta) => {
    const newDate = new Date(reminderDate);
    switch (field) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + delta);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + delta);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + delta);
        break;
      case 'hour':
        newDate.setHours(newDate.getHours() + delta);
        break;
      case 'minute':
        newDate.setMinutes(newDate.getMinutes() + delta * 5);
        break;
    }
    setReminderDate(newDate);
  };

  const quickSetTime = (hours) => {
    const d = new Date();
    d.setHours(d.getHours() + hours, 0, 0, 0);
    setReminderDate(d);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What do you need to do?"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditing}
              multiline
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && {
                      backgroundColor: CATEGORY_COLORS[cat],
                      borderColor: CATEGORY_COLORS[cat],
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reminder Toggle */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <MaterialIcons name="notifications" size={22} color={COLORS.primary} />
                <Text style={styles.label}>Reminder</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={reminderEnabled ? COLORS.primary : COLORS.textLight}
              />
            </View>
          </View>

          {/* Date & Time Picker */}
          {reminderEnabled && (
            <View style={styles.section}>
              {/* Quick set buttons */}
              <View style={styles.quickSetRow}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => quickSetTime(1)}>
                  <Text style={styles.quickBtnText}>In 1 hr</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => quickSetTime(3)}>
                  <Text style={styles.quickBtnText}>In 3 hrs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(9, 0, 0, 0);
                  setReminderDate(d);
                }}>
                  <Text style={styles.quickBtnText}>Tomorrow 9AM</Text>
                </TouchableOpacity>
              </View>

              {/* Date adjuster */}
              <Text style={styles.subLabel}>Date</Text>
              <View style={styles.adjustRow}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustDate('day', -1)}
                >
                  <MaterialIcons name="chevron-left" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.adjustValue}>{formatDate(reminderDate)}</Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustDate('day', 1)}
                >
                  <MaterialIcons name="chevron-right" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {/* Time adjuster */}
              <Text style={styles.subLabel}>Time</Text>
              <View style={styles.timeAdjustContainer}>
                <View style={styles.adjustRow}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustDate('hour', -1)}
                  >
                    <MaterialIcons name="remove" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.adjustValue}>{formatTime(reminderDate)}</Text>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustDate('hour', 1)}
                  >
                    <MaterialIcons name="add" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.minuteRow}>
                  <TouchableOpacity
                    style={styles.minuteBtn}
                    onPress={() => adjustDate('minute', -1)}
                  >
                    <Text style={styles.minuteBtnText}>-5 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.minuteBtn}
                    onPress={() => adjustDate('minute', 1)}
                  >
                    <Text style={styles.minuteBtnText}>+5 min</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Repeat */}
              <Text style={styles.subLabel}>Repeat</Text>
              <View style={styles.repeatRow}>
                {REPEAT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.repeatChip,
                      repeat === opt.value && styles.repeatChipActive,
                    ]}
                    onPress={() => setRepeat(opt.value)}
                  >
                    <Text
                      style={[
                        styles.repeatChipText,
                        repeat === opt.value && styles.repeatChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any extra details..."
              placeholderTextColor={COLORS.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    fontSize: 18,
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryLight,
    paddingVertical: 8,
    minHeight: 44,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickSetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 180,
    textAlign: 'center',
  },
  timeAdjustContainer: {
    gap: 8,
  },
  minuteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  minuteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  minuteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  repeatChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  repeatChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repeatChipTextActive: {
    color: COLORS.white,
  },
  notesInput: {
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
});
