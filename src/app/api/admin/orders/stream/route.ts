import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { onOrderEvent } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25000;

// Server-Sent Events stream of every order create/update, for the admin
// dashboard to react live instead of polling. One connection per open
// admin tab; events are pushed from the in-process event bus in
// src/lib/events.ts as they happen.
export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval>;
  let unsubscribe: () => void;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // controller already closed (client disconnected mid-write)
        }
      };

      send(`retry: 3000\n\n`);

      unsubscribe = onOrderEvent((event) => {
        send(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      });

      heartbeat = setInterval(() => send(`: ping\n\n`), HEARTBEAT_MS);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
