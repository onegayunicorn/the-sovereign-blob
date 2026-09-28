import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = "bottom",
  title = "Panel",
  ...props
}: React.ComponentProps<typeof Dialog.Content> & { side?: "bottom" | "right"; title?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/70" />
      <Dialog.Content
        className={cn(
          "fixed z-50 flex flex-col bg-surface text-fg shadow-soft",
          side === "bottom"
            ? "inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl border-t border-border"
            : "inset-y-0 right-0 h-full w-full max-w-md border-l border-border",
          className,
        )}
        {...props}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        <div className="flex justify-end p-3">
          <Dialog.Close className="grid size-11 place-items-center rounded-md text-muted hover:text-fg">
            <X className="size-4" />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
