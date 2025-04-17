import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@neolaner/ui/components/ui/button";
import { cn } from "@neolaner/ui/lib/utils";;

export function SubmitBtn({
  className,
  disabled,
  pendingActionState,
  children,
  pendingMessage,
  ...props
}: React.ComponentProps<"button"> & {
  pendingMessage?: string;
  pendingActionState?: boolean;
}) {
  const { pending: formPending } = useFormStatus();
  const pending = formPending || pendingActionState;

  return (
    <Button
      disabled={pending ?? disabled ?? pendingActionState}
      type="submit"
      className={cn(className, "w-full", "disabled:cursor-not-allowed")}
      {...props}
    >
      {pending && (
        <>
          <Loader2 className="animate-spin" />
          {pendingMessage ?? "Please wait..."}
        </>
      )}
      {!pending && children}
    </Button>
  );
}
