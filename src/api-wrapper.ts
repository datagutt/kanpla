import axios, {Method} from "axios";
import {setupCache} from 'axios-cache-interceptor';

import FirebaseAuthenticator from "./firebase-authenticator";

type ApiWrapperOptions = {
	FIREBASE_API_KEY: string;
	FIREBASE_USERNAME: string;
	FIREBASE_PASSWORD: string;
	API_BASE_URL?: string;
}

export default class ApiWrapper {
	private firebaseAuthenticator: FirebaseAuthenticator;
	private API_BASE_URL: string;
	private instance = setupCache(axios.create());

	constructor({FIREBASE_API_KEY, FIREBASE_USERNAME, FIREBASE_PASSWORD, API_BASE_URL}: ApiWrapperOptions) {
		this.firebaseAuthenticator = new FirebaseAuthenticator({FIREBASE_API_KEY, FIREBASE_USERNAME, FIREBASE_PASSWORD});
		this.API_BASE_URL = API_BASE_URL || 'https://app.kanpla.dk/api/internal/';
	}

	async getPortalToken() {
		return await this.firebaseAuthenticator.getPortalToken();
	}

	getUserId() {
		return this.firebaseAuthenticator.getLocalId();
	}

	async makeApiCall({path, method, data}: {path: string, method: Method, data: unknown}) {
		let token = await this.getPortalToken();
		let headers = {
			"accept": "application/json, text/plain, */*",
			"authorization": `Bearer ${token}`,
			"content-type": "application/json",
			"kanpla-app-env": "PROD",
			"kanpla-auth-provider": "GAuth",
			"kanpla-debug": "true"
		}
		let body = JSON.stringify(data);
		return await this.instance({
			url: this.API_BASE_URL + path,
			method,
			headers,
			data: body
		});
	}
}