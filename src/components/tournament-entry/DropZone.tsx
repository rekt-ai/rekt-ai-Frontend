import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface FileWithPreview extends File {
  preview: string;
}

export default function Dropzone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Cleanup URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <div
      className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <p className="text-gray-500 text-sm">
        {isDragActive
          ? "Drop the files here..."
          : "Drag & drop files here, or click to select"}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="w-24 h-24 overflow-hidden rounded-lg border border-gray-200"
          >
            <Image
              src={file.preview}
              alt={file.name}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
