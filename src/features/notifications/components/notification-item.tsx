'use client';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { INotification } from '../types';

interface NotificationItemProps {
  notification: INotification;
  onRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        'flex flex-col items-start gap-1 p-3 cursor-pointer',
        !notification.isRead && 'bg-muted/50'
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex w-full justify-between gap-2">
        <span
          className={cn(
            'font-medium text-sm',
            !notification.isRead && 'font-semibold'
          )}
        >
          {notification.title}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {notification.message}
      </p>
    </DropdownMenuItem>
  );
}
