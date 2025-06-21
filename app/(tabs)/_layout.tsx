import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        
        // Hide the built-in tab bar everywhere
        tabBarStyle:{
          display : 'none',
        },
      }}>
      
      <Tabs.Screen
        name="appointments/appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />

      <Tabs.Screen
        name="products/products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="skinAnalysis"
        options={{
          title: 'Skin Analysis',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="queue/queue"
        options={{
          title: 'Queue',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profiles/profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="book/appointmentBooking"
        options={{
          title: 'Book',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar.badge.plus" color={color} />,
        }}
      />
    </Tabs>
  );
}
