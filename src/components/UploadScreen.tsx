import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Database, Sparkles, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadScreenProps {
  onUploadSuccess: (filename: string) => void;
}

const UploadScreen = ({ onUploadSuccess }: UploadScreenProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.dump')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .dump file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess(file.name);
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and processed.`,
      });
    }, 2000);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-accent/30">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Database className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Data Exploration Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Upload your Neo4j database dump to start exploring and generating beautiful visualizations through natural language conversations.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-4 text-center card-elevated">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Chat with your data using natural language queries
            </p>
          </Card>
          <Card className="p-4 text-center card-elevated">
            <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Interactive Visualizations</h3>
            <p className="text-sm text-muted-foreground">
              Generate and customize beautiful charts and graphs
            </p>
          </Card>
          <Card className="p-4 text-center card-elevated">
            <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Export & Share</h3>
            <p className="text-sm text-muted-foreground">
              Download visualizations and share insights easily
            </p>
          </Card>
        </div>

        {/* Upload Area */}
        <Card 
          className={`p-8 border-2 border-dashed transition-all duration-300 cursor-pointer card-elevated ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : isUploading
              ? 'border-primary/50 bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isUploading ? 'pulse-glow' : ''}`}>
              <Upload className={`w-12 h-12 text-primary ${isUploading ? 'animate-pulse' : ''}`} />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {isUploading ? 'Processing your database...' : 'Upload Neo4j Database'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isUploading 
                  ? 'Please wait while we process your data' 
                  : 'Drag and drop your .dump file here, or click to browse'
                }
              </p>
              
              {!isUploading && (
                <Button className="transition-bounce">
                  Select .dump File
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".dump"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Make sure your file is a valid Neo4j database dump (.dump extension).
            <br />
            Supported formats: Neo4j dump files created with neo4j-admin dump command.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;