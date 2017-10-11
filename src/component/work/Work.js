import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ScrollView,
    DeviceEventEmitter,
    StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconS from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import * as Progress from 'react-native-progress';
import ItemWork from './ItemWork';
import moment from 'moment';
import ListWork from './ListWork';
import {connect} from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import Admob from '../../object/Admob';

const bgColor = '#fff';
const navColor = '#fff';
const textColor = '#0080FD';
const iconColor = '#0080FD';

class Work extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={() => {
            navigation.navigate('DrawerOpen')
        }}>
            <Text style={{marginLeft: 10}}>
                <IconS name="menu" style={{color: iconColor, fontSize: 30}}/>
            </Text>
        </TouchableOpacity>,
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: textColor},
        headerStyle: {
            // backgroundColor: navigation.state.params.theme,
            backgroundColor: '#fff',
            height: 40,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props) {
        super(props);
        this.state = {
            loadDone: 0,
            tabListWork: true,
            tabWorking: false,
            tabWorkDone: false,
            date: '',
        };
        this.number_per_page = 8;
        console.log('contrucstor');
        this.props.getListWorkToday();
        this.props.getListWork();
        this.props.getListWorkDone();
        this.props.getListWorkDoing();
        this.props.getListWorkMiss();

        setTimeout(() => {
            this.setState({
                loadDone: 1
            });
        }, 800);
    }

    componentDidMount() {
        this.props.navigation.setParams({
            getTheme: 'red',
            theme: 'blue'
        });
        console.log(this.props.navigation.state.params);
    }

    showWorking() {
        this.setState({
            tabListWork: false,
            tabWorking: true,
            tabWorkDone: false
        });
    }

    showListWork() {
        this.setState({
            tabListWork: true,
            tabWorking: false,
            tabWorkDone: false
        });
    }

    showDone() {
        this.setState({
            tabListWork: false,
            tabWorking: false,
            tabWorkDone: true
        });
    }

    loadMore(type) {
        //Dự định
        if (type === 1) {
            let today = moment().format("YYYYMMDD");
            SqlService.select('work', '*', 'startDate > ' + today, null, 'startUnix ASC', [this.state.page * this.number_per_page, this.number_per_page]).then(res => {
                console.log(res);
                this.setState({
                    dataWork: this.state.dataWork.concat(res),
                    page: this.state.page + 1
                });
            });
        }
        //Hoàn thành
        else if (type === 3) {
            SqlService.select('work', '*', 'status = 3', null, 'endUnix DESC', [this.state.pageWorkDone * this.number_per_page, this.number_per_page]).then(res => {
                this.setState({
                    dataWorkDone: this.state.dataWorkDone.concat(res),
                    pageWorkDone: this.state.pageWorkDone + 1
                });
            });
        }
        //Chưa hoàn thành
        else if (type === 4) {
            let currentUnix = moment().unix();
            SqlService.select('work', '*', 'status = 4 AND endUnix < ' + currentUnix, null, 'startUnix ASC', [this.state.pageWorkMiss * this.number_per_page, this.number_per_page]).then(res => {
                console.log(res);
                this.setState({
                    dataWorkMiss: this.state.dataWorkMiss.concat(res),
                    pageWorkMiss: this.state.pageWorkMiss + 1
                })
            });
        }
        console.log('------> ' + type);
    }

    render() {
        if (this.state.loadDone)
            return (
                <View style={styles.container}>
                    <StatusBar
                        backgroundColor = {navColor}
                        barStyle="dark-content"
                    />
                    <View style={styles.subNav}>
                        <View style={[styles.subTab, this.state.tabListWork ? styles.subTabActive : '']}>
                            <TouchableOpacity onPress={() => {
                                this.showListWork();
                            }}>
                                <Text
                                    style={[styles.subNavText, this.state.tabListWork ? styles.subTabTextActive : '']}>Danh
                                    sách</Text>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={[styles.subTab, styles.subTabCenter, this.state.tabWorking ? styles.subTabActive : '']}>
                            <TouchableOpacity onPress={() => {
                                this.showWorking();
                            }}>
                                <Text style={[styles.subNavText, this.state.tabWorking ? styles.subTabTextActive : '']}>Đang
                                    làm</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.subTab, this.state.tabWorkDone ? styles.subTabActive : '']}>
                            <TouchableOpacity onPress={() => {
                                this.showDone();
                            }}>
                                <Text
                                    style={[styles.subNavText, this.state.tabWorkDone ? styles.subTabTextActive : '']}>Hoàn
                                    thành</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {this.state.tabListWork ?
                        <ScrollView>
                            <ListWork
                                showLoadMore={false}
                                listWork={this.props.listWorkToday}
                                title='Hôm nay'
                                type={5}
                                navigation={this.props.navigation}
                            />
                            <ListWork
                                // loadMore={this.loadMore.bind(this)}
                                showLoadMore={true}
                                type={1}
                                listWork={this.props.listWorkMiss}
                                title='Chưa hoàn thành'
                                navigation={this.props.navigation}
                            />
                            <ListWork
                                // loadMore={this.loadMore.bind(this)}
                                showLoadMore={true}
                                type={2}
                                listWork={this.props.listWorkRedux}
                                title='Dự định'
                                navigation={this.props.navigation}
                            />
                        </ScrollView>
                        : null}
                    {this.state.tabWorking ?
                        <ScrollView>
                            <ListWork
                                // loadMore={this.loadMore.bind(this)}
                                showLoadMore={false}
                                listWork={this.props.listWorkDoing}
                                // title='Đang làm'
                                type={4}
                                navigation={this.props.navigation}
                            />

                        </ScrollView>
                        : null}
                    {this.state.tabWorkDone ?
                        <ScrollView>
                            <ListWork
                                // loadMore={this.loadMore.bind(this)}
                                showLoadMore={true}
                                type={3}
                                listWork={this.props.listWorkDone}
                                // title='Hoàn thành'
                                navigation={this.props.navigation}
                            />
                        </ScrollView>
                        : null}
                    <Admob/>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('AddWork')}
                        style={styles.iconCreate}>
                        <IconS name="note" style={{color: "#fff", fontSize: 24}}/>
                    </TouchableOpacity>
                </View>
            );
        else
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <StatusBar
                        backgroundColor = {navColor}
                        barStyle="dark-content"
                    />
                    <Progress.CircleSnail color={['red', 'green', 'blue']} size={90}/>
                    <Text style={{color: '#000', textAlign: 'center', fontSize: 18, marginTop: 30}}>Đang tải...</Text>
                </View>
            );
    }

}
const styles = StyleSheet.create({
    container: {
        backgroundColor: bgColor,
        flex: 1
    },
    subNav: {
        flexDirection: "row", padding: 8, backgroundColor: navColor, borderBottomWidth: 1, borderColor: '#fff'
    },
    subTab: {
        flex: 1, borderColor: iconColor, borderWidth: 1
    },
    subTabCenter: {
        borderLeftWidth: 0,
        borderRightWidth: 0
    },
    subNavText: {
        textAlign: "center", padding: 6, color: iconColor, fontSize: 16
    },
    subTabActive: {
        backgroundColor: iconColor
    },
    subTabTextActive: {
        color: '#fff'
    },
    list: {
        // backgroundColor: '#fff',
        // borderBottomColor: '#111',
        // borderTopColor:'#111',
        // borderBottomWidth: 1,
        // borderTopWidth:1,
        paddingTop: 24
    },
    itemFlatList: {
        backgroundColor: '#fff',
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    flatList: {
        // borderBottomColor: '#ccc',
        borderTopColor: '#ccc',
        // borderBottomWidth: 1,
        borderTopWidth: 1,
    },
    titleFlatList: {
        paddingLeft: 12,
        paddingBottom: 12,
        // paddingTop: 18,
        fontSize: 18
    },
    text: {
        fontSize: 18,
        color: '#111'
    },
    menuRow: {
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    rowIcon: {
        flex: 1,
        justifyContent: 'center'
    },
    rowTitle: {
        flex: 8,
        justifyContent: 'center'
    },
    rowLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    count: {
        backgroundColor: '#ddd',
        textAlign: 'center',
        height: 30,
        width: 30,
        lineHeight: 25,
        borderRadius: 30,
        fontSize: 16,
        color: '#333',
        // borderColor:'#000',
        // borderWidth: 1
    },
    iconCreate: {
        position: 'absolute',
        height: 70,
        width: 70,
        backgroundColor: iconColor,
        right: 10,
        bottom: 80,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

function mapStateToProps(state) {
    return {
        listWorkRedux: state.listWorkRedux,
        listWorkDoing: state.listWorkDoing,
        listWorkToday: state.listWorkToday,
        listWorkDone: state.listWorkDone,
        listWorkMiss: state.listWorkMiss,
        loadMoreWork: state.loadMoreWork,
        theme: state.theme
    }
}

export default connect(mapStateToProps, actionCreators)(Work);
