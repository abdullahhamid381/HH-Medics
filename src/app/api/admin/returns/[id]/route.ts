import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { updateReturnStatus } from "@/lib/db/returns";

const schema = z.object({
  status: z.enum(["requested", "approved", "rejected", "refunded"]),
  adminNote: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const returnRequest = await updateReturnStatus(id, parsed.data.status, parsed.data.adminNote);
  if (!returnRequest) {
    return NextResponse.json({ error: "Return request not found" }, { status: 404 });
  }
  return NextResponse.json({ returnRequest });
}
