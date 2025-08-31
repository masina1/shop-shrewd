import React, { useState, useCallback } from 'react';
import { Upload, FileText, Database, BarChart3, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ProcessingJob {
  id: string;
  shop: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  files: number;
  products: number;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export default function DataIngestion() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const { toast } = useToast();

  // Mock data for demonstration
  const recentJobs: ProcessingJob[] = [
    {
      id: '1',
      shop: 'MEGA',
      status: 'completed',
      files: 18,
      products: 13232,
      progress: 100,
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    },
    {
      id: '2',
      shop: 'AUCHAN',
      status: 'completed',
      files: 10,
      products: 8462,
      progress: 100,
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      completedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
    },
    {
      id: '3',
      shop: 'CARREFOUR',
      status: 'completed',
      files: 5,
      products: 30210,
      progress: 100,
      startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      completedAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
    },
    {
      id: '4',
      shop: 'LIDL',
      status: 'completed',
      files: 6,
      products: 441,
      progress: 100,
      startedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
      completedAt: new Date(Date.now() - 9.5 * 60 * 60 * 1000),
    },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate processing
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);
      
      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} files uploaded and queued for processing`,
      });

      // Add new job to the list
      const newJob: ProcessingJob = {
        id: Date.now().toString(),
        shop: 'NEW_UPLOAD',
        status: 'pending',
        files: selectedFiles.length,
        products: 0,
        progress: 0,
        startedAt: new Date(),
      };
      
      setProcessingJobs(prev => [newJob, ...prev]);
    }, 2000);
  }, [selectedFiles, toast]);

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ProcessingJob['status']) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
        <p className="text-muted-foreground">
          Upload and process shop data files for price comparison
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Shop Data
          </CardTitle>
          <CardDescription>
            Upload JSON files from your shop scraping sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} file(s) selected`
                      : 'Click to select files or drag and drop'
                    }
                  </p>
                  {selectedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFiles.map(f => f.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </CardContent>
      </Card>

      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Processing Status
          </CardTitle>
          <CardDescription>
            Monitor the status of your data processing jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="font-medium">{job.shop}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.files} files • {job.products.toLocaleString()} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(job.status)}
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{job.startedAt.toLocaleTimeString()}</p>
                    {job.completedAt && (
                      <p>Completed: {job.completedAt.toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70,406</div>
            <p className="text-xs text-muted-foreground">
              Across all shops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              MEGA, AUCHAN, CARREFOUR, LIDL, FRESHFUL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Properly categorized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Processed Data
          </CardTitle>
          <CardDescription>
            Access your processed and categorized data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download All Data (ZIP)
            </Button>
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Download Reports
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Data is automatically processed and categorized using our advanced preprocessing system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
