// credentialVault.js
//
// Client-side helper for storing a small number of "remembered" login
// credentials in an encrypted form instead of plain text.
//
// How it works
// ------------
// 1. On first use, we generate an AES-GCM key with the Web Crypto API and
//    mark it non-extractable, then persist the CryptoKey object itself
//    (not its raw bytes) in IndexedDB. Because it's non-extractable, no
//    script - not even this app's own code - can ever read the raw key
//    bytes back out; it can only be *used* via crypto.subtle.encrypt/decrypt.
// 2. Whatever we want to remember (the password) is encrypted with that
//    key before it's written to localStorage, and decrypted with it when
//    read back.
//
// What this protects against
// ---------------------------
// - Someone glancing at Application > Local Storage in devtools and seeing
//   a plaintext password.
// - A generic "dump everything in localStorage" script/extension, since the
//   stored blob is useless without the (non-extractable) key.
//
// What this does NOT protect against
// -----------------------------------
// - A genuine XSS vulnerability in this app: malicious code running with
//   the page's own script privileges can call crypto.subtle.decrypt() the
//   same way this app does. No purely client-side scheme can defend
//   against that - only avoiding client-side password storage entirely
//   (e.g. relying on the browser's own built-in password manager instead,
//   via autoComplete="current-password") removes that risk completely.
//
// Bottom line: this raises the bar well above plaintext storage, but it is
// still weaker than not storing the password in the app at all.

const DB_NAME = "knowgap-vault";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const KEY_ID = "remember-me-key";

function openVaultDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStoredKey(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY_ID);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function putStoredKey(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(key, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateKey() {
  const db = await openVaultDb();
  const existing = await getStoredKey(db);
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, 
    ["encrypt", "decrypt"]
  );
  await putStoredKey(db, key);
  return key;
}

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export async function encryptForStorage(plaintext) {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${toBase64(iv)}.${toBase64(ciphertext)}`;
}

export async function decryptFromStorage(stored) {
  if (!stored) return null;
  const [ivB64, ciphertextB64] = stored.split(".");
  if (!ivB64 || !ciphertextB64) return null;

  try {
    const key = await getOrCreateKey();
    const iv = fromBase64(ivB64);
    const ciphertext = fromBase64(ciphertextB64);
    const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plainBuffer);
  } catch (err) {
    console.warn("[credentialVault] could not decrypt remembered password:", err);
    return null;
  }
}
