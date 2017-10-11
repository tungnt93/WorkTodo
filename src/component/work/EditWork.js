import React, {Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Picker,
    Alert,
    ToastAndroid,
    FlatList, StatusBar
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import SqlService from '../../providers/SqlService';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import ItemTodo from './ItemTodo';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import PushNotification from 'react-native-push-notification';

const iconColor = '#0080FD';

class EditWork extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: "#fff"},
        headerLeft: <TouchableOpacity onPress={() => {navigation.state.params.backToHome()}}>
            <Text style={{marginLeft: 10, fontSize: 18, color: '#fff', justifyContent:'center'}}>
                Đóng
            </Text>
        </TouchableOpacity>,
        headerStyle: {
            backgroundColor: iconColor,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props) {
        super(props);
        this.itemWork = this.props.navigation.state.params.itemWork;
        this.state = {
            startDate: moment.unix(this.itemWork.startUnix).format("DD-MM-YYYY HH:mm"),
            endDate: moment.unix(this.itemWork.endUnix).format("DD-MM-YYYY HH:mm"),
            name: this.itemWork.name,
            description: this.itemWork.description,
            type: this.itemWork.type,
            repeat: this.itemWork.repeatType,
            priority: this.itemWork.priority,
            todo: [],
            textTodo: '',
            time: null
        };
        if(this.itemWork.totalTodo > 0){
            SqlService.select('todo', '*', 'work_id = ' + this.itemWork.id, null, 'id ASC', null).then(res=>{
                let preTodo = [];
                for(let i = 0; i < res.length; i++){
                    preTodo.push({id: res[i].id, name: res[i].name, status: res[i].status});
                }
                console.log(preTodo);
                this.setState({
                    todo: preTodo
                });
            });
        }

        PushNotification.configure({
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
            },
        });
    }

    componentDidMount() {
        this.props.navigation.setParams({
            backToHome: this.editWork.bind(this)
        });
    }

    editWork() {
        let start = this.state.startDate.split(' ');
        let end = this.state.endDate.split(' ');
        if (this.state.name === '') {
            Alert.alert('Bạn chưa nhập tên công việc!');
        }
        else if(start.length < 2){
            Alert.alert('Bạn chưa chọn thời gian bắt đầu!');
        }
        else if(end.length < 2){
            Alert.alert('Bạn chưa chọn thời gian kết thúc!');
        }
        else {
            let startUnix = moment(this.state.startDate, 'DD-MM-YYYY HH:mm').unix();
            let endUnix = moment(this.state.endDate, 'DD-MM-YYYY HH:mm').unix();
            let startDate = moment.unix(startUnix).format("YYYYMMDD");
            let endDate = moment.unix(endUnix).format("YYYYMMDD");
            if(startUnix >= endUnix){
                Alert.alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
            }
            else {
                let process = 0;
                let totalDone = 0;
                let todoLen = this.state.todo.length;
                let lastEdit = moment().unix();
                // if(this.itemWork.totalTodo > 0){
                //     if(this.itemWork.serverId > 0){
                //         SqlService.update('todo', ['isDelete', 'lastEdit'], [1, lastEdit], 'work_id = ' + this.itemWork.id, null);
                //     }
                //     else{
                //         SqlService.delete('todo', 'work_id = ' + this.itemWork.id, null);
                //     }
                // }
                if (todoLen > 0) {
                    this.state.todo.map((item, index) => {
                        console.log(item);
                        if (item.status) totalDone++;
                        // SqlService.insert('todo', ['name', 'status', 'work_id', 'isDelete', 'serverId', 'lastEdit'], [item.name, item.status, this.itemWork.id, 0, 0, lastEdit]);
                    });
                    process = 100 * totalDone / todoLen;
                }
                SqlService.update(
                    'work',
                    ['name', 'description', 'type', 'repeatType', 'status', 'totalTodo', 'priority','startUnix', 'endUnix', 'startDate', 'endDate', 'process', 'lastEdit'],
                    [this.state.name, this.state.description, this.state.type, this.state.repeat, this.itemWork.status, todoLen, this.state.priority, startUnix, endUnix, startDate, endDate, process, lastEdit],
                    'id = ' + this.itemWork.id, null
                ).then(res => {
                    let today = moment().format("YYYYMMDD");
                    let todayUnix = moment().unix();
                    if(today >= moment.unix(startUnix).format("YYYYMMDD") && today <= moment.unix(endUnix).format("YYYYMMDD")){
                        console.log('refresh list work today');
                        this.props.getListWorkToday();
                        if(moment().unix() >= startUnix && moment().unix() <= endUnix){
                            console.log('refresh list work doing');
                            this.props.getListWorkDoing();
                        }
                    }
                    else{
                        console.log('refresh list work');
                        this.props.getListWork();
                    }

                    // });
                    //Notification
                    let subText = moment.unix(startUnix).format("HH:mm") + ' Hôm nay - ';
                    if(moment.unix(endUnix).format("YYYYMMDD") === today){
                        subText += moment.unix(endUnix).format("HH:mm") + ' Hôm nay';
                    }
                    else if(moment.unix(endUnix).format("YYYY") === moment().format("YYYY")){
                        subText += moment.unix(endUnix).format("HH:mm DD/MM");
                    }
                    else{
                        subText += moment.unix(endUnix).format("HH:mm DD/MM/YYYY");
                    }
                    console.log(subText);
                    let repeat = this.state.repeat;
                    if(repeat != 4){
                        if(repeat === 1) repeat = '';
                        else if(repeat === 2) repeat = 'day';
                        else if(repeat === 3) repeat = 'week';
                        this.cancelNoti(this.itemWork.id);
                        if(todayUnix <= startUnix){
                            this.pushNoti(this.itemWork.id, startUnix*1000, this.state.name, subText, repeat);
                            this.pushNotiEnd(this.itemWork.id, endUnix*1000, this.state.name, repeat);
                        }
                        else if(todayUnix <= endUnix){
                            this.pushNotiEnd(this.itemWork.id, endUnix*1000, this.state.name, repeat);
                        }
                        // this.resetForm();
                        console.log('push noti success');
                    }
                    ToastAndroid.showWithGravity('Đã lưu!', ToastAndroid.SHORT, ToastAndroid.CENTER);
                    console.log('Đã lưu');
                    this.props.navigation.navigate('Work');
                });
            }
        }
    }

    // updateWork(todoLen, todoId, process, startUnix, endUnix, start, end){
    //     console.log('update work');
    //     let des = this.state.description;
    //     if(des === '') des = null;
    //     let todoIdUpdate = todoId.toString();
    //     if(todoId === '') todoIdUpdate = null;
    //     SqlService.update(
    //         'work',
    //         ['name', 'description', 'type', 'repeatType', 'status', 'totalTodo', 'todoId', 'priority','startUnix', 'endUnix', 'startDate', 'endDate', 'process'],
    //         [this.state.name, des, this.state.type, this.state.repeat, 4, todoLen , todoIdUpdate, this.state.priority, startUnix, endUnix, start.toString(), end.toString(), process],
    //         'id = ' + this.itemWork.id, null
    //     ).then(res => {
    //         // this.resetForm();
    //         let today = moment().format("YYYYMMDD");
    //         if(today >= moment.unix(startUnix).format("YYYYMMDD") && today <= moment.unix(endUnix).format("YYYYMMDD")){
    //             // this.props.dispatch({type: 'LIST_WORK_TODAY'});
    //             this.props.getListWorkToday();
    //             if(moment().unix() >= startUnix && moment().unix() <= endUnix){
    //                 // this.props.dispatch({type: 'LIST_WORK_DOING'});
    //                 this.props.getListWorkDoing();
    //             }
    //         }
    //         else{
    //             // this.props.dispatch({type: 'LIST_WORK'});
    //             this.props.getListWork();
    //         }
    //         ToastAndroid.showWithGravity('Đã lưu!', ToastAndroid.SHORT, ToastAndroid.CENTER);
    //         SqlService.select('work', 'id, name, repeatType', '', null, 'id DESC', [0, 1]).then(res1=>{
    //             let idWork = res1[0].id;
    //             let subText = moment.unix(startUnix).format("HH:mm") + ' Hôm nay - ';
    //             // let end = moment.unix(endUnix).for
    //             if(moment.unix(endUnix).format("YYYYMMDD") === today){
    //                 subText += moment.unix(endUnix).format("HH:mm") + ' Hôm nay';
    //             }
    //             else if(moment.unix(endUnix).format("YYYY") === moment().format("YYYY")){
    //                 subText += moment.unix(endUnix).format("HH:mm DD/MM");
    //             }
    //             else{
    //                 subText += moment.unix(endUnix).format("HH:mm DD/MM/YYYY");
    //             }
    //             console.log(subText);
    //             let repeat = res1[0].repeatType;
    //             if(repeat === 1) repeat = '';
    //             else if(repeat === 2) repeat = 'day';
    //             else if(repeat === 3) repeat = 'week';
    //             this.cancelNoti(idWork);
    //             this.pushNoti(idWork, startUnix*1000, res1[0].name, subText, repeat);
    //             this.pushNotiEnd(idWork, endUnix*1000, res1[0].name, repeat);
    //             this.props.navigation.navigate('Work');
    //         });
    //
    //     });
    // }

    // resetForm() {
    //     this.setState({
    //         startDate: moment().format("DD-MM-YYYY"),
    //         endDate: moment().format("DD-MM-YYYY"),
    //         name: '',
    //         description: '',
    //         type: 1,
    //         repeat: 1,
    //         priority: 1,
    //         idTodo: 1,
    //         todo: [],
    //         textTodo: ''
    //     });
    // }

    addTodo() {
        if (this.state.textTodo === '') {
            ToastAndroid.showWithGravity('Bạn chưa điền nội dung đầu mục!', ToastAndroid.SHORT, ToastAndroid.CENTER);
        }
        else {
            let lastEdit = moment().unix();
            SqlService.insert('todo', ['name', 'status', 'work_id', 'workServerId', 'isDelete', 'serverId', 'lastEdit'], [this.state.textTodo, false, this.itemWork.id, 0, 0, 0, lastEdit]).then(res=>{
                SqlService.selectFirst('todo', null).then(res1=>{
                    this.setState({
                        todo: this.state.todo.concat({id: res1[0].id, name: this.state.textTodo, status: false}),
                        textTodo: '',
                    });
                });
            });
        }
    }

    removeTodoAdd(id) {
        let index = this.state.todo.findIndex((item)=>{return item.id === id});
        let newTodo = this.state.todo;
        if(this.state.todo.length === 1 && index === 0){
            this.setState({todo: []});
        }
        else if(index > -1){
            newTodo.splice(index, 1);
            console.log(newTodo);
            this.setState({todo: newTodo});
        }
        SqlService.select('todo', 'serverId', 'id = ' + id, null, null, null).then(res=>{
            if(res[0].serverId > 0){
                let lastEdit = moment().unix();
                SqlService.update('todo', ['isDelete', 'lastEdit'], [1, lastEdit], 'id = ' + id, null);
            }
            else{
                SqlService.delete('todo', 'id = ' + id, null);
            }
        });
    }

    updateTodoItem(id, isDone){
        let index = this.state.todo.findIndex((item)=>{return item.id === id});
        if(index > -1){
            let lastEdit = moment().unix();
            SqlService.update('todo', ['status', 'lastEdit'], [isDone, lastEdit], 'id = ' + id, null);
            let newTodo = this.state.todo;
            newTodo[index].status = isDone;
            this.setState({todo: newTodo});
        }
    }

    pushNoti(id, time, message, subText, repeatType){
        let timePushNoti = new Date(time);
        console.log(timePushNoti);
        console.log(id);
        console.log(message);
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
        console.log(timePushNoti);
        PushNotification.localNotificationSchedule({
            id: "-" + id.toString(),
            message: "Bạn đã hoàn thành công việc '" + message + "' chưa?",
            repeatType: repeatType,
            date: timePushNoti
        });
    }

    cancelNoti(id){
        PushNotification.cancelLocalNotifications({id: id.toString()});
        PushNotification.cancelLocalNotifications({id: "-" + id.toString()});
    }

    goBack(){
        this.props.navigation.goBack();
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <StatusBar
                    backgroundColor = {iconColor}
                    barStyle="light-content"
                />
                <View style={styles.rowInput}>
                    <Text style={styles.text}>Tên công việc</Text>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={styles.inputText}
                        onChangeText={(name) => this.setState({name})} value={this.state.name}
                    />
                </View>
                <View style={styles.rowInput}>
                    <Text style={styles.text}>Mô tả</Text>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={{borderColor:'#ccc', borderWidth: 1, fontSize: 18}}
                        multiline={true}
                        numberOfLines = {2}
                        textAlignVertical={'top'}
                        onChangeText={(description) => this.setState({description})} value={this.state.description}
                    />
                </View>
                <View style={styles.rowInput}>
                    <Text style={styles.text}>Đầu mục các công việc cụ thể</Text>
                    <FlatList
                        ref="list"
                        data={this.state.todo}
                        keyExtractor={(item, index) => item.id}
                        renderItem={({item}) =>
                            <ItemTodo
                                itemTodo = {item}
                                removeTodo = {this.removeTodoAdd.bind(this)}
                                updateTodo = {this.updateTodoItem.bind(this)}
                                isUpdateDb = {false}
                            />
                        }
                        style={styles.flatList}
                    />
                    <View style={styles.row}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            style={[styles.inputText, {flex: 8, justifyContent: 'center', marginLeft: -5}]}
                            onChangeText={(textTodo) => this.setState({textTodo})} value={this.state.textTodo}
                        />
                        <TouchableOpacity onPress={this.addTodo.bind(this)} style={{flex: 1, marginTop: 6}}>
                            <Icon name='plus-circle' style={{color: "#2196F3", fontSize: 30, textAlign: 'right'}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{flex: 1}}><Text style={styles.text}>Bắt đầu</Text></View>
                    <View style={{flex: 3, alignItems: 'flex-end'}}>
                        <DatePicker
                            style={{width: 250}}
                            date={this.state.startDate}
                            mode="datetime"
                            placeholder="select date"
                            format="DD-MM-YYYY HH:mm"
                            is24Hour={true}
                            // minDate={this.state.startDate}
                            // maxDate="2016-06-01"
                            confirmBtnText="Đồng ý"
                            cancelBtnText="Hủy"
                            onDateChange={(date) => {
                                this.setState({startDate: date, endDate: date});
                                console.log(this.state.startDate);
                            }}
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{flex: 1}}><Text style={styles.text}>Kết thúc</Text></View>
                    <View style={{flex: 3, alignItems: 'flex-end'}}>
                        <DatePicker
                            style={{width: 250}}
                            date={this.state.endDate}
                            mode="datetime"
                            placeholder="select date"
                            format="DD-MM-YYYY HH:mm"
                            minDate={this.state.startDate}
                            is24Hour={true}
                            confirmBtnText="Đồng ý"
                            cancelBtnText="Hủy"
                            onDateChange={(date) => {
                                this.setState({endDate: date})
                            }}
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{flex: 2}}><Text style={styles.text}>Nhắc nhở</Text></View>
                    <View style={{flex: 1}}>
                        <Picker
                            selectedValue={this.state.repeat}
                            onValueChange={(itemValue, itemIndex) => this.setState({repeat: itemValue})}
                            mode='dropdown'
                        >
                            <Picker.Item label="Chỉ một lần" value={1}/>
                            <Picker.Item label="Hàng ngày" value={2}/>
                            <Picker.Item label="Hàng tuần" value={3}/>
                            <Picker.Item label="Không nhắc" value={4}/>
                        </Picker>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{flex: 2}}><Text style={styles.text}>Ưu tiên</Text></View>
                    <View style={{flex: 1}}>
                        <Picker
                            selectedValue={this.state.priority}
                            onValueChange={(itemValue, itemIndex) => this.setState({priority: itemValue})}
                            mode='dropdown'
                        >
                            <Picker.Item label="Cao" value={1}/>
                            <Picker.Item label="Trung bình" value={2}/>
                            <Picker.Item label="Thấp" value={3}/>
                        </Picker>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{flex: 1}}><Text style={styles.text}>Loại công việc</Text></View>
                    <View style={{flex: 1}}>
                        <Picker
                            selectedValue={this.state.type}
                            onValueChange={(itemValue, itemIndex) => this.setState({type: itemValue})}
                            mode='dropdown'
                        >
                            <Picker.Item label="Công việc cá nhân" value={1}/>
                            <Picker.Item label="Công việc gia đình" value={2}/>
                            <Picker.Item label="Công việc cơ quan" value={3}/>
                        </Picker>
                    </View>
                </View>
                <View style={[styles.row, {paddingBottom: 24}]}>
                    <TouchableOpacity style={{flex: 5}} onPress={this.editWork.bind(this)}>
                        <Text style={styles.buttonText}>Lưu</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}/>
                    <TouchableOpacity style={{flex: 5}} onPress={this.goBack.bind(this)}>
                        <Text style={styles.buttonCancel}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#fff', padding: 6
    },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 6
    },
    text: {
        fontSize: 15, color: '#333'
    },
    rowInput: {
        padding: 6
    },
    inputText: {
        height: 40, borderWidth: 1, borderColor: '#ccc', marginTop: 6, fontSize: 18
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
});

export default connect(null, actionCreators)(EditWork);