import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";

// Helper function to create deterministic UUID from Google ID
function googleIdToUUID(googleId: string): string {
  const hash = crypto.createHash('sha256').update(`google-${googleId}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // InstantDB writes happen client-side only
      // User creation will be handled by the client on first query
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Convert Google ID to UUID format for InstantDB compatibility
        session.user.id = googleIdToUUID(token.sub);
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
