import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator
} from "react-native"
import Header from "../../../components/Layouts/Header"
import { colorsTheme } from "../../../configurations/configStyle";
import { getDataUser } from "../../../functions/fncGeneral";
import { getDebetAgent, getTransactionAgent, getWallerByUser } from "../../../services/sales.services";
import moment from "moment/moment";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height, fontScale } = Dimensions.get('window')
const AccountStatus = ({ navigation }) => {
  const [dataUser, setDataUser] = useState(null)
  const [debetUser, setDebetUser] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const user = await getDataUser();
      const reqTransactions = await getTransactionAgent();
      const reqDebet = await getDebetAgent();
      const wallet = await getWallerByUser();
      console.log("[ WALLET ] >>", wallet);
      setDataUser(user)

      if (reqTransactions) {
        console.log("[ TRANSACTIONS ] => ", reqTransactions);
        setTransactions(reqTransactions)
      }
      if (reqDebet) {
        setDebetUser(reqDebet.amount)
      }

      if (wallet) {
        setWalletData(wallet)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const RenderItem = ({ item }) => (
    <View key={item.idTransactionUser} style={styles.renderItem}>

      <View style={{ flexDirection:"row"}}>
        <View style={{ justifyContent: "center", marginRight: 15 }}>
          <MaterialIcons
            name={item.typeTransaction === "Credit" ? "credit-card-plus" : "credit-card-minus"}
            color={item.typeTransaction === "Credit" ? colorsTheme.rojo20 : colorsTheme.azul}
            size={30}
          />
        </View>
      
        <View style={{ alignItems:"flex-start"}}>
          <Text style={{ color: "#000", fontSize: 15, fontWeight: "600" }}>{item.typeTransaction === "Credit" ? "CREDITO" : "PAGO"}</Text>
          <Text style={{ color: colorsTheme.gris60, fontWeight: "600", fontSize: 12 }}>{moment(item?.createdAt).format("DD/MM/YYYY")}</Text>
        </View>
        </View>
        <View style={{ justifyContent: "center" }}>
          <Text
            style={{
              ...styles.bage,
              color: item.typeTransaction === "Credit" ? colorsTheme.rojo20 : colorsTheme.azul
            }}>{parseFloat(item?.amount || 0).toLocaleString('en-US', optionsCurrency)}</Text>
        </View>
    </View>
  )

  const optionsCurrency = {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  };

  useEffect(() => {
    getData()
  }, [])

  return (
    <SafeAreaView>
      <Header isLeft={true} navigation={navigation} />
      {
        loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.5 }}>
            <ActivityIndicator size="large" color={colorsTheme.naranja} />
          </View>
        ) : (
          <>
            <View style={styles.cardDebet}>
              <View style={{ marginBottom: 10, alignItems:"center"}}>
                <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800" }}>{"Estado de cuenta"}</Text>
                <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "600" }}>{`${dataUser?.user?.name} ${dataUser?.user?.lastName}`}</Text>
              </View>
              <View style={{ flexDirection:"row", alignContent:"space-between", alignItems:"" }}>
                <View style={{ flex: 1 }} >
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>{"Debe Pagar"}</Text>
                <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800" }}>{parseFloat(debetUser).toLocaleString('en-US', optionsCurrency)}</Text>
                </View>
                <View style={{ flex: 1, alignItems:"flex-end" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>{"Reservado"}</Text>
                <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800" }}>{parseFloat(walletData?.wallet?.accountReservation || 0).toLocaleString('en-US', optionsCurrency)}</Text>
                </View>
              </View>
            </View>
            <View style={{ paddingHorizontal: 10 }}>
              <FlatList
                data={transactions}
                renderItem={RenderItem}
                contentContainerStyle={{ paddingBottom: height * 0.9 }}
                ListHeaderComponent={
                  <View style={{ backgroundColor: colorsTheme.naranja, paddingVertical: 10, alignItems: "center" }}>
                    <Text style={{ color: colorsTheme.blanco, fontSize: 20, fontWeight: "700" }}>{"Transacciones"}</Text>
                  </View>
                  }
                ListEmptyComponent={<Text style={{ fontSize: 18, fontWeight: "500", textAlign: "center" }}>{"No se encontraron transacciones"}</Text>}
              />
            </View>
          </>
        )
      }
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
    marginBottom: 15
  },
  cardDebet: {
    padding: 10,
    flexDirection: "column",
    backgroundColor: colorsTheme.naranja,
    margin: 10,
    paddingHorizontal: 25
  },
  renderItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    // marginVertical: 5,
    paddingVertical: 10,
    borderBottomColor: colorsTheme.gris20,
    borderBottomWidth: 1
  },
  bage: {
    color: "#FFF",
    paddingHorizontal: 20,
    borderRadius: 10,
  }
})

export default AccountStatus