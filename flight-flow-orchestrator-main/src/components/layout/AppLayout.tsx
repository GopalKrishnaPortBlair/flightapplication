
import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="app-container">
      <AppSidebar />
      <main className="page-container">
        {children}
      </main>
    </div>
  );
};
