
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Upload, 
  FileSpreadsheet, 
  GanttChart, 
  Play, 
  MenuIcon, 
  X 
} from "lucide-react";

const menuItems = [
  { icon: Home, name: "Home", path: "/" },
  { icon: Upload, name: "Upload Excel", path: "/upload" },
  { icon: FileSpreadsheet, name: "View Uploaded Files", path: "/files" },
  { icon: GanttChart, name: "Create Rules", path: "/rules/create" },
  { icon: Play, name: "Execute Rules", path: "/rules/execute" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        "h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-sidebar-foreground font-bold text-lg">
            Flight Flow
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded-md"
        >
          {collapsed ? <MenuIcon size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="flex flex-col flex-grow p-2 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center rounded-md px-3 py-2 transition-colors",
              location.pathname === item.path
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 text-xs text-sidebar-foreground opacity-50 border-t border-sidebar-border">
        {!collapsed && "Flight Allocation v1.0"}
      </div>
    </div>
  );
};
