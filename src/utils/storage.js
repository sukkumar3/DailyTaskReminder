import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@task_reminder_tasks';

export async function loadTasks() {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return [];
  }
}

export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}
