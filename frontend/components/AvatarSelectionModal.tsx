import React from "react";
import { Upload, XCircle } from "lucide-react";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: File | null, previewUrl: string) => void;
}

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: AvatarSelectionModalProps) {
  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(file, reader.result as string);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDicebear = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&mouth=smile`;
    onSelect(null, url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <XCircle size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">
          Choose an Avatar
        </h2>

        <div className="space-y-6">
          {/* Upload Option */}
          <label className="block w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#3B82F6] hover:bg-slate-50 transition-colors cursor-pointer text-center group">
            <Upload
              size={24}
              className="mx-auto text-slate-400 mb-2 group-hover:text-[#3B82F6]"
            />
            <span className="text-sm font-bold text-slate-700">
              Upload your own photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500 font-medium">
                Or pick a character
              </span>
            </div>
          </div>

          {/* DiceBear Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              "Kuro",
              "Bella",
              "Charlie",
              "Laila",
              "Susan1115",
              "Daisy",
              "",
              "Coco",
            ].map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => handleSelectDicebear(seed)}
                className="aspect-square rounded-xl bg-slate-100 hover:ring-2 hover:ring-[#3B82F6] transition-all overflow-hidden p-1"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&mouth=smile&eyes=happy`}
                  alt={seed}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
