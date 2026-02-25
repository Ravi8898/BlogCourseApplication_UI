import * as CryptoJS from 'crypto-js';

const SECRET_KEY = "MY_KEY_AMXBLOGAP"; 

export function encryptPassword(password: string): string {

  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

  const encrypted = CryptoJS.AES.encrypt(
    password,
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return encrypted.toString(); // Base64
}


