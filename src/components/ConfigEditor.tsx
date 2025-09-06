import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, RotateCcw, Code } from "lucide-react";
import { Visualization } from "@/types";

interface ConfigEditorProps {
  isOpen: boolean;
  visualization: Visualization | null;
  onSave: (config: Record<string, any>) => void;
  onClose: () => void;
}

const ConfigEditor = ({ isOpen, visualization, onSave, onClose }: ConfigEditorProps) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (visualization?.config_used) {
      setConfig(visualization.config_used);
      setJsonText(JSON.stringify(visualization.config_used, null, 2));
      setErrors([]);
    }
  }, [visualization]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setJsonText(JSON.stringify(newConfig, null, 2));
    setErrors([]);
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setConfig(parsed);
      setErrors([]);
    } catch (error) {
      setErrors(['Invalid JSON format']);
    }
  };

  const handleSave = () => {
    if (errors.length === 0) {
      onSave(config);
    }
  };

  const handleReset = () => {
    if (visualization?.config_used) {
      setConfig(visualization.config_used);
      setJsonText(JSON.stringify(visualization.config_used, null, 2));
      setErrors([]);
    }
  };

  const renderConfigForm = () => {
    if (!visualization) return null;

    return (
      <div className="space-y-6">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            
            {typeof value === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={value}
                  onChange={(e) => handleConfigChange(key, e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor={key} className="text-sm text-muted-foreground">
                  {value ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            ) : typeof value === 'number' ? (
              <Input
                type="number"
                value={value}
                onChange={(e) => handleConfigChange(key, Number(e.target.value))}
                className="w-full"
              />
            ) : typeof value === 'string' ? (
              value.length > 50 ? (
                <Textarea
                  value={value}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full min-h-[80px]"
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full"
                />
              )
            ) : typeof value === 'object' && value !== null ? (
              <Textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleConfigChange(key, parsed);
                  } catch {
                    // Keep the invalid JSON for user to fix
                  }
                }}
                className="w-full min-h-[100px] font-mono text-sm"
                placeholder="Valid JSON object"
              />
            ) : (
              <Input
                value={String(value)}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Visualization</SheetTitle>
          <SheetDescription>
            Modify the configuration parameters for your visualization. 
            Changes are applied immediately.
          </SheetDescription>
        </SheetHeader>

        {visualization && (
          <div className="mt-6 space-y-6">
            {/* Visualization Info */}
            <Card className="p-4 card-elevated">
              <h3 className="font-semibold text-sm mb-2">
                {visualization.title || `${visualization.type} Visualization`}
              </h3>
              <p className="text-xs text-muted-foreground">
                Type: {visualization.type} • Created: {new Date(visualization.generated_at).toLocaleString()}
              </p>
            </Card>

            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Configuration</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRawJsonMode(!rawJsonMode)}
                className="transition-smooth"
              >
                <Code className="w-4 h-4 mr-2" />
                {rawJsonMode ? 'Form View' : 'JSON View'}
              </Button>
            </div>

            <Separator />

            {/* Configuration Editor */}
            {rawJsonMode ? (
              <div className="space-y-4">
                <Label htmlFor="json-config" className="text-sm font-medium">
                  Raw JSON Configuration
                </Label>
                <Textarea
                  id="json-config"
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full min-h-[300px] font-mono text-sm"
                  placeholder="Enter valid JSON configuration"
                />
                {errors.length > 0 && (
                  <div className="text-sm text-destructive space-y-1">
                    {errors.map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              renderConfigForm()
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleReset}
                className="transition-smooth"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={errors.length > 0}
                  className="transition-smooth"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ConfigEditor;
