import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { guardEmailSignUp } from "@/lib/auth/reject-duplicate-signup";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => guardEmailSignUp(request, auth.handler),
    },
  },
});
