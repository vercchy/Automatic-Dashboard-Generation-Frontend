import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Settings, X } from "lucide-react";
import { Visualization } from "@/types";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist";

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
  
  // Get dimensions from config_used if available
  const getVisualizationDimensions = () => {
    const configData = visualization.config_used?.data?.visualization;
    if (configData && configData.width && configData.height) {
      return {
        width: Math.max(configData.width, 400),
        height: Math.max(configData.height, 300)
      };
    }
    return { width: '100%', height: isInChat ? '300px' : '100%' };
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
              displayModeBar: !isInChat,
              displaylogo: false,
              modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
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