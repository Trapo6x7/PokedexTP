import { useThemeColors } from "@/hooks/useThemeColors";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: "id" | "name";
  onChange: (v: "id" | "name") => void;
};

export function SortButton({ value, onChange }: Props) {
  const colors = useThemeColors();
  const [isModaleVisible, setModaleVisibility]= useState(false);
  const onClose= () => {
    setModaleVisibility(false);
  }
  const onButtonPress = () => {
    setModaleVisibility(true);
  };
  return (
    <>
      <Pressable onPress={onButtonPress}>
        <View style={[styles.button, { backgroundColor: colors.grayWhite }]}>
          <Image
            source={
              value === "id"
                ? require("@/assets/images/sort.png")
                : require("@/assets/images/sort.png")
            }
            style={{ width: 20, height: 20 }}
          />
        </View>
      </Pressable>
      <Modal transparent visible={isModaleVisible} onRequestClose={onClose}>
<Pressable style={styles.backdrop} onPress={onClose}></Pressable>
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
    flex : 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  }
});
