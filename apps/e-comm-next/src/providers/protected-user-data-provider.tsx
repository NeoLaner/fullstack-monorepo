"use client";
import { createContext, type ReactNode } from "react";
import type { UserData } from "~/server/api/routers/users/userServices";

interface ProtectedUserDataContextType {
  userData: UserData;
}

export const ProtectedUserDataContext = createContext<
  ProtectedUserDataContextType | undefined
>(undefined);

export const ProtectedUserDataProvider = ({
  children,
  userData,
}: {
  children: ReactNode;
  userData: UserData;
}) => {
  return (
    <ProtectedUserDataContext.Provider value={{ userData }}>
      {children}
    </ProtectedUserDataContext.Provider>
  );
};
