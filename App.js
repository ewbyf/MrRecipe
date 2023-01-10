import { MenuProvider } from "react-native-popup-menu";
import FlashMessage from "react-native-flash-message";
import MainStack from "./navigation/routes/MainStack"
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <MenuProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
        <FlashMessage position="top" floating={true} icon={"success"} titleStyle={{fontSize: 15}}/>
    </MenuProvider>
  );
}
