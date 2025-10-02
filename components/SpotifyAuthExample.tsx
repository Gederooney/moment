/**
 * Exemple de composant pour tester l'authentification Spotify
 * A utiliser comme référence pour l'intégration
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSpotify } from '../hooks/useSpotify';

export const SpotifyAuthExample: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    isPremium,
    userProfile,
    login,
    logout,
    search,
  } = useSpotify();

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSearch = async () => {
    const results = await search('The Beatles');
    setSearchResults(results.slice(0, 5));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Integration Test</Text>

      {!isAuthenticated ? (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login with Spotify</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.userInfo}>
            <Text style={styles.label}>User: {userProfile?.display_name}</Text>
            <Text style={styles.label}>Email: {userProfile?.email}</Text>
            <Text style={styles.label}>
              Account: {isPremium ? 'Premium' : 'Free'}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search "The Beatles"</Text>
          </TouchableOpacity>

          {searchResults.length > 0 && (
            <View style={styles.results}>
              <Text style={styles.label}>Results:</Text>
              {searchResults.map((track, index) => (
                <Text key={index} style={styles.track}>
                  {track.name} - {track.artists[0].name}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    marginVertical: 5,
  },
  results: {
    marginTop: 20,
  },
  track: {
    fontSize: 12,
    marginVertical: 3,
    color: '#666',
  },
});
