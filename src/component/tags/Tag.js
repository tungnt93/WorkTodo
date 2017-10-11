import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

export default class Tag extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: "#2196F3", fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: "#111"},
    });

    render() {
        return (
            <View style={{alignItems: 'center', justifyContent:'center'}}>
                <Text>
                    Tag
                </Text>
            </View>
        );
    }
}

