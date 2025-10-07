import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { HomeIcon, ListIcon, FolderIcon, SettingsIcon } from '../../components/icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.white,
          borderTopColor: Colors.border.light,
          borderTopWidth: 1,
          paddingTop: 5,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
        // Masquer les headers natifs car on utilise notre TopBar
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused, color, size }) => (
            <HomeIcon size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="moments"
        options={{
          title: 'Moments',
          tabBarIcon: ({ focused, color, size }) => <ListIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: 'Dossiers',
          tabBarIcon: ({ focused, color, size }) => (
            <FolderIcon size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ focused, color, size }) => (
            <SettingsIcon size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
