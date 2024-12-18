import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import { api } from "@/services/api";
import { Categories, CategoriesProps } from "@/components/categories";
import { PlaceProps } from "@/components/place";
import { Places } from "@/components/places";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";

type MarketProps = PlaceProps & {
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [categories, setCategories] = useState<CategoriesProps>([]);
  const [category, setCategory] = useState("");
  const [markets, setMarkets] = useState<MarketProps[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>({
    latitude: -10.302735034438902,
    longitude: -50.34073639268239,
    latitudeDelta: 35,
    longitudeDelta: 35,
  });

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
      const { data } = await api.get(`/markets/category/${category}`);
      setMarkets(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Locais", "Não foi possível carregar os locais");
    }
  }

  async function getCurrentLocation() {
    let { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      Alert.alert("A permissão para acessar o local foi negada");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: -23.561187293883442,
      longitude: -46.656451388116494,
      // latitude: location.coords.latitude,
      // longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }

  function getDistance(cords: {
    origin: { lat: number; lon: number };
    destiny: { lat: number; lon: number };
  }): string {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const lat1 = toRadians(cords.origin.lat);
    const lon1 = toRadians(cords.origin.lon);
    const lat2 = toRadians(cords.destiny.lat);
    const lon2 = toRadians(cords.destiny.lon);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371;

    const distance = R * c;
    if (distance < 1) {
      const distanceInMeters = distance * 1000;
      return `${Math.round(distanceInMeters)} metros`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  }

  useEffect(() => {
    getCurrentLocation();
    getCategories();
  }, []);

  useEffect(() => {
    getMarkets();
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: "#6e6e6e96" }}>
      <Categories
        data={categories}
        selected={category}
        onSelect={setCategory}
      />

      <MapView style={{ flex: 1 }} region={location}>
        <Marker
          identifier="current"
          coordinate={location}
          image={require("@/assets/location.png")}
        />
        {markets.map((item) => (
          <Marker
            key={item.id}
            identifier={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            image={require("@/assets/pin.png")}
          >
            <Callout onPress={() => router.navigate(`/market/${item.id}`)}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.gray[600],
                    fontFamily: fontFamily.medium,
                  }}
                >
                  {item.name}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: colors.gray[600],
                    fontFamily: fontFamily.regular,
                  }}
                >
                  {item.address}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.gray[600],
                    fontFamily: fontFamily.regular,
                  }}
                >
                  {getDistance({
                    origin: {
                      lat: location.latitude,
                      lon: location.longitude,
                    },
                    destiny: { lat: item.latitude, lon: item.longitude },
                  })}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <Places data={markets} />
    </View>
  );
}
