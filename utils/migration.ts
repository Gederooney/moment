// Migration des données de l'ancien système useMoments vers le nouveau système unifié
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CapturedMoment, VideoWithMoments } from '../types/moment';
import { getVideoThumbnail } from './youtube';

const OLD_MOMENTS_KEY = 'captured_moments';
const VIDEO_HISTORY_KEY = '@podcut_video_history';

export interface MigrationResult {
  success: boolean;
  migratedVideos: number;
  migratedMoments: number;
  errors: string[];
}

/**
 * Migre les données de l'ancien système useMoments vers le nouveau système unifié
 */
export const migrateMomentsStorage = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    migratedVideos: 0,
    migratedMoments: 0,
    errors: [],
  };

  try {
    console.log('🔄 Starting moments storage migration...');

    // 1. Lire l'ancien format (useMoments)
    const oldMomentsData = await AsyncStorage.getItem(OLD_MOMENTS_KEY);
    if (!oldMomentsData) {
      console.log('✅ No old moments data found - migration not needed');
      result.success = true;
      return result;
    }

    let oldMoments: CapturedMoment[];
    try {
      oldMoments = JSON.parse(oldMomentsData);
    } catch (parseError) {
      result.errors.push('Failed to parse old moments data');
      return result;
    }

    console.log(`📊 Found ${oldMoments.length} moments to migrate`);

    // 2. Grouper les moments par videoId
    const momentsByVideo = oldMoments.reduce((acc, moment) => {
      if (!moment.videoId) {
        result.errors.push(`Moment ${moment.id} has no videoId - skipping`);
        return acc;
      }

      if (!acc[moment.videoId]) {
        acc[moment.videoId] = [];
      }
      acc[moment.videoId].push(moment);
      return acc;
    }, {} as Record<string, CapturedMoment[]>);

    console.log(`📦 Grouped into ${Object.keys(momentsByVideo).length} videos`);

    // 3. Charger l'historique des vidéos existant
    const existingHistoryData = await AsyncStorage.getItem(VIDEO_HISTORY_KEY);
    let existingVideos: VideoWithMoments[] = [];
    if (existingHistoryData) {
      try {
        existingVideos = JSON.parse(existingHistoryData);
      } catch (parseError) {
        result.errors.push('Failed to parse existing video history');
      }
    }

    // 4. Créer un index des vidéos existantes
    const existingVideoIds = new Set(existingVideos.map(v => v.id));

    // 5. Migrer chaque groupe de moments
    const newVideos: VideoWithMoments[] = [...existingVideos];

    for (const [videoId, videoMoments] of Object.entries(momentsByVideo)) {
      try {
        // Sauvegarder les moments pour cette vidéo
        const momentsKey = `@podcut_moments_${videoId}`;
        await AsyncStorage.setItem(momentsKey, JSON.stringify(videoMoments));

        // Si la vidéo n'existe pas dans l'historique, la créer
        if (!existingVideoIds.has(videoId)) {
          const firstMoment = videoMoments[0];
          const newVideo: VideoWithMoments = {
            id: videoId,
            title: `Vidéo migrée ${videoId}`,
            thumbnail: getVideoThumbnail(videoId),
            url: `https://youtube.com/watch?v=${videoId}`,
            addedAt: firstMoment.createdAt,
            moments: videoMoments,
          };

          newVideos.push(newVideo);
          result.migratedVideos++;
        } else {
          // Mettre à jour la vidéo existante avec les moments
          const existingVideoIndex = newVideos.findIndex(v => v.id === videoId);
          if (existingVideoIndex !== -1) {
            // Merge les moments existants avec les nouveaux (éviter les doublons)
            const existingMoments = newVideos[existingVideoIndex].moments || [];
            const existingMomentIds = new Set(existingMoments.map(m => m.id));
            const newMoments = videoMoments.filter(m => !existingMomentIds.has(m.id));

            newVideos[existingVideoIndex].moments = [...existingMoments, ...newMoments];
          }
        }

        result.migratedMoments += videoMoments.length;
        console.log(`✅ Migrated ${videoMoments.length} moments for video ${videoId}`);

      } catch (error) {
        const errorMsg = `Failed to migrate video ${videoId}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // 6. Sauvegarder l'historique des vidéos mis à jour
    await AsyncStorage.setItem(VIDEO_HISTORY_KEY, JSON.stringify(newVideos));

    // 7. Nettoyer l'ancien stockage (en option - commenté pour sécurité)
    // await AsyncStorage.removeItem(OLD_MOMENTS_KEY);
    console.log('⚠️  Old moments data preserved for safety. Remove manually if migration successful.');

    result.success = true;
    console.log(`🎉 Migration completed successfully!`);
    console.log(`📊 Migrated ${result.migratedVideos} videos and ${result.migratedMoments} moments`);

  } catch (error) {
    const errorMsg = `Migration failed: ${error}`;
    result.errors.push(errorMsg);
    console.error('❌ Migration failed:', error);
  }

  return result;
};

/**
 * Vérifie si une migration est nécessaire
 */
export const isMigrationNeeded = async (): Promise<boolean> => {
  try {
    const oldMomentsData = await AsyncStorage.getItem(OLD_MOMENTS_KEY);
    return !!oldMomentsData;
  } catch (error) {
    console.error('Error checking migration need:', error);
    return false;
  }
};

/**
 * Nettoie les anciennes données après une migration réussie
 */
export const cleanupOldMomentsData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OLD_MOMENTS_KEY);
    console.log('✅ Old moments data cleaned up');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  }
};

/**
 * Rollback de la migration en cas de problème
 */
export const rollbackMigration = async (): Promise<void> => {
  try {
    console.log('🔄 Rolling back migration...');

    // Cette fonction peut être implémentée si nécessaire
    // pour restaurer l'état précédent en cas de problème

    console.log('⚠️  Manual rollback required - restore from backup if available');
  } catch (error) {
    console.error('Error during rollback:', error);
    throw error;
  }
};