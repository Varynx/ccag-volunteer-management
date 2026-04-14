import { DataProvider } from "react-admin";
import { supabase } from "./supabaseClient";

export const dataProvider: DataProvider = {
  // 🔹 GET LIST
  getList: async (resource, params: any) => {
    const { data, error } = await supabase.from(resource).select("*");

    if (error) {
      console.error("getList error:", error);
      throw error;
    }

    return {
      data: data ?? [],
      total: data?.length ?? 0,
    };
  },

  // 🔹 GET ONE
  getOne: async (resource, params: any) => {
    const { data, error } = await supabase
      .from(resource)
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("getOne error:", error);
      throw error;
    }

    return {
      data,
    };
  },

  // 🔹 CREATE
  create: async (resource, params: any) => {
    const { data, error } = await supabase
      .from(resource)
      .insert(params.data)
      .select()
      .single();

    if (error) {
      console.error("create error:", error);
      throw error;
    }

    return {
      data,
    };
  },

  // 🔹 UPDATE
  update: async (resource, params: any) => {
    const { data, error } = await supabase
      .from(resource)
      .update(params.data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("update error:", error);
      throw error;
    }

    return {
      data,
    };
  },

  // 🔹 DELETE (FIXED TYPE ISSUE)
delete: async (resource, params) => {
  const { error } = await supabase
    .from(resource)
    .delete()
    .eq("id", params.id);

  if (error) throw error;

  return {
    data: (params.previousData as any),
  };
},

  // 🔹 REQUIRED BUT SIMPLE

  getMany: async (resource) => {
    const { data, error } = await supabase.from(resource).select("*");

    if (error) throw error;

    return {
      data: data ?? [],
    };
  },

  getManyReference: async (resource) => {
    const { data, error } = await supabase.from(resource).select("*");

    if (error) throw error;

    return {
      data: data ?? [],
      total: data?.length ?? 0,
    };
  },

  updateMany: async () => {
    return { data: [] };
  },

  deleteMany: async () => {
    return { data: [] };
  },
};