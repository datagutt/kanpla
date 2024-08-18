const LOGIN_URI = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="
const GOOGLE_TOKEN_URI = "https://securetoken.googleapis.com/v1/token?key="

import axios from 'axios';

type FirebaseAuthenticatorOptions = {
	FIREBASE_API_KEY: string;
	FIREBASE_USERNAME: string;
	FIREBASE_PASSWORD: string;
}

export default class FirebaseAuthenticator {
	private refreshToken: string;
	private accessToken: string;
	private expiresIn: Date | null;
	private localId: string | null = null;
	private FIREBASE_API_KEY: string;
	private credentials: {email: string, password: string} = {email: "", password: ""};

	constructor(options: FirebaseAuthenticatorOptions) {
		this.refreshToken = "";
		this.accessToken = "";
		this.expiresIn = null;
		this.FIREBASE_API_KEY = options.FIREBASE_API_KEY;
		this.credentials = {email: options.FIREBASE_USERNAME, password: options.FIREBASE_PASSWORD};
	}

	isDateInThePast(date: Date) {
		const today = new Date();
		return date.getTime() < today.getTime();
	}

	async login() {
		let loginData = {
			"returnSecureToken": true,
			"email": this.credentials.email,
			"password": this.credentials.password
		}
		let loginResponse = await axios.post(LOGIN_URI + this.FIREBASE_API_KEY, loginData);
		this.refreshToken = loginResponse.data.refreshToken;
		this.localId = loginResponse.data.localId;
	}

	async loginGoogleApis() {
		if (this.refreshToken == "")
			await this.login();

		let formData = new URLSearchParams()
		formData.append("grant_type", "refresh_token")
		formData.append("refresh_token", this.refreshToken)
		let tokenResponse = await axios.post(GOOGLE_TOKEN_URI + this.FIREBASE_API_KEY, formData);
		this.accessToken = tokenResponse.data.access_token
		let d = new Date();
		d.setTime(d.getTime() + (tokenResponse.data.expiresIn * 500));
		this.expiresIn = d;
		return this.accessToken
	}

	async refreshAccessToken() {
		this.refreshToken = "";
		return await this.loginGoogleApis();
	}

	async getPortalToken() {
		if (this.accessToken == "" || this.expiresIn == null || this.isDateInThePast(this.expiresIn)) {
			console.log(`Token expired or doesnt exist. Access Token: ${this.accessToken}, Current Expiration Date: ${this.expiresIn}`);
			this.refreshToken = "";
			return await this.loginGoogleApis()
		} else {
			return this.accessToken;
		}
	}

	public async getTokenDirectly(force = false) {
		let logintoken = force ? await this.refreshAccessToken() : await this.getPortalToken();
		logintoken = logintoken.replace(/(\r\n|\n|\r)/gm, "");
		return logintoken;
	}

	getLocalId() {
		return this.localId;
	}
}