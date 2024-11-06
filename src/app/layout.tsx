import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import "./globals.css";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Financia",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

function Header() {
  return (
    <>
      <header className="fixed w-full h-20 bg-[#212126] flex items-center justify-between p-2 text-white">
        <Logo />
        <Profile />
      </header>
      <div className="h-20" />
    </>
  );
}

function Logo() {
  return <h1>Financia</h1>;
}

function Profile() {
  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button>Sign in</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-16 w-16",
            },
          }}
        />
      </SignedIn>
    </>
  );
}
