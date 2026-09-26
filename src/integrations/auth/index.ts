 import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
};

type OAuthProvider = "google" | "github" | "gitlab" | "bitbucket";

export const auth = {
  signInWithOAuth: async (
    provider: OAuthProvider,
    opts?: SignInOptions
  ) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          opts?.redirect_uri ?? window.location.origin,
      },
    });

    return {
      data,
      error,
    };
  },
}; 