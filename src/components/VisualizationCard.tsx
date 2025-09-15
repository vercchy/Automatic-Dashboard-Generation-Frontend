import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Download, Settings, X, ZoomIn, ZoomOut, RotateCcw, LayoutDashboard} from "lucide-react";
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
  onSendToDashboard?: () => void;
}

const VisualizationCard = ({ 
  visualization, 
  isInChat = false, 
  onDownload, 
  onConfigChange,
  onRemove,
  onSendToDashboard
}: VisualizationCardProps) => {
    const plotGdRef = useRef<any>(null);

    const attachGraphDiv = useCallback((_figure: any, graphDiv: any) => {
        plotGdRef.current = graphDiv;
    }, []);

    const getAxisRanges = () => {
        const gd = plotGdRef.current;
        if (!gd) return null;

        const full = gd._fullLayout || gd.layout;
        const x = full?.xaxis;
        const y = full?.yaxis;
        if (!x || !y || !x.range || !y.range) return null; // no simple cartesian axes

        // convert dates to numbers if needed, so math works
        const toNum = (v: any) =>
            v instanceof Date ? v.getTime() :
                (typeof v === "string" && !isNaN(Date.parse(v))) ? Date.parse(v) : v;

        const toSameType = (v: number, sample: any) =>
            (sample instanceof Date) ? new Date(v) :
                (typeof sample === "string" && !isNaN(Date.parse(sample))) ? new Date(v).toISOString() : v;

        const xr = x.range;
        const yr = y.range;

        const x0 = toNum(xr[0]); const x1 = toNum(xr[1]);
        const y0 = toNum(yr[0]); const y1 = toNum(yr[1]);

        return { xr, yr, x0, x1, y0, y1, toSameType };
    }
  
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
        const gd = plotGdRef.current;
        if (!gd) return;

        const r = getAxisRanges();
        if (!r) return;

        const zoomFactor = 0.95;
        const xC = (r.x0 + r.x1) / 2;
        const yC = (r.y0 + r.y1) / 2;
        const xSpan = (r.x1 - r.x0) * zoomFactor;
        const ySpan = (r.y1 - r.y0) * zoomFactor;

        const newX0 = r.toSameType(xC - xSpan / 2, r.xr[0]);
        const newX1 = r.toSameType(xC + xSpan / 2, r.xr[0]);
        const newY0 = r.toSameType(yC - ySpan / 2, r.yr[0]);
        const newY1 = r.toSameType(yC + ySpan / 2, r.yr[0]);

        Plotly.relayout(gd, {
            "xaxis.autorange": false,
            "yaxis.autorange": false,
            "xaxis.range": [newX0, newX1],
            "yaxis.range": [newY0, newY1],
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        const gd = plotGdRef.current;
        if (!gd) return;

        const r = getAxisRanges();
        if (!r) return;

        const zoomFactor = 1.05;
        const xC = (r.x0 + r.x1) / 2;
        const yC = (r.y0 + r.y1) / 2;
        const xSpan = (r.x1 - r.x0) * zoomFactor;
        const ySpan = (r.y1 - r.y0) * zoomFactor;

        const newX0 = r.toSameType(xC - xSpan / 2, r.xr[0]);
        const newX1 = r.toSameType(xC + xSpan / 2, r.xr[0]);
        const newY0 = r.toSameType(yC - ySpan / 2, r.yr[0]);
        const newY1 = r.toSameType(yC + ySpan / 2, r.yr[0]);

        Plotly.relayout(gd, {
            "xaxis.autorange": false,
            "yaxis.autorange": false,
            "xaxis.range": [newX0, newX1],
            "yaxis.range": [newY0, newY1],
        });
    }, []);

    const handleResetZoom = useCallback(() => {
        const gd = plotGdRef.current;
        if (!gd) return;
        Plotly.relayout(gd, { "xaxis.autorange": true, "yaxis.autorange": true });
    }, []);

  // Get dimensions from config_used if available
  const getVisualizationDimensions = () => {
    const configData = visualization.config_used;
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
        
        <div onMouseDown={(e) => e.stopPropagation()}
            className={`flex items-center space-x-2 ${isInChat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-smooth`}>
            {isInChat && onSendToDashboard && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSendToDashboard}
                    className="h-8 w-8 p-0"
                    title="Send to Dashboard"
                >
                    <LayoutDashboard className="w-4 h-4" />
                </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadVisualization}
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {/*<Button
            variant="ghost"
            size="sm"
            onClick={onConfigChange}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>*/}
          
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
              displayModeBar: false,
              displaylogo: false,
              responsive: true,
              staticPlot: false,
              scrollZoom: true,
              doubleClick: 'reset+autosize'
            }}
            plotly={Plotly}
            onInitialized={attachGraphDiv}
            onUpdate={attachGraphDiv}
            style={{ 
              width: isInChat ? '100%' : dimensions.width, 
              height: isInChat ? '100%' : dimensions.height 
            }}
            useResizeHandler={true}
          />
        </div>

        {!isInChat && (
            <div
                className="mt-3 flex items-center justify-center space-x-2 p-2 bg-card/50 rounded-lg border border-border/50"
                onMouseDown={(e) => e.stopPropagation()}
            >
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