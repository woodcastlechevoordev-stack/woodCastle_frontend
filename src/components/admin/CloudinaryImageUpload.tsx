"use client";

import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { useState } from "react";

type SingleProps = {
  mode: "single";
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  helpText?: string;
};

type MultiProps = {
  mode: "multi";
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  helpText?: string;
};

type CloudinaryImageUploadProps = SingleProps | MultiProps;

export function CloudinaryImageUpload(props: CloudinaryImageUploadProps) {
  const {
    folder = "woodcastle",
    label = "Images",
    helpText = "Drag and drop to upload directly to Cloudinary. First image is the primary listing image.",
  } = props;

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const images = props.mode === "multi" ? props.value : props.value ? [props.value] : [];

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) {
        setError("Please choose image files.");
        return;
      }

      const uploaded: string[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const url = await uploadToCloudinary(file, folder, (p) => {
          const base = (i / list.length) * 100;
          const slice = p.percent / list.length;
          setProgress(Math.round(base + slice));
        });
        uploaded.push(url);
      }

      if (props.mode === "single") {
        props.onChange(uploaded[0] || null);
      } else {
        props.onChange([...props.value, ...uploaded]);
      }
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    if (props.mode === "single") {
      props.onChange(null);
      return;
    }
    props.onChange(props.value.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (props.mode !== "multi") return;
    const next = [...props.value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    props.onChange(next);
  }

  return (
    <div>
      <p className="text-sm font-medium text-brown-dark">{label}</p>
      <p className="mt-1 text-xs text-brown-light">{helpText}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`mt-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-gold bg-gold-light/20" : "border-brown-light bg-white"
        }`}
      >
        <label className="cursor-pointer text-sm font-semibold text-gold hover:underline">
          {uploading ? `Uploading… ${progress}%` : "Browse or drop images"}
          <input
            type="file"
            accept="image/*"
            multiple={props.mode === "multi"}
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {uploading && (
          <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-brown-light/40">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <ul
          className={`mt-4 grid gap-3 ${
            props.mode === "single" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {images.map((url, i) => (
            <li
              key={url + i}
              className="relative overflow-hidden rounded-lg border border-brown-light"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className={
                  props.mode === "single"
                    ? "aspect-[16/9] w-full object-cover"
                    : "aspect-square w-full object-cover"
                }
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-brown-dark/70 p-1">
                {props.mode === "multi" && (
                  <button
                    type="button"
                    className="flex-1 text-xs text-cream disabled:opacity-40"
                    disabled={i === 0}
                    onClick={() => moveImage(i, i - 1)}
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  className="flex-1 text-xs text-cream"
                  onClick={() => removeAt(i)}
                >
                  Remove
                </button>
                {props.mode === "multi" && (
                  <button
                    type="button"
                    className="flex-1 text-xs text-cream disabled:opacity-40"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(i, i + 1)}
                  >
                    →
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
