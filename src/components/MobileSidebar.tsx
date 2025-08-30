import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="p-0 w-64"
      >
        <DashboardSidebar />
      </SheetContent>
    </Sheet>
  );
}