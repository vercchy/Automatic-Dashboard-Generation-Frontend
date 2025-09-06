import { Button } from "@/components/ui/button";
import { MessageCircle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: 'chat' | 'dashboard';
  onTabChange: (tab: 'chat' | 'dashboard') => void;
  visualizationCount: number;
}

const TabNavigation = ({ activeTab, onTabChange, visualizationCount }: TabNavigationProps) => {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => onTabChange('chat')}
            className={cn(
              "relative px-6 py-3 rounded-none border-b-2 transition-smooth",
              activeTab === 'chat'
                ? "border-primary bg-primary-soft text-primary-foreground"
                : "border-transparent hover:bg-accent"
            )}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => onTabChange('dashboard')}
            className={cn(
              "relative px-6 py-3 rounded-none border-b-2 transition-smooth",
              activeTab === 'dashboard'
                ? "border-primary bg-primary-soft text-primary-foreground"
                : "border-transparent hover:bg-accent"
            )}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
            {visualizationCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {visualizationCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;