"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  addMediaAsset,
  deleteMediaAsset,
  setCoverPhoto,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { MediaAsset, MediaCategory } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Sparkles,
  Camera,
  UploadCloud,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";

export function PhotosGalleryTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const mediaAssets = useSelector((state: RootState) => state.hospitalProfile.mediaAssets);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<MediaCategory>("Facility Exterior");
  const [formUrl, setFormUrl] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formIsCover, setFormIsCover] = useState(false);

  const mediaCategories: MediaCategory[] = [
    "Facility Exterior",
    "Lobby & Reception",
    "Operation Theatres",
    "Intensive Care Unit (ICU)",
    "Inpatient Deluxe Suites",
    "Diagnostics & Imaging",
    "Emergency & Trauma Bay",
  ];

  const sampleStockPhotos = [
    { title: "Advanced Cath Lab & DSA Suite", category: "Operation Theatres" as MediaCategory, url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80" },
    { title: "Deluxe Inpatient Single Suite", category: "Inpatient Deluxe Suites" as MediaCategory, url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80" },
    { title: "3T MRI & High-Field Scanner Room", category: "Diagnostics & Imaging" as MediaCategory, url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80" },
    { title: "24/7 Acute Emergency Triage Area", category: "Emergency & Trauma Bay" as MediaCategory, url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80" },
  ];

  const filteredAssets = mediaAssets.filter(
    (asset) => selectedCategory === "ALL" || asset.category === selectedCategory
  );

  const handleOpenUpload = () => {
    setFormTitle("");
    setFormCategory("Facility Exterior");
    setFormUrl("https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80");
    setFormCaption("");
    setFormIsCover(false);
    setIsUploadModalOpen(true);
  };

  const handleSaveUpload = () => {
    if (!formTitle.trim() || !formUrl.trim()) {
      toast({ title: "Fields Required", description: "Please enter title and image URL.", variant: "destructive" });
      return;
    }

    dispatch(
      addMediaAsset({
        title: formTitle,
        category: formCategory,
        fileUrl: formUrl,
        caption: formCaption,
        isCover: formIsCover,
        displayOrder: mediaAssets.length + 1,
        fileSize: "3.5 MB",
      })
    );

    toast({ title: "Photo Uploaded", description: `${formTitle} added to public media gallery.` });
    setIsUploadModalOpen(false);
  };

  const handleSetCover = (id: string, title: string) => {
    dispatch(setCoverPhoto(id));
    toast({ title: "Cover Photo Updated", description: `${title} set as hospital profile hero image.` });
  };

  const handleDelete = (id: string, title: string) => {
    dispatch(deleteMediaAsset(id));
    toast({ title: "Photo Removed", description: `${title} deleted from gallery.` });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <ImageIcon className="h-4 w-4 text-primary" />
                Hospital Photo Gallery &amp; Virtual Tour Media
              </CardTitle>
              <CardDescription className="text-xs">
                Manage high-resolution photography showcasing hospital infrastructure, sterile operation suites, intensive care cubicles, and patient hospitality rooms.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenUpload} className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Hospital Photo</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Photos ({mediaAssets.length})
            </button>
            {mediaCategories.map((cat) => {
              const count = mediaAssets.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden border border-border/80 bg-card shadow-xs group">
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <Image
                    src={asset.fileUrl}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-80" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <Badge variant="outline" className="bg-black/60 text-white border-white/20 text-[9px] backdrop-blur-xs">
                      {asset.category}
                    </Badge>
                    {asset.isCover && (
                      <Badge className="bg-amber-500 text-white border-amber-600 text-[9px] gap-1 shadow-xs">
                        <Star className="h-2.5 w-2.5 fill-white" /> Primary Cover
                      </Badge>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreviewAsset(asset)}
                      className="h-7 w-7 p-0 bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs"
                      title="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {!asset.isCover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCover(asset.id, asset.title)}
                        className="h-7 text-[10px] px-2 bg-black/60 text-white hover:bg-amber-600 backdrop-blur-xs gap-1"
                        title="Set as Cover"
                      >
                        <Star className="h-3 w-3" />
                        <span>Set Cover</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(asset.id, asset.title)}
                      className="h-7 w-7 p-0 bg-rose-600/80 text-white hover:bg-rose-700 backdrop-blur-xs"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-3 space-y-1 text-xs">
                  <h4 className="font-bold text-foreground line-clamp-1">{asset.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{asset.caption}</p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-muted-foreground font-mono border-t border-border/50">
                    <span>{asset.fileSize || "3.2 MB"}</span>
                    <span>{asset.uploadedBy.split(" ")[0]}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Photo Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" />
              Upload Hospital Infrastructure Photo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add photographs to the virtual tour and public hospital showcase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Photo Title / Area Name</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. 3T MRI Diagnostic Center"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Facility Category</Label>
              <Select value={formCategory} onValueChange={(val: MediaCategory) => setFormCategory(val)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {mediaCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Image URL</Label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-xs h-8.5 font-mono"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground">Quick Stock Samples:</span>
                {sampleStockPhotos.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormTitle(s.title);
                      setFormCategory(s.category);
                      setFormUrl(s.url);
                    }}
                    className="text-[9px] text-primary underline hover:text-primary/80"
                  >
                    {s.title.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Photo Caption / Description</Label>
              <Textarea
                rows={2}
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                placeholder="Describe equipment specifications, hygiene certifications, or patient amenities..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsUploadModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveUpload} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Lightbox Modal */}
      <Dialog open={!!previewAsset} onOpenChange={(open) => !open && setPreviewAsset(null)}>
        <DialogContent className="sm:max-w-2xl p-2">
          {previewAsset && (
            <div className="space-y-3">
              <div className="relative h-80 w-full rounded-lg overflow-hidden bg-black">
                <Image
                  src={previewAsset.fileUrl}
                  alt={previewAsset.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-contain"
                />
              </div>
              <div className="p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{previewAsset.title}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {previewAsset.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">{previewAsset.caption}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
