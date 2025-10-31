import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  const faqs = [
    {
      question: "How do I create a task?",
      answer: "Navigate to the 'Remind Me' or 'Add Task' section from the home page. Fill in the task details including title, description, and date, then tap 'Save' to create your task."
    },
    {
      question: "How do I find service providers?",
      answer: "Tap on 'Nearby Help' from the home screen. You can browse available service providers in your area, filter by category, and view their profiles and ratings."
    },
    {
      question: "Can I switch between User and Service Provider accounts?",
      answer: "Yes! Go to Settings and select 'Account Type'. You can switch between User and Service Provider modes instantly based on your current needs."
    },
    {
      question: "How do I change the app theme?",
      answer: "Go to Settings > App Theme. You can choose between Light, Dark, or System Default theme based on your preference."
    },
    {
      question: "What should I do if I forgot my password?",
      answer: "On the login screen, tap 'Forgot Password'. Enter your email address and we'll send you instructions to reset your password."
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Start Chat",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@taskin.app",
      action: "Send Email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "+1 (555) 123-4567",
      action: "Call Now",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-6 animate-fade-in">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* FAQs */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Methods */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
          <div className="space-y-3">
            {contactMethods.map((method, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <method.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <Button size="sm">{method.action}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access our complete user guide and documentation to learn more about Taskin's features.
                </p>
                <Button variant="outline">View Documentation</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Help;
