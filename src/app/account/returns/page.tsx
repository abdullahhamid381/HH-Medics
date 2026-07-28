import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listOrdersForUser } from "@/lib/db/orders";
import { listReturnsForUser } from "@/lib/db/returns";
import { listAddresses } from "@/lib/db/users";
import { AccountTabs } from "@/components/site/account-tabs";

export default async function AccountReturnsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/returns");

  const orders = await listOrdersForUser(session.user.id);
  const returns = await listReturnsForUser(session.user.id);
  const addresses = await listAddresses(session.user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          My account
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Returns & refunds</h1>
      </div>
      <AccountTabs orders={orders} returns={returns} addresses={addresses} defaultTab="returns" />
    </div>
  );
}
