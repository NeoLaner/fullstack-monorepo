import { HydrateClient } from "~/trpc/server";

export default function Page() {
  return (
    <HydrateClient>
      <div>dash</div>
    </HydrateClient>
  );
}
