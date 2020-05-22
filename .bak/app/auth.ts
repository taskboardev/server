import admin, { ServiceAccount } from 'firebase-admin';
import axios from 'axios';

export class FirebaseAuth {
  client: admin.auth.Auth;
  apiKey: string;

  constructor(configPath: ServiceAccount, databaseURL: string, apiKey: string) {
    this.client = admin.initializeApp({
      credential: admin.credential.cert(configPath),
      databaseURL,
    }).auth();
    this.apiKey = apiKey;
  }

  async authenticateRequestor(idToken: string) {
    try {
      const decoded = await this.client.verifyIdToken(idToken);
      return decoded.uid;
    } catch (error) {
      throw new Error(`invalid token: ${error}`);
    }
  }

  async createUser(email: string, password: string) {
    const { uid } = await this.client.createUser({ email, password });
    return uid;
  }

  async obtainIdTokenFromCustomToken(uid: string) {
    const token = await this.client.createCustomToken(uid);

    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${this.apiKey}`;

    try {
      const response = await axios.post(url, { token, returnSecureToken: true });
      return response.data.idToken;
    } catch (error) {
      throw new Error(`failed to obtain idToken from customToken: ${error.message}`);
    }
  };
}





