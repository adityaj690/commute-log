import { Car, Bus, TrainFront, Bike, HelpCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: LucideIcon } = {
  'Car': Car,
  'Bus': Bus,
  'TrainFront': TrainFront,
  'Bike': Bike,
};

export function CommuteIcon({ iconName, className }: { iconName: string, className?: string }) {
  const IconComponent = iconMap[iconName] || HelpCircle;
  return <IconComponent className={cn("h-4 w-4", className)} />;
}
