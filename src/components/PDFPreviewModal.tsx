import React from "react";
import { Dialog } from "./Dialog";
import { Download } from "lucide-react";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const PDFPreviewModal = ({ isOpen, onClose, url, title }: PDFPreviewModalProps) => {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && url && url.startsWith("data:application/pdf")) {
      try {
        const base64 = url.split(",")[1];
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);
        return () => URL.revokeObjectURL(newBlobUrl);
      } catch (e) {
        console.error("Error creating blob URL", e);
        setBlobUrl(null);
      }
    } else {
      setBlobUrl(null);
    }
  }, [isOpen, url]);

  if (!url) return null;

  const isPDF = url.startsWith("data:application/pdf") || url.toLowerCase().endsWith(".pdf");
  const displayUrl = blobUrl || url;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="h-[80vh] w-full bg-neutral-100 rounded-xl overflow-hidden">
        {isPDF ? (
          <div className="flex flex-col h-full">
            <iframe src={displayUrl} className="w-full flex-grow border-none" title={title} />
            <div className="p-4 border-t border-neutral-200 bg-white flex justify-end gap-4">
              <a 
                href={url} 
                download={title.endsWith(".pdf") ? title : `${title}.pdf`}
                className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold hover:bg-neutral-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-4 p-4">
            <img 
              src={displayUrl} 
              alt={title} 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
              referrerPolicy="no-referrer" 
            />
            <div className="flex gap-4">
              <a 
                href={url} 
                download 
                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Original
              </a>
              <button 
                onClick={onClose}
                className="px-6 py-3 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
