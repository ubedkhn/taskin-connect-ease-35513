import { useState, useEffect } from "react";
import { Plus, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

const RemindMe = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setTasks((data || []).map(task => ({
        ...task,
        priority: task.priority as "low" | "medium" | "high"
      })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ));

      toast({
        title: "Success",
        description: !currentStatus ? "Task completed!" : "Task reopened",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const getTaskCategory = (task: Task): "today" | "tomorrow" | "upcoming" => {
    const taskDate = parseISO(task.date);
    if (isToday(taskDate)) return "today";
    if (isTomorrow(taskDate)) return "tomorrow";
    return "upcoming";
  };

  const getDisplayTime = (task: Task): string => {
    const taskDate = parseISO(task.date);
    if (isToday(taskDate)) return task.time;
    if (isTomorrow(taskDate)) return "Tomorrow";
    return format(taskDate, "MMM d");
  };

  const todayTasks = tasks.filter(task => getTaskCategory(task) === "today");
  const upcomingTasks = tasks.filter(task => getTaskCategory(task) !== "today");

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Remind Me</h1>
          <Link to="/add-task">
            <Button size="icon" variant="gradient" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-sm">Manage your daily reminders</p>
      </header>

      {/* Tasks List */}
      <main className="p-6 space-y-4">
        {/* Today's Tasks */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Today</h2>
            <Badge variant="secondary" className="ml-auto">
              {todayTasks.filter((t) => !t.completed).length}
            </Badge>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
          ) : todayTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks for today</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "transition-all hover:shadow-md cursor-pointer",
                    task.completed && "opacity-60"
                  )}
                  onClick={() => toggleTaskComplete(task.id, task.completed)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          task.completed
                            ? "bg-success border-success"
                            : "border-border"
                        )}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-success-foreground" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3
                          className={cn(
                            "font-medium",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{getDisplayTime(task)}</p>
                      </div>

                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">Upcoming</h2>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => toggleTaskComplete(task.id, task.completed)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          task.completed
                            ? "bg-success border-success"
                            : "border-border"
                        )}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-success-foreground" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}>{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{getDisplayTime(task)}</p>
                      </div>

                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

// Import cn utility
import { cn } from "@/lib/utils";

export default RemindMe;
