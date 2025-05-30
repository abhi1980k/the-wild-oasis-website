import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createGuest, getGuest } from "./data-service"

const authConfig = {
    site: process.env.NEXTAUTH_URL,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        authorized({auth, request}){
            return !!auth?.user
        },
        async signIn({ user, account, profile }) {
            try{
                const existingUser = await getGuest(user.email)
        
                if(!existingUser) {
                    await createGuest({ email: user.email, fullName: user.name })
                }
        
                return true
            } catch(error){
                console.error(error)
                return false
            }
        },
        async session({ session, user }){
            const guest = await getGuest(session.user.email)
            session.user.guestId = guest.id
            return session
        },
    },
    pages: {
        signIn: "/login"
    }
}

export const { 
    auth,
    signIn,
    signOut,
    handlers : { 
        GET, POST 
    }
} =  NextAuth(authConfig)

