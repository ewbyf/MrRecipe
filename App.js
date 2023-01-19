import { MenuProvider } from "react-native-popup-menu";
import FlashMessage from "react-native-flash-message";
import MainStack from "./navigation/routes/MainStack";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import * as FileSystem from "expo-file-system";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const cacheImages = async(uri, doc) => {
    await FileSystem.downloadAsync(
      uri,
      FileSystem.documentDirectory + doc.toString() + ".jpg"
    )
  }

  const fetchFonts = async () => {
    await Font.loadAsync({
      Helvetica: require("./assets/fonts/Helvetica.otf"),
      Pacifico: require("./assets/fonts/Pacifico-Regular.ttf"),
      Sora: require("./assets/fonts/Sora-Medium.ttf"),
      Nunito: require("./assets/fonts/Nunito.ttf"),
      NunitoBold: require("./assets/fonts/Nunito-Bold.ttf"),
      NunitoExtraBold: require("./assets/fonts/Nunito-ExtraBold.ttf"),
    });
    setLoaded(true);
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  if (loaded) {
    SplashScreen.hideAsync();

    return (
      <MenuProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
        <FlashMessage
          position={{ top: "7%" }}
          floating={true}
          icon={"success"}
          titleStyle={{ fontSize: 15 }}
          animationDuration={400}
        />
      </MenuProvider>
    );
  }
}
