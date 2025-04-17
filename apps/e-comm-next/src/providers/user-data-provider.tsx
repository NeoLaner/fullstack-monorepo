"use client";
// context/UserDataContext.tsx
import { createContext, type ReactNode } from "react";
import type { UserData } from "~/server/api/routers/users/userServices";

interface UserDataContextType {
  userData: UserData | null | undefined;
}

export const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const UserDataProvider = ({
  children,
  userData,
}: {
  children: ReactNode;
  userData: UserData | null | undefined;
}) => {
  return (
    <UserDataContext.Provider value={{ userData }}>
      {children}
    </UserDataContext.Provider>
  );
};
