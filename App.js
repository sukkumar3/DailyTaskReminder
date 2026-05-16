import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AddEditTaskScreen from './src/screens/AddEditTaskScreen';
import { registerForPushNotifications } from './src/utils/notifications';

LogBox.ignoreLogs(['new NativeEventEmitter']);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const navigateToAdd = () => {
    setEditingTask(null);
    setScreen('addEdit');
  };

  const navigateToEdit = (task) => {
    setEditingTask(task);
    setScreen('addEdit');
  };

  const goBack = () => {
    setScreen('home');
    setEditingTask(null);
    if (HomeScreen.refresh) {
      HomeScreen.refresh();
    }
  };

  if (screen === 'addEdit') {
    return <AddEditTaskScreen task={editingTask} onGoBack={goBack} />;
  }

  return (
    <HomeScreen
      onNavigateToAdd={navigateToAdd}
      onNavigateToEdit={navigateToEdit}
    />
  );
}
