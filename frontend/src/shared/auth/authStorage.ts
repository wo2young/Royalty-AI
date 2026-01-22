// src/shared/auth/authStorage.ts

const TOKEN_KEY = "accessToken"
const USER_KEY = "loginUser"

export const authStorage = {
  set(token: string, user: any) {
    localStorage.setItem(TOKEN_KEY, token)

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY)
    if (!user || user === "undefined") return null

    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
