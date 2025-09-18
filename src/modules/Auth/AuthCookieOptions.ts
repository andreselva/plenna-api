import { CookieOptions } from "express";

export class AuthCookieOptions {
    static accessToken(): CookieOptions {
        return this.buildCookieOptions({
            httpOnly: true,
            maxAge: 60 * 60 * 1000,//1h
        });
    }

    static refreshToken(): CookieOptions {
        return this.buildCookieOptions({
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }

    static csrfToken(): CookieOptions {
        return this.buildCookieOptions({
            httpOnly: false,
            maxAge: 60 * 60 * 1000,
        });
    }

    static clearToken(): CookieOptions {
        return this.buildCookieOptions({
            httpOnly: true,
        });
    }

    static clearCsrfToken(): CookieOptions {
        return this.buildCookieOptions({
            httpOnly: false,
        });
    }

    private static buildCookieOptions(overrides: Partial<CookieOptions>): CookieOptions {
        const isProduction = process.env.NODE_ENV === 'production';
        const base: CookieOptions = {
            secure: isProduction,
            sameSite: 'lax',
        };

        if (isProduction) {
            base.domain = '.plenna.me';
        }

        return { ...base, ...overrides };
    }
}
