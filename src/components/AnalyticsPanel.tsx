import React from 'react';
import { Card, StatCard, Badge } from './ui';

interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

interface AnalyticsPanelProps {
  title: string;
  subtitle?: string;
  metrics: MetricData[];
  timeRange?: string;
  lastUpdated?: string;
  isLoading?: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  title,
  subtitle,
  metrics,
  timeRange = 'Last 30 Days',
  lastUpdated,
  isLoading = false,
}) => {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      variant="elevated"
      headerAction={
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {timeRange}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-600 mt-1">
              Updated {lastUpdated}
            </p>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <StatCard
              key={idx}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              variant={metric.variant}
              icon={metric.icon}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

interface DetailedMetricsProps {
  title: string;
  data: {
    label: string;
    value: string | number;
    description?: string;
    badge?: {
      text: string;
      variant:
        | 'primary'
        | 'success'
        | 'warning'
        | 'error'
        | 'default'
        | 'info';
    };
  }[];
}

export const DetailedMetrics: React.FC<DetailedMetricsProps> = ({
  title,
  data,
}) => {
  return (
    <Card title={title}>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 bg-[#16181D] rounded-lg hover:bg-[#1E2128] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              {item.badge && (
                <Badge variant={item.badge.variant as any} size="sm">
                  {item.badge.text}
                </Badge>
              )}
              <p className="text-lg font-bold text-[#00FFA3] text-right">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
