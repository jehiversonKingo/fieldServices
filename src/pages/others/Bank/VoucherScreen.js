import { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from "react-native"
import Header from "../../../components/Layouts/Header"
import { colorsTheme } from "../../../configurations/configStyle"
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FitImage from "react-native-fit-image";
import SelectDropdown from 'react-native-select-dropdown';
import { getAllBanks } from "../../../services/settings.services";
import AwesomeAlert from "react-native-awesome-alerts";
import { handleUpdateImage, handleUpdateImageVoucher } from "../../../functions/fncFirebase";
import { setVoucher } from "../../../services/bank.services";

const {width, fontScale} = Dimensions.get('window')
const VoucherScreen = ({navigation}) => {
    const [photo, setPhoto] = useState();
    const [selectedBank, setSelectedBank] = useState(null);
    const [banks, setBanks] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [closeAlert, setCloseAlert] = useState(true);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const isPhotoTaken = !!photo;

    const getListBanks = async () => {
      try {
        setBanks({value: null, label: "Cargando..."});
        const data = await getAllBanks();
        let listBanks = []
        if(data){
            
            data.map(bank => {
                console.log({value:bank.idBank, label:`${bank.name}-${bank.account}`})
                listBanks.push({value:bank.idBank, label:`${bank.name}-${bank.account}`})
            })
            setBanks([{value: null, label: "Seleccione un banco"}, ...listBanks]);
        } else setBanks(null)
      } catch (error) {
        console.log(error)
      }
    }

    const handleConfirmation = () => {
      setTitleAlert("Confirmar Envío")
      setMessageAlert("¿Está seguro de que desea enviar esta boleta?")
      setShowProgress(false)
      setCloseAlert(false)
      setShowButtons(true)
      setShowAlert(true)
    };

    const handleClickSave = async () => {
      setShowAlert(false)
      setShowProgress(true)
      setShowButtons(false)
      setCloseAlert(false)
      setTitleAlert("Cargando...")
      setMessageAlert("")
      setShowAlert(true)

      let url = await handleUpdateImageVoucher(Math.random(), 'agents', photo);
      try {
          const result = await setVoucher({idBank: selectedBank, photo: url})
          if (result.status === "OK") {
            setTitleAlert("Proceso terminado")
            setMessageAlert("La boleta fue envíada exitosamente")
            setShowProgress(false)
            setCloseAlert(true)
            setShowButtons(false)
            setShowAlert(true)
            setTimeout(() => {
              navigation.goBack()
            }, 1500);
          } else {
            setTitleAlert("¡Atención!")
            setMessageAlert("La boleta no se pudo enviar, intentalo de nuevo")
            setShowProgress(false)
            setCloseAlert(true)
            setShowButtons(false)
            setShowAlert(true)
          }
      } catch (error) {
        console.log("VAOUCHER AGENT ERROR ======>", error)
        setTitleAlert("¡Atención!")
        setMessageAlert("Algo salio mal")
        setShowProgress(false)
        setCloseAlert(true)
        setShowButtons(false)
        setShowAlert(true)
      }
    }

    useEffect(() => {
      getListBanks()
    }, [])

    return (
      <SafeAreaView>
        <Header isLeft={true} navigation={navigation} />
        <View style={{alignItems: "center", justifyContent: 'center'}}>
            {
                photo ? (
                    <View style={{alignItems: "center"}}>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("Camera", {index: 0, setData: setPhoto, data: photo})}
                          style={styles.buttons}
                        >
                            <Text style={{color: colorsTheme.naranja}}>
                                <FontAwesome5 name="camera" size={15} /> {"Cambiar foto del voucher"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("ImageFullScreen", {index: 0, photos: [{url: `file://${photo.path}`}]})}
                          style={{alignItems: "center"}}
                        >
                            <FitImage
                                indicator={true}
                                indicatorColor={colorsTheme.naranja}
                                indicatorSize="large"
                                source={{ uri: `file://${photo.path}` }}
                                resizeMode="contain"
                                style={{ width: 300, height: 400 }}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Camera", {index: 0, setData: setPhoto, data: photo})}
                      style={styles.buttons}
                    >
                        <Text style={{color: colorsTheme.naranja}}>
                            <FontAwesome5 name="camera" size={15} /> {"Tomar una foto del voucher"}
                        </Text>
                    </TouchableOpacity>
                )
            }
        </View>
        {
          isPhotoTaken && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{color: colorsTheme.naranja80, fontWeight: "700" }}>
                    {"Seleccione el banco donde realizo el deposito"}
                </Text>
                <SelectDropdown
                    data={banks}
                    onSelect={(selectedItem, index) => {
                      setSelectedBank(selectedItem.value);
                    }}
                    defaultButtonText={"Seleccione un banco"}
                    buttonStyle={{
                      backgroundColor: colorsTheme.blanco,
                      borderWidth: 1,
                      borderColor: colorsTheme.naranja,
                      borderRadius: 8,
                      marginTop: 10,
                      width: width * 0.8,
                    }}
                    buttonTextStyle={{ color: colorsTheme.naranja }}
                    renderDropdownIcon={() => (
                      <FontAwesome5
                        name='chevron-down'
                        size={16}
                        color={colorsTheme.naranja}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    dropdownStyle={{
                      backgroundColor: colorsTheme.blanco,
                      borderWidth: 1,
                      borderColor: colorsTheme.naranja,
                      borderRadius: 8,
                      marginTop: 10,
                      width: width * 0.8,
                    }}
                    rowStyle={{
                      backgroundColor: colorsTheme.blanco,
                    }}
                    rowTextStyle={{ color: colorsTheme.naranja }}
                    rowTextForSelection={(item, index) => {
                      return item.label;
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.label;
                    }}
                />
            </View>
          )
        }
        {
          selectedBank && (
            <View style={{marginTop: 20, alignItems: 'center'}}>
              <TouchableOpacity
                onPress={handleConfirmation}
                style={{
                  backgroundColor: colorsTheme.blanco,
                  borderWidth: 1,
                  borderColor: colorsTheme.naranja,
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 10,
                  width: width * 0.6
                }} >
                  <Text style={{
                    color: colorsTheme.naranja,
                    textAlign: "center",
                    fontSize: fontScale * 18
                  }}>{"Confirmar"}</Text>
                </TouchableOpacity>
            </View>
          )
        }

        <AwesomeAlert
          show={showAlert}
          onDismiss={() => setShowAlert(false)}
          title={titleAlert}
          message={messageAlert}
          showProgress={showProgress}
          closeOnTouchOutside={closeAlert}
          closeOnHardwareBackPress={closeAlert}
          showCancelButton={showButtons}
          showConfirmButton={showButtons}
          confirmText="Sí"
          cancelText="No"
          confirmButtonStyle={{width: 100, alignItems: "center"}}
          cancelButtonStyle={{width: 100, alignItems: "center"}}
          confirmButtonColor={colorsTheme.verdeClaro}
          cancelButtonColor={colorsTheme.rojo}
          onConfirmPressed={handleClickSave}
          onCancelPressed={() => setShowAlert(false)}
        />
        
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    buttons: {
        height: 45,
        width: width * 0.5,
        backgroundColor: colorsTheme.blanco,
        color: colorsTheme.negro,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 10,
        borderWidth: 1,
        borderColor: colorsTheme.naranja,
        borderRadius: 8,
        marginBottom:15
    }
})

export default VoucherScreen