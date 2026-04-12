"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  ForgotPasswordFormInput,
  ForgotPasswordFormSchema,
  LoginFormInput,
  LoginFormSchema,
  RegisterFormInput,
  RegisterFormSchema,
  ResetPasswordFormInput,
  ResetPasswordFormSchema,
} from "@/schemas/auth";
import { env } from "@/utils/env";
import { z } from "zod";
import { ActionResponse } from "@/types";

/**
 * A generic type for our authentication actions.
 * @template T The type of the form data.
 * @param data The validated form data.
 * @param supabase The Supabase client instance.
 * @returns An ActionResponse.
 */
type AuthAction<T> = (data: T, supabase: SupabaseClient) => ActionResponse;

/**
 * A higher-order function to create a server action that handles
 * form validation, captcha checks, and Supabase client creation.
 * @template T The type of the form data, which must include an optional captchaToken.
 * @param schema The Zod schema for validation.
 * @param action The core logic of the server action.
 * @returns An async function that serves as the server action.
 */
const createAuthAction = <T extends { captchaToken?: string }>(
  schema: z.ZodSchema<T>,
  action: AuthAction<T>,
  admin?: boolean,
) => {
  return async (formData: T): ActionResponse => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(". ");
      return { success: false, message };
    }

    if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && !result.data.captchaToken) {
      return { success: false, message: "Captcha is required." };
    }

    try {
      const supabase = await createClient(admin);
      return await action(result.data, supabase);
    } catch (error) {
      // Catch potential unhandled errors in actions
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "An unexpected error occurred." };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.loginPassword,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (error) return { success: false, message: error.message };

  const { data: username, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.user.id)
    .maybeSingle();

  if (!username) {
    console.error("Username check error:", usernameError);
    return {
      success: false,
      message: `Database error. Could not get username for ${user.user.email}.`,
    };
  }

  return { success: true, message: `Welcome back, ${username.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  // Check username availability
  const { data: usernameExists, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();

  if (usernameError) {
    console.error("Username check error:", usernameError);
    return { success: false, message: "Database error. Could not check username availability." };
  }

  if (usernameExists) {
    return { success: false, message: "Username already taken." };
  }

  // Create user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (signUpError) return { success: false, message: signUpError.message };
  if (!authData.user) return { success: false, message: "User not created. Please try again." };

  // Insert profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, username: data.username });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // This is a critical error. The user exists in auth but not in profiles.
    // It's better to return a generic error and log it for investigation.
    return { success: false, message: "Could not create user profile. Please contact support." };
  }

  return {
    success: true,
    message:
      "Sign up successful. Please check your email for verification. Check spam folder if you don't see it.",
  };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (
  data,
  supabase,
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    captchaToken: data.captchaToken,
  });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: `We have sent an email to ${data.email}. Check spam folder if you don't see it.`,
  };
};

const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data, supabase) => {
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Password has been reset successfully." };
};

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction, true);
export const sendResetPasswordEmail = createAuthAction(
  ForgotPasswordFormSchema,
  sendResetPasswordEmailAction,
);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);

export const signOut = async (): ActionResponse => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return { success: false, message: error.message };

  return { success: true, message: "You have been signed out." };
};
