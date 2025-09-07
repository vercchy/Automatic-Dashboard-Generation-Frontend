import { useState, useCallback } from "react";
import { AppState, ChatMessage, Visualization } from "@/types";
import TabNavigation from "@/components/TabNavigation";
import UploadScreen from "@/components/UploadScreen";
import ChatInterface from "@/components/ChatInterface";
import Dashboard from "@/components/Dashboard";
import {getSessionId} from "@/utils/session.ts";
import {API_ROUTES} from "@/utils/api.ts";

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
          content: `Database uploaded: ${filename}. You can now start asking questions.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
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

      try {
          const response = await fetch(API_ROUTES.query, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  session_id: getSessionId(),
                  question: message,
              }),
          });

          const data = await response.json();

          let visualization: Visualization | undefined = undefined;
          if (data.success && data.visualization) {
              const rawTitle = data.visualization.figure.layout?.title;
              const title = typeof rawTitle === "string"
                      ? rawTitle
                      : rawTitle?.text ?? "Generated Visualization";
              visualization = {
                  id: `viz-${Date.now()}`,
                  ...data.visualization,
                  title: title,
              };
          }

          const botMessage: ChatMessage = {
              id: `bot-${Date.now()}`,
              type: "bot",
              content: data.message + "\n" + !data.success ? data.error : undefined,
              visualization,
              timestamp: new Date().toISOString(),
          };

          setAppState((prev) => ({
              ...prev,
              chatMessages: [...prev.chatMessages, botMessage],
              visualizations: visualization
                  ? [...prev.visualizations, visualization]
                  : prev.visualizations,
              isLoading: false,
          }));
      } catch (err) {
          const errorMessage: ChatMessage = {
              id: `bot-${Date.now()}`,
              type: "bot",
              content: err.message,
              timestamp: new Date().toISOString(),
          };
          setAppState((prev) => ({
              ...prev,
              chatMessages: [...prev.chatMessages, errorMessage],
              isLoading: false,
          }));
      }
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

   const handleSendToDashboard = useCallback((viz: Visualization) => {
        setAppState(prev => {
            const alreadyInDashboard = prev.visualizations.some(v => v.id === viz.id);
            return {
                ...prev,
                visualizations: alreadyInDashboard
                    ? prev.visualizations
                    : [...prev.visualizations, viz],
                activeTab: 'dashboard',
            };
        });
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
          onSendToDashboard={handleSendToDashboard}
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
