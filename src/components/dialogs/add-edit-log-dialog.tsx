'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { CommuteLog, CommuteType } from '@/lib/types';
import { useEffect } from 'react';
import { CommuteIcon } from '../commute-icon';

const formSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  goingCommuteTypeId: z.string().min(1, 'Please select a commute type.'),
  goingDuration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  returnCommuteTypeId: z.string().min(1, 'Please select a commute type.'),
  returnDuration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  notes: z.string().optional(),
});

type AddEditLogDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (log: CommuteLog) => void;
  log: CommuteLog | null;
  commuteTypes: CommuteType[];
};

export function AddEditLogDialog({ isOpen, onOpenChange, onSave, log, commuteTypes }: AddEditLogDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      goingCommuteTypeId: '',
      goingDuration: 30,
      returnCommuteTypeId: '',
      returnDuration: 30,
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (log) {
        form.reset({
          date: new Date(log.date),
          goingCommuteTypeId: log.goingCommuteTypeId,
          goingDuration: log.goingDuration,
          returnCommuteTypeId: log.returnCommuteTypeId,
          returnDuration: log.returnDuration,
          notes: log.notes,
        });
      } else {
        const defaultTypeId = commuteTypes.length > 0 ? commuteTypes[0].id : '';
        form.reset({
          date: new Date(),
          goingCommuteTypeId: defaultTypeId,
          goingDuration: 30,
          returnCommuteTypeId: defaultTypeId,
          returnDuration: 30,
          notes: '',
        });
      }
    }
  }, [log, isOpen, form, commuteTypes]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newLog: CommuteLog = {
      id: log?.id || new Date().toISOString(),
      date: values.date,
      goingCommuteTypeId: values.goingCommuteTypeId,
      goingDuration: values.goingDuration,
      returnCommuteTypeId: values.returnCommuteTypeId,
      returnDuration: values.returnDuration,
      notes: values.notes || '',
    };
    onSave(newLog);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{log ? 'Edit Commute Log' : 'Add New Commute Log'}</DialogTitle>
          <DialogDescription>
            {log ? 'Update the details of your commute.' : 'Log a new commute to track your travel time.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goingCommuteTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Going Transport</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commuteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center">
                              <CommuteIcon iconName={type.icon} className="mr-2" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goingDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Going Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="returnCommuteTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Transport</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commuteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center">
                              <CommuteIcon iconName={type.icon} className="mr-2" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes about your commute..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {log ? 'Save Changes' : 'Add Log'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
