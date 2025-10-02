/**
 * Service d'authentification Spotify OAuth 2.0 avec PKCE
 * Implémente le flux Authorization Code avec PKCE pour sécurité mobile
 */

import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { SecureStorage } from '../SecureStorage';
import { Logger } from '../../logger/Logger';
import { SpotifyTokens, SpotifyAuthConfig } from './types';

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const discovery = {
  authorizationEndpoint: SPOTIFY_AUTH_ENDPOINT,
  tokenEndpoint: SPOTIFY_TOKEN_ENDPOINT,
};

export class SpotifyAuth {
  private static instance: SpotifyAuth;
  private config: SpotifyAuthConfig;

  private constructor(config: SpotifyAuthConfig) {
    this.config = config;
  }

  static getInstance(config: SpotifyAuthConfig): SpotifyAuth {
    if (!SpotifyAuth.instance) {
      SpotifyAuth.instance = new SpotifyAuth(config);
    }
    return SpotifyAuth.instance;
  }

  private async generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const verifier = this.base64URLEncode(
      Array.from(randomBytes, (byte) => String.fromCharCode(byte)).join('')
    );
    Logger.debug('SpotifyAuth.generateCodeVerifier', 'Generated code verifier');
    return verifier;
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    const challenge = this.base64URLEncode(hash);
    Logger.debug('SpotifyAuth.generateCodeChallenge', 'Generated code challenge');
    return challenge;
  }

  private base64URLEncode(str: string): string {
    return str
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async authenticate(): Promise<SpotifyTokens> {
    try {
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      const authUrl = this.buildAuthUrl(codeChallenge);
      Logger.info('SpotifyAuth.authenticate', 'Starting OAuth flow');

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.config.redirectUri
      );

      if (result.type !== 'success') {
        throw new Error(`Auth failed: ${result.type}`);
      }

      const url = result.url;
      const params = new URLSearchParams(url.split('?')[1]);
      const code = params.get('code');

      if (!code) {
        throw new Error('No authorization code received');
      }

      const tokens = await this.exchangeCodeForToken(code, codeVerifier);
      await this.saveTokens(tokens);
      Logger.info('SpotifyAuth.authenticate', 'Authentication successful');
      return tokens;
    } catch (error) {
      Logger.error('SpotifyAuth.authenticate', error as Error);
      throw error;
    }
  }

  private buildAuthUrl(codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: this.config.scopes.join(' '),
    });
    return `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
  }

  private async exchangeCodeForToken(
    code: string,
    verifier: string
  ): Promise<SpotifyTokens> {
    try {
      const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          code_verifier: verifier,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      Logger.error('SpotifyAuth.exchangeCodeForToken', error as Error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<SpotifyTokens> {
    try {
      const refreshToken = await SecureStorage.getItem('spotify_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const tokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      await this.saveTokens(tokens);
      Logger.info('SpotifyAuth.refreshAccessToken', 'Token refreshed');
      return tokens;
    } catch (error) {
      Logger.error('SpotifyAuth.refreshAccessToken', error as Error);
      throw error;
    }
  }

  async getValidAccessToken(): Promise<string> {
    try {
      const token = await SecureStorage.getItem('spotify_access_token');
      const expiry = await SecureStorage.getItem('spotify_token_expiry');

      if (!token || !expiry) {
        throw new Error('No tokens found. Please authenticate.');
      }

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      if (now >= expiryTime - 60000) {
        const tokens = await this.refreshAccessToken();
        return tokens.accessToken;
      }

      return token;
    } catch (error) {
      Logger.error('SpotifyAuth.getValidAccessToken', error as Error);
      throw error;
    }
  }

  private async saveTokens(tokens: SpotifyTokens): Promise<void> {
    await SecureStorage.setItem('spotify_access_token', tokens.accessToken);
    await SecureStorage.setItem('spotify_refresh_token', tokens.refreshToken);
    await SecureStorage.setItem('spotify_token_expiry', tokens.expiresAt.toString());
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStorage.getItem('spotify_access_token');
    return !!token;
  }

  async logout(): Promise<void> {
    await SecureStorage.clear();
    Logger.info('SpotifyAuth.logout', 'User logged out');
  }
}
