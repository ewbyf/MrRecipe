import NavigationBar from "./navigation/NavigationBar";
import { MenuProvider } from "react-native-popup-menu";
import FlashMessage from "react-native-flash-message";

export default function App() {
  return (
    <MenuProvider>
        <NavigationBar />
        <FlashMessage position="top" floating={true} icon={"success"} titleStyle={{fontSize: 15}}/>
    </MenuProvider>
  );
}
