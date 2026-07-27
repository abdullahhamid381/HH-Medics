import type { NextAuthConfig } from "next-auth";

// This config must stay free of Node-only imports (no `node:sqlite`, no
// db access) because Next.js runs middleware on the Edge runtime.
// The full provider list (which needs the database) lives in `src/auth.ts`.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        return role === "admin";
      }
      if (pathname.startsWith("/account")) {
        return isLoggedIn;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as "customer" | "admin") ?? "customer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
