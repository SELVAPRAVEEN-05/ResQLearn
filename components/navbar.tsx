"use client";

import { Navbar as HeroUINavbar, NavbarContent } from "@heroui/navbar";
import Image from "next/image";
import NextLink from "next/link";

import ThemeToggleButton from "./toggle-button/theme-toggle-button";

export const Navbar = () => {
  return (
    <HeroUINavbar
      className="flex bg-opacity-30 shadow-lg"
      maxWidth="full"
      position="sticky"
    >
      <div className="w-full lg:px-12 xl:px-28 flex justify-between">
        <div className="gap-3">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image alt="Logo" height={40} src="/images/logo.png" width={40} />
            <p className="font-bold text-inherit">logo</p>
          </NextLink>
        </div>

        <div className="hidden items-center lg:flex">
          <ThemeToggleButton start="center" variant="circle" />
        </div>
      </div>

      <NavbarContent className="lg:hidden" justify="end">
        <ThemeToggleButton start="center" variant="circle" />
      </NavbarContent>
    </HeroUINavbar>
  );
};
