import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  errorMessage?: string | null;
  className?: string;
};

export function Select({
  label,
  placeholder = "Selecione...",
  value,
  options,
  onValueChange,
  errorMessage,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={className}>
      {label ? (
        <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {label}
        </Text>
      ) : null}
      
      <Pressable
        onPress={() => setIsOpen(true)}
        className={[
          "mt-2 flex-row items-center justify-between rounded-input border px-input py-3",
          "border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark",
          errorMessage ? "border-red-500" : "",
        ].join(" ")}
      >
        <Text
          className={[
            "text-base",
            selectedOption
              ? "text-strong-light dark:text-strong-dark"
              : "text-muted-light dark:text-muted-dark",
          ].join(" ")}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text className="text-muted-light dark:text-muted-dark">▼</Text>
      </Pressable>

      {errorMessage ? (
        <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={() => setIsOpen(false)}
        >
          <View className="m-4 w-full max-w-sm rounded-2xl bg-surface-dark p-2">
            <Text className="px-4 py-3 text-lg font-semibold text-text-primary-dark">
              {label ?? "Selecione"}
            </Text>
            <ScrollView className="max-h-80">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={[
                    "rounded-lg px-4 py-3",
                    option.value === value ? "bg-brand-600" : "",
                  ].join(" ")}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text
                    className={[
                      "text-base",
                      option.value === value
                        ? "font-semibold text-white"
                        : "text-text-primary-dark",
                    ].join(" ")}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
