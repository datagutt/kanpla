import axios, { type Method } from 'axios';
import { setupCache } from 'axios-cache-interceptor';

import FirebaseAuthenticator from './firebase-authenticator.js';

type ApiWrapperOptions = {
  FIREBASE_API_KEY: string;
  FIREBASE_USERNAME: string;
  FIREBASE_PASSWORD: string;
  API_BASE_URL?: string;
};

export class ApiWrapper {
  private firebaseAuthenticator: FirebaseAuthenticator;
  private API_BASE_URL: string;
  private instance = setupCache(
    axios.create({
      adapter: 'fetch',
      withCredentials: true,
    }),
  );

  constructor({
    FIREBASE_API_KEY,
    FIREBASE_USERNAME,
    FIREBASE_PASSWORD,
    API_BASE_URL,
  }: ApiWrapperOptions) {
    this.firebaseAuthenticator = new FirebaseAuthenticator({
      FIREBASE_API_KEY,
      FIREBASE_USERNAME,
      FIREBASE_PASSWORD,
    });
    this.API_BASE_URL = API_BASE_URL || 'https://app.kanpla.dk/api/internal/';
  }

  async getPortalToken(): Promise<string> {
    return await this.firebaseAuthenticator.getPortalToken();
  }

  async getTokenDirectly(): Promise<string> {
    return await this.firebaseAuthenticator.getTokenDirectly(true);
  }

  getUserId(): string {
    return this.firebaseAuthenticator.getLocalId();
  }

  async makeApiCall({
    path,
    method,
    data,
  }: {
    path: string;
    method: Method;
    data: unknown;
  }) {
    const token = await this.getPortalToken();
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      accept: 'application/json, text/plain, */*',
      'accept-language':
        'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'kanpla-app-env': 'PROD',
      'kanpla-auth-provider': 'GAuth',
      'kanpla-debug': 'true',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      expires: '0',
      referer: 'https://app.kanpla.dk/app',
      origin: 'https://app.kanpla.dk',
    };
    const body = JSON.stringify(data);
    return await this.instance({
      url: this.API_BASE_URL + path,
      method,
      headers,
      data: body,
      transformRequest: [(d) => d],
    });
  }
}
