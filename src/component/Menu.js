
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconS from 'react-native-vector-icons/SimpleLineIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';

const navColor = '#0080FD';

class Menu extends Component{
    constructor(props){
        super(props);
        console.log(this.props.user);
    }

    render(){
        return(
            <View style={{flex:1}}>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('LoginMenu')}}>
                    <View style={{padding: 12, flexDirection: 'row', backgroundColor: navColor}}>
                        <View style={{justifyContent:'center', alignItems:'center', borderColor:'#fff', borderRadius:60, borderWidth:1, height: 60, width:60}}>
                            <IconS name="user" style={{color: "#fff", fontSize: 32}}/>
                        </View>
                        <View style={{justifyContent:'center', marginLeft: 18}}>
                            <Text style={{color: "#fff", fontSize: 20,}} numberOfLines={1}>{this.props.user ? this.props.user.fullname : 'TÀI KHOẢN'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.props.navigation.navigate('WorkMenu', {theme: this.props.theme})}>
                    <View style={{padding: 16, flexDirection: 'row'}}>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <IconS name="list" style={styles.icon}/>
                        </View>
                        <View style={{flex: 8, justifyContent:'center'}}>
                            <Text style={{color: "#111", fontSize: 18}}>Công việc</Text>
                        </View>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <Icon name="angle-right" style={styles.icon}/>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('NoteMenu')}}>
                    <View style={{padding: 16, flexDirection: 'row'}}>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <IconS name="note" style={styles.icon}/>
                        </View>
                        <View style={{flex: 8, justifyContent:'center'}}>
                            <Text style={{color: "#111", fontSize: 18}}>Ghi chú</Text>
                        </View>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <Icon name="angle-right" style={styles.icon}/>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('CalendarMenu')}}>
                    <View style={{padding: 16, flexDirection: 'row', borderBottomColor: '#ddd', borderBottomWidth: 1}}>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <Icon name="calendar" style={styles.icon}/>
                        </View>
                        <View style={{flex: 8, justifyContent:'center'}}>
                            <Text style={{color: "#111", fontSize: 18}}>Lịch</Text>
                        </View>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <Icon name="angle-right" style={styles.icon}/>
                        </View>
                    </View>
                </TouchableOpacity>
                {/*<TouchableOpacity onPress={()=>{this.props.navigation.navigate('SettingMenu')}}>*/}
                    {/*<View style={{padding: 16, flexDirection: 'row'}}>*/}
                        {/*<View style={{flex: 1, justifyContent:'center'}}>*/}
                            {/*<IconI name="ios-color-filter-outline" style={[styles.icon, {fontSize: 26}]}/>*/}
                        {/*</View>*/}
                        {/*<View style={{flex: 8, justifyContent:'center'}}>*/}
                            {/*<Text style={{color: "#111", fontSize: 18}}>Chủ đề</Text>*/}
                        {/*</View>*/}
                        {/*<View style={{flex: 1, justifyContent:'center'}}>*/}
                            {/*<Icon name="angle-right" style={styles.icon}/>*/}
                        {/*</View>*/}
                    {/*</View>*/}
                {/*</TouchableOpacity>*/}
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('InfoMenu')}}>
                    <View style={{padding: 16, flexDirection: 'row'}}>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <IconS name="info" style={styles.icon}/>
                        </View>
                        <View style={{flex: 8, justifyContent:'center'}}>
                            <Text style={{color: "#111", fontSize: 18}}>Giới thiệu</Text>
                        </View>
                        <View style={{flex: 1, justifyContent:'center'}}>
                            <Icon name="angle-right" style={styles.icon}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    icon:{
        color: "#34495E", fontSize: 20
    }
});

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Menu);