
import { AsyncStorage } from 'react-native';

const removeAsyncStorage = async(key) => {
    await AsyncStorage.removeItem(key);
};

export default removeAsyncStorage;
