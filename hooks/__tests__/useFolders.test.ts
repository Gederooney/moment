/**
 * Tests for useFolders hook
 * Coverage: hook re-export validation
 */

import { useFolders } from '../useFolders';
import { useFolders as useFoldersFromContext } from '../../contexts/FoldersContext';

describe('useFolders', () => {
  it('should re-export useFolders from FoldersContext', () => {
    expect(useFolders).toBe(useFoldersFromContext);
  });

  it('should be a function', () => {
    expect(typeof useFolders).toBe('function');
  });
});
