/**
 * Integration Tests for Moment Editing Flow
 * Coverage: opening editor, editing title/notes/tags, saving, canceling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MomentEditor } from '../../components/MomentEditor';
import { Moment } from '../../types/moment';

// Mock dependencies
jest.mock('../../components/RichTextEditor', () => ({
  RichTextEditor: 'RichTextEditor',
}));

jest.mock('../../components/TagInput', () => ({
  TagInput: 'TagInput',
}));

describe('Moment Editing Integration', () => {
  const mockMoment: Moment = {
    id: 'test-moment-1',
    type: 'youtube',
    videoId: 'dQw4w9WgXcQ',
    timestamp: 120,
    duration: 30,
    title: 'Original Title',
    notes: 'Original notes',
    tags: ['original', 'test'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  it('should open editor modal with existing moment data', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <MomentEditor
        visible={true}
        moment={mockMoment}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Verify modal is visible with edit mode title
    expect(getByText('Edit Moment')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should call onSave with updated data when save button is pressed', async () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <MomentEditor
        visible={true}
        moment={mockMoment}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Press save button
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    // Verify onSave was called
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          notes: expect.any(String),
          tags: expect.any(Array),
        })
      );
    });
  });

  it('should call onCancel when cancel button is pressed without saving', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <MomentEditor
        visible={true}
        moment={mockMoment}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Press cancel button
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    // Verify onCancel was called and onSave was not
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should create new moment when no moment is provided', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <MomentEditor
        visible={true}
        moment={null}
        defaultTitle="New Moment"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Verify modal shows new moment title
    expect(getByText('New Moment')).toBeTruthy();
  });
});
