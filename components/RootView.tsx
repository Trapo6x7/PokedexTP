import { useThemeColors } from "@/hooks/useThemeColors";
import {  StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ViewProps } from "react-native/Libraries/Components/View/ViewPropTypes";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  ReduceMotion,
} from "react-native-reanimated";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { useEffect, useRef } from "react";

type Props = ViewProps & {
  bakcgroundColor?: string;
};

export function RootView({ style, bakcgroundColor, ...rest }: Props) {
  const colors = useThemeColors();
  const targetColor = bakcgroundColor ?? colors.tint;
  const prevColorRef = useRef(targetColor);
  const progress = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [prevColorRef.current, targetColor]
      ),
    };
  });

  useEffect(() => {
    if (targetColor !== prevColorRef.current) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (finished) {
          prevColorRef.current = targetColor;
        }
      });
    }
  }, [targetColor]);
  
  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <SafeAreaView
        style={[styles.rootStyle, style]} {...rest}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootStyle: { flex: 1, padding: 4, gap: 16 },
});
