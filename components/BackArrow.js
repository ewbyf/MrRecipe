import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const BackArrow = ({ navigation }) => (
  <Icon
    name="arrow-back-outline"
    size={30}
    color="white"
    style={styles.backArrow}
    onPress={() => {
      if (navigation.canGoBack()) {
        navigation.goBack(null);
      }
    }}
  />
);

const styles = StyleSheet.create({
  backArrow: {
    position: "absolute",
    left: 20,
    bottom: "50%",
    marginBottom: -15,
    zIndex: 10,
  },
});

export default BackArrow;
