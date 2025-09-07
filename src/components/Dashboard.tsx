import { useState, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Settings, Plus, Grid3X3 } from "lucide-react";
import { Visualization, GridLayout } from "@/types";
import VisualizationCard from "./VisualizationCard";
import ConfigEditor from "./ConfigEditor";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  visualizations: Visualization[];
  dashboardLayouts: { [key: string]: any[] };
  onVisualizationUpdate: (id: string, updates: Partial<Visualization>) => void;
  onVisualizationRemove: (id: string) => void;
  onLayoutChange: (layouts: { [key: string]: any[] }) => void;
}

const Dashboard = ({ visualizations, dashboardLayouts, onVisualizationUpdate, onVisualizationRemove, onLayoutChange }: DashboardProps) => {
  const [selectedVisualization, setSelectedVisualization] = useState<Visualization | null>(null);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const { toast } = useToast();

  // Generate default layout for visualizations with proper sizing
  const defaultLayout: Layout[] = useMemo(() => {
    return visualizations.map((viz, index) => {
      const configData = viz.config_used?.data?.visualization;
      let width = 6;
      let height = 4;
      
      // Calculate grid units from pixel dimensions (60px per unit + 16px margin)
      if (configData && configData.width && configData.height) {
        width = Math.max(Math.ceil((configData.width + 100) / 76), 4);
        height = Math.max(Math.ceil((configData.height + 150) / 76), 3);
      }
      
      return {
        i: viz.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * height,
        w: width,
        h: height,
        minW: 4,
        minH: 3,
      };
    });
  }, [visualizations]);

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    onLayoutChange(layouts);
  };

  const handleDownload = (visualization: Visualization) => {
    toast({
      title: "Download started",
      description: `Downloading ${visualization.title || 'visualization'}...`,
    });
  };

  const handleConfigChange = (visualization: Visualization) => {
    setSelectedVisualization(visualization);
    setIsConfigEditorOpen(true);
  };

  const handleConfigSave = (config: Record<string, any>) => {
    if (selectedVisualization) {
      onVisualizationUpdate(selectedVisualization.id, {
        config_used: config,
        // In a real app, you might regenerate the figure here based on new config
      });
      
      toast({
        title: "Configuration updated",
        description: "Visualization configuration has been updated.",
      });
    }
    setIsConfigEditorOpen(false);
    setSelectedVisualization(null);
  };

  const handleDownloadAll = () => {
    const dashboardElement = document.querySelector('.layout');
    if (!dashboardElement) return;
    
    toast({
      title: "Download all started",
      description: `Creating dashboard screenshot...`,
    });
    
    html2canvas(dashboardElement as HTMLElement, {
      backgroundColor: '#0a0a0b',
      scale: 2,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dashboard_${timestamp}.png`;
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
      
      toast({
        title: "Download complete",
        description: `Dashboard saved as ${filename}`,
      });
    }).catch((err) => {
      console.error('Failed to download dashboard:', err);
      toast({
        title: "Download failed",
        description: "Could not create dashboard screenshot",
        variant: "destructive"
      });
    });
  };

  if (visualizations.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] dashboard-bg">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center space-y-6 p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Grid3X3 className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              No Visualizations Yet
            </h2>
            <p className="text-muted-foreground max-w-md">
              Start chatting with your data to generate visualizations. 
              They'll appear here where you can arrange, resize, and customize them.
            </p>
          </div>
          
          <Card className="p-6 max-w-md card-elevated">
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-sm">Dashboard Features:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Drag and drop to rearrange</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Resize by dragging corners</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Configure and download</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] dashboard-bg">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                {visualizations.length} visualization{visualizations.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Button onClick={handleDownloadAll} className="transition-smooth">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="p-6">
        <ResponsiveGridLayout
          className="layout"
          layouts={dashboardLayouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {visualizations.map((visualization) => (
            <div key={visualization.id}>
              <VisualizationCard
                visualization={visualization}
                onDownload={() => handleDownload(visualization)}
                onConfigChange={() => handleConfigChange(visualization)}
                onRemove={() => onVisualizationRemove(visualization.id)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Configuration Editor */}
      <ConfigEditor
        isOpen={isConfigEditorOpen}
        visualization={selectedVisualization}
        onSave={handleConfigSave}
        onClose={() => {
          setIsConfigEditorOpen(false);
          setSelectedVisualization(null);
        }}
      />
    </div>
  );
};

export default Dashboard;