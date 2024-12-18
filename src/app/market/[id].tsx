import { useEffect, useState, useRef } from "react";
import { View, Modal, Alert, StatusBar, ScrollView } from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from "@/services/api";
import { Loading } from "@/components/loading";
import { Cover } from "@/components/market/cover";
import { Details, PropsDetails } from "@/components/market/details";
import { Coupon } from "@/components/market/coupon";
import { Button } from "@/components/button";

type DataProps = PropsDetails & {
  cover: string;
};

export default function Market() {
  const [data, setData] = useState<DataProps>();
  const [loading, setLoading] = useState<boolean>(true);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [isVisibleCamera, setIsVisibleCamera] = useState<boolean>(false);
  const [couponIsLoading, setCouponIsLoading] = useState<boolean>(false);

  const [_, requestPermission] = useCameraPermissions();
  const params = useLocalSearchParams<{ id: string }>();
  const qrLock = useRef(false);

  async function getMarket() {
    try {
      const { data } = await api.get(`/markets/${params.id}`);
      setData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os dados.", [
        { text: "OK", onPress: () => router.navigate("/home") },
      ]);
    }
  }

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert(
          "Camera",
          "Você precisa habilitar o acesso a câmera."
        );
      }
      qrLock.current = false;
      setIsVisibleCamera(true);
    } catch (error) {
      console.log(error);
      Alert.alert("Câmera", "Não foi possível abrir a câmera.");
    }
  }

  async function getCoupon(id: string) {
    try {
      setCouponIsLoading(true);
      const { data } = await api.patch(`/coupons/${id}`);
      Alert.alert("Cupom", data.coupon);
      setCoupon(data.coupon);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível utilizar o cupom.");
    } finally {
      setCouponIsLoading(false);
    }
  }

  function handleUseCoupon(id: string) {
    setIsVisibleCamera(false);
    Alert.alert(
      "Cupom",
      "Não é possível reutilizar um cupom resgatado. Deseja realmente resgatar o cupom?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", onPress: () => getCoupon(id) },
      ]
    );
  }

  useEffect(() => {
    getMarket();
  }, [params.id, coupon]);

  if (loading) {
    return <Loading />;
  }

  if (!data) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" hidden={isVisibleCamera} />
      <ScrollView showsHorizontalScrollIndicator={false}>
        <Cover uri={data.cover} />
        <Details data={data} />
        {coupon && <Coupon code={coupon} />}
      </ScrollView>

      <View style={{ padding: 32 }}>
        <Button onPress={handleOpenCamera}>
          <Button.Title>Ler QR Code</Button.Title>
        </Button>

        <Modal style={{ flex: 1 }} visible={isVisibleCamera}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={({ data }) => {
              if (data && !qrLock.current) {
                qrLock.current = true;
                handleUseCoupon(data);
              }
            }}
          />

          <View
            style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}
          >
            <Button
              onPress={() => setIsVisibleCamera(false)}
              isLoading={couponIsLoading}
            >
              <Button.Title>Voltar</Button.Title>
            </Button>
          </View>
        </Modal>
      </View>
    </View>
  );
}
