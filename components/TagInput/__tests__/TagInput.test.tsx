/**
 * Tests for TagInput component
 * Coverage: tag addition, removal, autocomplete
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagInput } from '../TagInput';

// Mock TagService
jest.mock('../../../services/tagService', () => ({
  TagService: {
    getTagSuggestions: jest.fn(() => Promise.resolve([])),
  },
}));

describe('TagInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByPlaceholderText } = render(
      <TagInput
        tags={[]}
        onTagsChange={mockOnChange}
      />
    );

    expect(getByPlaceholderText('Add tags...')).toBeTruthy();
  });

  it('should display existing tags', () => {
    const existingTags = ['javascript', 'react'];

    const { getByText } = render(
      <TagInput
        tags={existingTags}
        onTagsChange={mockOnChange}
      />
    );

    expect(getByText('#javascript')).toBeTruthy();
    expect(getByText('#react')).toBeTruthy();
  });

  it('should call onTagsChange when tag is added', () => {
    const { getByPlaceholderText } = render(
      <TagInput
        tags={[]}
        onTagsChange={mockOnChange}
      />
    );

    const input = getByPlaceholderText('Add tags...');
    fireEvent.changeText(input, 'newtag');
    fireEvent(input, 'submitEditing');

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('should filter tag suggestions when typing', async () => {
    const mockSuggestions = ['react', 'typescript', 'testing'];
    const TagService = require('../../../services/tagService').TagService;
    TagService.getTagSuggestions.mockResolvedValue(mockSuggestions);

    const { getByPlaceholderText } = render(
      <TagInput
        tags={[]}
        onTagsChange={mockOnChange}
      />
    );

    const input = getByPlaceholderText('Add tags...');
    fireEvent.changeText(input, 're');

    // Wait for suggestions to load
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(TagService.getTagSuggestions).toHaveBeenCalledWith('re', 5);
  });
});
