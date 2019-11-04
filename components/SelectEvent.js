import React from 'react';
import { TextInput, Text, View, Button, Alert, TouchableOpacity, Image, KeyboardAvoidingView, StyleSheet} from 'react-native';
import * as Font from 'expo-font';


export default class SelectEvent extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center'
        }}>
        <Image style={{height:80, flex:0.9}} source={require('../assets/headerIcon.png')} />
      </View>
    ),
    headerStyle: {
      backgroundColor: '#072146',
      height: 150,
    },
  });
  state={
    ticket: '',
    error: false,
    fontLoaded: false,
  };
  async _getServerFromAPI() {
    try {
      let response = await fetch('http://uranodata.net/getServidor.php?ticket='+this.state.ticket);
      let responseJson = await response.json();
      console.log(responseJson);
      if(responseJson.ok.trim() !== "error".trim()){
        this.props.navigation.navigate('Scanner', {eventTicket: this.state.ticket, eventDom: responseJson.servidor, ctaupto: responseJson.ctaupto, eventTitle: responseJson.evento});
        this.setState({error: false});
      }else{
        this.setState({error: true});
      }
      return responseJson.movies;
    } catch (error) {
      console.error(error);
    }
  };
  async _getFAKEServerFromAPI() {
    try {
      let response = await fetch('http://uranodata.net/getServidor.php?ticket=you13');
      let responseJson = await response.json();
      console.log(responseJson.servidor);
      console.log(responseJson.ctaupto);
      this.props.navigation.navigate('Scanner', {eventTicket: 'you13', eventDom: responseJson.servidor, ctaupto: responseJson.ctaupto});
      return responseJson.movies;
    } catch (error) {
      console.error(error);
    }
  }
  goToResetOptions(){
    this.props.navigation.navigate('Reset');
  }
  async componentDidMount() {
    await Font.loadAsync({
      'maven-pro-regular': require('../assets/fonts/MavenPro-Regular.ttf'),
      'maven-pro-bold': require('../assets/fonts/MavenPro-Bold.ttf'),
    });
    this.setState({fontLoaded: true})
  }
  render() {
    //const {navigate} = this.props.navigation;
    if(this.state.fontLoaded){
      return (
        <KeyboardAvoidingView style={{
          flex: 1,
          padding: 30,
          justifyContent: 'center',
          backgroundColor: '#072146',
          flexDirection: "column"}} behavior="padding" enabled>
            {/* <View
              style={{
                paddingBottom: 50
                }}>
               <Image
                style={{
                  width: 300,
                  height: 90,
                  resizeMode: "stretch"
                }}
                source={require('../assets/headerIcon.png')}/>
            </View> */}
            <View style={{
              flexDirection: "row",
              paddingBottom: 20}}>
              <TextInput
                style={[this.state.error ? styles.invalidTicket : styles.validTicket]}
                placeholder="Event ticket"
                onChangeText={(text) => this.setState({ticket: text})}
              />
              <TouchableOpacity style={{
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center'}} activeOpacity={0.5} onPress={()=>this._getServerFromAPI()}>
                <Image
                  source={require('../assets/tic.png')}
                  style={{
                    padding: 5,
                    margin: 5,
                    height: 40,
                    width: 40,
                    resizeMode: 'stretch',}}
                />
              </TouchableOpacity>
            </View>
            <Button
              style={{margin:20}}
              onPress={()=>this.goToResetOptions()}
              title="Reset options"
            />
        </KeyboardAvoidingView>
      );
    }else{
      return (
        <View style={{
          flexDirection: "row",
        }}>
          <Text>
            Loading
          </Text>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  invalidTicket: {height: 50,
    color: '#111',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#900',
    borderWidth: 2,
    flex: 5,
    padding: 10,
    fontFamily: 'maven-pro-regular',},
  validTicket: {height: 50,
    color: '#111',
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 5,
    padding: 10,
    fontFamily: 'maven-pro-regular',}
})