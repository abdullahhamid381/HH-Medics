import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/db/orders";
import { onOrderEvent } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25000;

// Server-Sent Events stream scoped to a single order, so a customer viewing
// their order page sees status/tracking changes the moment an admin saves
// them, without polling or a manual refresh.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || order.user_id !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

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
        if (event.type !== "order:updated" || event.id !== id) return;
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
