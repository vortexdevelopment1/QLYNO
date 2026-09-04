import React from 'react';
import { Badge } from '@/hospital-admin/components/ui/badge';
import { Shield, MapPin } from 'lucide-react';

interface ScopeIndicatorProps {
  scope: 'Hospital Admin' | 'Station Lead';
  stationName?: string;
}

export function ScopeIndicator({ scope, stationName }: ScopeIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border">
      {scope === 'Hospital Admin' ? (
        <>
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium">Acting as: <span className="text-foreground">Hospital Admin (Full Access)</span></span>
        </>
      ) : (
        <>
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">Scope: <span className="text-foreground">{stationName || 'Unknown Station'}</span></span>
        </>
      )}
    </div>
  );
}
