/**
 * ============================================================================
 * NEXUS MANAGER — CRYPTOGRAPHY ABSTRACTION LAYER (DECRYPT)
 * ============================================================================
 */

const PROTOTYPE_PRE_SHARED_KEY = 'NEXUS_ENTERPRISE_KEY_V1';

async function getSubtleCryptoKey(secret: string): Promise<CryptoKey> {
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
 * Decrypts a ciphertext tagged with NEXUS_CIPHER or returns plain text if unencrypted
 */
export async function decryptMessage(
  ciphertext: string,
  ivBase64?: string,
  conversationId?: string
): Promise<string> {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return '';
  }

  if (!ciphertext.startsWith('[NEXUS_CIPHER:') || !ciphertext.endsWith(']')) {
    return ciphertext;
  }

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const rawPayload = ciphertext.slice(14, -1);
      const secret = conversationId ? `${PROTOTYPE_PRE_SHARED_KEY}_${conversationId}` : PROTOTYPE_PRE_SHARED_KEY;
      const key = await getSubtleCryptoKey(secret);

      let ivBytes: Uint8Array;
      let encryptedBytes: Uint8Array;

      if (rawPayload.includes(':')) {
        // Format: [NEXUS_CIPHER:ivBase64:cipherBase64]
        const [ivPart, cipherPart] = rawPayload.split(':');
        ivBytes = Uint8Array.from(atob(ivPart), c => c.charCodeAt(0));
        encryptedBytes = Uint8Array.from(atob(cipherPart), c => c.charCodeAt(0));
      } else {
        // Format: [NEXUS_CIPHER:combinedBase64] (First 12 bytes = IV, remaining = Ciphertext)
        const combined = Uint8Array.from(atob(rawPayload), c => c.charCodeAt(0));
        if (combined.length > 12) {
          ivBytes = combined.slice(0, 12);
          encryptedBytes = combined.slice(12);
        } else if (ivBase64) {
          ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
          encryptedBytes = combined;
        } else {
          return '🔒 [Mensagem Criptografada]';
        }
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes as unknown as BufferSource },
        key,
        encryptedBytes as unknown as BufferSource
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    }
  } catch (err) {
    console.warn('[Nexus Crypto Abstraction] Decryption failed:', err);
    // If decryption fails due to old mock keys, return a clean encrypted indicator instead of raw code
    return '🔒 [Mensagem Criptografada de Sessão Anterior]';
  }

  return ciphertext;
}
