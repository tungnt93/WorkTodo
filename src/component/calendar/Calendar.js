import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity, ScrollView, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import CalendarStrip from 'react-native-calendar-strip';
import Calendar from 'react-native-calendar';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import ListWork from '../work/ListWork';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import Admob from '../../object/Admob';

const bgColor = '#f1f1f1';
// const navColor = '#6C48FF';
const navColor = '#0080FD';
const textColor = '#fff';

const config = {
    months : "Tháng 1, Tháng 2, Tháng 3, Tháng 4, Tháng 5, Tháng 6, Tháng 7, Tháng 8, Tháng 9, Tháng 10, Tháng 11, Tháng 12".split(", "),
    monthsShort : "Thg 1, Thg 2, Thg 3, Thg 4, Thg 5, Thg 6, Thg 7, Thg 8, Thg 9, Thg 10, Thg 11, Thg 12".split(", "),
    weekdays : "Chủ nhật, Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7".split(", "),
    weekdaysShort : "CN_T2_T3_T4_T5_T6_T7".split("_"),
    weekdaysMin : "CN_T2_T3_T4_T5_T6_T7".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        LTS : "HH:mm:ss",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
    }
}
moment.defineLocale('vn', config);

class CalendarWork extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: textColor, fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: textColor},
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.showCalendar()}}>
            <Text style={{marginRight: 10}}>
                <Icon name="calendar" style={{color: textColor, fontSize: 30}}/>
            </Text>
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
        this.state = ({
            date: moment().format("YYYYMMDD"),
            isShowFull: false,
            eventDates: [],
            // listWork: []
        });
        // this.listWork = null;
        let eventDates = [];
        SqlService.select('work', '*', '', null, null, null).then(res=>{
            // this.listWork = res;
            for(let i=0; i<res.length; i++){
                if(res[i].startDate === res[i].endDate){
                    eventDates.push(res[i].startDate);
                }
                else{
                    let d = parseInt(res[i].endDate) - parseInt(res[i].startDate);
                    for(let j = 0; j <= d; j++){
                        eventDates.push((parseInt(res[i].startDate) + j).toString());
                    }
                }
            }
            eventDates = Array.from(new Set(eventDates));
            this.setState({eventDates});
            this.onDateSelect(this.state.date);
        });
    }

    componentDidMount() {
        this.props.navigation.setParams({
            showCalendar: this.showCalendar.bind(this)
        });
    }

    showCalendar(){
        this.setState({isShowFull: !this.state.isShowFull});
    }

    onDateSelect(date){
        this.props.getListWorkByDay(date);
        this.setState({
            date,
            isShowFull: false
        });
    }

    render() {
        return (
            <View style={{flex:1}}>
                <StatusBar
                    backgroundColor = {navColor}
                    barStyle="light-content"
                />
                {this.state.isShowFull ?
                    <View style={{flex: 1, backgroundColor:'#F7F7F7'}}>
                        <Calendar
                            showControls
                            dayHeadings={customDayHeadings}
                            monthNames={customMonthNames}
                            selectedDate={this.state.date}
                            onDateSelect={(date) => this.onDateSelect(moment(date).format("YYYYMMDD"))}
                            titleFormat={'MMMM YYYY'}
                            prevButtonText={'Trước'}
                            nextButtonText={'Tiếp'}
                            showEventIndicators ={true}
                            eventDates={this.state.eventDates}
                            customStyle={customStyle}
                        />
                    </View>
                    :
                    <View style={{flex: 1}}>
                        <View style={{height: 120, backgroundColor:'#fff', paddingTop: 12, paddingBottom: 12}}>
                            <CalendarStrip
                                style={{height: 120, backgroundColor: '#fff',borderBottomWidth: 1, borderBottomColor:'#ccc'}}
                                // calendarAnimation={{type: 'sequence', duration: 30}}
                                daySelectionAnimation={{
                                    type: 'border',
                                    duration: 200,
                                    borderWidth: 1,
                                    borderHighlightColor: navColor
                                }}
                                calendarHeaderStyle={{color: '#34495E'}}
                                dateNumberStyle={{color: '#34495E'}}
                                dateNameStyle={{color: '#34495E'}}
                                highlightDateNumberStyle={{color: navColor}}
                                highlightDateNameStyle={{color: navColor}}
                                maxDayComponentSize={50}
                                selectedDate={this.state.date}
                                onDateSelected={(date) => this.onDateSelect(moment(date).format("YYYYMMDD"))}
                                // locale={locale}
                            />
                        </View>
                        <View style={{flex: 3, backgroundColor: '#fff'}}>
                            <Text style={{color: '#34495E', fontSize: 20, textAlign:'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor:'#ccc'}}>Danh sách công việc</Text>
                            {this.props.listWorkByDay.length > 0 ?
                                <ScrollView style={{backgroundColor: '#fff'}}>
                                    {console.log(this.state.date)}
                                    <ListWork
                                        showLoadMore={false}
                                        listWork={this.props.listWorkByDay}
                                        dateSelected = {this.state.date.toString()}
                                        type = {6}
                                        navigation={this.props.navigation}
                                    />
                                </ScrollView>
                                :
                                <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                                    <Text style={{fontSize: 24, color:'#000'}}>Không có công việc nào!</Text>
                                </View>
                            }

                        </View>
                    </View>
                }
                <Admob/>
            </View>
        );
    }
}

const customMonthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const customDayHeadings = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const customStyle={
    title: {
        color: '#6C48FF'
    },
    titleText:{
        fontSize: 24
    },
    eventIndicator: {
        backgroundColor: '#6C48FF',
        width: 10,
        height: 10,
    },
    day: {fontSize: 18, textAlign: 'center', color:'#000'},
    calendarHeading: {
        borderTopWidth: 0,
        borderBottomColor: '#ccc'
    },
    selectedDayCircle: {
        backgroundColor: '#6C48FF',
    },
    weekendDayText: {
        color: 'blue',
    },
    weekendHeading: {
        color: 'blue',
    }
};

function mapStateToProps(state) {
    return {
        listWorkByDay: state.listWorkByDay
    }
}

export default connect(mapStateToProps, actionCreators)(CalendarWork);