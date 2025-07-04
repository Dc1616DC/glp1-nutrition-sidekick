// src/firebase/auth.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
  type AuthError,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Registers a new user with an email and password.
 * For a novice developer: This function talks to Firebase to create a new user account.
 * If it works, you get the new user's information back. If not, you get an error.
 *
 * @param {string} email - The email for the new account.
 * @param {string} password - The password for the new account.
 * @returns {Promise<{ user: User | null; error: AuthError | null }>} An object containing the user or an error.
 */
export const signUp = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

/**
 * Signs in an existing user with their email and password.
 * For a novice developer: This function checks with Firebase if the email and password are correct.
 * If they are, it logs the user in and gives you their information. If not, it gives you an error.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{ user: User | null; error: AuthError | null }>} An object containing the user or an error.
 */
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

/**
 * Signs out the currently authenticated user.
 * For a novice developer: This function logs out the user who is currently signed in.
 *
 * @returns {Promise<{ error: AuthError | null }>} An object that will contain an error if sign-out fails.
 */
export const signOutUser = async (): Promise<{ error: AuthError | null }> => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

/**
 * Sends a password reset email to a given email address.
 * For a novice developer: If a user forgets their password, this function sends them an email
 * with a link to create a new one. You just need to provide their email address.
 *
 * @param {string} email - The email address to send the reset link to.
 * @returns {Promise<{ error: AuthError | null }>} An object that will contain an error if sending the email fails.
 */
export const sendPasswordReset = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};
