
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileUp, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Upload = () => {
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Check if file is an Excel file
    const validExts = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExts.includes(ext)) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }
    
    setFile(file);
  };
  
  const handleUpload = async () => {
    if (!file) return;
  
    setUploading(true);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });
  
      // Log the full response from the backend
      console.log("Upload response:", response);
  
      // Check if response is successful
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
  
      // Parse the response
      const result = await response.json();
      console.log("Parsed result:", result);  // Log the result for debugging
  
      // Check if the response contains file_reference
      if (result && result.file_reference) {
        toast({
          title: "Upload successful",
          description: `File "${file.name}" uploaded and processed. Reference: ${result.file_reference}`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Missing file reference in the response.",
          variant: "destructive",
        });
      }
  
      setFile(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Upload Excel File</h1>
      
      <Card className="p-8 max-w-2xl mx-auto">
        <div 
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            dragging ? "border-sky-500 bg-sky-50" : "border-gray-300"
          } transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-500">
                <Check className="h-16 w-16 mr-2" />
              </div>
              <h3 className="text-xl font-medium">File Selected</h3>
              <p className="text-gray-500">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  {uploading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-sky-500">
                <UploadIcon className="h-16 w-16" />
              </div>
              <h3 className="text-xl font-medium">Drag & Drop Excel File test</h3>
              <p className="text-gray-500">or click to browse your files</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileSelect}
              />
              <div>
                <Button 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-semibold text-orange-800">Important Note</h4>
              <p className="text-sm text-orange-700">
                This is a frontend demo. In a complete version, uploaded files would be 
                processed by a Python backend which would handle Excel parsing and rule execution.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Acceptable File Formats</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Microsoft Excel (.xlsx, .xls)</li>
          <li>CSV (.csv)</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Maximum file size: 10MB. For larger files, please contact support.
        </p>
      </Card>
    </div>
  );
};

export default Upload;
