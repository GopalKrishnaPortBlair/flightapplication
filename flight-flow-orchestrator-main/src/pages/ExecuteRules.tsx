import { useEffect, useState } from "react";
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
  FileSpreadsheet,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

import DataTable from "@/components/DataTable";
// Mock data for initial state
const mockRules = [
  { id: 1, name: "Update Flight Statuses", equation: "IF(delay > 30, 'DELAYED', status)", tcolumn: "Status" ,selcols : ""},
  
];

const mockFiles = [
  { id: 1, file_reference: "Flight_Schedule_Q1_2025.xlsx", upload_timestamp: "2025-03-15 14:30:22" },
  { id: 2, file_reference: "Passenger_Manifests_March.xlsx", upload_timestamp: "2025-03-20 09:15:45" },
  { id: 3, file_reference: "Crew_Rotations_Q2.xlsx", upload_timestamp: "2025-04-01 11:22:33" },
  { id: 4, file_reference: "Maintenance_Logs_2025.csv", upload_timestamp: "2025-04-10 16:45:12" },
];

// Example: Show only id, name, and amount columns
const columnsToShow = ["Year", "Actual_Aircraft", "Total_Passengers"];

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

interface Rule {
  id: number;
  name: string;
  equation: string;
  tcolumn: string;
  selcols:string
}

interface File {
  id: number;
  file_reference: string;
  upload_timestamp: string;
}

const ExecuteRules = () => {
  // Initialize with mock data until API data is loaded
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [selectedRuleDetails, setSelectedRuleDetails] = useState<Rule | null>(null);

  const [files, setFiles] = useState<File[]>(mockFiles);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileDetails, setSelectedFileDetails] = useState<File | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<ExecutionHistory[]>(mockHistory);
  const [showSelectionInfo, setShowSelectionInfo] = useState(false);

  const [currentFileReference, setCurrentFileReference] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRules = async () => {
    try {
      const response = await axios.get("http://localhost:8000/rules");
      setRules(response.data);
    } catch (err) {
      console.error("Error fetching rules:", err);
      // Keep using mock data if API fails
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:8000/files");
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      // Keep using mock data if API fails
    }
  };

  useEffect(() => {
    fetchRules();
    fetchFiles();
  }, []);

  // Update selected rule details when selectedRule changes
  useEffect(() => {
    if (selectedRule) {
      const ruleDetails = rules.find(r => r.id.toString() === selectedRule);
      setSelectedRuleDetails(ruleDetails || null);
    } else {
      setSelectedRuleDetails(null);
    }
  }, [selectedRule, rules]);

  // Update selected file details when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const fileDetails = files.find(f => f.id.toString() === selectedFile);
      setSelectedFileDetails(fileDetails || null);
    } else {
      setSelectedFileDetails(null);
    }
  }, [selectedFile, files]);

  const handleExecute = async () => {
    if (!selectedRule || !selectedFile) return;

    // Show selection info
    setShowSelectionInfo(true);
    
    setIsExecuting(true);
    setProgress(0);

    // Simulate progress with interval
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10);
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300);

    const rule = rules.find(r => r.id.toString() === selectedRule);
    const file = files.find(f => f.id.toString() === selectedFile);

    if (!rule || !file) {
      setIsExecuting(false);
      clearInterval(progressInterval);
      return;
    }


     // Update the current file reference to trigger data table reload
     setCurrentFileReference(file.file_reference);
     


    const newExecution: ExecutionHistory = {
      id: Math.max(...history.map(h => h.id), 0) + 1,
      ruleName: rule.name,
      fileName: file.file_reference,
      startTime: new Date().toLocaleString(),
      duration: "0:00:00",
      status: "running",
      rowsProcessed: 0,
      rowsModified: 0
    };

    setHistory([newExecution, ...history]);

    try {
       // Make the actual API call to execute the rule
    const response = await axios.post("http://localhost:8000/execute-rule", {
      rule_id: rule.id,
      file_id: file.id,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      
    });

    if (response.status === 200) {
      console.log("First API call successful, now triggering the second API");

      setRefreshKey(prev => prev + 1); // 🚀 Triggers re-render of DataTable
      
    }



    // Process the actual response
    const executionResult = response.data;


      
      // Mock successful response
      const mockResponse = {
        duration: "0:00:23",
        rows_processed: Math.floor(Math.random() * 500) + 100,
        rows_modified: Math.floor(Math.random() * 100)
      };

      setHistory(prev => prev.map(item =>
        item.id === newExecution.id
          ? {
              ...item,
              status: "completed",
              duration: mockResponse.duration,
              rowsProcessed: mockResponse.rows_processed,
              rowsModified: mockResponse.rows_modified
            }
          : item
      ));
    } catch (error) {
      setHistory(prev => prev.map(item =>
        item.id === newExecution.id
          ? { ...item, status: "failed" }
          : item
      ));
    } finally {
      clearInterval(progressInterval);
      setIsExecuting(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
      
      // Hide selection info after a delay
      setTimeout(() => setShowSelectionInfo(false), 5000);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Execute Rules</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">New Execution</h2>
            
            {/* Selection Information */}
            {showSelectionInfo && selectedRuleDetails && selectedFileDetails && (
              <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Selected Rule and File</h4>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Rule:</strong> {selectedRuleDetails.name} (ID: {selectedRuleDetails.id})
                    </p>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Target Column:</strong> {selectedRuleDetails.tcolumn || "Loading..."}
                    </p>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>File:</strong> {selectedFileDetails.file_reference} (ID: {selectedFileDetails.id})
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Uploaded:</strong> {selectedFileDetails.upload_timestamp}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Available Rules</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Target Column</TableHead>
                          <TableHead>Select</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.id}</TableCell>
                            <TableCell className="font-medium">{rule.name}</TableCell>
                            <TableCell>{rule.equation}</TableCell>
                            <TableCell>{rule.tcolumn || "Loading..."}</TableCell>
                            <TableCell>
                              <Button
                                variant={selectedRule === rule.id.toString() ? "secondary" : "outline"}
                                onClick={() => setSelectedRule(rule.id.toString())}
                                size="sm"
                              >
                                {selectedRule === rule.id.toString() ? "Selected" : "Select"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Available Files</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Select</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>{file.id}</TableCell>
                            <TableCell className="font-medium">{file.file_reference}</TableCell>
                            <TableCell>{file.upload_timestamp}</TableCell>
                            <TableCell>
                              <Button
                                variant={selectedFile === file.id.toString() ? "secondary" : "outline"}
                                onClick={() => setSelectedFile(file.id.toString())}
                                size="sm"
                              >
                                {selectedFile === file.id.toString() ? "Selected" : "Select"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
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
      
      {/* Full Width Execution History */}
      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Execution Results</h2>
          
          {history.length > 0 ? (
            <div className="overflow-x-auto">
             <DataTable 
              key={refreshKey}
  id={currentFileReference} 
  columnsToShow={
    typeof selectedRuleDetails?.selcols === 'string'
      ? [...selectedRuleDetails.selcols.split("||").filter(col => col.trim() !== ""), selectedRuleDetails?.tcolumn]
      : selectedRuleDetails?.tcolumn
      ? [selectedRuleDetails.tcolumn]
      : []
  }
  
/>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No Selections yet
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExecuteRules;