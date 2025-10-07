import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const MODAL_HEIGHT = 320;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    ...Typography.body,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 44,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: Spacing.md,
    gap: Spacing.sm2,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});
