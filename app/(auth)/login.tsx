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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, Component } from '../../constants/Spacing';
import { useAuthContext } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark] = useState(false);

  const colors = getColors(isDark);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  // Handle login submission
  const handleLogin = useCallback(async () => {
    if (!validateForm() || isSubmitting || authLoading) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email: email.trim(), password });
      // Navigation will be handled by the auth context/root layout
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isSubmitting, authLoading, login, email, password, router]);

  // Navigate to register
  const handleNavigateToRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, [router]);

  const isLoading = isSubmitting || authLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: colors.text.primary }]}>Moments</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* General Error */}
            {errors.general && (
              <Text style={[styles.errorText, styles.generalError, { color: Colors.error }]}>
                {errors.general}
              </Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: Colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <Text style={[styles.loginButtonText, { color: colors.text.white }]}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.text.secondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleNavigateToRegister} disabled={isLoading}>
                <Text style={[styles.registerLink, { color: Colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md3,
    paddingBottom: Spacing.xl,
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
    gap: Spacing.md2,
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
  loginButton: {
    ...Component.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loginButtonText: {
    ...Typography.button,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md2,
  },
  registerText: {
    ...Typography.body,
  },
  registerLink: {
    ...Typography.bodyMedium,
  },
});
