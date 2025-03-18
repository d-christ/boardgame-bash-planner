
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Check, X } from 'lucide-react';

interface AttendanceFormProps {
  eventId: string;
}

interface FormValues {
  name: string;
}

export const AttendanceForm = ({ eventId }: AttendanceFormProps) => {
  const { setAttendanceByName, currentUser, participations } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is logged in, get their participation data
  const userParticipation = currentUser 
    ? participations.find(p => p.userId === currentUser.id && p.eventId === eventId)
    : null;

  // Check if there's an existing attendance with this user's name
  const existingAttendance = participations.find(
    p => p.eventId === eventId && 
    (p.userId === currentUser?.id || (currentUser && p.attendeeName === currentUser.name))
  );
  
  const isAttending = existingAttendance?.attending || false;

  const form = useForm<FormValues>({
    defaultValues: {
      name: currentUser?.name || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // If user is logged in, use their ID, otherwise use the name
      if (currentUser) {
        await setAttendanceByName(currentUser.name, eventId, true, currentUser.id);
      } else {
        await setAttendanceByName(data.name, eventId, true);
      }
    } finally {
      setIsSubmitting(false);
      form.reset({ name: data.name });
    }
  };

  const handleCancelAttendance = async () => {
    setIsSubmitting(true);
    
    try {
      if (currentUser && existingAttendance?.userId) {
        await setAttendanceByName(currentUser.name, eventId, false, currentUser.id);
      } else if (existingAttendance?.attendeeName) {
        await setAttendanceByName(existingAttendance.attendeeName, eventId, false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP for this event</CardTitle>
        <CardDescription>
          Let others know if you're planning to attend
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAttending ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Please enter your name" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                <Check className="mr-2 h-5 w-5" />
                I'm Attending!
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 font-medium">
                {currentUser ? "You're" : existingAttendance?.attendeeName + " is"} attending this event!
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCancelAttendance}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-5 w-5" />
              Cancel Attendance
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
