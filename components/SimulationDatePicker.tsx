"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSimulationDate } from "@/store/simulationDate";

export default function SimulationDatePicker() {
  const [open, setOpen] = useState(false);
  const { simulationDate, setSimulationDate, resetToNow } = useSimulationDate();

  const selectedDate = simulationDate instanceof Date ? simulationDate : simulationDate ? new Date(simulationDate) : null;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSimulationDate(date);
      setOpen(false);
    }
  };

  const handleReset = () => {
    resetToNow();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedDate ? "default" : "outline"}
          className={cn(
            "justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>Select Date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={handleSelect}
          disabled={(date) =>
            date > new Date() || date < new Date("2000-01-01")
          }
          initialFocus
        />
        <div className="p-3 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Return to Present
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
