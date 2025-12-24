'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { initializeUserCredits } from '@/lib/db';
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
      // Initialize credits for current user if needed
      initializeUserCredits(currentUser.uid).catch((error) => {
        console.error('Error initializing user credits:', error);
        // Don't block page load if credits initialization fails
      });
      setUser(currentUser);
      setLoading(false);
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      // If user logged in, initialize credits if needed
      if (user) {
        try {
          await initializeUserCredits(user.uid);
        } catch (error) {
          console.error('Error initializing user credits:', error);
          // Don't block login if credits initialization fails
        }
      }
      
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

