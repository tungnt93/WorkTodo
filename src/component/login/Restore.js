import React, { Component } from 'react';
import {StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import {connect} from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import * as Progress from 'react-native-progress';
import restore from '../../api/restore';
import login from '../../api/login';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import saveAsyncStorage from '../../storage/saveAsyncStorage';
import convertTime from '../../object/convertTime';
import PushNotification from 'react-native-push-notification';
import Admob from '../../object/Admob';
const navColor = '#1BBC9B';
const textColor = '#fff';

class Restore extends Component {
    static navigationOptions =({ navigation }) => ({
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: textColor},
        headerLeft: <TouchableOpacity onPress={() => {navigation.goBack()}}>
            <Icon name="arrow-left" style={{color: textColor, fontSize: 20, paddingLeft: 10}}/>
        </TouchableOpacity>,
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
            password:'',
            error:'',
            errorRestore: '',
            showLoad: false,
            countNote: 0,
            countWork: 0,
            countTodo: 0
        };

        PushNotification.configure({
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
            },
        });
    }

    componentDidMount(){
        console.log(this.props.lastRestore);
        if(this.props.lastRestore === 0){
            this.setState({
                errorRestore: 'Chưa khôi phục lần nào'
            })
        }
        else if(this.props.lastRestore === -1){
            this.setState({
                errorRestore: 'Đã xảy ra lỗi trong quá trình khôi phục dữ liệu, hãy khôi phục lại.'
            })
        }
        else{
            let time = convertTime(this.props.lastRestore, 1);
            this.setState({
                errorRestore: 'Khôi phục lần cuối lúc ' + time
            })
        }
    }

    confirmRestore(){
        if(this.state.password === ''){
            this.setState({
                error: 'Bạn chưa nhập mật khẩu'
            });
        }
        else{
            login(this.props.user.username, this.state.password).then(res=>{
                let r = JSON.parse(res);
                if(r.status === 'success'){
                    Alert.alert(
                        'Xác nhận khôi phục dữ liệu',
                        'Dữ liệu hiện tại có thể sẽ bị mất nếu bạn chưa thực hiện sao lưu trước khi thực hiện thao tác này.',
                        [
                            {text: 'Hủy', onPress: () => {}},
                            {text: 'Sao lưu bây giờ', onPress: () => {this.props.navigation.navigate('Backup')}},
                            {text: 'Tiếp tục', onPress: () => {
                                this.restoreData();
                            }}
                        ],
                        { cancelable: false }
                    );
                }
                else{
                    this.setState({
                        error: 'Mật khẩu không đúng, vui lòng nhập lại!'
                    });
                }
            });
        }
    }

    restoreData(){
        saveAsyncStorage('@lastRestore', '-1', 'TEXT');
        this.setState({
            error: '',
            password: '',
            showLoad: true,
            errorRestore: 'Đang khôi phục dữ liệu'
        });
        if(this.restoreNote() && this.restoreWork() && this.restoreTodo()){
            this.setState({
                errorRestore: 'Khôi phục lần cuối lúc ' + convertTime(moment().unix(), 1),
                showLoad: false
            });
            let lastRestore = moment().unix().toString();
            saveAsyncStorage('@lastRestore', lastRestore, 'TEXT');
            this.props.setLastRestore(lastRestore);
        }
        else{
            this.setState({
                errorRestore: 'Có lỗi xảy ra trong quá trình đồng bộ dữ liệu, vui lòng thử lại.',
                showLoad: false
            });
        }
    }

    restoreNote(){
        return restore('http://kyucxua.net/api/worktodo/listNote', this.props.user.id).then(res=>{
            let len = res.length;
            let timeOut = setTimeout(()=>{
                return (this.state.countNote !== len);
            }, 30000);
            SqlService.dropTable('note').then(res1=>{
                SqlService.createTableNote().then(res2=>{
                    for(let i = 0; i < len; i++){
                        SqlService.insert(
                            'note',
                            ['id', 'title', 'content', 'lastEdit', 'isDelete', 'serverId'],
                            [res[i].id, res[i].title.toString(), res[i].content.toString(), res[i].lastEdit, 0, res[i].id]
                        ).then(res3=>{
                            if(this.state.countNote === len - 1){
                                clearTimeout(timeOut);
                                return true;
                            }
                            else{
                                this.setState({
                                    countNote: this.state.countNote++
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    restoreWork(){
        return restore('http://kyucxua.net/api/worktodo/listWork', this.props.user.id).then(res=>{
            let len = res.length;
            let timeOut = setTimeout(()=>{
                return (this.state.countWork !== len);
            }, 30000);
            SqlService.select('work', '*', '', null, null, null).then(res1=>{
                let allWorkLen = res1.length;
                for(let i = 0; i < allWorkLen; i++){
                    this.cancelNoti(res1[i].id);
                }
                SqlService.dropTable('work').then(res1=>{
                    SqlService.createTableWork().then(res2=>{
                        for(let i = 0; i < len; i++){
                            SqlService.insert(
                                'work',
                                ['id', 'name', 'type', 'status','repeatType', 'startDate', 'endDate', 'startUnix', 'endUnix',
                                    'priority', 'description', 'totalTodo', 'process', 'lastEdit', 'isDelete', 'serverId'],
                                [res[i].id, res[i].name.toString(), res[i].type, res[i].status, res[i].repeatType, res[i].startDate.toString(), res[i].endDate.toString(), res[i].startUnix, res[i].endUnix,
                                    res[i].priority, res[i].description.toString(), res[i].totalTodo, res[i].process, res[i].lastEdit, 0, res[i].id]
                            ).then(res3=>{
                                //push noti
                                let today = moment().format("YYYYMMDD");
                                let todayUnix = moment().unix();
                                let subText = moment.unix(res[i].startUnix).format("HH:mm") + ' Hôm nay - ';
                                if(moment.unix(res[i].endUnix).format("YYYYMMDD") === today){
                                    subText += moment.unix(res[i].endUnix).format("HH:mm") + ' Hôm nay';
                                }
                                else if(moment.unix(res[i].endUnix).format("YYYY") === moment().format("YYYY")){
                                    subText += moment.unix(res[i].endUnix).format("HH:mm DD/MM");
                                }
                                else{
                                    subText += moment.unix(res[i].endUnix).format("HH:mm DD/MM/YYYY");
                                }
                                let repeat = res[0].repeatType;
                                if(repeat === 1) repeat = '';
                                else if(repeat === 2) repeat = 'day';
                                else if(repeat === 3) repeat = 'week';
                                if(todayUnix <= res[i].startUnix){
                                    this.pushNoti(res[i].id, res[i].startUnix*1000, res[i].name.toString(), subText, repeat);
                                    this.pushNotiEnd(res[i].id, res[i].endUnix*1000, res[i].name.toString(), repeat);
                                }
                                else if(todayUnix <= res[i].endUnix){
                                    this.pushNotiEnd(res[i].id, res[i].endUnix*1000, res[i].name.toString(), repeat);
                                }
                                //end push noti
                                if(this.state.countWork === len - 1){
                                    clearTimeout(timeOut);
                                    return true;
                                }
                                else{
                                    this.setState({
                                        countWork: this.state.countWork++
                                    });
                                }
                            });
                        }
                    });
                });
            });
        });
    }

    cancelNoti(id){
        PushNotification.cancelLocalNotifications({id: id.toString()});
        PushNotification.cancelLocalNotifications({id: "-" + id.toString()});
    }

    pushNoti(id, time, message, subText, repeatType){
        let timePushNoti = new Date(time);
        PushNotification.localNotificationSchedule({
            id: id.toString(),
            message: "Hãy bắt đầu công việc '" + message + "' ngay!",
            subText: subText,
            repeatType: repeatType,
            date: timePushNoti // in 60 secs
        });
    }

    pushNotiEnd(id, time, message, repeatType){
        let timePushNoti = new Date(time);
        PushNotification.localNotificationSchedule({
            id: "-" + id.toString(),
            message: "Bạn đã hoàn thành công việc '" + message + "' chưa?",
            repeatType: repeatType,
            date: timePushNoti
        });
    }

    restoreTodo(){
        return restore('http://kyucxua.net/api/worktodo/listTodo', this.props.user.id).then(res=>{
            let len = res.length;
            let timeOut = setTimeout(()=>{
                return (this.state.countTodo !== len);
            }, 30000);
            SqlService.dropTable('todo').then(res1=>{
                SqlService.createTableTodo().then(res2=>{
                    for(let i = 0; i < len; i++){
                        SqlService.insert(
                            'todo',
                            ['id', 'name', 'status', 'work_id', 'workServerId', 'lastEdit', 'isDelete', 'serverId'],
                            [res[i].id, res[i].name.toString(), res[i].status, res[i].workServerId, res[i].workServerId, res[i].lastEdit, 0, res[i].id]
                        ).then(res3=>{
                            if(this.state.countTodo === len - 1){
                                clearTimeout(timeOut);
                                return true;
                            }
                            else{
                                this.setState({
                                    countTodo: this.state.countTodo++
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    render() {
        return (
            <View style={{backgroundColor:'#F0EFF5', flex:1}}>
                <View style={{alignItems:'center', justifyContent:'center', paddingTop:24}}>
                    <Icon name="user" style={{color: "#333", fontSize: 60}}/>
                    <Text style={{fontSize: 24, color:'#000', padding: 16, textAlign:'center'}}>{this.props.user.fullname}</Text>
                </View>
                <View style={styles.block}>
                    <Text style={{color:'#333', fontSize: 16}}>Nhập mật khẩu cho tài khoản "{this.props.user.username}" để tiếp tục</Text>
                    <Text style={{color:'red', textAlign:'center', fontSize: 16, marginTop: 24}}>{this.state.error}</Text>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={styles.inputText}
                        placeholder="Mật khẩu"
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({password})} value={this.state.password}
                    />
                    <TouchableOpacity onPress={this.confirmRestore.bind(this)}>
                        <Text style={styles.buttonText}>KHÔI PHỤC</Text>
                    </TouchableOpacity>
                    <Text style={{
                        color: navColor,
                        textAlign: 'center',
                        fontSize: 16,
                        marginTop: 24
                    }}>{this.state.errorRestore}</Text>
                    {this.state.showLoad ?
                        <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: 12}}>
                            <Progress.CircleSnail color={['red', 'green', 'blue']} size={30}/>
                        </View>
                        :
                        null}
                </View>
                <View style={{position:'absolute', bottom: 0}}>
                    <Admob/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    block:{
        borderBottomColor:'#ccc', borderTopColor:'#ccc', borderBottomWidth:1, borderTopWidth: 1, marginTop:24, padding: 24, backgroundColor:'#fff'
    },
    inputText: {
        height: 50, borderWidth: 1, marginTop: 8, borderColor: navColor, padding: 12, fontSize: 18
    },
    buttonText: {
        padding: 12,
        textAlign: 'center',
        color: '#fff',
        backgroundColor: navColor,
        fontSize: 18,
        marginTop: 16
    },
});

function mapStateToProps(state) {
    return {
        user: state.user,
        lastRestore: state.lastRestore
    }
}

export default connect(mapStateToProps, actionCreators)(Restore);