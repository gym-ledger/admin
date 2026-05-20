"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProgramsTable() {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="ml-auto">
          <Button asChild size="sm">
            <Link href="/programs/new">
              <Plus className="size-4" /> New program
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">Visibility</th>
                <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                  No workout programs yet.{" "}
                  <Link href="/programs/new" className="text-indigo-600 hover:underline">
                    Create your first one.
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
