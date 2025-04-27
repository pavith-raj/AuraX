import { Redirect } from 'expo-router';

export default function Index() {
  // const isLoggedIn = false; // Replace with real logic later

  // if (!isLoggedIn) {
  //   return <Redirect href="/login" />;
  // }

  return <Redirect href="/user" />; // Adjust path based on your app structure
}
