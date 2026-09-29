import { createFileRoute } from "@tanstack/react-router";
import { readObject } from "@/lib/cerca/storage";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat;
        if (!key || key.includes("..")) return new Response(null, { status: 404 });
        try {
          const stored = await readObject(key);
          if (!stored) return new Response(null, { status: 404 });
          return new Response(Buffer.from(stored.bytes), {
            headers: {
              "Content-Type": stored.contentType,
              "Cache-Control": "public, max-age=86400",
            },
          });
        } catch {
          return new Response(null, { status: 404 });
        }
      },
    },
  },
});
