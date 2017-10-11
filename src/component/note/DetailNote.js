import React, {Component} from 'react';
import {Text, View, TouchableOpacity, TextInput, Dimensions, Keyboard, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';
import convertTime from '../../object/convertTime';

const navColor = '#0080FD';
const textColor = '#fff';

class DetailNote extends Component{
    static navigationOptions =({ navigation }) => ({
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.saveNote()}}>
            <Text style={{marginRight: 10, fontSize: 20, color: textColor}}>
                {navigation.state.params.isEdit ? 'Xong' : ''}
            </Text>
        </TouchableOpacity>,
        headerLeft: <TouchableOpacity onPress={() => {navigation.state.params.backToHome()}}>
            <Text style={{marginLeft: 10, fontSize: 20, color: textColor, justifyContent:'center'}}>
                <Icon name="arrow-left" style={{color: textColor, fontSize: 20}}/> Ghi chú
            </Text>
        </TouchableOpacity>,
        headerTitleStyle :{textAlign: 'center',alignSelf:'center', color: textColor},
        headerStyle: {
            backgroundColor: navColor,
            height: 60,
            elevation: 0,       //remove shadow on Android
            shadowOpacity: 0,  //remove shadow ios
        }
    });

    constructor(props){
        super(props);
        this.height = Dimensions.get('window').height - 100;
        this.note = this.props.navigation.state.params.note;
        this.state = {
            newValue: this.note.content,
            height: this.height
        }
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
    }

    componentDidMount() {
        this.props.navigation.setParams({
            saveNote: this.saveNote.bind(this),
            backToHome: this.backToHome.bind(this),
            isEdit: false,
        });
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow (e) {
        this.setState({
            height: this.height - e.endCoordinates.height
        });
        this.props.navigation.setParams({
            isEdit: true
        });
    }

    keyboardDidHide (e) {
        this.setState({
            height: this.height
        });
        this.props.navigation.setParams({
            isEdit: false
        });
    }

    backToHome(){
        if(this.state.newValue === ''){
            SqlService.delete('note', 'id = ' + this.note.id, null).then(res=>{
                this.props.getListNote();
            });
        }
        this.props.navigation.goBack();
    }

    saveNote(){
        Keyboard.dismiss();
        let content = this.state.newValue;
        if(content !== this.note.content){
            let index = content.indexOf('\n');
            let title = '';
            index >= 0 ? title = content.slice(0, index) : title = content;
            let lastEdit = moment().unix();
            SqlService.update(
                'note',
                ['title', 'content', 'lastEdit'],
                [title, content, lastEdit],
                'id = ' + this.note.id, null).then(res=>{
                    this.props.getListNote();
            });
        }
    }

    render () {
        return (
            <View style={{padding: 16, backgroundColor:'#fff'}}>
                <Text style={{fontSize: 16, color: '#666', textAlign:'center'}}>{convertTime(this.note.lastEdit, 1)}</Text>
                <TextInput
                    placeholder="Nhập nội dung"
                    onChangeText={(newValue) => this.setState({newValue})}
                    style={{height: this.state.height, color: '#000', fontSize: 18}}
                    editable={true}
                    multiline={true}
                    value={this.state.newValue}
                    autoFocus={false}
                    textAlignVertical={'top'}
                    underlineColorAndroid='transparent'
                />
            </View>
        );
    }
}

export default connect(null, actionCreators)(DetailNote);