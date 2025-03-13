import React from 'react';
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

export const SimpleDatePicker = ({ selected, onSelect, disabled, className }) => {
  const handleChange = (e) => {
    try {
      const inputDate = e.target.value;
      const date = new Date(inputDate);
      // Ensure we're working with a valid date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Check if the user is at least 16 years old
      const today = new Date();
      const minAgeDate = new Date(today);
      minAgeDate.setFullYear(today.getFullYear() - 16);
      
      if (date > minAgeDate) {
        toast.error("Vous devez avoir au moins 16 ans pour vous inscrire.");
        return;
      }
      
      // Add timezone offset to ensure correct date
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() - timezoneOffset);
      onSelect(adjustedDate);
    } catch (e) {
      console.error('Error handling date change:', e);
    }
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Ensure we're working with a valid date
      if (isNaN(d.getTime())) {
        return '';
      }
      // Add timezone offset to ensure correct date
      const timezoneOffset = d.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(d.getTime() - timezoneOffset);
      return adjustedDate.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  };

  // Calculate max date (must be at least 16 years old)
  const calculateMaxDate = () => {
    const today = new Date();
    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(today.getFullYear() - 16);
    return minAgeDate.toISOString().split('T')[0];
  };

  return (
    <Input
      type="date"
      value={formatDateForInput(selected)}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      max={calculateMaxDate()}
    />
  );
}; 