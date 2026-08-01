'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';

interface IFormActionBarButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

interface IFormActionBarDropdownItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface IFormActionBarDropdown {
  label: string;
  variant?: 'default' | 'outline';
  disabled?: boolean;
  items: IFormActionBarDropdownItem[];
}

type TFormActionBarAction = IFormActionBarButton | IFormActionBarDropdown;

interface IFormActionBarProps {
  variant: 'page' | 'dialog';
  show?: boolean;
  actions: TFormActionBarAction[];
}

function isDropdown(
  action: TFormActionBarAction
): action is IFormActionBarDropdown {
  return 'items' in action;
}

export function FormActionBar({
  variant,
  show = true,
  actions,
}: IFormActionBarProps) {
  if (!show || actions.length === 0) return null;

  const isPage = variant === 'page';

  const containerClass = isPage
    ? 'flex flex-wrap gap-2 justify-end pt-4 border-t mt-4 print:hidden'
    : 'sticky bottom-0 -mx-6 -mb-6 mt-6 p-4 bg-background/95 backdrop-blur-sm border-t flex justify-end gap-2 z-10 print:hidden';

  return (
    <div className={containerClass}>
      {actions.map((action, i) => {
        if (isDropdown(action)) {
          return (
            <DropdownMenu key={i}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={action.variant ?? 'default'}
                  disabled={action.disabled}
                  className="min-w-[140px]"
                >
                  {action.label}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {action.items.map((item, j) => (
                  <DropdownMenuItem
                    key={j}
                    onClick={item.onClick}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return (
          <Button
            key={i}
            type="button"
            variant={action.variant ?? 'default'}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
