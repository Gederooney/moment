// FICHIER DÉSACTIVÉ - Maintenant remplacé par MomentsContext unifié
// Ce fichier est conservé pour compatibilité mais ne doit plus être utilisé
// Toute nouvelle implémentation doit utiliser useMomentsContext()

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CapturedMoment } from '../types/moment';
import { StorageService } from '../services/storageService';
import { formatTime } from '../utils/time';
import { useMomentsContext } from '../contexts/MomentsContext';

const MOMENTS_STORAGE_KEY = 'captured_moments';

// ANCIEN HOOK - UTILISE MAINTENANT useMomentsContext() PARTOUT
export const useMoments = (videoId: string | null) => {
  console.warn('useMoments is deprecated. Use useMomentsContext() instead.');

  // Wrapper autour du nouveau contexte pour compatibilité
  const { getMomentsForVideo, captureMoment: contextCapture, deleteMomentFromVideo } = useMomentsContext();

  const moments = videoId ? getMomentsForVideo(videoId) : [];
  const [isLoading, setIsLoading] = useState(false);

  // ANCIEN CODE DÉSACTIVÉ - Remplacé par le contexte
  /*
  // Charger les moments depuis AsyncStorage
  useEffect(() => {
    loadMoments();
  }, [videoId]);
  */

  const loadMoments = async () => {
    // Désormais géré par le contexte
    console.warn('loadMoments is deprecated');
  };

  // ANCIEN CODE DÉSACTIVÉ
  /*
  const saveMoments = async (newMoments: CapturedMoment[]) => {
    try {
      // Charger tous les moments existants
      const stored = await AsyncStorage.getItem(MOMENTS_STORAGE_KEY);
      let allMoments: CapturedMoment[] = stored ? JSON.parse(stored) : [];

      // Supprimer les anciens moments de cette vidéo
      allMoments = allMoments.filter(m => m.videoId !== videoId);

      // Ajouter les nouveaux moments
      allMoments = [...allMoments, ...newMoments];

      // Sauvegarder
      await AsyncStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(allMoments));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des moments:', error);
    }
  };
  */

  // WRAPPER pour compatibilité - délègue au contexte
  const captureMoment = async (timestamp: number, duration?: number) => {
    if (!videoId) return;
    console.warn('Using deprecated captureMoment. Use context method instead.');

    // Délègue au contexte unifié
    return await contextCapture(videoId, timestamp, duration);
  };

  // WRAPPER pour compatibilité - délègue au contexte
  const deleteMoment = async (momentId: string) => {
    if (!videoId) return;
    console.warn('Using deprecated deleteMoment. Use context method instead.');

    // Délègue au contexte unifié
    await deleteMomentFromVideo(videoId, momentId);
  };

  // WRAPPER pour compatibilité
  const clearMoments = async () => {
    console.warn('clearMoments is deprecated and no longer needed.');
    // Ne fait plus rien - les moments sont gérés par le contexte
  };

  return {
    moments,
    isLoading,
    captureMoment,
    deleteMoment,
    clearMoments,
    loadMoments,
  };
};