import React from 'react';
import { Card, Badge, Button } from './ui';

interface CaseCardProps {
  caseId: string;
  clientName: string;
  caseType: string;
  status: 'active' | 'on-hold' | 'closed' | 'pending';
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  createdDate: string;
  lastUpdate: string;
  nextAction?: string;
  onView?: () => void;
  onUpdate?: () => void;
}

const statusColors = {
  active: { badge: 'success', label: 'Active' },
  'on-hold': { badge: 'warning', label: 'On Hold' },
  closed: { badge: 'error', label: 'Closed' },
  pending: { badge: 'info', label: 'Pending' },
} as const;

const urgencyColors = {
  low: { badge: 'default', label: 'Low Priority' },
  normal: { badge: 'primary', label: 'Normal' },
  high: { badge: 'warning', label: 'High Priority' },
  urgent: { badge: 'error', label: 'Urgent' },
} as const;

export const CaseCard: React.FC<CaseCardProps> = ({
  caseId,
  clientName,
  caseType,
  status,
  urgency,
  createdDate,
  lastUpdate,
  nextAction,
  onView,
  onUpdate,
}) => {
  return (
    <Card variant="bordered" className="group">
      <div className="space-y-4">
        {/* Header with ID and Status Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Case ID
            </p>
            <h3 className="text-lg font-bold text-white truncate">
              {caseId}
            </h3>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Badge
              variant={
                statusColors[status].badge as any
              }
              size="sm"
            >
              {statusColors[status].label}
            </Badge>
            <Badge variant={urgencyColors[urgency].badge as any} size="sm">
              {urgencyColors[urgency].label}
            </Badge>
          </div>
        </div>

        {/* Client and Case Info */}
        <div className="border-t border-[#2D3139] pt-4 space-y-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              Client
            </p>
            <p className="text-sm font-medium text-white">{clientName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              Case Type
            </p>
            <p className="text-sm font-medium text-[#00FFA3]">{caseType}</p>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="border-t border-[#2D3139] pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Created
              </p>
              <p className="text-sm text-white">{createdDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Last Update
              </p>
              <p className="text-sm text-white">{lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Next Action
            </p>
            <p className="text-sm text-[#00FFA3] font-medium">{nextAction}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-[#2D3139] pt-4 flex gap-2">
          {onView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onView}
              className="flex-1"
            >
              View
            </Button>
          )}
          {onUpdate && (
            <Button
              variant="primary"
              size="sm"
              onClick={onUpdate}
              className="flex-1"
            >
              Update
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
