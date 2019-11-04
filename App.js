import React from 'react';
import BarcodeScannerExample from './components/BarCodeExpo';
import SelectEvent from './components/SelectEvent';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import ResetOptions from './components/ResetOptions';

const MainNavigator = createStackNavigator({
      Home: SelectEvent,
      Scanner: BarcodeScannerExample,
      Reset: ResetOptions
    },
    // {
    //   initialRouteName: "Home"
    // }
    );

const App = createAppContainer(MainNavigator);

export default App;
