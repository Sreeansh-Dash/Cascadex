import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function SignInScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { signIn } = useAuthStore();

  const handleSignIn = () => {
    setLoading(true);
    // Mock Sign in
    setTimeout(() => {
      setLoading(false);
      signIn('mock-token', {
        id: 'DEMO-PATIENT-001',
        firstName: 'Ramesh',
        role: 'patient',
        verificationStatus: 'verified'
      });
      router.replace('/(patient)/(tabs)');
    }, 1000);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Ionicons name="medical" size={48} color={theme.colors.accent} />
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Sign in to your Cascadex account</Text>
      </View>

      <View style={styles.form}>
        <InputField
          label="Email / Phone"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email or phone"
          leftIcon={<Ionicons name="mail" size={20} color={theme.colors.textMuted} />}
        />
        
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} />}
        />
        
        <View style={styles.forgotPassword}>
          <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.subhead }}>Forgot Password?</Text>
        </View>

        <GlowButton
          label="Sign In"
          onPress={handleSignIn}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    height: 44,
    justifyContent: 'center',
  },
});
