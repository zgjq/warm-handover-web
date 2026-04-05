import type { Metadata } from "next";
import { NotificationProvider } from "@/context/NotificationContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warm Handover — 有尊严的交接",
  description: "将冰冷的离别化为温暖的交接。让一个人好好告别，让另一个人好好开始。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <NotificationProvider>
          <nav className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 text-orange-600 font-bold text-lg hover:opacity-80 transition-opacity">
                🤝 Warm Handover
              </a>
              <div className="flex gap-4 text-sm">
                <a href="/" className="text-gray-600 hover:text-orange-600 transition-colors">首页</a>
                <a href="/new" className="text-gray-600 hover:text-orange-600 transition-colors">新建交接</a>
                <a href="/dashboard" className="text-gray-600 hover:text-orange-600 transition-colors">看板</a>
                <a href="/list" className="text-gray-600 hover:text-orange-600 transition-colors">我的交接</a>
              </div>
            </div>
          </nav>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
