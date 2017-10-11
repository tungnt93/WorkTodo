
import { AsyncStorage } from 'react-native';

const saveAsyncStorage = async(key, value, type) => {
    if(type === 'JSON'){
        await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    else{
        await AsyncStorage.setItem(key, value);
    }
};

export default saveAsyncStorage;
