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

class AddWork extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: "#fff"},
        headerLeft: <TouchableOpacity onPress={() => {navigation.goBack()}}>
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
        this.state = {
            startDate: '',
            endDate: '',
            name: '',
            description: '',
            type: 1,
            repeat: 1,
            priority: 1,
            idTodo: 1,
            todo: [],
            textTodo: '',
            time: null
        };
        // this.time = moment.unix(1503801766.459).format("DD/MM/YYYY");
        // this.time = moment('27-8-2017', 'DD-MM-YYYY').unix();
        PushNotification.configure({
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
            },
        });
    }

    addWork() {
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
                SqlService.insert(
                    'work',
                    ['name', 'description', 'type', 'repeatType', 'status', 'totalTodo', 'priority','startUnix', 'endUnix', 'startDate', 'endDate', 'process', 'lastEdit', 'isDelete', 'serverId'],
                    [this.state.name, this.state.description, this.state.type, this.state.repeat, 4, todoLen, this.state.priority, startUnix, endUnix, startDate, endDate, process, lastEdit, 0, 0]
                ).then(res => {
                    let today = moment().format("YYYYMMDD");
                    SqlService.select('work', 'id, name, repeatType', '', null, 'id DESC', [0, 1]).then(res1=>{
                        let idWork = res1[0].id;
                        //Insert todo
                        if (todoLen > 0) {
                            this.state.todo.map((item, index) => {
                                if (item.status) totalDone++;
                                SqlService.insert('todo', ['name', 'status', 'work_id', 'workServerId', 'isDelete', 'serverId', 'lastEdit'], [item.name, item.status, idWork, 0, 0, 0, lastEdit]);
                            });
                            process = 100 * totalDone / todoLen;
                            SqlService.update('work', ['process'], [process], 'id = ' + idWork, null);
                        }
                        if(today >= moment.unix(startUnix).format("YYYYMMDD") && today <= moment.unix(endUnix).format("YYYYMMDD")){
                            this.props.getListWorkToday();
                            if(moment().unix() >= startUnix && moment().unix() <= endUnix){
                                this.props.getListWorkDoing();
                            }
                        }
                        else{
                            this.props.getListWork();
                        }
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
                        let repeat = res1[0].repeatType;
                        if(repeat != 4){
                            if(repeat === 1) repeat = '';
                            else if(repeat === 2) repeat = 'day';
                            else if(repeat === 3) repeat = 'week';
                            this.pushNoti(idWork, startUnix*1000, res1[0].name, subText, repeat);
                            this.pushNotiEnd(idWork, endUnix*1000, res1[0].name, repeat);
                        }
                        this.resetForm();
                        ToastAndroid.showWithGravity('Thêm công việc thành công!', ToastAndroid.SHORT, ToastAndroid.CENTER);
                    });
                });
            }
        }
    }

    resetForm() {
        this.setState({
            startDate: moment().format("DD-MM-YYYY"),
            endDate: moment().format("DD-MM-YYYY"),
            name: '',
            description: '',
            type: 1,
            repeat: 1,
            priority: 1,
            idTodo: 1,
            todo: [],
            textTodo: ''
        });
    }

    addTodo() {
        if (this.state.textTodo === '') {
            ToastAndroid.showWithGravity('Bạn chưa điền nội dung đầu mục!', ToastAndroid.SHORT, ToastAndroid.CENTER);
        }
        else {
            this.setState({
                todo: this.state.todo.concat({id: this.state.idTodo, name: this.state.textTodo, status: false}),
                textTodo: '',
                idTodo: this.state.idTodo + 1
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
    }

    updateTodoItem(id, isDone){
        let index = this.state.todo.findIndex((item)=>{return item.id === id});
        if(index > -1){
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
                    <TouchableOpacity style={{flex: 5}} onPress={this.addWork.bind(this)}>
                        <Text style={styles.buttonText}>Thêm</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}/>
                    <TouchableOpacity style={{flex: 5}} onPress={this.resetForm.bind(this)}>
                        <Text style={styles.buttonCancel}>Nhập lại</Text>
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

export default connect(null, actionCreators)(AddWork);