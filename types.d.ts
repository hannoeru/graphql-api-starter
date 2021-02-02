declare namespace NodeJS {
  export interface ProcessEnv {
    APP_URL: string
    REDIRECT_PATH: string
    NODE_ENV: 'production' | 'development'
    PORT: string
    HASH_KEY: string
    ENCRYPT_SECRET: string
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string
    GITHUB_CLIENT_ID?: string
    GITHUB_CLIENT_SECRET?: string
  }
}
