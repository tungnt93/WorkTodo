import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity, TextInput, ScrollView, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
// import IconF from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import * as actionCreator from '../../redux/actionCreator';
import removeAsyncStorage from '../../storage/removeAsyncStorage';
import moment from 'moment';
import convertTime from '../../object/convertTime';
import Admob from '../../object/Admob';
const navColor = '#1BBC9B';

class LoginSuccess extends Component {
    constructor(props){
        super(props);
        this.state = {
            usernameLog: '',
            passLog:'',
            usernameReg:'',
            passReg:'',
            rePassReg:'',
            isLogin: true,
            errorLog:'',
            errorReg:''
        }
    }

    logout(){
        removeAsyncStorage('@user');
        removeAsyncStorage('@lastSync');
        removeAsyncStorage('@lastRestore');
        this.props.saveUser(null);
        this.props.setLastSync(0);
        this.props.setLastRestore(0);
    }

    render() {
        return (
            <View style={{backgroundColor:'#efefef', flex:1}}>
                <StatusBar
                    backgroundColor= {navColor}
                    barStyle="light-content"
                />
                <View style={{alignItems:'center', justifyContent:'center', paddingTop:24}}>
                    <Icon name="user" style={{color: "#333", fontSize: 60}}/>
                    <Text style={{fontSize: 24, color:'#000', padding: 16, textAlign:'center'}}>{this.props.user.fullname}</Text>
                </View>
                <View style={styles.block}>
                    <TouchableOpacity
                        onPress={()=>{this.props.navigation.navigate('Backup')}}
                        style={styles.item}>
                        <Icon name="cloud-upload" style={[styles.icon, {color:'#2196F3', marginTop: 12}]}/>
                        <View style={styles.rightItem}>
                            <View style={styles.viewTextItem}>
                                <Text style={styles.textItem}>Sao lưu dữ liệu</Text>
                                <Text style={{color:'#666', fontSize: 14}}>
                                    {this.props.lastSync > 0 ?
                                        'Sao lưu lần cuối lúc ' + convertTime(this.props.lastSync, 1) :
                                        'Chưa sao lưu lần nào'}
                                </Text>
                            </View>
                            <View style={styles.arrowRight}>
                                <Icon name="arrow-right"/>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{this.props.navigation.navigate('Restore')}}
                        style={styles.item}>
                        <Icon name="cloud-download" style={[styles.icon, {color:'green', marginTop: 12}]}/>
                        <View style={styles.rightItem}>
                            <View style={styles.viewTextItem}>
                                <Text style={styles.textItem}>Khôi phục dữ liệu</Text>
                                <Text style={{color:'#666', fontSize: 14}}>
                                    {this.props.lastRestore > 0 ?
                                        'Khôi phục lần cuối lúc ' + convertTime(this.props.lastRestore, 1) :
                                        'Chưa khôi phục lần nào'}
                                </Text>
                            </View>
                            <View style={styles.arrowRight}>
                                <Icon name="arrow-right"/>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item}>
                        <Icon name="lock" style={styles.icon}/>
                        <View style={[styles.rightItem, {borderBottomWidth:0}]}>
                            <Text style={styles.textItem}>Đổi mật khẩu</Text>
                            <View style={styles.arrowRight}>
                                <Icon name="arrow-right"/>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={this.logout.bind(this)}
                    style={[styles.block, {padding: 16, backgroundColor:'#fff', marginTop:40}]}>
                    <Text style={{color:'red', textAlign:'center', fontSize: 18}}>Đăng xuất</Text>
                </TouchableOpacity>
                <View style={{position:'absolute', bottom: 0}}>
                    <Admob/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonText: {
        padding: 12,
        textAlign: 'center',
        borderRadius: 15,
        color: '#fff',
        backgroundColor:'#2196F3',
        fontSize: 18,
        marginTop: 16
    },
    icon:{
        color: "#333", fontSize: 32, flex: 1, justifyContent:'center'
    },
    item:{
        flexDirection:'row', backgroundColor:'#fff', paddingLeft: 12, paddingRight: 12, paddingTop: 12
    },
    rightItem:{
        flex: 6, flexDirection:'row', justifyContent:'center', borderBottomWidth: 1, borderBottomColor:'#ccc', paddingBottom: 20, paddingTop:6
    },
    viewTextItem:{
        flex: 9, justifyContent:'center'
    },
    textItem:{
         fontSize: 20, color:'#000'
    },
    arrowRight:{
        flex: 1, justifyContent:'center', alignItems:'flex-end'
    },
    block:{
        borderBottomColor:'#ccc', borderTopColor:'#ccc', borderBottomWidth:1, borderTopWidth: 1, marginTop:24
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        lastRestore: state.lastRestore,
        lastSync: state.lastSync
    }
}

export default connect(mapStateToProps, actionCreator)(LoginSuccess);