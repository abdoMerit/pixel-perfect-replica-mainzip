import { createContext, useContext } from "react";

export interface AdminContextValue {
  token: string;
  email: string;
  name: string;
}

export const AdminContext = createContext<AdminContextValue>({
  token: "",
  email: "",
  name: "",
});

export function useAdmin(): AdminContextValue {
  return useContext(AdminContext);
}
