import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getUserByEmail, createUser } from "@/lib/db/users";

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await getUserByEmail(email.toLowerCase());
      if (!user || !user.password_hash) return null;

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? undefined,
        role: user.role,
      };
    },
  }),
];

// Google sign-in only activates when credentials are actually configured,
// so the store still runs fully on email/password without extra setup.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers,
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await getUserByEmail(user.email.toLowerCase());
        if (!existing) {
          await createUser({
            name: user.name ?? "Google User",
            email: user.email.toLowerCase(),
            image: user.image,
            provider: "google",
            role: "customer",
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        token.email = user.email;
      }
      if (user || trigger === "signIn") {
        const dbUser = await getUserByEmail((token.email as string) ?? "");
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image ?? undefined;
        }
      }
      return token;
    },
  },
});
