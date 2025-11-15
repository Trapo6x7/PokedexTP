import { Colors } from "@/constants/Colors";
import { View, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";
;

type Props = {
  name: string;
};
export function PokemonType({ name }: Props) {
  const typeName = name.toLowerCase();
  const color = Colors.type[typeName as keyof typeof Colors.type] || Colors.type.normal;
  
  return (
    <View style={[rootStyle, {backgroundColor: color}]}>
      <ThemedText color="grayWhite" variant="subtitle3">
        {name ? name.charAt(0).toUpperCase() + name.slice(1) : ""}
      </ThemedText>
    </View>
  );
}

const rootStyle = {
    flex: 0,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 8,
} satisfies ViewStyle;
