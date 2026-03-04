/**
 * Activity Item Component
 * @module app/(main)/_components/activity-item
 */

import type { IActivityItemProps } from '@/features/dashboard/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileText, CheckCircle, ClipboardList } from 'lucide-react';

const icons: Record<string, typeof FileText> = {
  LOG_SHEET_SUBMITTED: FileText,
  LOG_SHEET_APPROVED: CheckCircle,
  WORK_REPORT_SUBMITTED: ClipboardList,
  WORK_REPORT_APPROVED: CheckCircle,
  ATTENDANCE_CHECK_IN: ClipboardList,
  ATTENDANCE_CHECK_OUT: ClipboardList,
  SUMMARY_REPORT_FINALIZED: CheckCircle,
};

const severityStyles = {
  INFO: 'border-l-blue-500',
  SUCCESS: 'border-l-green-500',
  WARNING: 'border-l-orange-500',
};

export function ActivityItem({
  activity,
  onClick,
  compact,
}: IActivityItemProps): React.ReactElement {
  const Icon = icons[activity.type] || FileText;
  const userInitial = activity.userName.charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-l-4 ${severityStyles[activity.severity]} bg-card hover:bg-accent/50 transition-colors cursor-pointer`}
      onClick={() => onClick?.(activity)}
    >
      {activity.userAvatarUrl ? (
        <img
          src={activity.userAvatarUrl}
          alt={activity.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
          {userInitial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium truncate">{activity.title}</p>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {activity.message}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {activity.projectName && (
              <span className="truncate">{activity.projectName}</span>
            )}
            <span>•</span>
            <span>
              {formatDistanceToNow(activity.createdAt, {
                addSuffix: true,
                locale: id,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
