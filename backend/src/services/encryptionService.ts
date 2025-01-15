import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 12; // 96 bits for GCM
  private saltLength = 16; // 128 bits
  private tagLength = 16; // 128 bits

  constructor(private masterKey: string) {
    if (!masterKey) {
      throw new Error('Encryption master key is required');
    }
  }

  /**
   * Encrypts sensitive data
   */
  async encrypt(data: string): Promise<string> {
    try {
      // Generate salt and derive key
      const salt = crypto.randomBytes(this.saltLength);
      const key = await this.deriveKey(this.masterKey, salt);

      // Generate IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final()
      ]);

      // Get auth tag
      const tag = cipher.getAuthTag();

      // Combine all pieces
      const result = Buffer.concat([
        salt,
        iv,
        tag,
        encrypted
      ]);

      return result.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts encrypted data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      // Convert from base64
      const buffer = Buffer.from(encryptedData, 'base64');

      // Extract pieces
      const salt = buffer.slice(0, this.saltLength);
      const iv = buffer.slice(this.saltLength, this.saltLength + this.ivLength);
      const tag = buffer.slice(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encrypted = buffer.slice(this.saltLength + this.ivLength + this.tagLength);

      // Derive key
      const key = await this.deriveKey(this.masterKey, salt);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Derives encryption key from master key and salt
   */
  private async deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        masterKey,
        salt,
        100000, // iterations
        this.keyLength,
        'sha256',
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });
  }
}

export default EncryptionService;