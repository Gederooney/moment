/**
 * RichTextEditor Component
 * Based on @10play/tentap-editor official example
 */

import React, { useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { RichText, Toolbar, useEditorBridge, useEditorContent } from '@10play/tentap-editor';
import { Colors } from '../../constants/Colors';

interface RichTextEditorProps {
  initialValue?: string;
  onContentChange?: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onContentChange,
  placeholder = 'Tapez vos notes ici...',
}) => {
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialValue,
  });

  // Use the official useEditorContent hook to get content
  const content = useEditorContent(editor, { type: 'html' });
  const previousContentRef = useRef<string>(initialValue);

  // Track content changes
  useEffect(() => {
    if (content && content !== previousContentRef.current) {
      previousContentRef.current = content;
      onContentChange?.(content);
    }
  }, [content, onContentChange]);

  return (
    <View style={styles.container}>
      <RichText editor={editor} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  keyboardAvoid: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
