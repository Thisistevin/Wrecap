'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoginScreen from '@/components/LoginScreen';
import CreateRetrospectiveScreen from '@/components/CreateRetrospectiveScreen';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check current user immediately
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand-green to-brand-chartreuse">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <CreateRetrospectiveScreen user={user} />;
}

