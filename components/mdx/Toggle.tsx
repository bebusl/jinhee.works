"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export function Toggle({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="my-4 rounded-lg border border-border">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors rounded-lg">
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
