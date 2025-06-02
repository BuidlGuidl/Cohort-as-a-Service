"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Share_Tech_Mono } from "next/font/google";
import "react-quill/dist/quill.snow.css";

const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: string;
}

export const Editor = ({ value, onChange, height = "200px" }: EditorProps) => {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className={`bg-base-100 editor-container border rounded-md ${shareTechMono.className}`} style={{ height }}>
      <style jsx>{`
        .editor-container :global(.ql-toolbar) {
          border-left: none;
          border-right: none;
          border-top: none;
        }
        .editor-container :global(.ql-container) {
          border-left: none;
          border-right: none;
          border-bottom: none;
          font-size: 14px;
          font-family: ${shareTechMono.style.fontFamily}, monospace !important;
          height: calc(${height} - 42px); /* Subtract toolbar height */
        }
        .editor-container :global(.ql-editor) {
          height: 100%;
          overflow-y: auto;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height: height }}
      />
    </div>
  );
};
