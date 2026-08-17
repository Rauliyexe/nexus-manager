/**
 * ============================================================================
 * NEXUS MANAGER — CRYPTOGRAPHY ABSTRACTION LAYER (ENCRYPT)
 * ============================================================================
 * WebCrypto AES-GCM 256-bit with IV payload embedding
 */

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  version: string;
  isEncrypted: boolean;
}

const PROTOTYPE_PRE_SHARED_KEY = 'NEXUS_ENTERPRISE_KEY_V1';

/**
 * Derives a WebCrypto CryptoKey from a secret string using PBKDF2
 */
async function getSubtleCryptoKey(secret: string): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('WebCrypto API is not available in this environment');
  }

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('NEXUS_SALT_2026'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a message string using WebCrypto AES-GCM 256-bit
 * Embeds 12-byte IV directly into the combined payload for standalone decryption
 */
export async function encryptMessage(
  plainText: string,
  conversationId?: string
): Promise<EncryptedPayload> {
  // System messages and empty strings skip client encryption
  if (!plainText || plainText.startsWith('[SISTEMA') || plainText.startsWith('🔔') || plainText.startsWith('━━━━━━━━')) {
    return {
      ciphertext: plainText,
      iv: '',
      version: 'raw-v1',
      isEncrypted: false,
    };
  }

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const secret = conversationId ? `${PROTOTYPE_PRE_SHARED_KEY}_${conversationId}` : PROTOTYPE_PRE_SHARED_KEY;
      const key = await getSubtleCryptoKey(secret);
      const encoder = new TextEncoder();
      const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes },
        key,
        encoder.encode(plainText)
      );

      // Combine IV (12 bytes) + Encrypted Buffer into single payload
      const combined = new Uint8Array(12 + encryptedBuffer.byteLength);
      combined.set(ivBytes, 0);
      combined.set(new Uint8Array(encryptedBuffer), 12);

      let binary = '';
      for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      const combinedBase64 = btoa(binary);
      const ivBase64 = btoa(String.fromCharCode(...ivBytes));

      return {
        ciphertext: `[NEXUS_CIPHER:${combinedBase64}]`,
        iv: ivBase64,
        version: 'aes-gcm-256',
        isEncrypted: true,
      };
    }
  } catch (err) {
    console.warn('[Nexus Crypto Abstraction] WebCrypto encryption fallback:', err);
  }

  return {
    ciphertext: plainText,
    iv: '',
    version: 'raw-fallback',
    isEncrypted: false,
  };
}
