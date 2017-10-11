import React, {Component} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';

export default class Statistics extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: "#fff"},
        headerLeft: <TouchableOpacity onPress={() => {navigation.goBack()}}>
            <Text style={{marginLeft: 10, fontSize: 18, color: '#fff', justifyContent:'center'}}>
                Đóng
            </Text>
        </TouchableOpacity>,
        headerStyle: {
            backgroundColor: '#2196F3',
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props){
        super(props);
        this.state = {
            items: {}
        };
    }

    render(){
        return(
            <View style={{flex: 1}}>
                <Agenda
                    items={this.state.items}
                    loadItemsForMonth={this.loadItems.bind(this)}
                    selected={'2017-05-16'}
                    renderItem={this.renderItem.bind(this)}
                    renderEmptyDate={this.renderEmptyDate.bind(this)}
                    rowHasChanged={this.rowHasChanged.bind(this)}
                />
            </View>
        )
    }

    loadItems(day) {
        // setTimeout(() => {
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = this.timeToString(time);
                if (!this.state.items[strTime]) {
                    this.state.items[strTime] = [];
                    const numItems = Math.floor(Math.random() * 5);
                    for (let j = 0; j < numItems; j++) {
                        this.state.items[strTime].push({
                            name: 'Item for ' + strTime,
                            height: Math.max(50, Math.floor(Math.random() * 150))
                        });
                    }
                }
            }
            //console.log(this.state.items);
            // const newItems = {};
            // Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
            // this.setState({
            //     items: newItems
            // });
        // }, 1000);
        // console.log(`Load Items for ${day.year}-${day.month}`);
    }
    renderItem(item) {
        return (
            <View style={[styles.item, {height: item.height}]}><Text>{item.name}</Text></View>
        );
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}><Text>This is empty date!</Text></View>
        );
    }

    rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
    }

    timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex:1,
        paddingTop: 30
    }
});