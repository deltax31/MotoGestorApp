export type PlanUsuario = 'free' | 'pro';

export interface Perfil {
  id: string;
  name?: string;
  phone?: string;
  plan: PlanUsuario;
  created_at: string;
  updated_at: string;
  // Estos campos vienen del Auth Session metadata
  avatar_url?: string;
  full_name?: string;
}

export interface UsuarioSession {
  id: string;
  email: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
}
