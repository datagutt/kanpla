const LOGIN_URI =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
const GOOGLE_TOKEN_URI = 'https://securetoken.googleapis.com/v1/token?key=';

import axios from 'axios';

type FirebaseAuthenticatorOptions = {
  FIREBASE_API_KEY: string;
  FIREBASE_USERNAME: string;
  FIREBASE_PASSWORD: string;
};

export default class FirebaseAuthenticator {
  private refreshToken: string;
  private accessToken: string;
  private expiresIn: Date | null;
  private localId: string | null = null;
  private FIREBASE_API_KEY: string;
  private credentials: {email: string; password: string} = {
    email: '',
    password: '',
  };

  constructor(options: FirebaseAuthenticatorOptions) {
    this.refreshToken = '';
    this.accessToken = '';
    this.expiresIn = null;
    this.FIREBASE_API_KEY = options.FIREBASE_API_KEY;
    this.credentials = {
      email: options.FIREBASE_USERNAME,
      password: options.FIREBASE_PASSWORD,
    };
  }

  isDateInThePast(date: Date) {
    const today = new Date();
    return date.getTime() < today.getTime();
  }

  async login() {
    const loginData = {
      returnSecureToken: true,
      email: this.credentials.email,
      password: this.credentials.password,
    };
    const loginResponse = await axios.post(
      LOGIN_URI + this.FIREBASE_API_KEY,
      loginData,
    );
    this.refreshToken = loginResponse.data.refreshToken;
    this.localId = loginResponse.data.localId;
  }

  async loginGoogleApis(): Promise<string> {
    if (this.refreshToken == '') await this.login();

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', this.refreshToken);
    const tokenResponse = await axios.post(
      GOOGLE_TOKEN_URI + this.FIREBASE_API_KEY,
      formData,
    );
    this.accessToken = tokenResponse.data.access_token;
    const d = new Date();
    d.setTime(d.getTime() + tokenResponse.data.expiresIn * 500);
    this.expiresIn = d;
    return this.accessToken;
  }

  async refreshAccessToken(): Promise<string> {
    this.refreshToken = '';
    return await this.loginGoogleApis();
  }

  async getPortalToken(): Promise<string> {
    if (
      this.accessToken == '' ||
      this.expiresIn == null ||
      this.isDateInThePast(this.expiresIn)
    ) {
      console.log(
        `Token expired or doesnt exist. Access Token: ${this.accessToken}, Current Expiration Date: ${this.expiresIn}`,
      );
      this.refreshToken = '';
      return await this.loginGoogleApis();
    } else {
      return this.accessToken;
    }
  }

  public async getTokenDirectly(force = false): Promise<string> {
    let logintoken = force
      ? await this.refreshAccessToken()
      : await this.getPortalToken();
    logintoken = logintoken.replace(/(\r\n|\n|\r)/gm, '');
    return logintoken;
  }

  getLocalId(): string | null {
    return this.localId;
  }
}
