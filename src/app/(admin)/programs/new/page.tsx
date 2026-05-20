import type { Metadata } from "next";
import { ProgramBuilder } from "@/features/programs/components/program-builder/index";

export const metadata: Metadata = { title: "New Program — GymAdmin" };

export default function NewProgramPage() {
  return <ProgramBuilder />;
}
