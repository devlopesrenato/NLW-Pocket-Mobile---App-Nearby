import { Alert, Text, View } from "react-native";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Categories, CategoriesProps } from "@/components/categories";
import { PlaceProps } from "@/components/place";
import { Places } from "@/components/places";

type MarketProps = PlaceProps & {};

export default function Home() {
  const [categories, setCategories] = useState<CategoriesProps>([]);
  const [category, setCategory] = useState("");
  const [markets, setMarkets] = useState<MarketProps[]>([]);

  async function getCategories() {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
      setCategory(data[0].id);
    } catch (error) {
      console.log(error);
      Alert.alert("Categorias", "Não foi possível carregar as categorias");
    }
  }

  async function getMarkets() {
    try {
      if (!category) {
        return;
      }
      const { data } = await api.get("/markets/category/" + category);
      setMarkets(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Locais", "Não foi possível carregar as categorias");
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getMarkets();
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Categories
        data={categories}
        selected={category}
        onSelect={setCategory}
      />

      <Places data={markets} />
    </View>
  );
}
