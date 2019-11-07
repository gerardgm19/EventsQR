import * as React from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Sharing from 'expo-sharing';

import Modal, { ModalContent, ModalButton, ModalFooter, SlideAnimation } from 'react-native-modals';

export default class BarcodeScannerExample extends React.Component {
  static navigationOptions =({ navigation }) => ({
    headerTitle: (
      <View style={{flexDirection: 'row'}}>
        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.headerTitle}>Event: </Text><Text style={styles.headerText}>{navigation.state.params.eventTitle}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.headerTitle}>Ticket: </Text><Text style={styles.headerText}>{navigation.state.params.eventTicket}</Text>
          </View>
        </View>
      </View>
    ),
    headerRight: (
      <Button
        onPress={navigation.getParam('_onShare')}
        title="Share"
        color="#28aece"
      />
    ),
    headerStyle: {
      backgroundColor: '#072146',
      height: 100,
    },
    headerTintColor: '#fff'
  });
  state = {
    hasCameraPermission: null,
    scanned: false,
    ticket: '',
    ctaupto: '',
    domini: '',
    codeScanned: '',
    eventTitle: '',
    alertSuccessVisible: false,
    alertErrorVisible: false,
    scannedUsername: "",
    scannedID: null,
    scannedUserInfo: null,
    scannednCheckins: "",
    errorMsg: "",
  };
  async componentDidMount() {
    this.props.navigation.setParams({ _onShare: this.onShare , _readTXT: this.readTXT}); //Per a utilitzar la funcio desde el header
    const itemID = this.props.navigation.getParam('eventTicket', 'NoTicket');
    const ctaupto = this.props.navigation.getParam('ctaupto', 'null');
    const domini = this.props.navigation.getParam('eventDom', 'null');
    const title = this.props.navigation.getParam('eventTitle', 'null');
    this.getPermissionsAsync();
    if(this.state.ticket === '') {
      this.setState({ticket: itemID, ctaupto: ctaupto, domini: domini, eventTitle: title});
    }
  }
  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  getDataFromJSONtoTXT(objectJson){
    let userInfo = objectJson.formulario;
    let strinfo = "";
    for(let elem in userInfo){
      strinfo += userInfo[elem].campo + ": "+ userInfo[elem].valor + "\n";
    }
    return strinfo;
  }
  getDataFromJSON(objectJson){
    let userInfo = objectJson.formulario;
    return userInfo;
  }
  getKeysAsString(variable){
    //ID;ATRIBUTOS;CHECKIN;
    let titles = "ID;";
    variable.map((elem) => {
      titles += elem.campo + ";";
    });
    titles += "Check-in;\n";
    return titles;
  }
  async makeCheckIn(data){
    let filename = this.state.ticket.toLowerCase() + ".csv"
    try {
      let url = 'http://'+this.state.domini+'/getCheckin.php?ctaupto='+this.state.ctaupto+'&codigo='+data;
      let response = await fetch(url);
      let responseJson = await response.json();
      console.log("Call to: "+url);
      console.log("Response ", responseJson);
      let infoUser = this.getDataFromJSON(responseJson);
      if (responseJson.ok.trim() ===  "ok".trim()){
        let n = responseJson.conexion.checkin;
        if(n === "no"){
          //Procesar dato para mostrar adecuadamente
          n = "1";
        }
        this.setState({scannedUsername: responseJson.formulario[0].valor, scannedID: data, scannedUserInfo: infoUser, scannednCheckins: n, alertSuccessVisible: true})
        await this.appendTXT(filename, infoUser, n);
        //Alert.alert(responseJson.formulario[0].valor+" Primera entrada","ID: "+data+" existe\n"+infoUser,[{text: 'OK', onPress: () => this.setState({ scanned: false })}]);
        //Alert.alert(responseJson.formulario[0].valor+" (Nº entrada: "+responseJson.conexion.checkin.trim()+")","ID: "+data+" existe\n"+infoUser,[{text: 'OK', onPress: () => this.setState({ scanned: false })}]);
      }else{
        //Alert.alert("Check-in info ERROR","Code: "+data+"\nERROR: "+responseJson.msgError,[{text: 'OK', onPress: () => this.setState({ scanned: false })}]);
        this.setState({alertErrorVisible: true});
      }
      return responseJson;
    } catch (error) {
      Alert.alert("QR no válido", "Error en el formato");
      console.error("ERROR", error);
    }
    //Info json: "CTAUPTO: "+this.state.ctaupto+"\nDOMINI: "+this.state.domini+"\n"
  }
  async initTXT(filename, text){
    let directory = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(directory, text, { encoding: FileSystem.EncodingType.UTF8 });
  }
  async readTXT(filename){
    let directory = FileSystem.documentDirectory + filename;
    let file = await FileSystem.readAsStringAsync(directory, { encoding: FileSystem.EncodingType.UTF8 });
    return file;
  }
  async appendTXT(filename, infoUser, n){
    let directory = FileSystem.documentDirectory + filename;
    //Check if the file exists, either create it with titles. Ex: Nombre,Edad,DNI,
    let infoFile = await FileSystem.getInfoAsync(directory);
    if(!infoFile.exists){
      console.log("Creando documento");
      let titles = this.getKeysAsString(infoUser);
      this.initTXT(filename, titles);
    }
    //Append new checkin to file. ID;ATRIBUTOS;CHECKIN
    let text = await this.readTXT(filename);
    let val;
    let infoTXT = this.state.scannedID+";";
    infoUser.map((elem) => {
      if (elem.valor === ""){
        val = "null";
      }else{
        val = elem.valor;
      }
      infoTXT += val + ";";
    });
    //Añadir nº checkins
    infoTXT += n + ";";
    await FileSystem.writeAsStringAsync(directory, text + infoTXT + "\n", { encoding: FileSystem.EncodingType.UTF8 });
  }
  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true , codeScanned: data});
    let response = this.makeCheckIn(data);
    //alert(`Bar code with type ${type} and data ${data} has been scanned for the event: ${this.state.ticket}!\n${this.state.ctaupto}\n${this.state.domini}`);
  }
  onShare = async () => { //Al ser cridat desde el header el declaro aixi perque sino pasen coses rares
    let filename = this.state.ticket.toLowerCase() + ".csv";
    let directory = FileSystem.documentDirectory + filename;
    Sharing.shareAsync(directory);
  }
  render() {
    const { hasCameraPermission, scanned } = this.state;
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Modal
          visible={this.state.alertSuccessVisible}
          onTouchOutside={ () => {this.setState({alertSuccessVisible: false})} }
          modalAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          footer={
            <ModalFooter>
              <ModalButton
                text="OK"
                onPress={() => {this.setState({alertSuccessVisible: false})} }
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
                <Text style={styles.modalTitle}>{this.state.scannedUsername}</Text>
                <View style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                  <Text style={styles.modalCheckTitle}>CHECK-IN:<Text style={styles.modalCheckText}>{this.state.scannednCheckins}</Text></Text>
                </View>
              </View>
              {this.state.scannedUserInfo !== null && this.state.scannedUserInfo.map((elem) => {
                if(elem.campo.trim() === "Nombre"){
                  return null;
                }
                return(
                  <View key={elem.numero} style={{
                    flexDirection: 'row',
                  }}>
                    <Text style={styles.modalInfoTitle}>{elem.campo}:<Text style={styles.modalInfoText}>{elem.valor}</Text></Text>
                  </View>
                );
              })}
            </View>
          </ModalContent>
        </Modal>
        
        <Modal
          visible={this.state.alertErrorVisible}
          onTouchOutside={ () => {this.setState({alertErrorVisible: false})} }
          modalAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          footer={
            <ModalFooter>
              <ModalButton
                text="OK"
                onPress={() => {this.setState({alertErrorVisible: false})} }
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
                <Text style={styles.modalTitleError}>Registro</Text>
                <Text style={styles.modalTitleError}>inexistente</Text>
                <Text style={styles.modalTitleError}>para este evento</Text>
              </View>
            </View>
          </ModalContent>
        </Modal>
        {this.state.scanned && !this.state.alertErrorVisible && !this.state.alertSuccessVisible &&
          <TouchableOpacity onPress={() => this.setState({ scanned: false })} style={styles.scanAgainButton}>
            <Text style={styles.textButton}>Tap to scan again</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    color: '#28aece',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
  },
  headerText: {
    color: '#fff',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
  },
  modalTitle: {
    color: '#072146',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
    textAlign: 'center',
  },
  modalTitleError: {
    color: '#990000',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
  },
  modalCheckTitle: {
    color: '#072146',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
  },
  modalCheckText: {
    color: '#28aece',
    fontSize: 25,
    fontFamily: 'maven-pro-bold',
  },
  modalInfoTitle: {
    color: '#28aece',
    fontSize: 15,
    fontFamily: 'maven-pro-bold',
  },
  modalInfoText: {
    color: '#072146',
    fontSize: 15,
    fontFamily: 'maven-pro-bold',
  },
  scanAgainButton:{
    height: 50,
    backgroundColor: '#28aece',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton:{
    color: 'white',
    textTransform: 'uppercase',
    fontSize: 20,
    fontWeight: 'bold',
  }
});