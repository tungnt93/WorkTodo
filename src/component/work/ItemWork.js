import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconS from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import {connect} from 'react-redux';
import ItemTodo from './ItemTodo';
import * as actionCreators from '../../redux/actionCreator';
import Swipeout from 'react-native-swipeout';
import PushNotification from 'react-native-push-notification';

const iconColor = '#0080FD';

class ItemWork extends Component {
    constructor(props) {
        super(props);
        this.process = this.props.itemWork.status === 3 ? 100 : this.props.itemWork.process;
        this.state = {
            isShow: false,
            status: this.props.itemWork.status,
            todo: [],
            process: this.process
        };

        console.log(this.props.dateSelected);

        this.displayStart = moment.unix(this.props.itemWork.startUnix).format("HH:mm");
        this.displayEnd = moment.unix(this.props.itemWork.endUnix).format("HH:mm");
        if (this.props.itemWork.startDate === moment().format("YYYYMMDD")) {
            this.displayStart += ' Hôm nay';
        }
        else {
            if (moment.unix(this.props.itemWork.startUnix).format("YYYY") === moment().format("YYYY")) {
                this.displayStart += ' ' + moment.unix(this.props.itemWork.startUnix).format("DD/MM");
            }
            else {
                this.displayStart += ' ' + moment.unix(this.props.itemWork.startUnix).format("DD/MM/YYYY");
            }
        }
        if (this.props.itemWork.endDate === moment().format("YYYYMMDD")) {
            this.displayEnd += ' Hôm nay';
        }
        else {
            if (moment.unix(this.props.itemWork.endUnix).format("YYYY") === moment().format("YYYY")) {
                this.displayEnd += ' ' + moment.unix(this.props.itemWork.endUnix).format("DD/MM");
            }
            else {
                this.displayEnd += ' ' + moment.unix(this.props.itemWork.endUnix).format("DD/MM/YYYY");
            }
        }
        this.totalTodo = this.props.itemWork.totalTodo;
        this.totalDone = 0;
        if (this.props.itemWork.totalTodo > 0) {
            SqlService.select('todo', '*', 'isDelete = 0 AND work_id = ' + this.props.itemWork.id, null, 'id ASC', null).then(res => {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].status)
                        this.totalDone++;
                }
                this.setState({
                    todo: res,
                    process: this.props.itemWork.status === 3 ? 100 : 100 * this.totalDone / this.totalTodo
                });
            });
        }

        PushNotification.configure({
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
            },
        });
    }

    workDone() {
        let id = this.props.itemWork.id;
        let lastEdit = moment().unix();
        if (this.state.status !== 3) {
            SqlService.update('work', ['status', 'lastEdit'], [3, lastEdit], 'id = ' + id, null).then(res => {
                this.refreshView();
            });
            this.setState({
                status: 3,
                process: 100
            });
        }
        else {
            SqlService.update('work', ['status', 'lastEdit'], [4, lastEdit], 'id = ' + id, null).then(res => {
                this.refreshView();
            });
            this.setState({
                status: 4,
                process: this.process
            });
        }
    }

    refreshView() {
        this.props.getListWorkDoing();
        this.props.getListWork();
        this.props.getListWorkDone();
        this.props.getListWorkMiss();
        this.props.getListWorkToday();
    }

    updateTodoItem(id, isDone) {
        let index = this.state.todo.findIndex((item) => {
            return item.id === id
        });
        if (index > -1) {
            let newTodo = this.state.todo;
            newTodo[index].status = isDone;
            if (isDone) {
                this.totalDone++;
            }
            else {
                this.totalDone--;
            }
            let lastEdit = moment().unix();
            this.process = 100 * this.totalDone / (this.totalTodo);
            if (this.process === 100) {
                SqlService.update('work', ['status', 'process', 'lastEdit'], [3, 100, lastEdit], 'id = ' + this.props.itemWork.id, null).then(res => {
                    this.refreshView();
                });
                this.setState({
                    status: 3,
                    todo: newTodo,
                    process: 100
                });
            }
            else {
                SqlService.update('work', ['status', 'process', 'lastEdit'], [4, this.process, lastEdit], 'id = ' + this.props.itemWork.id, null).then(res => {
                    this.refreshView();
                });
                this.setState({
                    status: 4,
                    todo: newTodo,
                    process: this.process
                });
            }
            // SqlService.update('work', ['process'], [this.process], 'id = ' + this.props.itemWork.id, null);
            let stt = (isDone === true) ? 1 : 0;
            SqlService.update('todo', ['status', 'lastEdit'], [stt, lastEdit], 'id = ' + id, null);
        }
    }

    gotoEdit() {
        this.props.navigation.navigate('EditWork', {itemWork: this.props.itemWork});
    }

    deleteWork(){
        Alert.alert(
            'Xác nhận xóa công việc',
            'Bạn chắc chắn muốn xóa công việc "' + this.props.itemWork.name + '"?',
            [
                {text: 'Hủy', onPress: () => {}},
                {text: 'Đồng ý', onPress: () => {
                    SqlService.select('work', 'serverId', 'id = ' + this.props.itemWork.id, null, null, null).then(res=>{
                        if(res[0].serverId === 0){
                            SqlService.delete('work', 'id = ' + this.props.itemWork.id, null);
                            if(this.props.itemWork.totalTodo > 0){
                                SqlService.delete('todo', 'work_id = ' + this.props.itemWork.id, null);
                            }
                        }
                        else{
                            let lastEdit = moment().unix();
                            SqlService.update('work', ['isDelete', 'lastEdit'], [1, lastEdit], 'id = ' + this.props.itemWork.id, null);
                            if(this.props.itemWork.totalTodo > 0){
                                SqlService.update('todo', ['isDelete', 'lastEdit'], [1, lastEdit], 'work_id = ' + this.props.itemWork.id, null);
                            }
                        }
                    });

                    this.cancelNoti(this.props.itemWork.id);
                    switch (this.props.type){
                        case 1:
                            this.props.getListWorkMiss();
                            break;
                        case 2:
                            this.props.getListWork();
                            break;
                        case 3:
                            this.props.getListWorkDone();
                            break;
                        case 4:
                            this.props.getListWorkDoing();
                            break;
                        case 5:
                            this.props.getListWorkToday();
                            break;
                        case 6:
                            console.log(this.props.dateSelected);
                            this.props.getListWorkByDay(this.props.dateSelected);
                            break;
                    }
                }},
            ],
            { cancelable: false }
        )
    }

    cancelNoti(id){
        PushNotification.cancelLocalNotifications({id: id.toString()});
        PushNotification.cancelLocalNotifications({id: "-" + id.toString()});
    }

    render() {
        let swipeBtns = [
            {
                text: 'Sửa',
                backgroundColor: '#6BDE71',
                color: '#fff',
                onPress: () => {
                    this.gotoEdit();
                }
            },
            {
                text: 'Xóa',
                backgroundColor: 'red',
                color: '#fff',
                onPress: () => {
                    this.deleteWork();
                }
            }
        ];

        return (
            <Swipeout right={swipeBtns} autoClose={true} backgroundColor= 'transparent'>
                <View
                    style={[styles.itemContainer]}>
                    <View style={styles.titleItem}>
                        <TouchableOpacity style={styles.rowIcon} onPress={() => {
                            this.workDone()
                        }}>
                            <Icon name={this.state.status === 3 ? 'check-square-o' : 'square-o'}
                                  style={{color: "#000", fontSize: 24}}/>
                        </TouchableOpacity>
                        <View style={styles.rowTitle}>
                            <View style={styles.flexRow}>
                                <Icon name={this.props.itemWork.priority === 1 ? 'star' :
                                    (this.props.itemWork.priority === 2 ? 'star-half-o' : 'star-o')}
                                      style={[styles.iconTop, styles.colorBlue]}/>
                                <Icon
                                    name={this.props.itemWork.type === 1 ? 'user-o' : this.props.itemWork.type === 2 ? 'home' : 'building-o'}
                                    style={styles.iconTop}/>
                                <View style={{flex: 1}}/>
                                <View style={{flex: 5, justifyContent: 'center'}}>
                                    <Text style={{
                                        position: 'absolute',
                                        marginLeft: 125
                                    }}>{Math.ceil(this.state.process)}%</Text>
                                    <View style={styles.wrapProcess}/>
                                    <View style={[styles.process, {width: Math.ceil(this.state.process * 1.2)}]}/>
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => {
                                    this.setState({isShow: !this.state.isShow})
                                }}>
                                    <Text
                                        style={[styles.text, {marginTop: 6}, this.state.status === 3 ? {textDecorationLine: 'line-through'} : {textDecorationLine: 'none'}]}>{this.props.itemWork.name}</Text>
                                </TouchableOpacity>
                                <Text style={styles.textTime}>
                                    {this.displayStart} - {this.displayEnd}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.rowLeft} onPress={() => {
                            this.setState({isShow: !this.state.isShow})
                        }}>
                            <Icon name={this.state.isShow ? 'angle-up' : 'angle-down'}
                                  style={{color: "#111", fontSize: 20}}/>
                        </TouchableOpacity>
                    </View>
                    {this.state.isShow ?
                        <View style={styles.flexRow}>
                            <View style={{flex: 2}}/>
                            <View style={{flex: 13}}>
                                <View style={styles.viewDetail}>
                                    <View style={styles.itemDetail}>
                                        <Icon name='info-circle' style={styles.iconSmall}/>
                                        <Text style={styles.textDetail}>
                                            {this.props.itemWork.description === '' ? 'Không có mô tả nào' : this.props.itemWork.description}
                                        </Text>
                                    </View>
                                </View>
                                {this.state.todo.length > 0 ?
                                    <View>
                                        <View style={styles.itemDetail}>
                                            <Icon name='list-ul' style={styles.iconSmall}/>
                                            <Text style={styles.textDetail}>Các đầu mục công việc</Text>
                                        </View>
                                        <FlatList
                                            ref={this.props.itemWork.id}
                                            data={this.state.todo}
                                            keyExtractor={(item, index) => item.id}
                                            renderItem={({item}) =>
                                                <ItemTodo
                                                    itemTodo={item}
                                                    updateTodo={this.updateTodoItem.bind(this)}
                                                    isUpdateDb={true}
                                                />
                                            }
                                        />
                                    </View>
                                    : null}
                                {/*<View style={[styles.flexRow, {marginTop: 8}]}>*/}
                                    {/*<TouchableOpacity onPress={this.gotoEdit.bind(this)}>*/}
                                        {/*<Text style={[styles.text, styles.colorBlue]}>Sửa</Text>*/}
                                    {/*</TouchableOpacity>*/}
                                    {/*<Text style={[styles.text, styles.colorRed, {marginLeft: 12}]}>Xóa</Text>*/}
                                {/*</View>*/}
                            </View>
                        </View>
                        : null}
                </View>
            </Swipeout>
        );
    }
}

ItemWork.propType = {
    itemWork: React.PropTypes.object,
    navigation: React.PropTypes.object,
    idWork: React.PropTypes.int,
    type: React.PropTypes.int,
    dateSelected: React.PropTypes.string
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#fff',
        // marginLeft: 16,
        // marginRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        // borderWidth: 1,
        // borderColor: '#ddd',
        // marginHorizontal: 12,
        // marginBottom: 12
    },
    titleItem: {
        flexDirection: 'row',
        // paddingBottom: 16
    },
    text: {
        fontSize: 20,
        color: '#000',
        // color: '#2196F3'
    },
    textTime: {
        flex: 13,
        justifyContent: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 3
    },
    textDetail: {
        flex: 13,
        justifyContent: 'center',
        fontSize: 18,
        color: '#666'
    },
    rowTitle: {
        flex: 12,
        justifyContent: 'center'
    },
    rowLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    rowIcon: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    iconSmall: {
        color: "#111", fontSize: 18, flex: 1, paddingTop: 3
    },
    iconTop: {
        fontSize: 24, flex: 1
    },
    colorBlue: {
        color: iconColor
    },
    colorRed: {
        color: 'red'
    },
    viewDetail: {
        // padding: 16
        // flex: 13,
        // flexDirection: 'row',
        marginTop: 6,
        paddingTop: 2,
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    flexRow: {
        flexDirection: 'row'
    },
    itemDetail: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 6,
        // alignItems:'center',
        // justifyContent:'center'
    },
    wrapProcess: {
        width: 120, height: 12, borderWidth: 1, borderColor: '#ccc', position: 'absolute'
    },
    process: {
        height: 12, position: 'absolute', backgroundColor: iconColor
    }
});

export default connect(null, actionCreators)(ItemWork);
