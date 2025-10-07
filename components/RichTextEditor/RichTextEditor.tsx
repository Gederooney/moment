/**
 * RichTextEditor Component
 * Based on @10play/tentap-editor official implementation
 * Provides a rich text editing experience with toolbar above keyboard
 */

import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { RichText, Toolbar, useEditorBridge, useEditorContent } from '@10play/tentap-editor';

interface RichTextEditorProps {
  initialValue?: string;
  onContentChange?: (html: string) => void;
  placeholder?: string;
  darkMode?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onContentChange,
  placeholder = 'Start taking notes here...',
  darkMode = false,
}) => {
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialValue || '',
    theme: {
      toolbar: darkMode
        ? {
            toolbarBody: {
              backgroundColor: '#2a2a2a',
              borderTopColor: '#404040',
              borderBottomColor: '#404040',
            },
          }
        : undefined,
      webview: {
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      },
    },
  });

  // Get content changes
  const content = useEditorContent(editor, { type: 'html' });
  const previousContentRef = useRef<string>(initialValue);

  // Track content changes and notify parent
  useEffect(() => {
    if (content && content !== previousContentRef.current) {
      previousContentRef.current = content;
      onContentChange?.(content);
    }
  }, [content, onContentChange]);

  return (
    <>
      <RichText editor={editor} style={styles.richText} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  richText: {
    flex: 1,
  },
  keyboardAvoid: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
