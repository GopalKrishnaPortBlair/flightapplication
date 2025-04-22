
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download,
  Loader2,
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock data
const rules = [
  { id: 1, name: "Update Flight Statuses", description: "Updates flight status based on delay time" },
  { id: 2, name: "Calculate Fuel Efficiency", description: "Calculates fuel efficiency metrics" },
  { id: 3, name: "Flag Maintenance Needs", description: "Flags aircraft that require maintenance" },
];

const files = [
  { id: 1, name: "Flight_Schedule_Q1_2025.xlsx", rows: 256 },
  { id: 2, name: "Passenger_Manifests_March.xlsx", rows: 1024 },
  { id: 3, name: "Crew_Rotations_Q2.xlsx", rows: 154 },
  { id: 4, name: "Maintenance_Logs_2025.csv", rows: 512 },
];

interface ExecutionHistory {
  id: number;
  ruleName: string;
  fileName: string;
  startTime: string;
  duration: string;
  status: "completed" | "running" | "failed" | "queued";
  rowsProcessed: number;
  rowsModified: number;
}

// Mock execution history
const mockHistory: ExecutionHistory[] = [
  {
    id: 1,
    ruleName: "Update Flight Statuses",
    fileName: "Flight_Schedule_Q1_2025.xlsx",
    startTime: "2025-04-14 10:23:45",
    duration: "0:00:32",
    status: "completed",
    rowsProcessed: 256,
    rowsModified: 45
  },
  {
    id: 2,
    ruleName: "Calculate Fuel Efficiency",
    fileName: "Maintenance_Logs_2025.csv",
    startTime: "2025-04-14 09:58:12",
    duration: "0:01:05",
    status: "completed",
    rowsProcessed: 512,
    rowsModified: 512
  },
  {
    id: 3,
    ruleName: "Flag Maintenance Needs",
    fileName: "Crew_Rotations_Q2.xlsx",
    startTime: "2025-04-14 09:45:30",
    duration: "0:00:18",
    status: "failed",
    rowsProcessed: 56,
    rowsModified: 0
  }
];

const ExecuteRules = () => {
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<ExecutionHistory[]>(mockHistory);
  
  const handleExecute = () => {
    if (!selectedRule || !selectedFile) return;
    
    setIsExecuting(true);
    setProgress(0);
    
    // Find rule and file details
    const rule = rules.find(r => r.id.toString() === selectedRule);
    const file = files.find(f => f.id.toString() === selectedFile);
    
    if (!rule || !file) {
      setIsExecuting(false);
      return;
    }
    
    // Add a new "running" execution to history
    const newExecution: ExecutionHistory = {
      id: Math.max(...history.map(h => h.id)) + 1,
      ruleName: rule.name,
      fileName: file.name,
      startTime: new Date().toLocaleString(),
      duration: "0:00:00",
      status: "running",
      rowsProcessed: 0,
      rowsModified: 0
    };
    
    setHistory([newExecution, ...history]);
    
    // Simulate progress
    let currentProgress = 0;
    const intervalId = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(intervalId);
        
        // Update history with completed execution
        setHistory(prev => prev.map(item => 
          item.id === newExecution.id 
            ? {
                ...item, 
                status: "completed",
                duration: "0:00:" + Math.floor(Math.random() * 50 + 10),
                rowsProcessed: file.rows,
                rowsModified: Math.floor(file.rows * Math.random() * 0.8)
              } 
            : item
        ));
        
        setTimeout(() => {
          setIsExecuting(false);
          setProgress(0);
        }, 500);
      }
      setProgress(Math.floor(currentProgress));
    }, 500);
  };
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Execute Rules</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">New Execution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Select Rule</label>
                <Select value={selectedRule} onValueChange={setSelectedRule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id.toString()}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRule && (
                  <p className="text-xs text-gray-500 mt-1">
                    {rules.find(r => r.id.toString() === selectedRule)?.description}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Select File</label>
                <Select value={selectedFile} onValueChange={setSelectedFile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {files.map((file) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {files.find(f => f.id.toString() === selectedFile)?.rows} rows
                  </p>
                )}
              </div>
            </div>
            
            {isExecuting && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <Button 
              onClick={handleExecute}
              className="bg-sky-500 hover:bg-sky-600"
              disabled={!selectedRule || !selectedFile || isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Execute Rule
                </>
              )}
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Execution History</h2>
            
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">{execution.ruleName}</TableCell>
                        <TableCell>{execution.fileName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {execution.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            ) : execution.status === "running" ? (
                              <Loader2 className="h-4 w-4 text-sky-500 mr-1 animate-spin" />
                            ) : execution.status === "failed" ? (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-500 mr-1" />
                            )}
                            <span className="capitalize">{execution.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {execution.rowsProcessed} rows
                          {execution.rowsModified > 0 && (
                            <span className="text-xs text-gray-500 block">
                              {execution.rowsModified} modified
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {execution.status === "completed" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Result
                            </Button>
                          )}
                          {execution.status === "failed" && (
                            <Button variant="outline" size="sm" className="text-red-500">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Logs
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No executions yet
              </div>
            )}
          </Card>
        </div>
        
        <Card className="p-6 lg:row-span-2">
          <h2 className="text-xl font-semibold mb-4">Execution Stats</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-md p-4">
              <div className="text-blue-500 mb-1 text-3xl font-bold">
                {history.filter(h => h.status === "completed").length}
              </div>
              <div className="text-sm text-blue-700">Completed</div>
            </div>
            
            <div className="bg-red-50 rounded-md p-4">
              <div className="text-red-500 mb-1 text-3xl font-bold">
                {history.filter(h => h.status === "failed").length}
              </div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            
            <div className="bg-green-50 rounded-md p-4">
              <div className="text-green-500 mb-1 text-3xl font-bold">
                {history.reduce((sum, h) => sum + h.rowsModified, 0)}
              </div>
              <div className="text-sm text-green-700">Rows Modified</div>
            </div>
            
            <div className="bg-orange-50 rounded-md p-4">
              <div className="text-orange-500 mb-1 text-3xl font-bold">
                {history.filter(h => h.status === "running").length}
              </div>
              <div className="text-sm text-orange-700">In Progress</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                View All Results
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Execution
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Error Logs
              </Button>
            </div>
          </div>
          
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-semibold text-orange-800">Demo Mode</h4>
                <p className="text-sm text-orange-700">
                  In a complete implementation, rules would be executed by a Python backend 
                  that processes Excel files and returns results.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExecuteRules;
