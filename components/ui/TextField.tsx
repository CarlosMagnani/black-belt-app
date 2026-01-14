import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorMessage?: string | null;
  className?: string;
};

export function TextField({
  label,
  helperText,
  errorMessage,
  className,
  ...props
}: TextFieldProps) {
  return (
    <View>
      {label ? (
        <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={[
          "mt-2 rounded-input border border-subtle-light bg-app-light px-input py-3 text-base text-strong-light",
          "dark:border-subtle-dark dark:bg-app-dark dark:text-strong-dark",
          errorMessage ? "border-red-500" : "",
          className ?? "",
        ].join(" ")}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {helperText ? (
        <Text className="mt-2 text-xs text-muted-light dark:text-muted-dark">{helperText}</Text>
      ) : null}
      {errorMessage ? <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text> : null}
    </View>
  );
}
