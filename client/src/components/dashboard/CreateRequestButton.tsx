import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "wouter";

export default function CreateRequestButton() {
  return (
    <Link href="/request/new">
      <Button className="flex items-center">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Request
      </Button>
    </Link>
  );
}
