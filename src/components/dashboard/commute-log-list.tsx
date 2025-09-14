'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { MoreHorizontal, Edit, Trash2, Clock, Calendar, StickyNote, ArrowRight } from 'lucide-react';
import type { CommuteLog, CommuteType } from '@/lib/types';
import { useState } from 'react';
import { CommuteIcon } from '@/components/commute-icon';

export function CommuteLogList({
  logs,
  commuteTypes,
  onEdit,
  onDelete,
}: {
  logs: CommuteLog[];
  commuteTypes: CommuteType[];
  onEdit: (log: CommuteLog) => void;
  onDelete: (id: string) => void;
}) {
  const [logToDelete, setLogToDelete] = useState<CommuteLog | null>(null);

  const getType = (typeId: string) => commuteTypes.find((t) => t.id === typeId);

  if (logs.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto bg-secondary p-3 rounded-full">
            <CommuteIcon iconName="Car" className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No Commute Logs Yet</CardTitle>
          <CardDescription>Start by adding your first commute log to see it here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {logs.map((log) => {
          const goingCommuteType = getType(log.goingCommuteTypeId);
          const returnCommuteType = getType(log.returnCommuteTypeId);

          return (
            <Card key={log.id} className="overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-xl">
              <CardContent className="p-4 grid gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="font-bold text-lg mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CommuteIcon iconName={goingCommuteType?.icon || 'HelpCircle'} className="h-5 w-5" />
                        <span>{goingCommuteType?.name || 'Unknown'}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <CommuteIcon iconName={returnCommuteType?.icon || 'HelpCircle'} className="h-5 w-5" />
                        <span>{returnCommuteType?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(log)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setLogToDelete(log)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      Going: <strong>{log.goingDuration} mins</strong>
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      Return: <strong>{log.returnDuration} mins</strong>
                    </span>
                  </div>
                </div>

                {log.notes && (
                  <div className="flex items-start text-sm text-muted-foreground border-t pt-4">
                    <StickyNote className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="italic">{log.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this commute log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (logToDelete) {
                  onDelete(logToDelete.id);
                  setLogToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
