import { AuthProvider } from "react-admin";
import { supabase } from "./supabaseClient";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) throw new Error(error.message);
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  checkAuth: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
  },

  checkError: async (error) => {
    const status = error?.status;
    if (status === 401 || status === 403) throw new Error("Unauthorized");
  },

  getIdentity: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return {
      id: user.id,
      fullName: user.user_metadata?.full_name ?? user.email ?? "Admin",
      avatar: undefined,
    };
  },

  getPermissions: async () => "admin",
};
