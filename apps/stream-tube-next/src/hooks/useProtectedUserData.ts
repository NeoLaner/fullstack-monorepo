import { useContext } from "react";
import { ProtectedUserDataContext } from "~/providers/protected-user-data-provider";

export const useProtectedUserData = () => {
  const context = useContext(ProtectedUserDataContext);
  if (context === undefined) {
    throw new Error(
      "useProtectedUserData must be used within a ProtectedUserDataProvider",
    );
  }
  return context;
};
