import { cn } from "@neolaner/ui/lib/utils";;

export default function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col gap-6", className)} {...props}>
      {props.children}
    </section>
  );
}
