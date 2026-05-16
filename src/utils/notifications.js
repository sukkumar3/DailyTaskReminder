import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90D9',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleTaskNotification(task) {
  await cancelTaskNotification(task.id);

  if (!task.reminderEnabled || !task.reminderTime) {
    return null;
  }

  const reminderDate = new Date(task.reminderTime);
  if (reminderDate <= new Date()) {
    if (task.repeat === 'none') return null;
    adjustToNextOccurrence(reminderDate, task.repeat);
  }

  const trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: task.title,
      data: { taskId: task.id },
      sound: 'default',
    },
    trigger,
    identifier: task.id,
  });

  return notificationId;
}

function adjustToNextOccurrence(date, repeat) {
  const now = new Date();
  while (date <= now) {
    switch (repeat) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return;
    }
  }
}

export async function cancelTaskNotification(taskId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch (e) {
    // Notification may not exist
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
