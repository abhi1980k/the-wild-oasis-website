"use server"

import { revalidatePath } from "next/cache"
import { auth, signIn, signOut } from "./auth"
import { supabase } from "./supabase"
import { getBookings } from "./data-service"
import { redirect } from "next/navigation"

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
    // For testing
    //await new Promise((res) => setTimeout(res, 2000));

    //throw new Error()

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

export async function updateBooking(formData){
    const bookingId = Number(formData.get("bookingId"))
    const numGuests = Number(formData.get("numGuests"))
    const observations = formData.get("observations").slice(0, 1000)

    const session = await auth()
    if(!session) throw new Error('You must be logged in to update a booking')

    const guestBookings = await getBookings(session.user.guestId)
    console.log(guestBookings)
    const guestBookingIds = guestBookings.map((booking)=> booking.id)

    if(!guestBookingIds.includes(bookingId))
        throw new Error("You are not allowed to edit this booking.")

    const updatedFields = { numGuests, observations }
    
    const { data, error } = await supabase
        .from('bookings')
        .update(updatedFields)
        .eq('id', bookingId)
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error('Booking could not be updated');
    }

    revalidatePath('/account/reservations')
    revalidatePath(`/account/reservations/edit/${bookingId}`)

    //return data;
    redirect("/account/reservations")
}

export async function createBooking(bookingData, formData){
    const session = await auth()
    if(!session) throw new Error('You must be logged in to update a booking')

    const extrasPrice = 0

    const newBooking = {
        ...bookingData,
        guestId : session.user.guestId,
        numGuests : Number(formData.get("numGuests")),
        observations: formData.get("observations").slice(0, 1000),
        extrasPrice,
        totalPrice: bookingData.cabinPrice + extrasPrice,
        status: "unconfirmed",
        hasBreakfast: false,
        isPaid: false
    }

    const { data, error } = await supabase
    .from('bookings')
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

    if (error) {
        console.error(error);
        throw new Error('Booking could not be created');
    }

    revalidatePath(`/cabins/${bookingData.cabinId}`)
    //redirect("/cabins/thankyou")
    //return data;
}

