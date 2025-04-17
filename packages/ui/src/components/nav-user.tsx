"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";

import { useEffect, useState, type SetStateAction } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@neolaner/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@neolaner/ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@neolaner/ui/components/ui/sidebar";

import { Button } from "@neolaner/ui/components/ui/button";

export function NavUser({
  userData,
  signoutAction,
  dir = "ltr",
}: {
  userData?: { email?: string; name?: string; image?: string };
  signoutAction: () => void;
  dir?: "ltr" | "rtl";
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu dir={dir}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              dir="ltr"
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userData?.image ?? ""} alt={userData?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-right font-semibold">
                  {userData?.name}
                </span>
                <span className="truncate text-right text-xs">
                  {userData?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel dir="ltr" className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userData?.image ?? ""}
                    alt={userData?.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-right font-semibold">
                    {userData?.name}
                  </span>
                  <span className="truncate text-right text-xs">
                    {userData?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Signout signoutAction={signoutAction} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function Signout({ signoutAction }: { signoutAction: () => void }) {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <>
      {!isClicked && <SignoutBtn setIsClicked={setIsClicked} />}
      {isClicked && <SignoutActionBtn signoutAction={signoutAction} />}
    </>
  );
}

function SignoutBtn({
  setIsClicked,
}: {
  setIsClicked: (value: SetStateAction<boolean>) => void;
}) {
  return (
    <Button
      className="h-8 w-full justify-start border-none px-2 py-1.5"
      variant={"outline"}
      onClick={() => setIsClicked(true)}
    >
      <LogOut />
      Sign out
    </Button>
  );
}

function SignoutActionBtn({ signoutAction }: { signoutAction: () => void }) {
  const [disabledMs, setDisabledMs] = useState(3000);
  const isDisabled = disabledMs > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setDisabledMs((prvMs) => prvMs - 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isDisabled]);

  return (
    <Button
      className="h-8 w-full justify-start border-none px-2 py-1.5"
      variant={"destructive"}
      onClick={signoutAction}
      disabled={isDisabled}
    >
      <LogOut />
      Are you sure? {isDisabled && `${disabledMs / 1000}s`}
    </Button>
  );
}
