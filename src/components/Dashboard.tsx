import { useState, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Settings, Plus, Grid3X3 } from "lucide-react";
import { Visualization, GridLayout } from "@/types";
import VisualizationCard from "./VisualizationCard";
import ConfigEditor from "./ConfigEditor";
import { useToast } from "@/hooks/use-toast";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  visualizations: Visualization[];
  onVisualizationUpdate: (id: string, updates: Partial<Visualization>) => void;
  onVisualizationRemove: (id: string) => void;
}

const Dashboard = ({ visualizations, onVisualizationUpdate, onVisualizationRemove }: DashboardProps) => {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [selectedVisualization, setSelectedVisualization] = useState<Visualization | null>(null);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const { toast } = useToast();

  // Generate default layout for visualizations
  const defaultLayout: Layout[] = useMemo(() => {
    return visualizations.map((viz, index) => ({
      i: viz.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 4,
      w: 6,
      h: 4,
      minW: 4,
      minH: 3,
    }));
  }, [visualizations]);

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
  };

  const handleDownload = (visualization: Visualization) => {
    // Mock download implementation
    toast({
      title: "Download started",
      description: `Downloading ${visualization.title || 'visualization'}...`,
    });
    
    // In a real implementation, this would trigger the actual download
    console.log('Downloading visualization:', visualization);
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
    toast({
      title: "Download all started",
      description: `Downloading all ${visualizations.length} visualizations...`,
    });
    
    // In a real implementation, this would create a zip file or similar
    console.log('Downloading all visualizations:', visualizations);
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
          layouts={layouts}
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