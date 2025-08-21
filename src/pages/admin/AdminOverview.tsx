import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Store,
  Tag,
  TrendingUp,
  Bell,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Play,
  Upload,
  Merge
} from "lucide-react";
import { mockKPIs, mockImports, mockScrapers, mockDataQuality, getStoreById } from "@/lib/adminMockData";

export default function AdminOverview() {
  const kpis = [
    {
      title: "Products",
      value: mockKPIs.totalProducts,
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Offers",  
      value: mockKPIs.totalOffers,
      icon: Tag,
      color: "text-accent"
    },
    {
      title: "Active Stores",
      value: mockKPIs.activeStores,
      icon: Store,
      color: "text-success"
    },
    {
      title: "Price Updates Today",
      value: mockKPIs.priceUpdatesToday,
      icon: TrendingUp,
      color: "text-muted-foreground"
    },
    {
      title: "Alerts Queued",
      value: mockKPIs.alertsQueued,
      icon: Bell,
      color: "text-destructive"
    }
  ];

  const ctaActions = [
    { title: "Add Product", icon: Plus, action: () => window.location.href = '/admin/products/new' },
    { title: "Add Offer", icon: Plus, action: () => window.location.href = '/admin/offers/new' },
    { title: "Run Dedupe", icon: Merge, action: () => console.log('Running deduplication...') },
    { title: "Start Import", icon: Upload, action: () => window.location.href = '/admin/ingestion' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Monitor your supermarket price comparison platform
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Imports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Imports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockImports.map((importJob) => (
                <div key={importJob.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{importJob.file}</p>
                    <p className="text-sm text-muted-foreground">
                      {importJob.rows} rows • {importJob.duration}
                    </p>
                  </div>
                  <Badge 
                    variant={importJob.status === 'success' ? 'default' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {importJob.status === 'success' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {importJob.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scrapers Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Scrapers Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockScrapers.map((scraper) => {
                const store = getStoreById(scraper.storeId);
                return (
                  <div key={scraper.storeId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{store?.name}</p>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {scraper.lastRun}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Success: {Math.round(scraper.successRate * 100)}%</span>
                      <span>Changed: {scraper.changed}</span>
                      <span>Errors: {scraper.errors}</span>
                    </div>
                    <Progress value={scraper.successRate * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Next run: {scraper.nextRun}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Data Quality Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Duplicates</span>
                <Badge variant="secondary">{mockDataQuality.duplicates}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Missing Images</span>
                <Badge variant="secondary">{mockDataQuality.missingImages}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Unit Conflicts</span>
                <Badge variant="secondary">{mockDataQuality.unitConflicts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Name Mismatches</span>
                <Badge variant="secondary">{mockDataQuality.nameMismatches}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Price Drops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Price Drops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lapte 1.5% 1.5L</p>
                  <p className="text-sm text-muted-foreground">Freshful</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground line-through">14.39 RON</p>
                  <p className="font-medium text-success">12.49 RON</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mușchi file 100g</p>
                  <p className="text-sm text-muted-foreground">Freshful</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground line-through">7.99 RON</p>
                  <p className="font-medium text-success">7.09 RON</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {ctaActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={action.action}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}