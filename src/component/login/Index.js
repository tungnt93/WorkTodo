import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
// import IconF from 'react-native-vector-icons/FontAwesome';
import Login from './Login';
import LoginSuccess from './LoginSuccess';
import {connect} from 'react-redux';
import {saveUser} from '../../redux/actionCreator';

const navColor = '#1BBC9B';
const textColor = '#fff';

class Index extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: textColor, fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: textColor},
        headerStyle: {
            backgroundColor: navColor,
            height: 60,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            this.props.user ? <LoginSuccess {...this.props}/> : <Login {...this.props}/>
        );
    }
}

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps, {saveUser})(Index);