import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { formatBytes, calculateStoragePercentage, getStorageWarningLevel, getStorageWarningColor } from '../utils/storage';

interface StorageIndicatorProps {
  used: number;
  total: number;
  label: string;
}

export const StorageIndicator: React.FC<StorageIndicatorProps> = ({
  used,
  total,
  label,
}) => {
  const percentage = calculateStoragePercentage(used, total);
  const warningLevel = getStorageWarningLevel(percentage);
  const color = getStorageWarningColor(warningLevel);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.usage}>
          {formatBytes(used)} {total > 0 && `/ ${formatBytes(total)}`}
        </Text>
      </View>

      {total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: color },
              ]}
            />
          </View>
          <Text style={[styles.percentage, { color }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  usage: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
});