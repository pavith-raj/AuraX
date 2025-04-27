import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // This single line hides the header AND prevents the "(user)" title
      }}
    />
  );
}