import { StyleSheet } from 'react-native';
import { Spacing } from '../constants/Spacing';

export const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md2,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    // Loading animation can be added here
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    // Handled by color prop
  },
  timeText: {
    textAlign: 'center',
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  timeTextDisabled: {
    // Handled by color prop
  },
});
