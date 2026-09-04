"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Construction, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";

interface ModulePlaceholderProps {
  title: string;
  section: string;
  description: string;
  features?: string[];
}

export function ModulePlaceholder({
  title,
  section,
  description,
  features = [],
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={title}
        description={description}
        crumbs={[{ label: section }, { label: title }]}
      />

      <Card className="border-dashed border-2 border-border/80 bg-card/50">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
            <Construction className="h-7 w-7 text-primary" />
          </div>
          <div className="flex justify-center mb-2">
            <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider font-semibold text-primary">
              Section: {section} • Module Blueprint
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">{title} Module</CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs text-muted-foreground pt-1">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 pb-8 max-w-xl mx-auto">
          {features.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Planned Capabilities & Features</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/hospital-admin/dashboard">
              <Button size="sm" variant="outline" className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <Button size="sm" className="gap-2 text-xs" disabled>
              <Clock className="h-4 w-4" /> Ready for Implementation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
