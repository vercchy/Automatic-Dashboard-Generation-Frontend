import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Settings, X } from "lucide-react";
import { Visualization } from "@/types";
import Plot from "react-plotly.js";

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
            onClick={onDownload}
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
        <div className="w-full h-64 bg-accent/20 rounded-lg overflow-hidden">
          <Plot
            data={visualization.figure.data}
            layout={{
              ...visualization.figure.layout,
              margin: { l: 40, r: 40, t: 40, b: 40 },
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: {
                family: 'inherit',
                size: 12
              }
            }}
            config={{
              displayModeBar: false,
              responsive: true,
              staticPlot: false
            }}
            style={{ width: '100%', height: '100%' }}
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