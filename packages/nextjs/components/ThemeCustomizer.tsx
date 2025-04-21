"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignMessage } from "wagmi";
import { CheckIcon, Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Define theme setting types
export interface Theme {
  primary: string;
  "primary-content": string;
  secondary: string;
  "secondary-content": string;
  accent: string;
  "accent-content": string;
  neutral: string;
  "neutral-content": string;
  "base-100": string;
  "base-content": string;
  fontFamily: string;
}

interface ThemeCustomizerProps {
  cohortAddress: string;
  isAdmin: boolean;
}

// Default theme values
export const defaultTheme: Theme = {
  primary: "#c913ff",
  "primary-content": "#49ff13",
  secondary: "#49ff13",
  "secondary-content": "#212638",
  accent: "#93BBFB",
  "accent-content": "#212638",
  neutral: "#212638",
  "neutral-content": "#ffffff",
  "base-100": "#000000",
  "base-content": "#ffffff",
  fontFamily: "sans-serif",
};

// Enhanced apply theme function that also sets derived variables like shadows
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Set the main theme variables
  Object.entries(theme).forEach(([key, value]) => {
    if (key === "fontFamily") {
      root.style.setProperty("--font-family", value);
    } else {
      root.style.setProperty(`--${key}`, value);
    }
  });

  root.style.setProperty("--border-primary", theme.primary);
  root.style.setProperty("--border-secondary", theme.secondary);
  root.style.setProperty("--border-base", theme["base-content"]);
  root.style.setProperty("--border-neutral", theme.neutral);

  root.style.setProperty("--shadow-primary", `${theme.primary}33`);
  root.style.setProperty("--shadow-secondary", `${theme.secondary}33`);
  root.style.setProperty("--shadow-base", `${theme["base-100"]}33`);
  root.style.setProperty("--shadow-neutral", `${theme.neutral}33`);

  updateShadowStyles(theme);
};

const updateShadowStyles = (theme: Theme) => {
  let shadowStyle = document.getElementById("theme-shadow-styles");
  if (!shadowStyle) {
    shadowStyle = document.createElement("style");
    shadowStyle.id = "theme-shadow-styles";
    document.head.appendChild(shadowStyle);
  }

  shadowStyle.textContent = `
    .shadow-primary {
      --tw-shadow-color: ${theme.primary}33 !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
    
    .shadow-secondary {
      --tw-shadow-color: ${theme.secondary}33 !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
    
    .shadow-md.shadow-primary {
      --tw-shadow: 0 4px 6px -1px ${theme.primary}33, 0 2px 4px -1px ${theme.primary}33 !important;
      --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color) !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
    
    .shadow-md.shadow-secondary {
      --tw-shadow: 0 4px 6px -1px ${theme.secondary}33, 0 2px 4px -1px ${theme.secondary}33 !important;
      --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color) !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
    
    .shadow-lg.shadow-primary {
      --tw-shadow: 0 10px 15px -3px ${theme.primary}33, 0 4px 6px -2px ${theme.primary}33 !important;
      --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color) !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
    
    .shadow-lg.shadow-secondary {
      --tw-shadow: 0 10px 15px -3px ${theme.secondary}33, 0 4px 6px -2px ${theme.secondary}33 !important;
      --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color) !important;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
    }
  `;
};

export const ThemeCustomizer = ({ cohortAddress, isAdmin }: ThemeCustomizerProps) => {
  const router = useRouter();
  const { signMessageAsync } = useSignMessage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [previewTheme, setPreviewTheme] = useState<Theme>(defaultTheme);

  // Font options
  const fontOptions = [
    "sans-serif",
    "serif",
    "monospace",
    "Roboto, sans-serif",
    "Inter, sans-serif",
    "Poppins, sans-serif",
  ];

  // Added shadow preview to the component
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cohort/${cohortAddress}/theme`);

        if (response.ok) {
          const data = await response.json();
          if (data.theme) {
            setTheme(data.theme);
            setPreviewTheme(data.theme);

            applyTheme(data.theme);
          }
        }
      } catch (error) {
        console.error("Error fetching theme settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (cohortAddress) {
      fetchTheme();
    }
  }, [cohortAddress]);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const message = `Save theme settings for cohort: ${cohortAddress}`;

      const signature = await signMessageAsync({ message });

      const response = await fetch(`/api/cohort/${cohortAddress}/theme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: previewTheme,
          message,
          signature,
        }),
      });

      if (response.ok) {
        setTheme(previewTheme);
        applyTheme(previewTheme);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsOpen(false);
        }, 2000);

        router.refresh();
      } else {
        console.error("Error saving theme");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  const handlePreview = (newTheme: Theme) => {
    setPreviewTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleColorChange = (key: keyof Theme, value: string) => {
    const updatedTheme = { ...previewTheme, [key]: value };
    handlePreview(updatedTheme);
  };

  const handleResetDefaults = () => {
    handlePreview(defaultTheme);
  };

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-primary-content p-3 rounded-full shadow-lg hover:opacity-90 transition-all z-50"
        title="Customize Theme"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border">
            <div className="p-4 flex justify-between items-center border-b border-neutral">
              <h2 className="text-xl font-bold">Customize Cohort Theme</h2>
              <button onClick={handleCancel} className="btn btn-ghost btn-sm">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Colors</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme.primary}
                        onChange={e => handleColorChange("primary", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme.primary}
                        onChange={e => handleColorChange("primary", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Content</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme["primary-content"]}
                        onChange={e => handleColorChange("primary-content", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme["primary-content"]}
                        onChange={e => handleColorChange("primary-content", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Secondary</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme.secondary}
                        onChange={e => handleColorChange("secondary", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme.secondary}
                        onChange={e => handleColorChange("secondary", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Secondary Content</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme["secondary-content"]}
                        onChange={e => handleColorChange("secondary-content", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme["secondary-content"]}
                        onChange={e => handleColorChange("secondary-content", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme["base-100"]}
                        onChange={e => handleColorChange("base-100", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme["base-100"]}
                        onChange={e => handleColorChange("base-100", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewTheme["base-content"]}
                        onChange={e => handleColorChange("base-content", e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewTheme["base-content"]}
                        onChange={e => handleColorChange("base-content", e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Typography</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Font Family</label>
                  <select
                    value={previewTheme.fontFamily}
                    onChange={e => handleColorChange("fontFamily", e.target.value)}
                    className="select select-bordered w-full"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Preview</h3>
                  <button onClick={() => setPreviewExpanded(!previewExpanded)} className="btn btn-xs btn-ghost">
                    {previewExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>

                <div className="border border-neutral rounded-lg p-4 space-y-4">
                  <h4 className="text-xl font-bold" style={{ fontFamily: previewTheme.fontFamily }}>
                    Preview Text
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary">Primary Button</button>
                    <button className="btn btn-secondary">Secondary Button</button>
                    <button className="btn">Default Button</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="badge badge-primary">Primary Badge</div>
                    <div className="badge badge-secondary">Secondary Badge</div>
                    <div className="badge">Default Badge</div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-primary-content">
                      P
                    </div>
                    <div className="w-12 h-12 bg-secondary rounded-md flex items-center justify-center text-secondary-content">
                      S
                    </div>
                    <div className="w-12 h-12 bg-base-100 border border-base-300 rounded-md flex items-center justify-center text-base-content">
                      B
                    </div>
                  </div>

                  {previewExpanded && (
                    <>
                      <h5 className="text-lg font-semibold mt-4">Shadows</h5>
                      <div className="flex flex-wrap gap-4">
                        <div className="w-16 h-16 bg-base-100 shadow-md shadow-primary rounded-md flex items-center justify-center">
                          Primary
                        </div>
                        <div className="w-16 h-16 bg-base-100 shadow-md shadow-secondary rounded-md flex items-center justify-center">
                          Secondary
                        </div>
                      </div>

                      <h5 className="text-lg font-semibold mt-4">Borders</h5>
                      <div className="flex flex-wrap gap-4">
                        <div className="w-16 h-16 bg-base-100 border-2 border-primary rounded-md flex items-center justify-center">
                          Primary
                        </div>
                        <div className="w-16 h-16 bg-base-100 border-2 border-secondary rounded-md flex items-center justify-center">
                          Secondary
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-neutral p-4 flex justify-between">
              <button onClick={handleResetDefaults} className="btn btn-ghost btn-sm" disabled={isLoading}>
                Reset to Defaults
              </button>

              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={isLoading}>
                  {isLoading ? <span className="loading loading-spinner loading-xs"></span> : "Save Changes"}
                </button>
              </div>
            </div>

            {showSuccessMessage && (
              <div className="absolute bottom-4 right-4 bg-success text-success-content p-3 rounded-md shadow-lg flex items-center gap-2">
                <CheckIcon className="h-5 w-5" />
                Theme saved successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
