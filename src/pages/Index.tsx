import { useState, useCallback } from "react";
import { AppState, ChatMessage, Visualization } from "@/types";
import TabNavigation from "@/components/TabNavigation";
import UploadScreen from "@/components/UploadScreen";
import ChatInterface from "@/components/ChatInterface";
import Dashboard from "@/components/Dashboard";

// Mock data for demonstration
const mockVisualizations = {
  scatter: {
    data: [
      {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 6, 3, 8, 4, 9, 5, 7, 6, 8],
        mode: 'markers',
        type: 'scatter',
        name: 'Data Points',
        marker: { color: 'hsl(200, 95%, 40%)', size: 8 },
      },
    ],
    layout: {
      title: 'Node Distribution Analysis',
      xaxis: { title: 'Time Period' },
      yaxis: { title: 'Node Count' },
    },
  },
  bar: {
    data: [
      {
        x: ['Nodes', 'Relationships', 'Properties', 'Labels'],
        y: [150, 89, 45, 12],
        type: 'bar',
        marker: { color: ['hsl(200, 95%, 40%)', 'hsl(200, 100%, 60%)', 'hsl(220, 15%, 96%)', 'hsl(200, 100%, 95%)'] },
      },
    ],
    layout: {
      title: 'Database Statistics',
      xaxis: { title: 'Entity Type' },
      yaxis: { title: 'Count' },
    },
  },
};

const Index = () => {
  const [appState, setAppState] = useState<AppState>({
    isUploaded: false,
    chatMessages: [],
    visualizations: [],
    activeTab: 'chat',
    isLoading: false,
    dashboardLayouts: {},
  });

  const handleUploadSuccess = useCallback((filename: string) => {
    setAppState(prev => ({
      ...prev,
      isUploaded: true,
      chatMessages: [
        {
          id: '1',
          type: 'bot',
          content: `Great! I've successfully loaded your database: ${filename}\n\nI can now help you explore your data. Here are some things you can ask me:\n\n• "Show me the distribution of nodes"\n• "What are the most connected entities?"\n• "Create a network visualization"\n• "Analyze the relationship patterns"\n\nWhat would you like to explore first?`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setAppState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage],
      isLoading: true,
    }));

    // Simulate AI response with visualization
    setTimeout(() => {
      const isVisualizationRequest = message.toLowerCase().includes('show') || 
                                   message.toLowerCase().includes('chart') || 
                                   message.toLowerCase().includes('graph') ||
                                   message.toLowerCase().includes('distribution') ||
                                   message.toLowerCase().includes('analyze');

      let visualization: Visualization | undefined;
      
      if (isVisualizationRequest) {
        const vizType = message.toLowerCase().includes('distribution') || message.toLowerCase().includes('scatter') ? 'scatter' : 'bar';
        const vizData = vizType === 'scatter' ? mockVisualizations.scatter : mockVisualizations.bar;
        
        visualization = {
          id: `viz-${Date.now()}`,
          figure: vizData,
          type: vizType === 'scatter' ? 'Scatter Plot' : 'Bar Chart',
          config_used: {
            chart_type: vizType,
            color_scheme: 'primary',
            show_legend: true,
            animation_enabled: true,
            data_points: vizType === 'scatter' ? 10 : 4,
          },
          generated_at: new Date().toISOString(),
          title: vizData.layout.title,
        };
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: isVisualizationRequest 
          ? `I've analyzed your data and created a visualization showing the ${message.toLowerCase().includes('distribution') ? 'distribution patterns' : 'statistical overview'}. The chart reveals interesting patterns in your dataset that can help guide further analysis.`
          : `I understand you're asking about "${message}". Based on your Neo4j database, I can provide insights and create visualizations to help answer your question. Would you like me to create a specific chart or analysis for this?`,
        visualization,
        timestamp: new Date().toISOString(),
      };

      setAppState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, botMessage],
        visualizations: visualization 
          ? [...prev.visualizations, visualization]
          : prev.visualizations,
        isLoading: false,
      }));
    }, 2000);
  }, []);

  const handleTabChange = useCallback((tab: 'chat' | 'dashboard') => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleVisualizationUpdate = useCallback((id: string, updates: Partial<Visualization>) => {
    setAppState(prev => ({
      ...prev,
      visualizations: prev.visualizations.map(viz =>
        viz.id === id ? { ...viz, ...updates } : viz
      ),
    }));
  }, []);

  const handleVisualizationRemove = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      visualizations: prev.visualizations.filter(viz => viz.id !== id),
    }));
  }, []);

  const handleLayoutChange = useCallback((layouts: { [key: string]: any[] }) => {
    setAppState(prev => ({
      ...prev,
      dashboardLayouts: layouts,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {appState.isUploaded && (
        <TabNavigation
          activeTab={appState.activeTab}
          onTabChange={handleTabChange}
          visualizationCount={appState.visualizations.length}
        />
      )}

      {!appState.isUploaded ? (
        <UploadScreen onUploadSuccess={handleUploadSuccess} />
      ) : appState.activeTab === 'chat' ? (
        <ChatInterface
          messages={appState.chatMessages}
          isLoading={appState.isLoading}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <Dashboard
          visualizations={appState.visualizations}
          dashboardLayouts={appState.dashboardLayouts}
          onVisualizationUpdate={handleVisualizationUpdate}
          onVisualizationRemove={handleVisualizationRemove}
          onLayoutChange={handleLayoutChange}
        />
      )}
    </div>
  );
};

export default Index;
