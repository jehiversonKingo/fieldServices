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
import { getDebetAgent, getTransactionAgent, getWallerByUser } from "../../../services/bank.services";
import moment from "moment/moment";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height, fontScale } = Dimensions.get('window')
const CreditListScreen = ({ navigation }) => {
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
      <View style={{ justifyContent: "center" }}>
        <MaterialIcons
          name={item.typeTransaction === "Credit" ? "credit-card-plus" : "credit-card-minus"}
          color={item.typeTransaction === "Credit" ? colorsTheme.rojo20 : colorsTheme.azul}
          size={30}
        />
      </View>
      <View>
        <Text style={{ color: "#000", fontSize: 15, fontWeight: "600" }}>{item.typeTransaction === "Credit" ? "CREDITO" : "PAGO"}</Text>
        <Text style={{ fontWeight: "600", fontSize: 12 }}>{moment(item?.createdAt).format("DD/MM/YYYY")}</Text>
      </View>
      <View style={{ justifyContent: "center" }}>
        <Text
          style={{
            ...styles.bage,
            backgroundColor: item.typeTransaction === "Credit" ? colorsTheme.rojo20 : colorsTheme.azul
          }}>Q {parseFloat(item?.amount || 0).toFixed(2)}</Text>
      </View>
    </View>
  )

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
              <View>
                <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800" }}>{"Estado de cuenta"}</Text>
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600" }}>{`${dataUser?.user?.name} ${dataUser?.user?.lastName}`}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>{"Debe Pagar"}</Text>
                <Text style={{ color: "#FFF", fontSize: 25, fontWeight: "800" }}>Q {parseFloat(debetUser).toFixed(2)}</Text>
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>{"Reservado"}</Text>
                <Text style={{ color: "#FFF", fontSize: 25, fontWeight: "800" }}>Q {parseFloat(walletData?.wallet?.accountReservation || 0).toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 10 }}>
              <FlatList
                data={transactions}
                renderItem={RenderItem}
                contentContainerStyle={{ paddingBottom: height * 0.9 }}
                ListHeaderComponent={<Text style={{ color: "#000", fontSize: 20, paddingVertical: 10, fontWeight: "700" }}>{"Transacciones"}</Text>}
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
    marginTop: 5,
    padding: 10,
    flexDirection: "column",
    backgroundColor: colorsTheme.naranja,
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

export default CreditListScreen