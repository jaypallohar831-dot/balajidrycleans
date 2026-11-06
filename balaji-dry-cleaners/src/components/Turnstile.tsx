"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface TurnstileRef {
  reset: () => void;
  execute: () => void;
}

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: (error?: unknown) => void;
  onExpire?: () => void;
  action?: string;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          action?: string;
          size?: "invisible" | "normal" | "compact";
          callback?: (token: string) => void;
          "error-callback"?: (err?: unknown) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      execute: (container?: HTMLElement | string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ onSuccess, onError, onExpire, action = "submit", className = "" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const isMock = !siteKey || siteKey.startsWith("0x_your_");

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (isMock) {
          onSuccess("dummy-test-token");
          return;
        }
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      execute: () => {
        if (isMock) {
          onSuccess("dummy-test-token");
          return;
        }
        if (window.turnstile && containerRef.current) {
          window.turnstile.execute(containerRef.current);
        }
      },
    }));

    useEffect(() => {
      // In dev or without valid site key, emit dummy token immediately
      if (isMock) {
        onSuccess("dummy-test-token");
        return;
      }

      let isMounted = true;

      const initWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return;

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            size: "invisible",
            callback: (token) => {
              if (isMounted) onSuccess(token);
            },
            "error-callback": (err) => {
              if (isMounted && onError) onError(err);
            },
            "expired-callback": () => {
              if (isMounted && onExpire) onExpire();
            },
          });
        } catch (err) {
          console.warn("[Turnstile:RENDER_ERROR]", err);
          if (onError) onError(err);
        }
      };

      if (window.turnstile) {
        initWidget();
      } else {
        // Load the Cloudflare script
        const existingScript = document.getElementById("cf-turnstile-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "cf-turnstile-script";
          script.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            initWidget();
          };
          document.head.appendChild(script);
        } else {
          const interval = setInterval(() => {
            if (window.turnstile) {
              clearInterval(interval);
              initWidget();
            }
          }, 100);
          return () => clearInterval(interval);
        }
      }

      return () => {
        isMounted = false;
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [isMock, siteKey, action, onSuccess, onError, onExpire]);

    if (isMock) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className={`cf-turnstile-invisible ${className}`}
        style={{ display: "none" }}
      />
    );
  }
);

Turnstile.displayName = "Turnstile";
