import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { getMessages } from "@/libs/i18n/getMessages";
import { getKudoHashtags } from "@/app/kudos/actions";
import { KudoComposer } from "@/components/kudos/KudoComposer";

// Standalone compose route — Viết Kudo spec (ihQ26W78P2) FR-001.
// PR 2 MVP: Server Component pre-fetches hashtags + messages, renders
// `<KudoComposer />` as a full-page modal (over a dark backdrop).
// The intercepting-route variant (`@modal/new/page.tsx`) is deferred
// to PR 4 polish once patterns settle.

export default async function NewKudoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/kudos/new");
  }

  const [{ messages }, hashtags] = await Promise.all([
    getMessages(),
    getKudoHashtags(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-brand-900)]">
      <KudoComposer hashtags={hashtags} messages={messages} />
    </main>
  );
}
