"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, X, Zap } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  stage: number;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const LoadingModal = ({ isOpen, stage, isError, onClose, onRetry }: LoadingModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStage(0);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (stage > currentStage && !isError) {
      const timer = setTimeout(() => {
        setCurrentStage(stage);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isError) {
      setCurrentStage(stage);
    }
  }, [stage, currentStage, isError]);

  const stages = [
    {
      title: "Creating Cohort...",
      description: "Deploying your cohort contract",
      icon: Loader2,
      color: "text-primary",
    },
    {
      title: "Verifying Contract...",
      description: "Ensuring contract integrity",
      icon: CheckCircle,
      color: "text-secondary",
    },
    {
      title: "Finalizing...",
      description: "Setting up cohort data",
      icon: Zap,
      color: "text-accent",
    },
  ];

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-8 w-full max-w-md mx-4 transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {isError && (
          <button onClick={onClose} className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle">
            <X className="h-4 w-4" />
          </button>
        )}

        {isError ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-error/10">
                <AlertCircle className="h-8 w-8 text-error" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            <p className="text-base-content/70 mb-6">
              We encountered an error while creating your cohort. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={onClose} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button onClick={onRetry} className="btn btn-primary btn-sm">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                {stages.map((stageItem, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`relative p-2 rounded-full transition-all duration-500 ${
                        index <= currentStage ? "bg-primary/10 scale-110" : "bg-base-200 scale-100"
                      }`}
                    >
                      <stageItem.icon
                        className={`h-5 w-5 transition-all duration-500 ${
                          index === currentStage
                            ? `${stageItem.color} animate-pulse`
                            : index < currentStage
                              ? "text-success"
                              : "text-base-content/30"
                        } ${index === currentStage && stageItem.icon === Loader2 ? "animate-spin" : ""}`}
                      />

                      {index < currentStage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                      )}
                    </div>

                    {index < stages.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-all duration-700 ${
                          index < currentStage ? "bg-success" : "bg-base-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 min-h-[60px] flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-1 transition-all duration-300">{stages[currentStage]?.title}</h3>
              <p className="text-base-content/70 text-sm transition-all duration-300">
                {stages[currentStage]?.description}
              </p>
            </div>

            <div className="w-full bg-base-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${((currentStage + 1) / stages.length) * 100}%`,
                  transform: currentStage === stages.length - 1 ? "translateX(0)" : "translateX(-2px)",
                }}
              />
            </div>

            {currentStage === stages.length - 1 && (
              <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-success text-sm font-medium">✨ Cohort created successfully! Redirecting...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
