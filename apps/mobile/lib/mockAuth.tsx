/**
 * Mock de Clerk para desarrollo local.
 * Expone los mismos hooks que @clerk/clerk-expo pero sin servicios externos.
 */
import React, { createContext, useContext, useState } from 'react'

interface AuthContextValue {
  isSignedIn: boolean
  isLoaded: boolean
  getToken: () => Promise<string | null>
  signOut: () => Promise<void>
  userId: string | null
}

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: true,
  isLoaded: true,
  getToken: async () => 'dev-token',
  signOut: async () => {},
  userId: 'dev-user-001',
})

interface SignInContextValue {
  signIn: {
    create: (params: { identifier: string; password: string }) => Promise<{ createdSessionId: string }>
  }
  setActive: (params: { session: string }) => Promise<void>
  isLoaded: boolean
}

interface SignUpContextValue {
  signUp: {
    create: (params: { emailAddress: string; password: string; username?: string }) => Promise<{ createdSessionId: string }>
  }
  setActive: (params: { session: string }) => Promise<void>
  isLoaded: boolean
}

const SignInContext = createContext<SignInContextValue>({
  signIn: { create: async () => ({ createdSessionId: 'dev-session' }) },
  setActive: async () => {},
  isLoaded: true,
})

const SignUpContext = createContext<SignUpContextValue>({
  signUp: { create: async () => ({ createdSessionId: 'dev-session' }) },
  setActive: async () => {},
  isLoaded: true,
})

export function MockClerkProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(true)

  const authValue: AuthContextValue = {
    isSignedIn,
    isLoaded: true,
    getToken: async () => 'dev-token',
    signOut: async () => setIsSignedIn(false),
    userId: isSignedIn ? 'dev-user-001' : null,
  }

  const signInValue: SignInContextValue = {
    signIn: { create: async () => ({ createdSessionId: 'dev-session' }) },
    setActive: async () => setIsSignedIn(true),
    isLoaded: true,
  }

  const signUpValue: SignUpContextValue = {
    signUp: { create: async () => ({ createdSessionId: 'dev-session' }) },
    setActive: async () => setIsSignedIn(true),
    isLoaded: true,
  }

  return (
    <AuthContext.Provider value={authValue}>
      <SignInContext.Provider value={signInValue}>
        <SignUpContext.Provider value={signUpValue}>
          {children}
        </SignUpContext.Provider>
      </SignInContext.Provider>
    </AuthContext.Provider>
  )
}

// Hooks que reemplazan exactamente los de @clerk/clerk-expo
export const useAuth = () => useContext(AuthContext)
export const useSignIn = () => useContext(SignInContext)
export const useSignUp = () => useContext(SignUpContext)
