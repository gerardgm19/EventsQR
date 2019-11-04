import React from 'react';
import { TextInput, Text, View, Button, Alert, TouchableOpacity, Image, KeyboardAvoidingView, StyleSheet} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Modal, { ModalContent, ModalButton, ModalFooter, SlideAnimation } from 'react-native-modals';


export default class ResetOptions extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center'
        }}>
        <Image style={{height:75, flex:0.95}} source={require('../assets/headerIcon.png')} />
      </View>
    ),
    headerStyle: {
      backgroundColor: '#072146',
      height: 150,
    },
    headerTintColor: '#fff'
  });
  state={
    ticket: '',
    error: true,
    alertAreYouSure: false,
    alertInfo: false,
    alertInfoText: "",
  };
  async _getServerFromAPI() {
    try {
      let response = await fetch('http://uranodata.net/getServidor.php?ticket='+this.state.ticket);
      let responseJson = await response.json();
      console.log(responseJson);
      if(responseJson.ok.trim() !== "error".trim()){
        //this.props.navigation.navigate('Scanner', {eventTicket: this.state.ticket, eventDom: responseJson.servidor, ctaupto: responseJson.ctaupto, eventTitle: responseJson.evento});
        this.setState({error: false, alertInfo: true, alertInfoText: "Ticket válido"});
      }else{
        this.setState({error: true});
      }
      return responseJson.movies;
    } catch (error) {
      console.error(error);
    }
  };
  async writeTXT(filename){
    let directory = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(directory, "Hello World\n", { encoding: FileSystem.EncodingType.UTF8 });
    console.log("Directory: " + directory);
  }
  async appendTXT(filename){
    let directory = FileSystem.documentDirectory + filename;
    let text = await this.readTXT(filename);
    await FileSystem.writeAsStringAsync(directory, text + "Hello World\n", { encoding: FileSystem.EncodingType.UTF8 });
    console.log("Directory: " + directory);
  }
  async readTXT(filename){
    let existence = await this.existFile(filename);
    let directory = FileSystem.documentDirectory + filename;
    if(existence){
      file = await FileSystem.readAsStringAsync(directory, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert("Your checkins", file);
      console.log(file);
      return file;
    }else{
      this.setState({alertInfo: true, alertInfoText: "No hay datos"});
      return "No exist";
    }
  }
  async deleteTXT(filename){
    let directory = FileSystem.documentDirectory + filename;
    let existence = await this.existFile(filename);
    if(existence){
      await FileSystem.deleteAsync(directory);
      this.setState({alertInfo: true, alertInfoText: "Reset completado"});
    }else{
      this.setState({alertInfo: true, alertInfoText: "No hay datos"});
    }
  }
  async existFile(filename){
    let directory = FileSystem.documentDirectory + filename;
    let infoFile = await FileSystem.getInfoAsync(directory);
    return infoFile.exists;
  }
  async componentDidMount() {
  }
  render() {
    //const {navigate} = this.props.navigation;
      return (
        <KeyboardAvoidingView style={{
          flex: 1,
          padding: 30,
          paddingBottom: 0,
          justifyContent: 'center',
          backgroundColor: '#072146',
          flexDirection: "column"}} behavior="padding" enabled>
            <View style={{paddingBottom: 20}}>
              <Text style={styles.infoText}>Introduce tiquet y valida</Text>
              {/* <Image
                style={{
                  width: 300,
                  height: 90,
                  resizeMode: "stretch"
                }}
                source={require('../assets/headerIcon.png')}/> */}
            </View>
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
            <View style={{
              flexDirection: "column",
              paddingBottom: 20}}>
              {/* <Button
                style={{margin:20}}
                onPress={()=>this.writeTXT(this.state.ticket.toLowerCase() + ".csv")}
                title="Write txt"
              />
              <Button
                style={{margin:20}}
                onPress={()=>this.appendTXT(this.state.ticket.toLowerCase() + ".csv")}
                title="Append txt"
              /> */}
            
              <Button
                disabled={this.state.error}
                onPress={()=>this.readTXT(this.state.ticket.toLowerCase() + ".csv")}
                title="Mostrar datos"
              />
              <View style={{height:10}}></View>
              <Button
                disabled={this.state.error}
                onPress={()=>{
                  this.setState({alertAreYouSure: true});
                }}
                title="Eliminar datos"
              />
            </View>
            <Modal
              visible={this.state.alertAreYouSure}
              onTouchOutside={ () => {this.setState({alertAreYouSure: false})} }
              modalAnimation={new SlideAnimation({
                slideFrom: 'bottom',
              })}
              footer={
                <ModalFooter>
                  <ModalButton
                    text="Si"
                    onPress={() => {
                      this.setState({alertAreYouSure: false});
                      this.deleteTXT(this.state.ticket.toLowerCase()+".csv")} }
                  />
                  <ModalButton
                    text="No"
                    onPress={() => {this.setState({alertAreYouSure: false})} }
                  />
                </ModalFooter>
              }
            >
              <ModalContent>
                <View style={{
                  flexDirection: 'column',
                  margin: 10,
                  maxWidth: 300,
                  justifyContent: 'center',
                }}>
                  <View style={{
                    flexDirection: 'column',
                  }}>
                    <Text style={styles.modalTitle}>¿Estas seguro?</Text>
                  </View>
                </View>
              </ModalContent>
            </Modal>
            <Modal
              visible={this.state.alertInfo}
              onTouchOutside={ () => {this.setState({alertInfo: false})} }
              modalAnimation={new SlideAnimation({
                slideFrom: 'bottom',
              })}
              footer={
                <ModalFooter>
                  <ModalButton
                    text="Ok"
                    onPress={() => {this.setState({alertInfo: false})} }
                  />
                </ModalFooter>
              }
            >
              <ModalContent>
                <View style={{
                  flexDirection: 'column',
                  margin: 10,
                  maxWidth: 300,
                  justifyContent: 'center',
                }}>
                  <View style={{
                    flexDirection: 'column',
                  }}>
                    <Text style={styles.modalTitle}>{this.state.alertInfoText}</Text>
                  </View>
                </View>
              </ModalContent>
            </Modal>
        </KeyboardAvoidingView>
        
      );
  }
}
const styles = StyleSheet.create({
  modalTitle: {
    color: '#072146',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
    textAlign: 'center',
  },
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
    borderColor: '#090',
    borderWidth: 2,
    flex: 5,
    padding: 10,
    fontFamily: 'maven-pro-regular',},
  noneTicket: {height: 50,
    color: '#111',
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 5,
    padding: 10,
    fontFamily: 'maven-pro-regular',},
  infoText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'maven-pro-bold',
  },
})