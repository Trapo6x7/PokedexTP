import { useThemeColors } from "@/hooks/useThemeColors";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Card } from "./Card";
import { Row } from "./Row";
import { Radio } from "./Radio";
import { Shadows } from "@/constants/Shadows";

type Props = {
  value: "national" | "alola" | "galar" | "hisui" | "paldea";
  onChange: (v: "national" | "alola" | "galar" | "hisui" | "paldea") => void;
};

const options = [
  { label: "Pokédex national", value: "national" },
  { label: "Pokédex Alola", value: "alola" },
  { label: "Pokédex Galar", value: "galar" },
  { label: "Pokédex Hisui", value: "hisui" },
  { label: "Pokédex Paldea", value: "paldea" },
] as const;

export function SortButton({ value, onChange }: Props) {
  const buttonRef = useRef<View>(null);
  const colors = useThemeColors();
  const [isModaleVisible, setModaleVisibility] = useState(false);
  const [position, setPosition] = useState<null | {
    top: number;
    right: number;
  }>(null);
  const onClose = () => {
    setModaleVisibility(false);
  };
  const onButtonPress = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setModaleVisibility(true);
      setPosition({
        top: y + height + 30,
        right: Dimensions.get("window").width - x - width - 12,
      });
    });
  };
  return (
    <>
      <Pressable onPress={onButtonPress}>
        <View
          ref={buttonRef}
          style={[styles.button, { backgroundColor: colors.grayWhite }]}
        >
          <Image
            source={require("@/assets/images/sort.png")}
            style={{ width: 20, height: 20 }}
          />
        </View>
      </Pressable>
      <Modal
        transparent
        visible={isModaleVisible}
        onRequestClose={onClose}
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[styles.popup, { backgroundColor: colors.tint, ...position }]}
        >
          <ThemedText
            variant="subtitle2"
            color="grayWhite"
            style={styles.title}
          >
            Trier par :
          </ThemedText>
          <Card style={styles.card}>
            {options.map((o) => (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  onClose();
                }}
              >
                <Row gap={8}>
                  <Radio checked={o.value === value} />
                  <ThemedText>{o.label}</ThemedText>
                </Row>
              </Pressable>
            ))}
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 32,
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  popup: {
    padding: 4,
    paddingTop: 16,
    gap: 16,
    borderRadius: 12,
    position: "absolute",
    width: 150,
    // ...Shadows.dp2,
  },
  title: {
    paddingLeft: 20,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
});
