
import React, {Component} from 'react';
import Menu from './Menu';

export default class MenuWrap extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu {...this.props}/>
        );
    }
}
