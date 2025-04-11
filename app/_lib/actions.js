"use server"

import { revalidatePath } from "next/cache"
import { auth, signIn, signOut } from "./auth"
import { supabase } from "./supabase"
import { getBookings } from "./data-service"

export async function signInAction(){
    await signIn("google", { redirectTo: "/account" })
}

export async function signOutAction(){
    await signOut({redirectTo: "/"})
}

export async function updateGuest(formData){
    const session = await auth()
    if(!session) throw new Error('You must be logged in to update your profile')

    const nationalID = formData.get("nationalID")
    const [nationality, countryFlag] = formData.get('nationality').split("%")

    if (!nationality || !countryFlag)
        throw new Error("You must select a country")

    if (!nationalID)
        throw new Error("You must enter a valid nationalID")

    const updatedData = { nationalID, nationality, countryFlag }

    const { data, error } = await supabase
        .from('guests')
        .update(updatedData)
        .eq('id', session.user.guestId)
    
      if (error) {
        console.error(error);
        throw new Error('Guest could not be updated');
      }

      revalidatePath("/account/profile")
}

export async function deleteReservation(bookingId){
    const session = await auth()
    if(!session) throw new Error('You must be logged in to delete a booking')

    const guestBookings = await getBookings(session.user.guestId)
    const guestBookingIds = guestBookings.map((booking)=> booking.id)

    if(!guestBookingIds.includes(bookingId))
        throw new Error("You are not allowed to delete this booking.")

    const { data, error } = await supabase.from('bookings').delete().eq('id', bookingId);

    if (error) {
        console.error(error);
        throw new Error('Booking could not be deleted');
    }
    revalidatePath("/account/reservations")
    return data;
}