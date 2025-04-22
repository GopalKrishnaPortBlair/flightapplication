
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import CreateRules from "./pages/CreateRules";
import ExecuteRules from "./pages/ExecuteRules";
import NotFound from "./pages/NotFound";
import FileDetails from "./pages/FileDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/upload" element={<AppLayout><Upload /></AppLayout>} />
          <Route path="/files" element={<AppLayout><Files /></AppLayout>} />
          <Route path="/file/:id" element={<FileDetails />} />

          <Route path="/rules/create" element={<AppLayout><CreateRules /></AppLayout>} />
          <Route path="/rules/execute" element={<AppLayout><ExecuteRules /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
