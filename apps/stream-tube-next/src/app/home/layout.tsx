import { type ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="h-fit">
      <div className="h-full pt-8 pr-4 pl-4 md:pl-8">{children}</div>
    </section>
  );
}

export default Layout;
