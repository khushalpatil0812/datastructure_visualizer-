import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 👈 custom field added
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
