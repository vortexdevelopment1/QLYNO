"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { FileText, Plus, X, Stethoscope } from "lucide-react";
import { ArticleItem, ArticleCategory } from "@/hospital-admin/lib/types";

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleCreated: (article: ArticleItem) => void;
}

const AUTHORS = [
  { id: "doc-101", name: "Dr. Arvind Kumar", role: "Chief Cardiologist & Interventional Director" },
  { id: "doc-102", name: "Dr. Sunita Rao", role: "Lead Cardiothoracic Surgeon" },
  { id: "doc-103", name: "Dr. Rajeshwar Singh", role: "Senior Joint Replacement Surgeon" },
  { id: "doc-105", name: "Dr. Meenakshi Sundaram", role: "Director of Neurosurgery" },
  { id: "doc-106", name: "Dr. Priya Deshmukh", role: "Consultant Endocrinologist" },
];

export function CreateArticleModal({
  isOpen,
  onClose,
  onArticleCreated,
}: CreateArticleModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("Health & Wellness");
  const [authorId, setAuthorId] = useState(AUTHORS[0].id);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [readTime, setReadTime] = useState(5);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Patient Education", "Health Awareness"]);
  const [submitForReview, setSubmitForReview] = useState(true);

  const selectedAuthor = AUTHORS.find((a) => a.id === authorId) || AUTHORS[0];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newArticle: ArticleItem = {
      id: `art-${Date.now()}`,
      title,
      slug,
      category,
      summary: summary || title,
      body,
      authorId: selectedAuthor.id,
      authorName: selectedAuthor.name,
      authorRole: selectedAuthor.role,
      readTimeMinutes: readTime,
      tags,
      status: submitForReview ? "In Review" : "Draft",
      version: 1,
      publishedToPublic: false,
      hospitalProfileSynced: false,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onArticleCreated(newArticle);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Author Health & Wellness Article</DialogTitle>
              <DialogDescription className="text-xs">
                Draft medical blog or wellness article. Must undergo clinical review before public publication.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Article Headline / Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Understanding Atrial Fibrillation: Management & Stroke Prevention"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ArticleCategory)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Health & Wellness" className="text-xs">Health & Wellness</SelectItem>
                  <SelectItem value="Disease Awareness" className="text-xs">Disease Awareness</SelectItem>
                  <SelectItem value="Preventive Care" className="text-xs">Preventive Care</SelectItem>
                  <SelectItem value="Nutrition & Diet" className="text-xs">Nutrition & Diet</SelectItem>
                  <SelectItem value="Clinical Outcomes" className="text-xs">Clinical Outcomes</SelectItem>
                  <SelectItem value="Hospital News" className="text-xs">Hospital News</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Doctor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Attributed Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTHORS.map((author) => (
                    <SelectItem key={author.id} value={author.id} className="text-xs">
                      {author.name} ({author.role.split("&")[0]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Short Summary */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Executive Summary / Abstract</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A concise 2-3 sentence overview of the article for preview cards and SEO..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Body Content */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Article Content (Markdown Supported)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the full clinical article here with headings, bullet points, and references..."
              rows={6}
              className="text-xs font-mono"
            />
          </div>

          {/* Tags and Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Estimated Read Time (Minutes)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={readTime}
                onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Keywords & Tags</Label>
              <div className="flex gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag & press enter"
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="px-2">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Governance Toggle */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold block text-xs">Submit to Clinical Review Queue</span>
              <span className="text-[11px] text-muted-foreground">
                Routes directly to the peer consultant sign-off workstation before public listing.
              </span>
            </div>
            <Button
              type="button"
              variant={submitForReview ? "default" : "outline"}
              size="sm"
              onClick={() => setSubmitForReview(!submitForReview)}
              className="text-xs"
            >
              {submitForReview ? "Submitting for Review" : "Save as Draft Only"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!title.trim() || !body.trim()}
            onClick={handleSubmit}
            className="text-xs"
          >
            Create Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
