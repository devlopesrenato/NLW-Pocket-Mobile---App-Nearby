import { StyleSheet } from "react-native";
import { colors, fontFamily } from "@/styles/theme";

export const s = StyleSheet.create({
  container: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22.4,
    color: colors.gray[500],
    fontFamily: fontFamily.regular,
  },
});
