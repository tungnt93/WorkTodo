import React, {Component} from 'react';
import {AdMobBanner} from 'react-native-admob';

export default class Admob extends Component{
    render(){
        return(
            <AdMobBanner
                bannerSize="fullBanner"
                adUnitID="ca-app-pub-3990006735413383/1189127394"
                testDeviceID=""
                didFailToReceiveAdWithError={this.bannerError} />
        )
    }
}