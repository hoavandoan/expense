import { AppText } from "@/components/app-text";
import React from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface FormSectionProps {
  label: string;
  error?: string;
  isRequired?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized form section layout for consistent labels, spacing, and error handling.
 */
export const FormSection = ({
  label,
  error,
  isRequired,
  children,
  className = "mb-6",
}: FormSectionProps) => {
  return (
    <View className={className}>
      <AppText className="text-[12px] font-heading-bold text-muted capitalize tracking-widest mb-2 ml-1">
        {label}
        {isRequired && <AppText className="text-danger ml-1">*</AppText>}
      </AppText>
      
      {children}
      
      {error && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          className="ml-1 mt-2"
        >
          <AppText className="text-danger text-xs font-medium">
            {error}
          </AppText>
        </Animated.View>
      )}
    </View>
  );
};
