import { FlatList } from "react-native";
import { s } from "./styles";
import { Category } from "../category";

export type CategoriesProps = {
  id: string;
  name: string;
}[];

type Props = {
  data: CategoriesProps;
  selected: string;
  onSelect: (id: string) => void;
};

export function Categories({ data, selected, onSelect }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Category
          name={item.name}
          iconId={item.id}
          isSelected={item.id === selected}
          onPress={() => onSelect(item.id)}
        />
      )}
      horizontal
      contentContainerStyle={s.content}
      showsHorizontalScrollIndicator={false}
      style={s.container}
    />
  );
}
