export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface RefreshTokenCreate {
  user_id: string;
  token: string;
  expires_at: Date;
}
