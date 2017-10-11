import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Dimensions, FlatList, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import ItemNote from './ItemNote';
import Admob from '../../object/Admob';

const navColor = '#0080FD';
const textColor = '#fff';

class Note extends Component {
    static navigationOptions =({ navigation }) => ({
        headerLeft: <TouchableOpacity onPress={()=>{navigation.navigate('DrawerOpen')}}>
            <Text style={{marginLeft: 10}}>
                <Icon name="menu" style={{color: textColor, fontSize: 30}}/>
            </Text></TouchableOpacity>,
        headerRight: <TouchableOpacity onPress={() => navigation.navigate('AddNote')}>
            <Text style={{marginRight: 10}}>
                <Icon name="note" style={{color: textColor, fontSize: 30}}/>
            </Text>
        </TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: textColor},
        headerStyle: {
            backgroundColor: navColor,
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            height: 60,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props){
        super(props);
        this.height = Dimensions.get('window').height - 100;
        this.state = {
            newValue: '',
            height: this.height
        };

        this.props.getListNote();
    }

    loadMoreNote(){
        this.props.loadMore(6);
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor:'#fff', paddingTop: 24}}>
                <StatusBar
                    backgroundColor = {navColor}
                    barStyle="light-content"
                />
                {this.props.listNote.length > 0 ?
                    <FlatList
                        ref={this.props.type}
                        data={this.props.listNote}
                        keyExtractor={(item, index) => item.id}
                        onEndReachedThreshold = {0.4}
                        onEndReached = {()=>{
                            this.loadMoreNote();
                        }}
                        renderItem={({item}) =>
                            <ItemNote
                                note = {item}
                                navigation = {this.props.navigation}
                            />
                        }
                    />
                    :
                    <Text style={{color:'#000', textAlign:'center', fontSize: 20}}>Không có ghi chú nào!</Text>
                }
                <Admob/>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        listNote: state.listNote
    }
}

export default connect(mapStateToProps, actionCreators)(Note);