import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
  },
  bottomSheet: {
    height: 320,
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.medium,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 44,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.light,
  },
  inputValid: {
    borderColor: Colors.success,
    backgroundColor: Colors.background.white,
  },
  inputInvalid: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
