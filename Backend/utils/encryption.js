import crypto from 'crypto';

// AES-256-CBC configuration
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES requires 16 bytes for initialization vector

/**
 * Ensures the key meets the length requirement (32 bytes).
 * If the key is provided via env, it slices or pads it to 32 bytes.
 */
const getEncryptionKey = () => {
    let key = process.env.ENCRYPTION_KEY;
    if (!key) {
        console.warn('ENCRYPTION_KEY not set in environment. Using a fallback key for development ONLY.');
        key = 'fallback_key_do_not_use_in_prod';
    }

    // Hash the key to ensure it is exactly 32 bytes long
    return crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
};

/**
 * Encrypts a plain text string
 * @param {string} text The text to encrypt
 * @returns {string} The encrypted text formatted as iv:encryptedData
 */
export const encrypt = (text) => {
    if (!text) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV and encrypted text, separated by a colon
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Return original if error (fail-safe)
    }
};

/**
 * Decrypts an encrypted string
 * @param {string} text The iv:encryptedData formatted text
 * @returns {string} The decrypted plain text
 */
export const decrypt = (text) => {
    if (!text) return text;

    try {
        // If the text is not in the correct format (e.g. data before encryption was implemented)
        // just return the text.
        if (!text.includes(':')) {
            return text;
        }

        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return text; // Return original if error (e.g. key changed)
    }
};
