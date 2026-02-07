import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

type DateInputProps = {
  label?: string;
  value?: string;
  onChangeDate?: (date: string) => void;
  placeholder?: string;
  errorMessage?: string | null;
  helperText?: string;
  className?: string;
};

/**
 * Formats input to DD/MM/YYYY pattern
 */
const formatDateInput = (text: string): string => {
  // Remove non-digits
  const digits = text.replace(/\D/g, "");
  
  // Limit to 8 digits (DDMMYYYY)
  const limited = digits.slice(0, 8);
  
  // Format with slashes
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  }
};

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD (ISO format for storage)
 */
const toISODate = (displayDate: string): string => {
  const parts = displayDate.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY (for display)
 */
const fromISODate = (isoDate?: string): string => {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export function DateInput({
  label,
  value,
  onChangeDate,
  placeholder = "DD/MM/AAAA",
  errorMessage,
  helperText,
  className,
}: DateInputProps) {
  // Convert ISO to display format for internal state
  const [displayValue, setDisplayValue] = useState(() => fromISODate(value));

  const handleChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDisplayValue(formatted);
    
    // Only emit ISO date when complete
    if (formatted.length === 10) {
      const isoDate = toISODate(formatted);
      if (isoDate) {
        onChangeDate?.(isoDate);
      }
    } else {
      onChangeDate?.("");
    }
  };

  // Sync with external value changes (including clears)
  React.useEffect(() => {
    const fromExternal = fromISODate(value);
    if (fromExternal !== displayValue) {
      setDisplayValue(fromExternal);
    }
  }, [value]);

  return (
    <View className={className}>
      {label ? (
        <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {label}
        </Text>
      ) : null}
      
      <TextInput
        value={displayValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        keyboardType="number-pad"
        maxLength={10}
        className={[
          "mt-2 rounded-input border px-input py-3 text-base",
          "border-subtle-light bg-app-light text-strong-light",
          "dark:border-subtle-dark dark:bg-app-dark dark:text-strong-dark",
          errorMessage ? "border-red-500" : "",
        ].join(" ")}
        placeholderTextColor="#9CA3AF"
      />
      
      {helperText && !errorMessage ? (
        <Text className="mt-2 text-xs text-muted-light dark:text-muted-dark">
          {helperText}
        </Text>
      ) : null}
      
      {errorMessage ? (
        <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
