import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

export const authOptions = {
  providers: [
    Auth0Provider({
        issuer: `${process.env.OAUTH_ISSUER_URL}`,
        clientId:`${process.env.OAUTH_CLIENT_ID}`,
        clientSecret: `${process.env.OAUTH_CLIENT_SECRET}`,
        id: 'IBMid',
        name: 'IBMid',
      }),
    ],
    pages: {
      signIn: "/signin"
    }
  }
  
const handler =  NextAuth(authOptions);

export { handler as GET, handler as POST };