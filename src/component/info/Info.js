import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity, FlatList, Linking, StatusBar, ScrollView, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import listApp from '../../api/listApp';
import getItemAsyncStorage from '../../storage/getItemAsyncStorage';
import IonIcon from 'react-native-vector-icons/Ionicons';
import Admob from '../../object/Admob';
import feedback from '../../api/feedback';

const navColor = '#0080FD';
const navBoldColor = '#0066cc';
const textColor = '#fff';

export default class Info extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: textColor, fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: textColor},
        headerStyle: {
            backgroundColor: navColor,
            height: 60,
            // borderBottomColor: '#fff',
            // borderBottomWidth: 1,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props){
        super(props);
        this.state = {
            listApp: [],
            showInbox: false,
            email:'',
            feedback:'',
            error:''
        };
        getItemAsyncStorage('@list_app').then(res=>{
            console.log(JSON.parse(res));
            this.setState({
                listApp: JSON.parse(res)
            });
        });
    }

    sendFeedback(){
        if(this.state.feedback === ''){
            this.setState({error:'Bạn chưa nhập nội dung'});
        }
        else{
            feedback(this.state.email, this.state.feedback);
            this.setState({
                error:'Cảm ơn bạn đã góp ý cho sản phẩm của chúng tôi.',
                email:'',
                feedback:''
            })
        }
    }

    render() {
        return (
            <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
                <StatusBar
                    backgroundColor = {navColor}
                    barStyle="light-content"
                />
                <View style={{margin: 12}}>
                    <Text style={{color:'#000', fontSize: 20}}>Về chúng tôi</Text>
                    <View style={{flexDirection:'row', backgroundColor: navColor, marginTop: 12}}>
                        <View style={{flex: 3}}>
                            <Text style={{color: '#fff', fontSize: 20, padding: 6}}>Sản phẩm được xây dựng bởi dopteam.</Text>
                            <Text style={{color: '#fff', fontSize: 16, padding: 6, paddingTop: 0}}>Mọi thông tin thắc mắc và góp ý xin gửi về email: dopteams@gmail.com</Text>
                        </View>
                        <TouchableOpacity style={{flex: 1, backgroundColor: navBoldColor, justifyContent:'center', alignItems:'center'}}
                                          onPress={() => this.setState({showInbox: true})}>
                            <Icon name="envelope" style={{color: '#fff', fontSize: 32}}/>
                            <Text style={{color: '#fff', fontSize: 16, marginTop: 6}}>Góp ý</Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.showInbox ?
                        <View>
                            <Text style={styles.titleInput}>Email (Có thể bỏ qua)</Text>
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder="Nhập email"
                                style={styles.inputText}
                                onChangeText={(email) => this.setState({email})} value={this.state.email}
                            />
                            <Text style={styles.titleInput}>Nội dung</Text>
                            <TextInput
                                placeholder="Nhập nội dung"
                                onChangeText={(feedback) => this.setState({feedback})}
                                style={{color: '#000', fontSize: 18, borderWidth:1, borderColor:'#ccc', marginTop:6}}
                                multiline={true}
                                numberOfLines = {4}
                                value={this.state.feedback}
                                textAlignVertical={'top'}
                                underlineColorAndroid='transparent'
                            />
                            <Text style={{color:'red', fontSize: 16, marginTop: 12}}>{this.state.error}</Text>
                            <View style={{flexDirection:'row', marginTop: 12}}>
                                <TouchableOpacity style={{flex: 7}} onPress={this.sendFeedback.bind(this)}>
                                    <Text style={styles.buttonText}>Gửi</Text>
                                </TouchableOpacity>
                                <View style={{flex: 1}}/>
                                <TouchableOpacity style={{flex: 7}}
                                                  onPress={()=>this.setState({showInbox: false, error: '',email:'',feedback:''})}>
                                    <Text style={styles.buttonCancel}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        : null}
                </View>
                <View style={{margin: 12}}>
                    <Text style={{color:'#000', fontSize: 20}}>Các ứng dụng khác của chúng tôi</Text>
                    <FlatList
                        data={this.state.listApp}
                        keyExtractor={(item, index) => item.id}
                        renderItem={({item}) =>
                            <View style={{flexDirection:'row', backgroundColor: navColor, marginTop: 12}}>
                                <View style={{flex: 3}}>
                                    <Text style={{color: '#fff', fontSize: 20, padding: 6}}>{item.name}</Text>
                                    <Text style={{color: '#fff', fontSize: 16, padding: 6, paddingTop: 0}}>{item.description}</Text>
                                </View>
                                <TouchableOpacity style={{flex: 1, backgroundColor: navBoldColor, justifyContent:'center', alignItems:'center'}}
                                                  onPress={() => Linking.openURL(item.link)}>
                                    <IonIcon name="md-appstore" style={{color: '#fff', fontSize: 32}}/>
                                    <Text style={{color: '#fff', fontSize: 16, marginTop: 6}}>Tải về</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 18,
        color: '#000',
    },
    inputText: {
        height: 40, borderWidth: 1, borderColor: '#ccc', marginTop: 6
    },
    titleInput:{
        fontSize: 16,
        color: '#333',
        marginTop: 12
    },
    buttonText: {
        padding: 6,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#2196F3',
        color: '#2196F3',
        fontSize: 18
    },
    buttonCancel: {
        padding: 6,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'red',
        color: 'red',
        fontSize: 18
    }
})

