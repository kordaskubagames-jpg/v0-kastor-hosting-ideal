"use client"

import { createAuthClient } from "better-auth/react"

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [],
})

export const { signIn, signUp, signOut, useSession } = authClient
