import { createContext, useContext } from "react";

export interface AdminContextValue {
  password: string;
}

export const AdminContext = createContext<AdminContextValue>({ password: "" });

export function useAdmin(): AdminContextValue {
  return useContext(AdminContext);
}
