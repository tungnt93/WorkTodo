import React, { Component } from 'react';
import {StyleSheet, Text, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import convertTime from '../../object/convertTime';
import Swipeout from 'react-native-swipeout';
import moment from 'moment';

class ItemNote extends Component{
    constructor(props){
        super(props);
    }

    deleteNote(){
        SqlService.select('note', 'serverId', 'id = ' + this.props.note.id, null, null, null).then(res=>{
            if(res[0].serverId === 0){
                SqlService.delete('note', 'id = ' + this.props.note.id, null).then(res1=>{
                    this.props.getListNote();
                });
            }
            else{
                let lastEdit = moment().unix();
                SqlService.update('note', ['isDelete', 'lastEdit'], [1, lastEdit], 'id = ' + this.props.note.id, null).then(res1=>{
                    this.props.getListNote();
                });
            }
        });
    }

    render(){
        let swipeBtns = [{
            text: 'Xóa',
            backgroundColor: 'red',
            onPress: () => {this.deleteNote()}
        }];

        return(
            <Swipeout right={swipeBtns} autoClose={true} backgroundColor= 'transparent'>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('DetailNote', {note: this.props.note})}
                    style={styles.itemNote}
                >
                    <Text style={{flex: 9, color: '#000', fontSize: 18}}
                          numberOfLines={1}>{this.props.note.title}</Text>
                    <Text style={{
                        flex: 3,
                        textAlign: 'right',
                        color: '#666',
                        fontSize: 14
                    }}>{convertTime(this.props.note.lastEdit, 0)}</Text>
                    <Icon style={{flex: 1, textAlign: 'right', fontSize: 16, color: '#333'}}
                          name="arrow-right"/>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}

ItemNote.propType = {
    note: React.PropTypes.object,
    navigation: React.PropTypes.object
};

const styles = StyleSheet.create({
    itemNote:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor:'#ccc'
    }
});

export default connect(null, actionCreators)(ItemNote);