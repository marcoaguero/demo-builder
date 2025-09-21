import React from "react";
import { useFastSpring } from "../context/FastSpringContext";

export default function Header() {
  const { status } = useFastSpring();
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-black text-white grid place-items-center font-bold">
            DB
          </div>
          <span className="font-semibold">Demo Builder</span>
        </div>
        {/* <nav className="flex items-center gap-6 text-sm">
          <a href="#about" className="hover:opacity-80">
            About
          </a>
          <a href="#contact" className="hover:opacity-80">
            Contact
          </a>
          <span className="text-xs px-2 py-1 rounded bg-gray-100">
            {status}
          </span>
        </nav> */}
      </div>
    </header>
  );
}
