import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTopBarContext } from '../../contexts/TopBarContext';

export default function AuthLayout() {
  const router = useRouter();
  const { setBackButton } = useTopBarContext();

  // Set up back button for all auth screens
  useEffect(() => {
    setBackButton(true, () => router.back());
    return () => setBackButton(false);
  }, [setBackButton, router]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            title: 'Register',
          }}
        />
      </Stack>
    </>
  );
}
