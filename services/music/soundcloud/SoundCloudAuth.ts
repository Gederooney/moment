/**
 * Service d'authentification SoundCloud avec OAuth 2.1 PKCE
 */

import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { makeRedirectUri } from 'expo-auth-session';
import axios from 'axios';
import { Logger } from '../../logger/Logger';
import { SecureStorage } from '../common/SecureStorage';
import { OAuthTokens, MusicServiceError } from '../common/types';
import { SoundCloudTokenResponse } from './types';

const CONTEXT = 'SoundCloudAuth';

const SOUNDCLOUD_AUTH_ENDPOINT = 'https://secure.soundcloud.com/connect';
const SOUNDCLOUD_TOKEN_ENDPOINT = 'https://api.soundcloud.com/oauth2/token';

export class SoundCloudAuth {
  private static clientId: string;
  private static clientSecret?: string;
  private static redirectUri: string;
  private static scopes = ['non-expiring'];

  /**
   * Initialise les configurations SoundCloud
   */
  static configure(
    clientId: string,
    clientSecret?: string,
    redirectUri?: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri =
      redirectUri || makeRedirectUri({ scheme: 'podcut', path: 'callback' });
    Logger.info(CONTEXT, 'SoundCloud configured', {
      clientId: clientId.substring(0, 8) + '...',
      redirectUri: this.redirectUri,
    });
  }

  /**
   * Génère un code verifier pour PKCE
   */
  private static async generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const base64 = Crypto.digest(
      Crypto.CryptoDigestAlgorithm.SHA256,
      randomBytes
    );
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
          'SoundCloud not configured',
          'NOT_CONFIGURED',
          'soundcloud'
        );
      }

      Logger.info(CONTEXT, 'Starting OAuth flow');

      // Génération PKCE
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Configuration de la requête OAuth
      const discovery = {
        authorizationEndpoint: SOUNDCLOUD_AUTH_ENDPOINT,
        tokenEndpoint: SOUNDCLOUD_TOKEN_ENDPOINT,
      };

      const request = new AuthSession.AuthRequest({
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        scopes: this.scopes,
        usePKCE: true,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        throw new MusicServiceError(
          'Authentication cancelled',
          'AUTH_CANCELLED',
          'soundcloud'
        );
      }

      // Échange du code contre des tokens
      const tokens = await this.exchangeCodeForTokens(
        result.params.code,
        codeVerifier
      );

      await SecureStorage.saveTokens('soundcloud', tokens);
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
      const params: any = {
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: verifier,
      };

      // Client secret optionnel pour PKCE
      if (this.clientSecret) {
        params.client_secret = this.clientSecret;
      }

      const response = await axios.post<SoundCloudTokenResponse>(
        SOUNDCLOUD_TOKEN_ENDPOINT,
        new URLSearchParams(params).toString(),
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
        'soundcloud',
        error
      );
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  static async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const params: any = {
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };

      if (this.clientSecret) {
        params.client_secret = this.clientSecret;
      }

      const response = await axios.post<SoundCloudTokenResponse>(
        SOUNDCLOUD_TOKEN_ENDPOINT,
        new URLSearchParams(params).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const tokens = this.mapTokenResponse(response.data);
      await SecureStorage.saveTokens('soundcloud', tokens);
      Logger.info(CONTEXT, 'Token refreshed');

      return tokens;
    } catch (error) {
      Logger.error(CONTEXT, 'Token refresh failed', error);
      throw new MusicServiceError(
        'Failed to refresh token',
        'TOKEN_REFRESH_FAILED',
        'soundcloud',
        error
      );
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  static async logout(): Promise<void> {
    try {
      await SecureStorage.deleteTokens('soundcloud');
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
    return SecureStorage.getTokens('soundcloud');
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }

  /**
   * Convertit la réponse SoundCloud en OAuthTokens
   */
  private static mapTokenResponse(
    response: SoundCloudTokenResponse
  ): OAuthTokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      tokenType: response.token_type,
      scope: response.scope,
    };
  }
}
