import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { v5 as uuidv5 } from "uuid";

// Namespace UUID for converting Google IDs to UUIDs
const GOOGLE_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function googleIdToUUID(googleId: string): string {
  return uuidv5(googleId, GOOGLE_NAMESPACE);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        // Convert Google ID (token.sub) to UUID for InstantDB compatibility
        session.user.id = googleIdToUUID(token.sub);
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

