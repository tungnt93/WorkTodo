import React, { Component } from 'react';
import {Text, View, TouchableOpacity, TextInput, Dimensions, Keyboard, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';

const bgColor = '#f1f1f1';
const navColor = '#1BBC9B';
const textColor = '#fff';
const iconColor = '#fff';

class FirstScreen extends Component {
    static navigationOptions =({ navigation }) => ({

    });

    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Text>First screen</Text>
            </View>
        );
    }
}

export default connect(null, actionCreators)(FirstScreen);
