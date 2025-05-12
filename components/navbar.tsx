"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { ThemeSwitch } from "@/components/theme-switch";
import { Bot, LayoutGrid, User, Settings } from "@/components/icons";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Handle logout
  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Navigation routes
  const navigationRoutes = [
    {
      label: "Home",
      href: "/",
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      label: "Chat",
      href: "/chat",
      icon: <Bot className="w-4 h-4" />,
    },
  ];

  return (
    <HeroUINavbar
      className="border-b border-gray-200 dark:border-gray-800"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <div className="w-8 h-8 rounded-full bg-[#8e24aa] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-inherit">QueryNest</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {navigationRoutes.map((route) => (
            <NavbarItem key={route.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium flex items-center gap-2",
                  pathname === route.href ? "text-primary font-medium" : "",
                )}
                href={route.href}
              >
                {route.icon}
                {route.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-2">
          <ThemeSwitch />
          {session?.user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={session.user.name}
                  size="sm"
                  src={session.user.image}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Settings className="w-4 h-4" />}
                  onPress={() => router.push("/settings")}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <NextLink href="/login">
              <Avatar
                as="button"
                className="transition-transform"
                color="default"
                icon={<User className="w-4 h-4" />}
                name="Guest"
                size="sm"
              />
            </NextLink>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navigationRoutes.map((route) => (
            <NavbarMenuItem key={route.href}>
              <Link
                className="flex items-center gap-2"
                color={pathname === route.href ? "primary" : "foreground"}
                href={route.href}
                size="lg"
              >
                {route.icon}
                {route.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
