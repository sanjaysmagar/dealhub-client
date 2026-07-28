"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useDispatch } from "react-redux";
import { googleAuth } from "@/store/slices/authSlice";

export default function GoogleSignInButton() {
  const dispatch = useDispatch();
  const buttonRef = useRef(null);

  const handleCredentialResponse = (response) => {
    dispatch(googleAuth(response.credential)).then((result) => {
      if (googleAuth.fulfilled.match(result)) {
        window.location.href = "/";
      }
    });
  };

  useEffect(() => {
    if (window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
        text: "continue_with",
      });
    }
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google && buttonRef.current) {
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: "outline",
              size: "large",
              shape: "pill",
              width: 320,
              text: "continue_with",
            });
          }
        }}
      />
      <div
        ref={buttonRef}
        style={{ display: "flex", justifyContent: "center" }}
      />
    </>
  );
}
