import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import ItemWork from './ItemWork';
import {connect} from 'react-redux';
import * as actionCreators from '../../redux/actionCreator';

var today = new Date();
const iconColor = '#0080FD';

class ListWork extends Component {
    static navigationOptions = ({navigation}) => ({
        title: 'Thêm công việc',
        headerTitleStyle: {textAlign: 'center', alignSelf: 'center', color: "#111"},
    });

    constructor(props) {
        super(props);
        this.state = {
            dataWork: [],
            dataWorking: [],
            dataWorkDone: []
        };
        // console.log(this.props.listWork);
        // console.log(22222222222);
        // SqlService.select('work', '*', '').then(res => {
        //     this.setState({
        //         dataWork: res
        //     });
        // });
        // this.loadMoreChild.bind(this);
    }

    loadMoreChild() {
        this.props.loadMore(this.props.type);
    }

    render() {
        return (
            <View style={[styles.list, this.props.title ? '' : {paddingTop: 0}]}>
                {this.props.title ? <Text style={styles.titleFlatList}>{this.props.title}</Text> : null}
                <FlatList
                    ref={this.props.type}
                    data={this.props.listWork}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({item}) =>
                        <ItemWork itemWork={item} navigation={this.props.navigation} type={this.props.type}/>
                    }
                    style={[styles.flatList, this.props.title ? '' : {borderTopWidth: 0}]}
                />
                {(this.props.showLoadMore && this.props.listWork.length > 0) ?
                    <TouchableOpacity onPress={this.loadMoreChild.bind(this)}>
                        <Text style={styles.showMore}>Xem thêm</Text>
                    </TouchableOpacity>
                    : null}
                {this.props.listWork.length <= 0 ?
                    <View>
                        <Text style={(this.props.type === 3 || this.props.type === 4) ? styles.showMore1 : styles.showMore}>Không có công việc nào!</Text>
                    </View>
                    : null}
            </View>
        );
    }
}

ListWork.propType = {
    listWork: React.PropTypes.object,
    type: React.PropTypes.int,
    title: React.PropTypes.string,
    showLoadMore: React.PropTypes.boolean,
    navigation: React.PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#fff',
        flex: 1,
        marginTop: 16,
    },
    list: {
        paddingTop: 24,
        paddingBottom: 48
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
        fontSize: 18,
        // backgroundColor: iconColor
        color:'#000'
    },
    showMore: {
        fontSize: 18,
        color: iconColor,
        flex: 1,
        textAlign: 'center',
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        // borderBottomWidth: 1,
    },
    showMore1:{
        fontSize: 18,
        color: iconColor,
        flex: 1,
        textAlign: 'center',
        backgroundColor: '#fff',
        marginTop: 50
    }
});
export default connect(null, actionCreators)(ListWork);

