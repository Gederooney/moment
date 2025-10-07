/**
 * RichTextEditor Component
 * Markdown-based rich text editor with floating toolbar
 * Auto-saves after 3 seconds of inactivity
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { debounce } from 'lodash.debounce';

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  darkMode?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Add your notes here...',
  autoFocus = true,
  darkMode = false,
}) => {
  const editor = useEditorBridge({
    autofocus: autoFocus,
    avoidIosKeyboard: true,
    initialContent: value,
  });

  // Debounced auto-save (3 seconds)
  const debouncedOnChange = useRef(
    debounce((markdown: string) => {
      onChange(markdown);
    }, 3000)
  ).current;

  // Update content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getContent()) {
      editor.setContent(value);
    }
  }, [value, editor]);

  // Listen to editor changes
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.subscribeToEditorState(() => {
      const markdown = editor.getContent();
      debouncedOnChange(markdown);
    });

    return () => {
      unsubscribe();
      debouncedOnChange.cancel();
    };
  }, [editor, debouncedOnChange]);

  const handleBold = useCallback(() => {
    editor?.toggleBold();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor?.toggleItalic();
  }, [editor]);

  const handleUnderline = useCallback(() => {
    editor?.toggleUnderline();
  }, [editor]);

  const handleBulletList = useCallback(() => {
    editor?.toggleBulletList();
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    editor?.toggleOrderedList();
  }, [editor]);

  const handleHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.toggleHeading(level);
  }, [editor]);

  if (!editor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <RichText
        editor={editor}
        style={[styles.editor, darkMode && styles.editorDark]}
      />
      <Toolbar
        editor={editor}
        style={[styles.toolbar, darkMode && styles.toolbarDark]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  editor: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  editorDark: {
    color: '#fff',
  },
  toolbar: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toolbarDark: {
    backgroundColor: '#2a2a2a',
    borderTopColor: '#404040',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
