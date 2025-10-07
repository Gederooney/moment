/**
 * MomentEditor Modal Component
 * Modal overlay for editing moment title, notes, and tags
 * Slide-up animation, glassmorphism effect
 * Video audio continues playing while modal is open
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { RichTextEditor } from '../RichTextEditor';
import { TagInput } from '../TagInput';
import { Moment } from '../../types/moment';

interface MomentEditorProps {
  visible: boolean;
  moment?: Moment | null;
  defaultTitle?: string;
  onSave: (data: { title: string; notes: string; tags: string[] }) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MomentEditor: React.FC<MomentEditorProps> = ({
  visible,
  moment,
  defaultTitle = '',
  onSave,
  onCancel,
  darkMode = false,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Initialize form data when moment changes
  useEffect(() => {
    if (moment) {
      setTitle(moment.title || defaultTitle);
      setNotes(moment.notes || '');
      setTags(moment.tags || []);
    } else {
      setTitle(defaultTitle);
      setNotes('');
      setTags([]);
    }
  }, [moment, defaultTitle]);

  // Slide-up animation on open
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSave = () => {
    onSave({ title, notes, tags });
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            darkMode && styles.containerDark,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
                {moment ? 'Edit Moment' : 'New Moment'}
              </Text>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text style={[styles.label, darkMode && styles.labelDark]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Moment title..."
                placeholderTextColor={darkMode ? '#666' : '#999'}
                style={[styles.titleInput, darkMode && styles.titleInputDark]}
                autoFocus={!moment}
              />
            </View>

            {/* Notes Editor */}
            <View style={[styles.section, styles.editorSection]}>
              <Text style={[styles.label, darkMode && styles.labelDark]}>Notes</Text>
              <View style={styles.editorContainer}>
                <RichTextEditor
                  value={notes}
                  onChange={setNotes}
                  placeholder="Add your notes..."
                  autoFocus={false}
                  darkMode={darkMode}
                />
              </View>
            </View>

            {/* Tags Input */}
            <View style={styles.section}>
              <Text style={[styles.label, darkMode && styles.labelDark]}>Tags</Text>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tags..."
                darkMode={darkMode}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  editorSection: {
    flex: 1,
    minHeight: 200,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  labelDark: {
    color: '#999',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  titleInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
    color: '#fff',
  },
  editorContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
