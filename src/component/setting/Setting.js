import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import {connect} from 'react-redux';
import * as actionCreator from '../../redux/actionCreator';

class Setting extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: "#fff", fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: "#111"},
    });

    render() {
        return (
            <View style={{backgroundColor: '#fff', flex: 1}}>
                <View>
                    <Text style={{fontSize: 20, margin: 6, marginTop: 24, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor:'#ccc', color:'#000'}}>
                        Chọn chủ đề
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#113f8c'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#01a4a4'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#00a1cb'}]}/>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#61AE24'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#D0D102'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#32742C'}]}/>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#E54028'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#F18D05'}]}/>
                        <TouchableOpacity style={[styles.colorBox, {backgroundColor:'#616161'}]}/>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    colorBox:{
        flex:1, height: 50, margin: 6
    }
});

function mapStateToProps(state) {
    return {
        theme: state.theme
    }
}

export default connect(mapStateToProps, actionCreator)(Setting);