"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Share_Tech_Mono } from "next/font/google";
import "react-quill/dist/quill.bubble.css";

const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

interface PreviewProps {
  value: string;
  fontSize?: number;
}

export const Preview = ({ value, fontSize = 14 }: PreviewProps) => {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  return (
    <div id="preview" key="preview" className={`bg-base-100 preview-container ${shareTechMono.className}`}>
      <style jsx>{`
        .preview-container :global(.ql-container) {
          border-left: none;
          border-right: none;
          border-bottom: none;
          font-size: ${fontSize}px;
        }
        .preview-container :global(.ql-editor) {
          height: 100%;
          overflow-y: auto;
          font-family: ${shareTechMono.style.fontFamily}, monospace !important;
          font-size: ${fontSize}px !important;
        }
        .preview-container :global(.ql-editor p) {
          font-size: ${fontSize}px !important;
          margin: 0.5em 0 !important;
        }
        .preview-container :global(.ql-editor h1),
        .preview-container :global(.ql-editor h2),
        .preview-container :global(.ql-editor h3),
        .preview-container :global(.ql-editor h4),
        .preview-container :global(.ql-editor h5),
        .preview-container :global(.ql-editor h6) {
          font-size: ${fontSize}px !important;
          font-weight: 600 !important;
        }
        .preview-container :global(.ql-editor ul),
        .preview-container :global(.ql-editor ol),
        .preview-container :global(.ql-editor li) {
          font-size: ${fontSize}px !important;
        }
      `}</style>
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};
