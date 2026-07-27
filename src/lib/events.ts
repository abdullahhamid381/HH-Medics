import { EventEmitter } from "node:events";

// Single shared in-process event bus for order lifecycle events, mirroring
// the singleton pattern used for the db connection (src/lib/db/index.ts).
// This assumes a single long-running Node server (true here — same
// assumption node:sqlite already relies on), not a multi-instance/serverless
// deployment, where this would need swapping for a real pub/sub backend.

declare global {
  // eslint-disable-next-line no-var
  var __medistoreEvents__: EventEmitter | undefined;
}

export const orderEvents: EventEmitter =
  globalThis.__medistoreEvents__ ?? new EventEmitter();
orderEvents.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalThis.__medistoreEvents__ = orderEvents;
}

export interface OrderCreatedPayload {
  type: "order:created";
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface OrderUpdatedPayload {
  type: "order:updated";
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  updatedAt: string;
}

export type OrderEvent = OrderCreatedPayload | OrderUpdatedPayload;

const CHANNEL = "order-event";

export function emitOrderEvent(event: OrderEvent) {
  orderEvents.emit(CHANNEL, event);
}

export function onOrderEvent(listener: (event: OrderEvent) => void) {
  orderEvents.on(CHANNEL, listener);
  return () => orderEvents.off(CHANNEL, listener);
}
