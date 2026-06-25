import { Redirect } from 'expo-router';

/** Always boot into the patient dashboard — no auth required. */
export default function Index() {
  return <Redirect href="/(patient)/(tabs)" />;
}
