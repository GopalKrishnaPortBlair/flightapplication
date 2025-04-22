import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS_PER_PAGE = 10;

const FileDetailsPage = () => {
  const { id } = useParams();
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/filesv1/${id}`);
        setFileName(response.data.file.file_name);
        setRecords(response.data.records);
      } catch (error) {
        console.error("Error fetching file details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  if (!fileName || records.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/files">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-primary">File not found or empty</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">No data available for this file.</p>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil(records.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);
  const columns = Object.keys(records[0]);

  return (
    <div className="animate-fade-in space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link to="/files">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              {fileName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, records.length)} of {records.length} entries
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead 
                    key={column}
                    className="py-3 px-4 text-sm font-semibold text-primary"
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell 
                      key={column}
                      className="py-3 px-4"
                    >
                      {String(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                Previous
              </Button>
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};


export default FileDetailsPage;
