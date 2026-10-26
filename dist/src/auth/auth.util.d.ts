export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, storedHash: string): boolean;
export declare function generateToken(length?: number): string;
export declare function generateRecoveryCode(): string;
