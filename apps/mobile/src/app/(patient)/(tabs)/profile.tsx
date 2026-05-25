import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PatientProfile() {
  const { theme } = useTheme();
  const { user, signOut, updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState(user?.age || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || '');

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)');
  };

  const handleSave = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First Name is required');
      return;
    }

    updateUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: age.trim(),
      weight: weight.trim(),
      gender: gender.trim(),
      bloodType: bloodType.trim(),
    });

    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  return (
    <ScreenContainer scrollable padding hasTabBar={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Profile</Text>
        <GlowButton
          label={isEditing ? "Cancel" : "Edit"}
          onPress={() => {
            if (isEditing) {
              // reset to store values
              setFirstName(user?.firstName || '');
              setLastName(user?.lastName || '');
              setAge(user?.age || '');
              setWeight(user?.weight || '');
              setGender(user?.gender || '');
              setBloodType(user?.bloodType || '');
            }
            setIsEditing(!isEditing);
          }}
          variant="secondary"
          size="sm"
        />
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>Age</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>Weight</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={weight}
              onChangeText={setWeight}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>Gender</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={gender}
              onChangeText={setGender}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>Blood Type</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
              value={bloodType}
              onChangeText={setBloodType}
            />

            <View style={{ height: 20 }} />
            
            <GlowButton
              label="Save Changes"
              onPress={handleSave}
              variant="primary"
              size="md"
              fullWidth
            />
          </View>
        ) : (
          <View style={styles.viewDetails}>
            <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>Full Name</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>
              {user?.firstName} {user?.lastName || ''}
            </Text>
            
            <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Patient ID</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{user?.id || 'DEMO-PATIENT-001'}</Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Email Address</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>{user?.email}</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Age</Text>
                <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                  {user?.age || 'Not provided'}
                </Text>
              </View>
              
              <View style={styles.col}>
                <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Weight</Text>
                <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                  {user?.weight || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Gender</Text>
                <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                  {user?.gender || 'Not provided'}
                </Text>
              </View>
              
              <View style={styles.col}>
                <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Blood Type</Text>
                <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                  {user?.bloodType || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {!isEditing && (
        <View style={styles.signOutBtn}>
          <GlowButton
            label="Sign Out"
            onPress={handleSignOut}
            variant="destructive"
            size="md"
            fullWidth
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  editForm: {
    gap: 2,
  },
  viewDetails: {
    gap: 2,
  },
  inputLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  signOutBtn: {
    marginBottom: 40,
  }
});

