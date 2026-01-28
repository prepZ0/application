"use client";

import { useEffect, useState, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import { AlertTriangle, Maximize, Eye } from "lucide-react";

interface ProctoringMonitorProps {
  maxTabSwitches: number;
  requireFullscreen: boolean;
  onViolation: (type: "tab_switch" | "fullscreen_exit", count: number) => void;
  onTerminate?: () => void;
}

export function ProctoringMonitor({
  maxTabSwitches,
  requireFullscreen,
  onViolation,
  onTerminate,
}: ProctoringMonitorProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        onViolation("tab_switch", newCount);

        if (newCount >= maxTabSwitches) {
          setWarningMessage(`Test terminated: You exceeded the maximum tab switches (${maxTabSwitches})`);
          setShowWarning(true);
          onTerminate?.();
        } else {
          setWarningMessage(`Warning: Tab switch detected (${newCount}/${maxTabSwitches})`);
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }

        return newCount;
      });
    }
  }, [maxTabSwitches, onViolation, onTerminate]);

  const handleFullscreenChange = useCallback(() => {
    const isNowFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isNowFullscreen);

    if (!isNowFullscreen && requireFullscreen) {
      onViolation("fullscreen_exit", 1);
      setWarningMessage("Warning: Please return to fullscreen mode");
      setShowWarning(true);
    }
  }, [requireFullscreen, onViolation]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Enter fullscreen on mount if required
    if (requireFullscreen && !document.fullscreenElement) {
      enterFullscreen();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleVisibilityChange, handleFullscreenChange, requireFullscreen, enterFullscreen]);

  return (
    <>
      {/* Proctoring Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <span>Proctoring Active</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Tab Switches: {tabSwitchCount}/{maxTabSwitches}</span>
            </div>
          </div>

          {requireFullscreen && !isFullscreen && (
            <Button size="sm" variant="outline" onClick={enterFullscreen}>
              <Maximize className="h-4 w-4 mr-1" />
              Enter Fullscreen
            </Button>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <Alert variant="warning" className="max-w-md mx-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Proctoring Warning</AlertTitle>
            <AlertDescription>{warningMessage}</AlertDescription>
            {tabSwitchCount < maxTabSwitches && (
              <Button
                className="mt-4"
                onClick={() => {
                  setShowWarning(false);
                  if (requireFullscreen) enterFullscreen();
                }}
              >
                I Understand
              </Button>
            )}
          </Alert>
        </div>
      )}
    </>
  );
}
