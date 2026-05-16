import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TaskItem from '../components/TaskItem';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { loadTasks, saveTasks } from '../utils/storage';
import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from '../utils/notifications';

const FILTERS = ['All', 'Active', 'Completed'];

export default function HomeScreen({ onNavigateToAdd, onNavigateToEdit }) {
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const refresh = useCallback(async () => {
    const loaded = await loadTasks();
    setTasks(loaded);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Expose refresh so parent can call it
  HomeScreen.refresh = refresh;

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'Active') return !task.completed;
    if (activeFilter === 'Completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleToggle = async (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const toggled = { ...t, completed: !t.completed };
        if (toggled.completed) {
          cancelTaskNotification(taskId);
        } else if (toggled.reminderEnabled) {
          scheduleTaskNotification(toggled);
        }
        return toggled;
      }
      return t;
    });
    setTasks(updated);
    await saveTasks(updated);
  };

  const handleDelete = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelTaskNotification(taskId);
            const updated = tasks.filter((t) => t.id !== taskId);
            setTasks(updated);
            await saveTasks(updated);
          },
        },
      ],
    );
  };

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    Alert.alert(
      'Clear Completed',
      `Remove ${completedTasks.length} completed task(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            for (const t of completedTasks) {
              await cancelTaskNotification(t.id);
            }
            const updated = tasks.filter((t) => !t.completed);
            setTasks(updated);
            await saveTasks(updated);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {activeCount} active, {completedCount} done
            </Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity
              onPress={handleClearCompleted}
              style={styles.clearButton}
            >
              <MaterialIcons name="cleaning-services" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        {filteredTasks.length === 0 && tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggle={handleToggle}
                onEdit={onNavigateToEdit}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyFilterText}>
                  No {activeFilter.toLowerCase()} tasks
                </Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={onNavigateToAdd}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  emptyFilter: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyFilterText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
