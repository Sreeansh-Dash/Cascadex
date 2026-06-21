import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(patient)/(tabs)" />;
}
