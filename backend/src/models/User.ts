export interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  emailPreferences?: {
    marketing?: boolean;
    updates?: boolean;
    security?: boolean;
  };
  vectorStorePreferences?: {
    provider?: 'pinecone' | 'weaviate';
    automaticIndexing?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  encrypted_password: string;
  settings: UserSettings;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  settings: UserSettings;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends LoginCredentials {
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}
