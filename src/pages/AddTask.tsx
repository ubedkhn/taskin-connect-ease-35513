import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  priority: z.enum(["low", "medium", "high"]),
  repeat: z.enum(["none", "daily", "weekly", "monthly", "custom"]),
});

const AddTask = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [priority, setPriority] = useState("medium");
  const [repeat, setRepeat] = useState("none");

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (hours: string, minutes: string, period: "AM" | "PM"): string => {
    let hour = parseInt(hours);
    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const time24 = convertTo24Hour(hours, minutes, period);
      
      const validatedData = taskSchema.parse({
        title,
        date,
        time: time24,
        priority,
        repeat,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add tasks");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: validatedData.title,
          date: validatedData.date,
          time: validatedData.time,
          priority: validatedData.priority,
          repeat: validatedData.repeat,
        });

      if (error) throw error;

      toast.success("Reminder added successfully!");
      navigate("/remind-me");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to add reminder. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Reminder</h1>
            <p className="text-muted-foreground text-sm">Create a new task</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Buy groceries"
                  required
                  className="h-12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-11 h-12"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                    <Select value={hours} onValueChange={setHours}>
                      <SelectTrigger className="pl-11 h-12">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, '0');
                          return <SelectItem key={hour} value={hour}>{hour}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={minutes} onValueChange={setMinutes}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => {
                        const minute = i.toString().padStart(2, '0');
                        return <SelectItem key={minute} value={minute}>{minute}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  <Select value={period} onValueChange={(value) => setPeriod(value as "AM" | "PM")}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <div className="relative">
                  <Flag className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="pl-11 h-12">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Repeat */}
              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select value={repeat} onValueChange={setRepeat}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Reminder"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AddTask;
