"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatView } from "@/components/chat/ChatView";

export default function Home() {
  const hydrate = useChatStore((s) => s.hydrate);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Header onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        <ChatView />
      </div>
    </div>
  );
}
