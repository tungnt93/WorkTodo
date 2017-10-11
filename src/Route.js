import React, { Component } from 'react';
import {StackNavigator, TabNavigator, DrawerNavigator} from 'react-navigation';
import {StyleSheet, Text, View, StatusBar} from 'react-native';

import Work from './component/work/Work';
import AddWork from './component/work/AddWork';
import EditWork from './component/work/EditWork';
import Statistics from './component/work/Statistics';
import Note from './component/note/Note';
import AddNote from './component/note/AddNote';
import DetailNote from './component/note/DetailNote';
import Info from './component/info/Info';
import CalendarWork from './component/calendar/Calendar';
import Setting from './component/setting/Setting';
import Index from './component/login/Index';
import Restore from './component/login/Restore';
import Backup from './component/login/Backup';
import Tag from './component/tags/Tag';
import MenuWrap from './component/MenuWrap';

export const WorkStack = StackNavigator({
    Work: {
        screen: Work,
        navigationOptions:{
            title: 'Quản lý công việc'
        }
    },
    AddWork: {
        screen: AddWork,
        navigationOptions:{
            title: 'Thêm công việc mới'
        }
    },
    EditWork: {
        screen: EditWork,
        navigationOptions:{
            title: 'Chỉnh sửa công việc'
        }
    },
    Statistics:{
        screen: Statistics,
        navigationOptions:{
            title:'Thống kê công việc'
        }
    }
});

export const NoteStack = StackNavigator({
    Note: {
        screen: Note,
        navigationOptions:{
            title: 'Ghi chú'
        }
    },
    AddNote:{
        screen: AddNote,
        navigationOptions:{
            title: ''
        }
    },
    DetailNote:{
        screen: DetailNote,
        navigationOptions:{
            title: ''
        }
    }
});

export const SettingStack = StackNavigator({
    Setting: {
        screen: Setting,
        navigationOptions:{
            title: 'Chủ đề'
        }
    }
});

export const InfoStack = StackNavigator({
    Info: {
        screen: Info,
        navigationOptions:{
            title: 'Giới thiệu'
        }
    }
});

export const CalendarStack = StackNavigator({
    Calendar: {
        screen: CalendarWork,
        navigationOptions:{
            title: 'Lịch'
        }
    }
});

export const LoginStack = StackNavigator({
    Login: {
        screen: Index,
        navigationOptions:{
            title: 'Tài khoản'
        }
    },
    Restore: {
        screen: Restore,
        navigationOptions:{
            title: 'Khôi phục dữ liệu'
        }
    },
    Backup: {
        screen: Backup,
        navigationOptions:{
            title: 'Sao lưu dữ liệu'
        }
    }
});

export const SideMenu = DrawerNavigator({
        WorkMenu:{
            screen: WorkStack
        },
        NoteMenu:{
            screen: NoteStack
        },
        LoginMenu:{
            screen: LoginStack
        },
        InfoMenu:{
            screen: InfoStack
        },
        CalendarMenu:{
            screen: CalendarStack
        },
        SettingMenu:{
            screen: SettingStack
        }
    },
    {
        drawerWidth: 300,
        drawerPosition: 'left',
        contentComponent: props => <MenuWrap {...props} />
    }
);
