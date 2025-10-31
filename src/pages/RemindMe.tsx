import { useState } from "react";
import { Plus, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Link } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

const RemindMe = () => {
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: "Morning workout",
      time: "6:00 AM",
      priority: "high",
      completed: true,
    },
    {
      id: 2,
      title: "Team meeting",
      time: "10:00 AM",
      priority: "high",
      completed: false,
    },
    {
      id: 3,
      title: "Grocery shopping",
      time: "4:00 PM",
      priority: "medium",
      completed: false,
    },
    {
      id: 4,
      title: "Call dentist",
      time: "Tomorrow",
      priority: "low",
      completed: false,
    },
  ]);

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
              {tasks.filter((t) => !t.completed && t.time !== "Tomorrow").length}
            </Badge>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((task) => task.time !== "Tomorrow")
              .map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "transition-all hover:shadow-md",
                    task.completed && "opacity-60"
                  )}
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
                        <p className="text-sm text-muted-foreground mt-1">{task.time}</p>
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

        {/* Upcoming Tasks */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">Upcoming</h2>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((task) => task.time === "Tomorrow")
              .map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-border mt-0.5"></div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.time}</p>
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
      </main>

      <BottomNav />
    </div>
  );
};

// Import cn utility
import { cn } from "@/lib/utils";

export default RemindMe;
