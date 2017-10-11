import React, {Component} from 'react';
import {View, Text, StatusBar} from 'react-native';
import SqlService from './providers/SqlService';
import * as Progress from 'react-native-progress';
import {SideMenu} from './Route';
import store  from './redux/store';
import { Provider } from 'react-redux';
import getItemAsyncStorage from './storage/getItemAsyncStorage';
import listApp from './api/listApp';
import saveAsyncStorage from './storage/saveAsyncStorage';
import restore from './api/restore';


import {LocaleConfig} from 'react-native-calendars';
LocaleConfig.locales['vn'] = {
    monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    monthNamesShort: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    dayNames: ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'],
    dayNamesShort: ['CN','T.2','T.3','T.4','T.5','T.6','T.7']
};
LocaleConfig.defaultLocale = 'vn';
this.state = {
    items: {}
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadDone: 0
        }
        // SqlService.dropTable('work');
        // SqlService.dropTable('todo');
        // SqlService.dropTable('note');
        let today = new Date().getTime();
        SqlService.createTableWork().then(res => {
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        SqlService.createTableTodo().then(res => {
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        SqlService.createTableNote().then(res => {
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        getItemAsyncStorage('@user').then(res=>{
            if(res !== ''){
                let r = JSON.parse(res);
                let user = {username: r.username, fullname: r.fullname, id: r.id};
                store.dispatch({
                    type:'SAVE_USER',
                    user: user
                });
            }
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        getItemAsyncStorage('@lastSync').then(res=>{
            if(!res){
                saveAsyncStorage('@lastSync', '0', 'TEXT');
                store.dispatch({
                    type:'LAST_SYNC',
                    time: 0
                })
            }
            else{
                store.dispatch({
                    type:'LAST_SYNC',
                    time: parseInt(res)
                });
            }
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        getItemAsyncStorage('@lastRestore').then(res=>{
            if(!res){
                saveAsyncStorage('@lastRestore', '0', 'TEXT');
                store.dispatch({
                    type:'LAST_RESTORE',
                    time: 0
                })
            }
            else{
                console.log(res);
                store.dispatch({
                    type:'LAST_RESTORE',
                    time: parseInt(res)
                });
            }
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        listApp().then(res=>{
            console.log(res);
            saveAsyncStorage('@list_app', res, 'JSON');
            this.setState({
                loadDone: this.state.loadDone + 1
            });
        });

        restore('http://kyucxua.net/api/index/listNote', 3).then(res=>{
           console.log(res);
        });
    }

    render() {
        if (this.state.loadDone === 7) {
            return (
                <Provider store={store}>
                    <SideMenu/>
                </Provider>
            );
        }
        else {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Progress.CircleSnail color={['red', 'green', 'blue']} size={90}/>
                    <Text style={{color: '#000', textAlign: 'center', fontSize: 18, marginTop: 30}}>Đang tải...</Text>
                </View>
            );
        }
    }
}
