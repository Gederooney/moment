import { useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface UseSwipeActionsProps {
  onDelete: () => void;
  onArchive?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  archiveConfirmTitle?: string;
  archiveConfirmMessage?: string;
}

export const useSwipeActions = ({
  onDelete,
  onArchive,
  deleteConfirmTitle = 'Supprimer',
  deleteConfirmMessage = 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  archiveConfirmTitle = 'Archiver',
  archiveConfirmMessage = 'Archiver cet élément ?',
}: UseSwipeActionsProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  const closeSwipe = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      deleteConfirmTitle,
      deleteConfirmMessage,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: closeSwipe,
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onDelete();
            closeSwipe();
          },
        },
      ],
      { cancelable: true }
    );
  }, [onDelete, deleteConfirmTitle, deleteConfirmMessage, closeSwipe]);

  const handleArchive = useCallback(() => {
    if (!onArchive) {
      Alert.alert('Archiver', 'Cette fonctionnalité sera disponible bientôt !', [
        { text: 'OK', onPress: closeSwipe },
      ]);
      return;
    }

    Alert.alert(
      archiveConfirmTitle,
      archiveConfirmMessage,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: closeSwipe,
        },
        {
          text: 'Archiver',
          onPress: () => {
            onArchive();
            closeSwipe();
          },
        },
      ],
      { cancelable: true }
    );
  }, [onArchive, archiveConfirmTitle, archiveConfirmMessage, closeSwipe]);

  return {
    swipeableRef,
    handleDelete,
    handleArchive,
    closeSwipe,
  };
};
