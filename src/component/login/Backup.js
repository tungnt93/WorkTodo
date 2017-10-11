import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
// import IconF from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Progress from 'react-native-progress';
// import {saveUser} from '../../redux/actionCreator';
import backup from '../../api/backup';
import restore from '../../api/restore';
import login from '../../api/login';
import SqlService from '../../providers/SqlService';
import getItemAsyncStorage from '../../storage/getItemAsyncStorage';
import saveAsyncStorage from '../../storage/saveAsyncStorage';
import * as actionCreator from '../../redux/actionCreator';
import Admob from '../../object/Admob';
const navColor = '#1BBC9B';
const textColor = '#fff';

class Backup extends Component {
    static navigationOptions = ({navigation}) => ({
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

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            error: '',
            errorBackup: '',
            showLoadBackup: false
        }

    }

    componentDidMount(){
        // this.props.navigation.setParams({
        //     backToHome: this.props.navigation.goBack()
        // });
        if(this.props.lastSync === 0){
            this.setState({
                errorBackup: 'Chưa sao lưu lần nào'
            })
        }
        else{
            this.setState({
                errorBackup: 'Sao lưu lần cuối lúc ' + moment.unix(this.props.lastSync).format("HH:mm DD/MM/YYYY")
            })
        }
    }

    // backToHome(){
    //     this.props.navigation.goBack();
    // }

    backupData() {
        if (this.state.password === '') {
            this.setState({
                error: 'Bạn chưa nhập mật khẩu'
            });
        }
        else {
            login(this.props.user.username, this.state.password).then(res => {
                let r = JSON.parse(res);
                if (r.status === 'success') {
                    this.setState({
                        error: '',
                        password: '',
                        showLoadBackup: true,
                        errorBackup: 'Đang sao lưu'
                    });
                    getItemAsyncStorage('@lastSync').then(time => {
                        let lastSync = parseInt(time);
                        if(this.backupWork(lastSync) && this.backupNote(lastSync)){
                            this.setState({
                                errorBackup: 'Sao lưu lần cuối lúc ' + moment().format("HH:mm DD/MM/YYYY"),
                                showLoadBackup: false
                            });
                        }
                        else{
                            this.setState({
                                errorBackup: 'Có lỗi xảy ra trong quá trình đồng bộ, vui lòng thử lại.',
                                showLoadBackup: false
                            });
                        }
                    });
                }
                else {
                    this.setState({
                        error: 'Mật khẩu không đúng, vui lòng nhập lại!'
                    });
                }
            });
        }
    }

    backupNote(lastSync){
        let count = 0;
        return SqlService.select('note', '*', 'lastEdit > ' + lastSync, null, 'lastEdit ASC', null).then(notes => {
            let len = notes.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    let data = {
                        noteId: notes[i].id,
                        userId: this.props.user.id,
                        title: notes[i].title,
                        content: notes[i].content,
                        lastEdit: notes[i].lastEdit,
                        isDelete: notes[i].isDelete,
                        serverId: notes[i].serverId
                    };
                    backup(data, 'http://kyucxua.net/api/worktodo/backupNote').then(result => {
                        let statusBackup = JSON.parse(result);
                        if (statusBackup.status === 'success') {
                            console.log('back up success');
                            let lastSync = moment().unix();
                            saveAsyncStorage('@lastSync', lastSync.toString(), 'TEXT');
                            this.props.setLastSync(lastSync);
                            if(notes[i].serverId === 0){
                                SqlService.update('note', ['serverId'],[statusBackup.serverId],'id = ' + notes[i].id, null);
                            }
                            else if(notes[i].isDelete){
                                SqlService.delete('note', 'id = ' + notes[i].id, null);
                            }
                            count++;
                            if (count === len) {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    });
                }
            }
            else{
                return true;
            }
        });
    }

    backupTodo(lastSync){
        let count = 0;
        return SqlService.select('todo', '*', 'lastEdit > ' + lastSync, null, 'lastEdit ASC', null).then(todos => {
            let len = todos.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    let data = {
                        todoId: todos[i].id,
                        userId: this.props.user.id,
                        name: todos[i].name,
                        status: todos[i].status,
                        work_id: todos[i].work_id,
                        lastEdit: todos[i].lastEdit,
                        isDelete: todos[i].isDelete,
                        serverId: todos[i].serverId,
                        workServerId: todos[i].workServerId
                    };
                    backup(data, 'http://kyucxua.net/api/worktodo/backupTodo').then(result => {
                        let statusBackup = JSON.parse(result);
                        if (statusBackup.status === 'success') {
                            console.log('back up success');
                            let lastSync = moment().unix();
                            saveAsyncStorage('@lastSync', lastSync.toString(), 'TEXT');
                            this.props.setLastSync(lastSync);
                            if(todos[i].serverId === 0){
                                SqlService.update('todo', ['serverId'],[statusBackup.serverId],'id = ' + todos[i].id, null);
                            }
                            else if(todos[i].isDelete){
                                SqlService.delete('todo', 'id = ' + todos[i].id, null);
                            }
                            count++;
                            if (count === len) {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    });
                }
            }
            else{
                return true;
            }
        });
    }

    backupWork(lastSync){
        let count = 0;
        return SqlService.select('work', '*', 'lastEdit > ' + lastSync, null, 'lastEdit ASC', null).then(works => {
            let len = works.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    let data = {
                        workId: works[i].id,
                        userId: this.props.user.id,
                        name: works[i].name,
                        type: works[i].type,
                        status: works[i].status,
                        repeatType: works[i].repeatType,
                        startDate: works[i].startDate,
                        endDate: works[i].endDate,
                        startUnix: works[i].startUnix,
                        endUnix: works[i].endUnix,
                        priority: works[i].priority,
                        description: works[i].description,
                        totalTodo: works[i].totalTodo,
                        process: works[i].process,
                        lastEdit: works[i].lastEdit,
                        isDelete: works[i].isDelete,
                        serverId: works[i].serverId
                    };
                    backup(data, 'http://kyucxua.net/api/worktodo/backupWork').then(result => {
                        let statusBackup = JSON.parse(result);
                        if (statusBackup.status === 'success') {
                            let lastSyncNew = moment().unix();
                            saveAsyncStorage('@lastSync', lastSyncNew.toString(), 'TEXT');
                            this.props.setLastSync(lastSyncNew);
                            if(works[i].serverId === 0){
                                SqlService.update('work', ['serverId'], [statusBackup.serverId], 'id = ' + works[i].id, null);
                                SqlService.update('todo', ['workServerId'], [statusBackup.serverId], 'work_id = ' + works[i].id, null)
                            }
                            else if(works[i].isDelete){
                                SqlService.delete('work', 'id = ' + works[i].id, null);
                            }
                            count++;
                            if (count === len) {
                                return this.backupTodo(lastSync);
                            }
                        }
                        else {
                            return false;
                        }
                    });
                }
            }
            else{
                return true;
            }
        });
    }

    render() {
        return (
            <View style={{backgroundColor: '#F0EFF5', flex: 1}}>
                <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: 24}}>
                    <Icon name="user" style={{color: "#333", fontSize: 60}}/>
                    <Text style={{
                        fontSize: 24,
                        color: '#000',
                        padding: 16,
                        textAlign: 'center'
                    }}>{this.props.user.fullname}</Text>
                </View>
                <View style={styles.block}>
                    <Text style={{color: '#333', fontSize: 16}}>Nhập mật khẩu cho tài khoản "{this.props.user.username}"
                        để tiếp tục</Text>
                    <Text style={{
                        color: 'red',
                        textAlign: 'center',
                        fontSize: 16,
                        marginTop: 24
                    }}>{this.state.error}</Text>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={styles.inputText}
                        placeholder="Mật khẩu"
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({password})} value={this.state.password}
                    />
                    <TouchableOpacity onPress={this.backupData.bind(this)} disabled= {this.state.showLoadBackup}>
                        <Text style={styles.buttonText}>SAO LƯU</Text>
                    </TouchableOpacity>
                    <Text style={{
                        color: navColor,
                        textAlign: 'center',
                        fontSize: 16,
                        marginTop: 24
                    }}>{this.state.errorBackup}</Text>
                    {this.state.showLoadBackup ?
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
    block: {
        borderBottomColor: '#ccc',
        borderTopColor: '#ccc',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        marginTop: 24,
        padding: 24,
        backgroundColor: '#fff'
    },
    inputText: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 8,
        borderColor: navColor,
        padding: 12,
        fontSize: 18
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
        lastSync: state.lastSync
    }
}

export default connect(mapStateToProps, actionCreator)(Backup);