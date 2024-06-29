"use client";
import MainHeader from "@/components/main-header/main-header";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <MainHeader />

        {children}
        <ProgressBar
          height="5px"
          color="#ff8a05"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </body>
    </html>
  );
}
