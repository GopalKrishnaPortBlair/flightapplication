
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileSpreadsheet, 
  GanttChart, 
  Play,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Upload className="h-12 w-12 text-sky-500" />,
      title: "Upload Excel",
      description: "Upload Excel files containing flight data for processing",
      action: () => navigate("/upload"),
    },
    {
      icon: <FileSpreadsheet className="h-12 w-12 text-sky-500" />,
      title: "View Files",
      description: "Browse and manage your uploaded Excel files",
      action: () => navigate("/files"),
    },
    {
      icon: <GanttChart className="h-12 w-12 text-sky-500" />,
      title: "Create Rules",
      description: "Define processing rules for flight data analysis",
      action: () => navigate("/rules/create"),
    },
    {
      icon: <Play className="h-12 w-12 text-sky-500" />,
      title: "Execute Rules",
      description: "Run defined rules against your uploaded flight data",
      action: () => navigate("/rules/execute"),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">
          Flight Allocation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          An intelligent platform for processing, analyzing, and extracting insights 
          from flight data using Excel files and custom rules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className="p-6 card-hover border-l-4 border-l-sky-500"
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 mb-4 flex-grow">{feature.description}</p>
              <Button 
                onClick={feature.action}
                className="w-full bg-sky-500 hover:bg-sky-600"
              >
                <span>Get Started</span>
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 max-w-3xl mx-auto text-center">
        <Card className="p-6 bg-navy-50">
          <h2 className="text-2xl font-semibold mb-4">About Flight Allocation</h2>
          <p className="text-gray-600">
            Our platform simplifies the process of flight data management, enabling airlines and flight 
            operators to easily upload Excel files, create custom processing rules, and execute these rules 
            to gain valuable insights that optimize operations and enhance decision-making.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
