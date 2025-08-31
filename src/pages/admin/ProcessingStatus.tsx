import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, XCircle, Download, RefreshCw, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProcessingJob {
  id: string;
  shop: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  files: number;
  products: number;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  currentFile?: string;
  currentStep?: string;
  estimatedTime?: number;
  priority: 'low' | 'medium' | 'high';
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeJobs: number;
  queueLength: number;
  throughput: number;
  errorRate: number;
}

export default function ProcessingStatus() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    activeJobs: 0,
    queueLength: 0,
    throughput: 0,
    errorRate: 0
  });

  // Mock data representing our preprocessing system's current status
  const mockJobs: ProcessingJob[] = [
    {
      id: '1',
      shop: 'MEGA',
      status: 'completed',
      files: 18,
      products: 13232,
      progress: 100,
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '2',
      shop: 'AUCHAN',
      status: 'processing',
      files: 10,
      products: 8462,
      progress: 65,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      currentFile: 'auchan-lactate-2025-01-29.json',
      currentStep: 'Normalizing products',
      estimatedTime: 45,
      priority: 'medium'
    },
    {
      id: '3',
      shop: 'CARREFOUR',
      status: 'pending',
      files: 5,
      products: 30210,
      progress: 0,
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      priority: 'low'
    },
    {
      id: '4',
      shop: 'LIDL',
      status: 'failed',
      files: 6,
      products: 441,
      progress: 23,
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      error: 'Price extraction failed for 15% of products',
      priority: 'medium'
    },
    {
      id: '5',
      shop: 'FRESHFUL',
      status: 'processing',
      files: 72,
      products: 18461,
      progress: 89,
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      currentFile: 'freshful-bacanie-2025-01-29.json',
      currentStep: 'Generating category shards',
      estimatedTime: 12,
      priority: 'high'
    }
  ];

  useEffect(() => {
    setJobs(mockJobs);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpuUsage: Math.random() * 100,
        memoryUsage: 60 + Math.random() * 30,
        activeJobs: mockJobs.filter(j => j.status === 'processing').length,
        queueLength: mockJobs.filter(j => j.status === 'pending').length,
        throughput: 1500 + Math.random() * 500,
        errorRate: Math.random() * 5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleJobAction = (jobId: string, action: 'start' | 'pause' | 'stop') => {
    console.log(`${action} job:`, jobId);
    // In a real app, this would send commands to the preprocessing system
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ProcessingJob['status']) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      pending: 'outline',
      failed: 'destructive',
      paused: 'secondary',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: ProcessingJob['priority']) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
    } as const;

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesShop = selectedShop === 'all' || job.shop.toLowerCase() === selectedShop;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    return matchesShop && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    totalProducts: jobs.reduce((sum, j) => sum + j.products, 0),
    totalFiles: jobs.reduce((sum, j) => sum + j.files, 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processing Status</h1>
        <p className="text-muted-foreground">
          Monitor real-time status of preprocessing jobs and system performance
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{Math.round(systemMetrics.cpuUsage)}%</span>
              </div>
              <Progress value={systemMetrics.cpuUsage} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{Math.round(systemMetrics.memoryUsage)}%</span>
              </div>
              <Progress value={systemMetrics.memoryUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Job Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Jobs</span>
                <span className="font-medium">{systemMetrics.activeJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Queue Length</span>
                <span className="font-medium">{systemMetrics.queueLength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Throughput</span>
                <span className="font-medium">{Math.round(systemMetrics.throughput)} products/min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                systemMetrics.errorRate > 3 ? 'text-red-600' : 
                systemMetrics.errorRate > 1 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {systemMetrics.errorRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Processing errors
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All shops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Job Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select shop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                <SelectItem value="mega">MEGA</SelectItem>
                <SelectItem value="auchan">AUCHAN</SelectItem>
                <SelectItem value="carrefour">CARREFOUR</SelectItem>
                <SelectItem value="lidl">LIDL</SelectItem>
                <SelectItem value="freshful">FRESHFUL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Processing Jobs</CardTitle>
              <CardDescription>
                Complete overview of all preprocessing jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">{job.shop}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.files} files • {job.products.toLocaleString()} products
                        </p>
                        {job.currentFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {job.currentFile}
                          </p>
                        )}
                        {job.currentStep && (
                          <p className="text-xs text-muted-foreground">
                            Step: {job.currentStep}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(job.status)}
                      {getPriorityBadge(job.priority)}
                      {job.status === 'processing' && (
                        <div className="text-right text-sm">
                          <div className="flex justify-between">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2 w-24" />
                          {job.estimatedTime && (
                            <p className="text-xs text-muted-foreground">
                              ~{job.estimatedTime} min remaining
                            </p>
                          )}
                        </div>
                      )}
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{job.startedAt.toLocaleTimeString()}</p>
                        {job.completedAt && (
                          <p>Completed: {job.completedAt.toLocaleTimeString()}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {job.status === 'pending' && (
                          <Button size="sm" onClick={() => handleJobAction(job.id, 'start')}>
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === 'processing' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleJobAction(job.id, 'pause')}>
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleJobAction(job.id, 'stop')}>
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {job.status === 'paused' && (
                          <Button size="sm" onClick={() => handleJobAction(job.id, 'start')}>
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>
                Currently running preprocessing jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.filter(j => j.status === 'processing').map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-4">
                      <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                      <div>
                        <p className="font-medium">{job.shop}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.currentFile} • {job.currentStep}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">{job.progress}%</div>
                        <Progress value={job.progress} className="h-2 w-20" />
                      </div>
                      {job.estimatedTime && (
                        <div className="text-sm text-muted-foreground">
                          ~{job.estimatedTime} min
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Jobs</CardTitle>
              <CardDescription>
                Successfully completed preprocessing jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.filter(j => j.status === 'completed').map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">{job.shop}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.files} files • {job.products.toLocaleString()} products
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default">Completed</Badge>
                      <div className="text-sm text-muted-foreground">
                        {job.completedAt?.toLocaleTimeString()}
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Jobs</CardTitle>
              <CardDescription>
                Jobs that encountered errors during processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.filter(j => j.status === 'failed').map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-4">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">{job.shop}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.files} files • {job.products.toLocaleString()} products
                        </p>
                        {job.error && (
                          <p className="text-sm text-red-600 mt-1">{job.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">Failed</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start All Pending
            </Button>
            <Button variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause All Active
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Results
            </Button>
            <Button variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              View Error Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
