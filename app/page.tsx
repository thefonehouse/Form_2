"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, User, Info, Banknote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

// Define the API response types
type Product = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  color_attributes: {
    id: string;
    color: string;
    image: string;
  }[];
  storage_attributes: {
    id: string;
    storage: string;
    price: number;
  }[];
};

type ApiResponse = {
  data: Product[];
  success: boolean;
  statusCode: number;
  message: string;
};

const formSchema = z.object({
  sortCode: z.string()
    .refine(val => !val || /^\d{6}$/.test(val),
      { message: "Sort code must be 6 digits" }).optional(),
  accountNumber: z.string()
    .refine(val => !val || /^\d{8}$/.test(val),
      { message: "Account number must be 8 digits" }).optional(),
  nameOnCard: z.string().optional(),
  timeWithBank: z.string().optional(),
});


export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  useState
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sortCode: "",
      accountNumber: "",
      nameOnCard: "",
      timeWithBank: "",
    },
  });

  // Update the onSubmit function in Code 1:
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const spreadsheetId = '1lxlp-sXZRCxgFP-yJtWmyYvxgUBpIHFUG87irV75Mfg';
      const range = 'Banking';

      const formattedValues = [
        values.sortCode || 'N/A',
        values.accountNumber || 'N/A',
        values.nameOnCard || 'N/A',
        values.timeWithBank || 'N/A',
      ];

      // Send to API with color information
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId,
          range,
          values: formattedValues,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to save data');
      }

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your form has been submitted successfully.",
        duration: 5000,
      });

      form.reset();
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    const navigateToWebsite = () => {
      router.push("https://thefonehouse.com/");
    };
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-teal-100 rounded-full p-4 w-fit">
              <CheckCircle2 className="h-12 w-12 text-teal-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-teal-800">Thank You!</CardTitle>
            <p className="text-gray-700">
              Your Banking details have been submitted successfully. Our team will contact you shortly.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={navigateToWebsite}
            >
              Visit Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gray-50 rounded-t-lg p-6 sm:p-8 space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="Company Logo"
                width={400}
                height={400}
                className="rounded-full"
                priority
              />
            </div>
            <div className=" space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Submit Your Details
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600">
                Please submit your details and our team will contact you shortly. For further inquiry please visit <Link href="https://thefonehouse.com/" className="text-teal-700 underline">www.thefonehouse.com</Link>.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 lg:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-8">
                  {/* Banking Details Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-teal-700 pt-4">
                      <Banknote className="h-5 w-5" />
                      <h2 className="text-lg sm:text-xl font-semibold">Banking Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      {/* Sort Code */}
                      <FormField
                        control={form.control}
                        name="sortCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              6 Digit Sort Code
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>Your 6-digit bank sort code</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="123456"
                                maxLength={6}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Account Number */}
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              8 Digit Account Number
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>Your 8-digit bank account number</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="12345678"
                                maxLength={8}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Name on Bank Card */}
                      <FormField
                        control={form.control}
                        name="nameOnCard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              Name on Bank Card
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>Name as it appears on your bank card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-9 text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                  placeholder="John Doe"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Time with Bank */}
                      <FormField
                        control={form.control}
                        name="timeWithBank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              Time with Bank
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>How long you&apos;ve had this bank account</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors">
                                  <SelectValue placeholder="Select time with bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                                <SelectItem value="1-3">1-3 years</SelectItem>
                                <SelectItem value="3-5">3-5 years</SelectItem>
                                <SelectItem value="5-10">5-10 years</SelectItem>
                                <SelectItem value="more-than-10">More than 10 years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </div>
                {/* Submit Button */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900",
                    "text-sm sm:text-base py-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02]",
                    "flex items-center justify-center gap-2 shadow-md",
                    isSubmitting && "opacity-90 cursor-not-allowed"
                  )}
                  disabled={isSubmitting}
                  aria-label="Submit form"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Submit Form</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}