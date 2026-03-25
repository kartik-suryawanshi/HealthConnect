import { generateAccessToken, generateRefreshTokenString } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

describe('Token Generator Utility', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_ACCESS_EXPIRE = '15m';
    });

    test('generateAccessToken generates a valid JWT', () => {
        const userId = '12345';
        const token = generateAccessToken(userId);
        expect(token).toBeDefined();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(userId);
    });

    test('generateRefreshTokenString generates a 80-char hex string', () => {
        const token = generateRefreshTokenString();
        expect(token).toBeDefined();
        expect(token.length).toBe(80);
    });
});
