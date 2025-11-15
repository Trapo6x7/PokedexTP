import { Colors } from "@/constants/Colors";
import { View, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";
;

type Props = {
  name: keyof (typeof Colors)["type"];
};
export function PokemonType({ name }: Props) {
  return (
    <View style={[rootStyle, {backgroundColor: Colors.type[name]}]}>
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
