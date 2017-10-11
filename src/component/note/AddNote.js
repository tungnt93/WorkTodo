import React, { Component } from 'react';
import {Text, View, TouchableOpacity, TextInput, Dimensions, Keyboard, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import SqlService from '../../providers/SqlService';
import moment from 'moment';
import { connect } from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';

const navColor = '#0080FD';
const textColor = '#fff';

class AddNote extends Component {
    static navigationOptions =({ navigation }) => ({
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.saveNote()}}>
            <Text style={{marginRight: 10, fontSize: 20, color: textColor}}>
                Xong
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
        this.state = {
            newValue: '',
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
            theme: '#fff'
        });
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow (e) {
        this.setState({
            height: this.height - e.endCoordinates.height
        })
    }

    keyboardDidHide (e) {
        this.setState({
            height: this.height
        })
    }

    backToHome(){
        this.props.navigation.goBack();
    }

    saveNote(){
        Keyboard.dismiss();
        let content = this.state.newValue;
        if(content === ''){
            this.props.navigation.goBack();
        }
        else{
            let index = content.indexOf('\n');
            let title = '';
            index >= 0 ? title = content.slice(0, index) : title = content;
            let lastEdit = moment().unix();
            // if(title.length > 28)
            //     title = title.slice(0, 25) + '...';
            SqlService.insert('note', ['title', 'content', 'lastEdit', 'isDelete', 'serverId'], [title, content, lastEdit, 0, 0]).then(res=>{
                this.props.getListNote();
                this.props.navigation.goBack();
            });
        }
    }

    render() {
        return (
            <View style={{paddingLeft: 16, paddingRight: 16, backgroundColor:'#fff'}}>
                <Text style={{fontSize: 16, color: '#666', textAlign:'center', paddingTop: 16}}>{moment().format("HH:mm DD/MM/YYYY")}</Text>
                <TextInput
                    placeholder="Nhập nội dung"
                    onChangeText={(newValue) => this.setState({newValue})}
                    style={{height: this.state.height, color: '#000', fontSize: 18}}
                    editable={true}
                    multiline={true}
                    value={this.state.newValue}
                    autoFocus={true}
                    textAlignVertical={'top'}
                    underlineColorAndroid='transparent'
                />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        theme: state.theme
    }
}

export default connect(mapStateToProps, actionCreators)(AddNote);
