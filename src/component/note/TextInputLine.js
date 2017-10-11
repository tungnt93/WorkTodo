import React, { Component } from 'react'
import { TextInput, Platform, View, Text } from 'react-native'

const iosTextHeight = 20.5;
const androidTextHeight = 20.5;
const textHeight = Platform.OS === 'ios' ? iosTextHeight : androidTextHeight;

export default class TextInputLines extends Component {
    constructor(props){
        super(props);
        this.state = {
            height: textHeight * 2,
            lines: this.props.numberOfLines,
            value: this.props.value
        }
    }


    componentWillReceiveProps (nextProps) {
        if (nextProps.value === '') {
            this.setState({
                height: textHeight * 2,
                lines: 10
            });
        }
    }

    render () {
        // const {style, value, placeholder, numberOfLines = 8, autoFocus = true} = this.props;

        return (
            <View>
                <Text>{this.props.numberOfLines} - {this.state.height}</Text>
                <TextInput
                    style={[this.props.style, { height: this.state.height }]}
                    multiline = {true}
                    numberOfLines={this.state.lines}
                    autoFocus={this.props.autoFocus}
                    value={this.state.value}
                    placeholder={this.props.placeholder}
                    onChangeText={(text) => this.setState({value: text})}
                    onContentSizeChange={(event) => {
                         const height = Platform.OS === 'ios'
                             ? event.nativeEvent.contentSize.height
                             : event.nativeEvent.contentSize.height
                         const lines = Math.round(height / textHeight)
                         const visibleLines = lines > this.props.numberOfLines ? lines : this.props.numberOfLines
                         // const visibleHeight = textHeight * (visibleLines + 1)
                        // const visibleHeight = height >
                         this.setState({ height: height, lines: visibleLines })
                    }}

                    // underlineColorAndroid='transparent'
                    textAlignVertical={'top'}
                />
            </View>
        )
    }
}

TextInputLines.propType = {
    numberOfLines: React.PropTypes.int,
    placeholder: React.PropTypes.string,
    value: React.PropTypes.string,
    autoFocus: React.PropTypes.boolean,
    style: React.PropTypes.object
}