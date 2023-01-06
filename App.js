import NavigationBar from "./navigation/NavigationBar";
import { MenuProvider } from "react-native-popup-menu";

export function App() {
  return (
    <MenuProvider>
        <NavigationBar />
    </MenuProvider>
  );
}

export default App;
