import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  providerId: string;
  amount: number;
  onPaymentComplete?: () => void;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  requestId,
  providerId,
  amount,
  onPaymentComplete,
}: PaymentDialogProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { error } = await supabase.from("payments").insert({
      service_request_id: requestId,
      user_id: user.id,
      provider_id: providerId,
      amount,
      status: "completed",
      payment_method: paymentMethod,
      transaction_id: `TXN${Date.now()}`,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Payment has been processed successfully",
      });

      // Update service request status
      await supabase
        .from("service_requests")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", requestId);

      // Create notifications
      await supabase.from("notifications").insert([
        {
          user_id: providerId,
          type: "payment",
          title: "Payment Received",
          message: `You received ₹${amount} for your service`,
          related_id: requestId,
        },
        {
          user_id: user.id,
          type: "payment",
          title: "Payment Successful",
          message: `Payment of ₹${amount} processed successfully`,
          related_id: requestId,
        },
      ]);

      onOpenChange(false);
      onPaymentComplete?.();
    }

    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Choose your payment method and complete the transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount */}
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">₹{amount}</p>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="w-5 h-5" />
                <Label htmlFor="card" className="cursor-pointer flex-1">
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="upi" id="upi" />
                <Wallet className="w-5 h-5" />
                <Label htmlFor="upi" className="cursor-pointer flex-1">
                  UPI
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Details (if card selected) */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" type="password" />
                </div>
              </div>
            </div>
          )}

          {/* UPI Details (if UPI selected) */}
          {paymentMethod === "upi" && (
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" placeholder="username@upi" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1"
            >
              {processing ? "Processing..." : `Pay ₹${amount}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
