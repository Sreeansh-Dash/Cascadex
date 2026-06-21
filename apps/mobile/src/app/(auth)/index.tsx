import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { useAuthStore } from '@/store/auth.store';
import { usePatientStore } from '@/store/patient.store';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  
  const { signIn } = useAuthStore();
  const { setCurrentPatient } = usePatientStore();

  const handleSignIn = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    
    if (res.success) {
      const user = useAuthStore.getState().user;
      if (user) {
        setCurrentPatient(user.id);
        router.replace('/(patient)/(tabs)');
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Ionicons name="medical" size={48} color={theme.colors.accent} />
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Sign in to your Cascadex account</Text>
      </View>

      <View style={styles.form}>
        {errorMsg ? (
          <Text style={[styles.errorText, { color: theme.colors.dangerStrong, fontFamily: theme.typography.subhead }]}>
            {errorMsg}
          </Text>
        ) : null}

        <InputField
          label="Email / Phone"
          value={email}
          onChangeText={(txt) => { setErrorMsg(''); setEmail(txt); }}
          placeholder="Enter email or phone"
          leftIcon={<Ionicons name="mail" size={20} color={theme.colors.textMuted} />}
          autoCapitalize="none"
        />
        
        <InputField
          label="Password"
          value={password}
          onChangeText={(txt) => { setErrorMsg(''); setPassword(txt); }}
          placeholder="Enter password"
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} />}
          autoCapitalize="none"
        />
        
        <View style={styles.forgotPassword}>
          <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.subhead }}>Forgot Password?</Text>
          </Pressable>
        </View>

        <GlowButton
          label="Sign In"
          onPress={handleSignIn}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        />

        <View style={styles.signUpContainer}>
          <Text style={[styles.signUpText, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up/step-1-account')}>
            <Text style={[styles.signUpLink, { color: theme.colors.accent, fontFamily: theme.typography.subhead }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    height: 44,
    justifyContent: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 40,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
