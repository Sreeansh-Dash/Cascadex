import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <Redirect href="/(auth)" />;
  }

  if (user.role === 'pharmacist') {
    return <Redirect href="/(clinician)/(tabs)" />;
  }

  return <Redirect href="/(patient)/(tabs)" />;
}
