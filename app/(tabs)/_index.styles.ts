import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // État Initial
  initialState: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: -0.5,
  },

  // Tabs minimalistes
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  tabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section CTA - Wireframe
  ctaContainer: {
    marginBottom: 24,
  },
  wireframeTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  modernInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '400',
    minHeight: 48,
  },
  inputValid: {
    borderWidth: 2,
  },
  validIndicator: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },

  // 3 icônes musicales - Wireframe
  musicIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  musicIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Moments récents
  recentMomentsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  momentThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  momentTime: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Section Sources supportées
  supportedSourcesContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  supportedSourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  sourcesIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },

  // État Chargement
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Spotify/SoundCloud content
  sourceContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Section header
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // Instructions
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Spotify/SoundCloud non connectés
  notConnectedContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  notConnectedText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Quick Access Spotify/SoundCloud
  quickAccessSection: {
    gap: 12,
    marginBottom: 24,
  },
  quickAccessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  quickAccessItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickAccessItemText: {
    fontSize: 15,
  },
});
