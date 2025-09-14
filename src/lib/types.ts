export type CommuteType = {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
};

export type CommuteLog = {
  id: string;
  date: Date;
  goingCommuteTypeId: string;
  returnCommuteTypeId: string;
  goingDuration: number; // in minutes
  returnDuration: number; // in minutes
  notes: string;
};
