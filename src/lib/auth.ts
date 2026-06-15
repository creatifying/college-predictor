export async function generateAuthToken(): Promise<string> {

  const keyChars = [99, 111, 108, 108, 101, 103, 101, 95, 112, 114, 101, 100, 105, 99, 116, 111, 114, 95, 115, 101, 99, 117, 114, 101, 95, 116, 111, 107, 101, 110, 95, 97, 98, 99, 49, 50, 51];
  const secret = String.fromCharCode(...keyChars);

  // 5-minute time window (300,000 milliseconds)
  const windowTime = Math.floor(Date.now() / 300000).toString();

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(windowTime);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `${windowTime}.${signatureHex}`;
}

export async function getAESKey(windowStr: string): Promise<CryptoKey> {

  const keyChars = [99, 111, 108, 108, 101, 103, 101, 95, 112, 114, 101, 100, 105, 99, 116, 111, 114, 95, 115, 101, 99, 117, 114, 101, 95, 116, 111, 107, 101, 110, 95, 97, 98, 99, 49, 50, 51];
  const secret = String.fromCharCode(...keyChars);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(windowStr);

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const keyMaterial = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    messageData
  );

  return await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function decryptData(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const iv = new Uint8Array(
    atob(ivBase64).split("").map(c => c.charCodeAt(0))
  );
  const ciphertext = new Uint8Array(
    atob(ciphertextBase64).split("").map(c => c.charCodeAt(0))
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
