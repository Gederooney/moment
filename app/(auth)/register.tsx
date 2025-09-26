import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, Component } from '../../constants/Spacing';
import { useAuthContext } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuthContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark] = useState(false);

  const colors = getColors(isDark);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirmPassword]);

  // Handle register submission
  const handleRegister = useCallback(async () => {
    if (!validateForm() || isSubmitting || authLoading) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      // Navigation will be handled by the auth context/root layout
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isSubmitting, authLoading, register, name, email, password, router]);

  // Navigate to login
  const handleNavigateToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const isLoading = isSubmitting || authLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: colors.text.primary }]}>Moments</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Create your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background.white,
                      borderColor: errors.name
                        ? Colors.error
                        : name
                          ? Colors.primary
                          : colors.border.medium,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="Full name"
                  placeholderTextColor={colors.text.tertiary}
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!isLoading}
                />
              </View>
              {errors.name && (
                <Text style={[styles.errorText, { color: Colors.error }]}>{errors.name}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background.white,
                      borderColor: errors.email
                        ? Colors.error
                        : email
                          ? Colors.primary
                          : colors.border.medium,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="Email address"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: Colors.error }]}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.background.white,
                      borderColor: errors.password
                        ? Colors.error
                        : password
                          ? Colors.primary
                          : colors.border.medium,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: Colors.error }]}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.background.white,
                      borderColor: errors.confirmPassword
                        ? Colors.error
                        : confirmPassword
                          ? Colors.primary
                          : colors.border.medium,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.text.tertiary}
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* General Error */}
            {errors.general && (
              <Text style={[styles.errorText, styles.generalError, { color: Colors.error }]}>
                {errors.general}
              </Text>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                {
                  backgroundColor: Colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <Text style={[styles.registerButtonText, { color: colors.text.white }]}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.text.secondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleNavigateToLogin} disabled={isLoading}>
                <Text style={[styles.loginLink, { color: Colors.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md3,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg2,
  },
  appTitle: {
    ...Typography.display,
    marginBottom: Spacing.sm2,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  input: {
    flex: 1,
    ...Component.input,
    ...Typography.input,
    borderWidth: 2,
    paddingLeft: Spacing.lg2,
  },
  passwordInput: {
    paddingRight: Spacing.lg2,
  },
  passwordToggle: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.small,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  generalError: {
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  registerButton: {
    ...Component.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md2,
  },
  registerButtonText: {
    ...Typography.button,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md2,
  },
  loginText: {
    ...Typography.body,
  },
  loginLink: {
    ...Typography.bodyMedium,
  },
});
