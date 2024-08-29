import axios, {Method} from 'axios';
import {setupCache} from 'axios-cache-interceptor';

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
      accept: 'application/json, text/plain, */*',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'kanpla-app-env': 'PROD',
      'kanpla-auth-provider': 'GAuth',
      'kanpla-debug': 'true',
    };
    const body = JSON.stringify(data);
    return await this.instance({
      url: this.API_BASE_URL + path,
      method,
      headers,
      data: body,
    });
  }
}
