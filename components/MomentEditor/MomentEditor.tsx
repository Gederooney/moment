/**
 * MomentEditor Modal Component
 * Modal overlay for editing moment title, notes, and tags
 * Native slide-up animation for better iOS/Android compatibility
 * Video audio continues playing while modal is open
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { CapturedMoment } from '../../types/moment';

interface MomentEditorProps {
  visible: boolean;
  moment?: CapturedMoment | null;
  defaultTitle?: string;
  onSave: (data: { title: string; notes: string; tags: string[] }) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export const MomentEditor: React.FC<MomentEditorProps> = ({
  visible,
  moment,
  defaultTitle = '',
  onSave,
  darkMode = false,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  // Use only moment ID as key (not visible to avoid recreating on open/close)
  const editorKey = moment?.id || 'new';

  // TenTap Editor Bridge
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: moment?.notes || '',
    theme: {
      toolbar: {
        toolbarBody: {
          backgroundColor: darkMode ? '#2a2a2a' : '#f8f8f8',
          borderTopColor: darkMode ? '#404040' : '#d1d1d6',
          borderBottomColor: darkMode ? '#404040' : '#d1d1d6',
        },
        icon: {
          tintColor: darkMode ? '#ffffff' : '#000000',
        },
        iconActive: {
          tintColor: darkMode ? '#5ac8fa' : '#007aff',
        },
        iconDisabled: {
          tintColor: darkMode ? '#666666' : '#cccccc',
        },
        iconWrapperActive: {
          backgroundColor: darkMode ? '#404040' : '#e5e5ea',
          borderRadius: 6,
        },
      },
      webview: {
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      },
    },
  });

  // Update title and content when moment changes
  useEffect(() => {
    if (visible && moment) {
      setTitle(moment.title || defaultTitle);
    } else if (visible && !moment) {
      setTitle(defaultTitle);
    }
  }, [visible, moment?.id, defaultTitle]);

  // Inject CSS to style the editor with sans-serif font, larger text, and reading theme
  useEffect(() => {
    const timer = setTimeout(() => {
      editor.injectCSS(`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
          font-size: 17px !important;
          line-height: 1.6 !important;
          color: ${darkMode ? '#e8e8e8' : '#1a1a1a'} !important;
          padding: 16px !important;
          background-color: ${darkMode ? '#1a1a1a' : '#ffffff'} !important;
        }
        p, div, span, li {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
          font-size: 17px !important;
          line-height: 1.6 !important;
          color: ${darkMode ? '#e8e8e8' : '#1a1a1a'} !important;
        }
        p {
          margin: 0.5em 0 !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
          font-weight: 600 !important;
          color: ${darkMode ? '#ffffff' : '#000000'} !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
        }
        h1 { font-size: 28px !important; }
        h2 { font-size: 24px !important; }
        h3 { font-size: 20px !important; }
        ul, ol {
          padding-left: 24px !important;
        }
        li {
          margin: 0.25em 0 !important;
        }
        a {
          color: ${darkMode ? '#5ac8fa' : '#007aff'} !important;
          text-decoration: none !important;
        }
        blockquote {
          border-left: 3px solid ${darkMode ? '#5ac8fa' : '#007aff'} !important;
          padding-left: 16px !important;
          margin-left: 0 !important;
          color: ${darkMode ? '#b8b8b8' : '#666666'} !important;
          font-style: italic !important;
        }
        code {
          background-color: ${darkMode ? '#2a2a2a' : '#f5f5f5'} !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace !important;
          font-size: 15px !important;
        }
        pre {
          background-color: ${darkMode ? '#2a2a2a' : '#f5f5f5'} !important;
          padding: 12px !important;
          border-radius: 8px !important;
          overflow-x: auto !important;
        }
        pre code {
          background-color: transparent !important;
          padding: 0 !important;
        }
      `);
    }, 500);
    return () => clearTimeout(timer);
  }, [editor, editorKey, darkMode]);

  const handleSave = async () => {
    // Get fresh content from editor
    const editorContent = await editor.getHTML();
    onSave({ title, notes: editorContent || '', tags: [] });
  };

  // Auto-save when modal closes
  const previousVisibleRef = useRef(visible);
  useEffect(() => {
    if (previousVisibleRef.current && !visible) {
      // Modal is closing, save
      handleSave();
    }
    previousVisibleRef.current = visible;
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleSave}
    >
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
        {/* Title Input */}
        <View style={styles.titleSection}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title here"
            placeholderTextColor={darkMode ? '#666' : '#999'}
            style={[styles.titleInput, darkMode && styles.titleInputDark]}
            autoFocus={!moment}
          />
          <View style={[styles.divider, darkMode && styles.dividerDark]} />
        </View>

        {/* Notes Editor */}
        <RichText key={editorKey} editor={editor} />

        {/* Toolbar - Positioned above keyboard and iOS suggestions bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          style={styles.toolbarContainer}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  titleSection: {
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderWidth: 0,
  },
  titleInputDark: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    marginBottom: 16,
  },
  dividerDark: {
    backgroundColor: '#404040',
  },
  toolbarContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
