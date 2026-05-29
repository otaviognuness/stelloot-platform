import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

import { getCurrentUser, login, register } from '@/src/services/api';
import { deleteStoredValue, getStoredValue, setStoredValue } from '@/src/storage/storage';
import { Session } from '@/src/types/api';

const SESSION_KEY = 'stelloot.mobile.session';

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getStoredValue(SESSION_KEY)
      .then(async (stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Session;
        const user = await getCurrentUser(parsed.token);
        setSession({ ...parsed, user });
      })
      .catch(() => deleteStoredValue(SESSION_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function persist(nextSession: Session) {
    setSession(nextSession);
    await setStoredValue(SESSION_KEY, JSON.stringify(nextSession));
  }

  async function signIn(email: string, password: string) {
    await persist(await login(email.trim(), password));
  }

  async function signUp(username: string, email: string, password: string) {
    await persist(await register(username.trim(), email.trim(), password));
  }

  async function signOut() {
    setSession(null);
    await deleteStoredValue(SESSION_KEY);
  }

  const value = { loading, session, signIn, signOut, signUp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
