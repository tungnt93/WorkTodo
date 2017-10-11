import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ItemTodo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: this.props.itemTodo.status
        };
        // this.removeTodoItem.bind(this);
    }

    removeTodoItem(){
        this.props.removeTodo(this.props.itemTodo.id);
    }

    updateTodoItem(){
        console.log(this.state.status);
        this.props.updateTodo(this.props.itemTodo.id, !this.state.status);
        this.setState({
            status: !this.state.status
        });
    }

    render() {
        return (
            <View style={{flexDirection: 'row', padding: 6}}>
                <TouchableOpacity style={{flex: 1, marginTop: 3}} onPress={this.updateTodoItem.bind(this)}>
                    <Icon name={this.state.status ? 'check-square-o' : 'square-o'} style={styles.text}/>
                </TouchableOpacity>
                <Text style={[styles.text, {flex: 10}, this.state.status ? {textDecorationLine:'line-through'} : {textDecorationLine:'none'}]}>
                    {this.props.itemTodo.name}
                    </Text>
                {this.props.isUpdateDb ? null :
                    <TouchableOpacity style={{flex: 1}} onPress={this.removeTodoItem.bind(this)}>
                        <Icon name='close' style={[styles.text, {
                            marginTop: 3,
                            color: 'red',
                            textAlign: 'right',
                            fontSize: 22
                        }]}/>
                    </TouchableOpacity>
                }
            </View>
        );
    }
}

ItemTodo.propType = {
    itemTodo: React.PropTypes.object,
    isUpdateDb: React.PropTypes.boolean
};

const styles = StyleSheet.create({
    text: {
        fontSize: 18, color: '#111'
    },
});