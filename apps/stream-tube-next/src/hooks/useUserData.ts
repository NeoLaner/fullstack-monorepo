import { UserDataContext } from "~/providers/user-data-provider";
import { useContext } from "react";

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
