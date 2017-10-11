import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity, TextInput, ScrollView, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
// import IconF from 'react-native-vector-icons/FontAwesome';
import saveAsyncStorage from '../../storage/saveAsyncStorage';
import register from '../../api/register';
import login from '../../api/login';
import {connect} from 'react-redux';
import {saveUser} from '../../redux/actionCreator';

const navColor = '#1BBB9A';

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            usernameLog: '',
            passLog:'',
            fullnameReg:'',
            usernameReg:'',
            passReg:'',
            rePassReg:'',
            isLogin: true,
            errorLog:'',
            errorReg:''
        }
    }

    login(){
        if(this.state.usernameLog === ''){
            this.setState({
                errorLog: 'Bạn chưa nhập tên đăng nhập!'
            });
        }
        else if(this.state.passLog === ''){
            this.setState({
                errorLog: 'Bạn chưa nhập mật khẩu!'
            });
        }
        else{
            login(this.state.usernameLog, this.state.passLog).then(res=>{
                let r = JSON.parse(res);
                if(r.status === 'success'){
                    this.setState({
                        errorLog: '',
                        usernameLog: '',
                        passLog:''
                    });
                    let user = {username: r.username, fullname: r.fullname, id: r.id};
                    saveAsyncStorage('@user', user, 'JSON');
                    this.props.saveUser(user);
                }
                else{
                    this.setState({
                        errorLog: 'Tên đăng nhập hoặc mật khẩu không đúng!'
                    });
                }
            });
        }
    }

    register(){
        if(this.state.fullnameReg === ''){
            this.setState({
                errorReg: 'Bạn chưa nhập họ tên!'
            });
        }
        else if(this.state.usernameReg === ''){
            this.setState({
                errorReg: 'Bạn chưa nhập tên đăng nhập!'
            });
        }
        else if(this.state.passReg === ''){
            this.setState({
                errorReg: 'Bạn chưa nhập tên mật khẩu!'
            });
        }
        else if(this.state.passReg !== this.state.rePassReg){
            this.setState({
                errorReg: 'Xác nhận mật khẩu không khớp!'
            });
        }
        else{
            register(this.state.usernameReg, this.state.fullnameReg, this.state.passReg).then(res=>{
                let r = JSON.parse(res);
                if(r.status === 'success'){
                    this.setState({
                        errorReg: '',
                        usernameReg: '',
                        passReg:'',
                        rePassReg:'',
                        fullnameReg:'',
                        errorLog:'Đăng ký thành công, đăng nhập để tiếp tục!',
                        isLogin: true
                    });
                }
                else if(r.status === 'error_duplicate'){
                    this.setState({
                        errorReg: 'Tên đăng nhập đã tồn tại!'
                    });
                }
                else{
                    this.setState({
                        errorReg: 'Lỗi đường truyền, vui lòng thử lại!'
                    });
                }
            });
        }
    }

    render() {
        return (
            <ScrollView style={{backgroundColor:'#fff', flex:1}}>
                <StatusBar
                    backgroundColor={navColor}
                    barStyle="light-content"
                />
                <View style={{flex: 2, alignItems:'center', justifyContent:'center', paddingTop:24}}>
                    <Icon name="login" style={{color: "#111", fontSize: 60}}/>
                    <Text style={{fontSize: 18, color:'#333', padding: 24, textAlign:'center'}}>Đăng nhập giúp sao lưu và khôi phục dữ liệu của bạn</Text>
                </View>
                <View style={{flex: 1, flexDirection:'row'}}>
                    <TouchableOpacity
                        onPress={()=>this.setState({isLogin: true})}
                        style={this.state.isLogin ? styles.tabActive : styles.tabNotActive}>
                        <Text style={{fontSize: 18, color: this.state.isLogin ? navColor : '#333'}}>ĐĂNG NHẬP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this.setState({isLogin: false})}
                        style={this.state.isLogin ? styles.tabNotActive : styles.tabActive}>
                        <Text style={{fontSize: 18, color: this.state.isLogin ? '#333' : navColor}}>ĐĂNG KÝ</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 5, padding: 12}}>
                    {this.state.isLogin ?
                        <View>
                            <Text style={{color:'red', textAlign:'center', fontSize: 16}}>{this.state.errorLog}</Text>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Tên đăng nhập"
                                onChangeText={(usernameLog) => this.setState({usernameLog})} value={this.state.usernameLog}
                            />
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Mật khẩu"
                                secureTextEntry={true}
                                onChangeText={(passLog) => this.setState({passLog})} value={this.state.passLog}
                            />

                            <TouchableOpacity onPress={this.login.bind(this)}>
                                <Text style={styles.buttonText}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={{paddingBottom: 24}}>
                            <Text style={{color:'red', textAlign:'center', fontSize: 16}}>{this.state.errorReg}</Text>
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Họ tên"
                                onChangeText={(fullnameReg) => this.setState({fullnameReg})} value={this.state.fullnameReg}
                            />
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Tên đăng nhập"
                                onChangeText={(usernameReg) => this.setState({usernameReg})} value={this.state.usernameReg}
                            />
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Mật khẩu"
                                secureTextEntry={true}
                                onChangeText={(passReg) => this.setState({passReg})} value={this.state.passReg}
                            />
                            <TextInput
                                underlineColorAndroid='transparent'
                                style={styles.inputText}
                                placeholder="Nhập lại mật khẩu"
                                secureTextEntry={true}
                                onChangeText={(rePassReg) => this.setState({rePassReg})} value={this.state.rePassReg}
                            />
                            <TouchableOpacity onPress={this.register.bind(this)}>
                                <Text style={styles.buttonText}>Đăng ký</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    inputText: {
        height: 50, borderWidth: 1, borderColor: navColor, marginTop: 24, padding: 12, fontSize: 18
    },
    buttonText: {
        padding: 12,
        textAlign: 'center',
        color: '#fff',
        backgroundColor: navColor,
        fontSize: 18,
        marginTop: 16
    },
    tabActive:{
        flex:1, margin:12, alignItems:'center', borderBottomWidth: 1, borderBottomColor: navColor, paddingBottom: 12
    },
    tabNotActive:{
        flex:1, margin:12, alignItems:'center', borderBottomWidth: 1, borderBottomColor:'#ccc', paddingBottom: 12
    }
});

// function mapStateToProps(state) {
//     return {
//         user: state.user
//     }
// }

export default connect(null, {saveUser})(Login);
