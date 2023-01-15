import { MenuProvider } from "react-native-popup-menu";
import FlashMessage from "react-native-flash-message";
import MainStack from "./navigation/routes/MainStack";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const fetchFonts = async () => {
    await Font.loadAsync({
      Proxima: require("./assets/fonts/ProximaNova-Regular.otf"),
      Pacifico: require("./assets/fonts/Pacifico-Regular.ttf"),
      Sora: require("./assets/fonts/Sora-Medium.ttf"),
      RobotoBold: require("./assets/fonts/Roboto-Bold.ttf"),
      Playfair: require("./assets/fonts/PlayfairDisplay-VariableFont_wght.ttf"),
      OxygenBold: require("./assets/fonts/Oxygen-Bold.ttf"),
      Oxygen: require("./assets/fonts/Oxygen-Regular.ttf"),
    });
  };

  useEffect(() => {
    fetchFonts();
    setLoaded(true);
  }, []);

  if (loaded) {
    SplashScreen.hideAsync();
  }

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
