/**
 * Service d'authentification Spotify avec OAuth PKCE
 */

import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import axios from 'axios';
import { Logger } from '../../logger/Logger';
import { SecureStorage } from '../common/SecureStorage';
import { OAuthTokens, MusicServiceError } from '../common/types';
import { SpotifyTokenResponse } from './types';
import env from '../../../config/environment';

// CRITICAL: This allows expo-auth-session to automatically close the WebView
WebBrowser.maybeCompleteAuthSession();

const CONTEXT = 'SpotifyAuth';

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export class SpotifyAuth {
  private static clientId: string;
  private static redirectUri: string;
  private static scopes = [
    'user-read-private',
    'user-read-email',
    'streaming',
    'user-modify-playback-state',
    'user-read-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
  ];

  /**
   * Initialise les configurations Spotify
   */
  static configure(clientId: string, redirectUri?: string) {
    this.clientId = clientId;
    this.redirectUri =
      redirectUri || makeRedirectUri({ scheme: 'podcut', path: 'callback' });
    Logger.info(CONTEXT, 'Spotify configured', {
      clientId: clientId.substring(0, 8) + '...',
      redirectUri: this.redirectUri,
    });
  }

  /**
   * Génère un code verifier pour PKCE
   */
  private static async generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    // Convert Uint8Array to base64 using native JS
    const base64 = btoa(String.fromCharCode(...randomBytes));
    // Convert to base64url format
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Génère un code challenge à partir du verifier
   */
  private static async generateCodeChallenge(
    verifier: string
  ): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Lance le flow OAuth avec PKCE
   */
  static async login(): Promise<OAuthTokens> {
    try {
      if (!this.clientId) {
        throw new MusicServiceError(
          'Spotify not configured',
          'NOT_CONFIGURED',
          'spotify'
        );
      }

      Logger.info(CONTEXT, 'Starting OAuth flow');

      // Génération PKCE
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Save code verifier for later use
      // Store temporarily in memory (could also use SecureStore)
      (global as any).__spotify_code_verifier = codeVerifier;

      // Build authorization URL manually
      const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('scope', this.scopes.join(' '));
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      // Generate state for security
      const state = await this.generateCodeVerifier();
      authUrl.searchParams.set('state', state);

      Logger.info(CONTEXT, 'Opening auth session', { url: authUrl.toString() });

      // Use WebBrowser.openAuthSessionAsync instead of AuthRequest
      // IMPORTANT: The second parameter should be the FINAL redirect URL
      // Dynamically determine the redirect URL based on environment
      const finalRedirectUrl = __DEV__
        ? env.EXPO_REDIRECT_URI  // Use environment variable for dev
        : this.redirectUri;       // Use configured redirect URI for production

      Logger.info(CONTEXT, 'Expecting final redirect to:', finalRedirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        finalRedirectUrl
      );

      if (result.type !== 'success') {
        throw new MusicServiceError(
          'Authentication cancelled',
          'AUTH_CANCELLED',
          'spotify'
        );
      }

      // Parse the callback URL to get the code
      const callbackUrl = new URL(result.url);
      const code = callbackUrl.searchParams.get('code');
      const returnedState = callbackUrl.searchParams.get('state');
      const error = callbackUrl.searchParams.get('error');

      if (error) {
        throw new MusicServiceError(
          `Authentication error: ${error}`,
          'AUTH_ERROR',
          'spotify'
        );
      }

      if (!code) {
        throw new MusicServiceError(
          'No authorization code received',
          'NO_CODE',
          'spotify'
        );
      }

      // Retrieve code verifier
      const savedVerifier = (global as any).__spotify_code_verifier;
      if (!savedVerifier) {
        throw new MusicServiceError(
          'Code verifier lost',
          'VERIFIER_LOST',
          'spotify'
        );
      }

      // Échange du code contre des tokens
      const tokens = await this.exchangeCodeForTokens(code, savedVerifier);

      // Clean up
      delete (global as any).__spotify_code_verifier;

      await SecureStorage.saveTokens('spotify', tokens);
      Logger.info(CONTEXT, 'Login successful');

      return tokens;
    } catch (error) {
      Logger.error(CONTEXT, 'Login failed', error);
      throw error;
    }
  }

  /**
   * Échange le code d'autorisation contre des tokens
   */
  private static async exchangeCodeForTokens(
    code: string,
    verifier: string
  ): Promise<OAuthTokens> {
    try {
      const response = await axios.post<SpotifyTokenResponse>(
        SPOTIFY_TOKEN_ENDPOINT,
        new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          code_verifier: verifier,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      return this.mapTokenResponse(response.data);
    } catch (error) {
      Logger.error(CONTEXT, 'Token exchange failed', error);
      throw new MusicServiceError(
        'Failed to exchange code',
        'TOKEN_EXCHANGE_FAILED',
        'spotify',
        error
      );
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  static async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post<SpotifyTokenResponse>(
        SPOTIFY_TOKEN_ENDPOINT,
        new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const tokens = this.mapTokenResponse(response.data);
      await SecureStorage.saveTokens('spotify', tokens);
      Logger.info(CONTEXT, 'Token refreshed');

      return tokens;
    } catch (error) {
      Logger.error(CONTEXT, 'Token refresh failed', error);
      throw new MusicServiceError(
        'Failed to refresh token',
        'TOKEN_REFRESH_FAILED',
        'spotify',
        error
      );
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  static async logout(): Promise<void> {
    try {
      await SecureStorage.deleteTokens('spotify');
      Logger.info(CONTEXT, 'Logout successful');
    } catch (error) {
      Logger.error(CONTEXT, 'Logout failed', error);
      throw error;
    }
  }

  /**
   * Récupère les tokens actuels
   */
  static async getTokens(): Promise<OAuthTokens | null> {
    return SecureStorage.getTokens('spotify');
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }

  /**
   * Convertit la réponse Spotify en OAuthTokens
   */
  private static mapTokenResponse(response: SpotifyTokenResponse): OAuthTokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      tokenType: response.token_type,
      scope: response.scope,
    };
  }
}
