
import { AsyncStorage } from 'react-native';

const getItemAsyncStorage = async(key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if(value !== null){
            return value;
        }
        return '';
    }
    catch (error){
        return '';
    }
};

export default getItemAsyncStorage;
