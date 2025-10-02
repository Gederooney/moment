import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { MODAL_HEIGHT } from './AddVideoModal.styles';

export const useAddVideoModal = (
  visible: boolean,
  onClose: () => void,
  onAddVideo: (url: string) => Promise<void> | void
) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setUrl('');
      setError('');
      setIsLoading(false);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const validateYouTubeUrl = (inputUrl: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(&.*)?$/;
    return youtubeRegex.test(inputUrl.trim());
  };

  const handleAddVideo = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Veuillez entrer une URL');
      return;
    }

    if (!validateYouTubeUrl(trimmedUrl)) {
      setError('URL YouTube invalide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onAddVideo(trimmedUrl);
      onClose();
    } catch (err) {
      setError("Erreur lors de l'ajout de la vidéo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleOverlayPress = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    if (error) setError('');
  };

  return {
    url,
    isLoading,
    error,
    slideAnim,
    overlayOpacity,
    handleAddVideo,
    handleClose,
    handleOverlayPress,
    handleUrlChange,
  };
};
