import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Settings, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Visualization } from "@/types";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist";
import { useRef, useCallback } from "react";

interface VisualizationCardProps {
  visualization: Visualization;
  isInChat?: boolean;
  onDownload: () => void;
  onConfigChange: () => void;
  onRemove?: () => void;
}

const VisualizationCard = ({ 
  visualization, 
  isInChat = false, 
  onDownload, 
  onConfigChange,
  onRemove 
}: VisualizationCardProps) => {
  const plotRef = useRef<any>(null);
  
  const handleDownloadVisualization = () => {
    const title = visualization.title || `${visualization.type}_visualization`;
    const filename = title.replace(/\s+/g, '_') + '.png';
    
    // Create a temporary div for the plot
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '800px';
    tempDiv.style.height = '600px';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Render plot for download
    Plotly.newPlot(tempDiv, visualization.figure.data, {
      ...visualization.figure.layout,
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      font: { family: 'Arial, sans-serif', size: 12, color: 'black' }
    }, { 
      displayModeBar: false, 
      responsive: false 
    }).then(() => {
      return Plotly.toImage(tempDiv, { 
        format: 'png', 
        width: 800, 
        height: 600 
      });
    }).then((url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      document.body.removeChild(tempDiv);
      onDownload();
    }).catch((err) => {
      console.error('Failed to download visualization:', err);
      document.body.removeChild(tempDiv);
      onDownload();
    });
  };
  
  // Zoom and reset functions
  const handleZoomIn = useCallback(() => {
    if (plotRef.current) {
      const currentLayout = plotRef.current.layout;
      const xRange = currentLayout.xaxis?.range;
      const yRange = currentLayout.yaxis?.range;
      
      if (xRange && yRange) {
        const xCenter = (xRange[0] + xRange[1]) / 2;
        const yCenter = (yRange[0] + yRange[1]) / 2;
        const xSpan = (xRange[1] - xRange[0]) * 0.7;
        const ySpan = (yRange[1] - yRange[0]) * 0.7;
        
        Plotly.relayout(plotRef.current, {
          'xaxis.range': [xCenter - xSpan/2, xCenter + xSpan/2],
          'yaxis.range': [yCenter - ySpan/2, yCenter + ySpan/2]
        });
      }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (plotRef.current) {
      const currentLayout = plotRef.current.layout;
      const xRange = currentLayout.xaxis?.range;
      const yRange = currentLayout.yaxis?.range;
      
      if (xRange && yRange) {
        const xCenter = (xRange[0] + xRange[1]) / 2;
        const yCenter = (yRange[0] + yRange[1]) / 2;
        const xSpan = (xRange[1] - xRange[0]) * 1.4;
        const ySpan = (yRange[1] - yRange[0]) * 1.4;
        
        Plotly.relayout(plotRef.current, {
          'xaxis.range': [xCenter - xSpan/2, xCenter + xSpan/2],
          'yaxis.range': [yCenter - ySpan/2, yCenter + ySpan/2]
        });
      }
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
      });
    }
  }, []);

  // Get dimensions from config_used if available
  const getVisualizationDimensions = () => {
    const configData = visualization.config_used?.data?.visualization;
    if (configData && configData.width && configData.height) {
      return {
        width: Math.max(configData.width, isInChat ? 400 : 700),
        height: Math.max(configData.height, isInChat ? 300 : 500)
      };
    }
    return { 
      width: isInChat ? '100%' : 700, 
      height: isInChat ? '300px' : 500 
    };
  };

  const dimensions = getVisualizationDimensions();
  
  return (
    <Card className={`${isInChat ? 'w-full' : ''} card-elevated transition-smooth hover:card-floating group`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">
            {visualization.title || `${visualization.type} Visualization`}
          </h3>
          <p className="text-xs text-muted-foreground">
            Created {new Date(visualization.generated_at).toLocaleString()}
          </p>
        </div>
        
        <div className={`flex items-center space-x-2 ${isInChat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-smooth`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadVisualization}
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigChange}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          {!isInChat && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4">
        <div 
          className="w-full bg-white/95 rounded-lg overflow-hidden border border-white/10 shadow-inner"
          style={isInChat ? { height: '300px' } : { minHeight: '400px', height: 'auto' }}
        >
          <Plot
            ref={plotRef}
            data={visualization.figure.data}
            layout={{
              ...visualization.figure.layout,
              margin: { l: 40, r: 40, t: 40, b: 40 },
              autosize: !isInChat,
              width: typeof dimensions.width === 'number' ? dimensions.width : undefined,
              height: typeof dimensions.height === 'number' ? dimensions.height : undefined,
              paper_bgcolor: 'white',
              plot_bgcolor: 'white',
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12,
                color: '#1f2937'
              }
            }}
            config={{
              displayModeBar: false,
              displaylogo: false,
              responsive: true,
              staticPlot: false,
              scrollZoom: true,
              doubleClick: 'reset+autosize'
            }}
            style={{ 
              width: isInChat ? '100%' : dimensions.width, 
              height: isInChat ? '100%' : dimensions.height 
            }}
            useResizeHandler={true}
          />
        </div>
        
        {/* Plotly Toolbar - Only show in dashboard view */}
        {!isInChat && (
          <div className="mt-3 flex items-center justify-center space-x-2 p-2 bg-card/50 rounded-lg border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {isInChat && (
          <div className="mt-3 p-3 bg-accent/50 rounded-lg">
            <p className="text-sm text-accent-foreground">
              ✨ This visualization has been added to your dashboard.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VisualizationCard;