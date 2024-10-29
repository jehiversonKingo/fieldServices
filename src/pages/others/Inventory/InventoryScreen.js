import React, { useEffect, useState, useContext } from 'react';
import {View, FlatList, Dimensions, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';

//Components
import Header from '../../../components/Layouts/Header';

import {updateStep, getStep} from '../../../functions/fncSqlite';
import {getListEquipment, getListAddon} from '../../../services/inventory.services';
import {colorsTheme} from '../../../configurations/configStyle';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {Context as AuthContext} from '../../../context/AuthContext';
import moment from 'moment';

const {width, height} = Dimensions.get('screen');

const InventoryScreen = ({navigation}) => {
    const [kingos, setKingo] = useState([]);
    const [addon, setAddon] = useState([]);
    const [active, setActive] = useState(0);
    const [data, setData] = useState([]);
    const [filterTxt, setFilterTxt] = useState("");
    const [loading, setLoading] = useState(true);

    const {state} = useContext(AuthContext);
    const {inline} = state;

    const getAllDataInventory = async () => {
      let getAddon = [];
      let getKingo = [];
        if(inline){
          console.log('*1*');
          let inventory = await getListAddon();
          getAddon = [];
          getKingo = [];
          if (inventory) {
            getAddon = inventory?.addons || [];
            getKingo = inventory?.equipments || [];
          }

          await updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0);
          await updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0);
        }else{
          let dataKingos = await getStep('warehouseEquipment',0,0);
          let dataAddons = await getStep('warehouseAddon',0,0);
          getAddon = JSON.parse(dataAddons);
          getKingo = JSON.parse(dataKingos);
        }
        setKingo(getKingo);
        setAddon(getAddon);
        setData(getKingo);
        setLoading(false);
    };

    const handleFilter = (value = "") => {
      console.log("[ VALUE ]", value.toLowerCase());
      setFilterTxt(value)
      let dataFilter = []
      const regexPattern = new RegExp(value.toLowerCase(), "g");
      if (active == 0) {
        dataFilter = kingos.filter((item => item.barcode.toLowerCase().match(regexPattern) || item.equipment.equipmentModel.name.toLowerCase().match(regexPattern)))
      } else {
        dataFilter = addon.filter((item => item.barcode.toLowerCase().match(regexPattern) || item.addon.name.toLowerCase().match(regexPattern)))
      }
      if (dataFilter.length > 0) {
        setData(dataFilter)
      } else {
        if (active == 0) {
          setData(kingos)
        } else setData(addon)
      }
    }

    useEffect(()=>{
        getAllDataInventory();
    },[]);

    const AddonsWarehouse = ({item, index}) => {
      return (
        <View
          style={{
            margin:5,
            padding: 15,
            borderRadius:10,
            borderLeftColor: colorsTheme.naranja60,
            borderLeftWidth: 5,
            backgroundColor: colorsTheme.blanco,
            shadowColor: colorsTheme.gris80,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 6,
          }}
          key={`A-${index}`}>
          <View key={`B-${index}`} style={{flexDirection: 'row'}}>
            <View key={`C-${index}`}>
              <Text key={`D-${index}`} style={{fontSize: 14, fontWeight: '400', color: colorsTheme.negro}}>
                {(item.equipment ? item.equipment.equipmentModel.name : 'Addon: ' + item.addon.name)}
              </Text>
              <Text style={{fontSize: 18, fontWeight: '500', color: colorsTheme.negro}}>
                {`Barcode: ${item.barcode}`}
              </Text>
              <Text style={{fontSize: 14, fontWeight: '400', color: colorsTheme.negro}}>
                {moment(item?.createdAt).format("DD-MM-YYYY HH:MM A")}
              </Text>
            </View>
          </View>
        </View>
      );
    };

    const ListInventory = () => (
      <FlatList
        key={'FlatList-2'}
        data={data}
        renderItem={AddonsWarehouse}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // contentContainerStyle={{margin:20, paddingBottom: 25, backgroundColor: 'yellow'}}
        style={{margin:20, marginBottom: height * 0.3}}
        ListHeaderComponent={
        <View
            style={{
            backgroundColor: colorsTheme.naranja,
            padding: 10,
            alignItems: 'center',
            }}>
            <Text style={{color: colorsTheme.blanco}}>Inventario ({data.length})</Text>
        </View>
        }
        ListEmptyComponent={
        <View
            style={{
            backgroundColor: colorsTheme.gris80,
            width: width,
            padding: 10,
            alignContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            }}>
            <Text style={{color: colorsTheme.blanco}}>
            No se han escaneado equipos.
            </Text>
        </View>
        }
      />
    );

  return (
    <View>
        <Header
        isLeft={true}
        navigation={navigation}
        title={'Listado De Inventario'}
      />
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 0 ? colorsTheme.amarillo:colorsTheme.naranja
          }}
          onPress={() => {
            setActive(0)
            setData(kingos)
          }}>
          <Text style={{color: colorsTheme.blanco}}>Kingos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.buttonTab,
            borderBottomWidth: 3,
            borderBottomColor: active === 1 ? colorsTheme.amarillo:colorsTheme.naranja
          }}
          onPress={() => {
            setActive(1)
            setData(addon)
          }}>
          <Text style={{color: colorsTheme.blanco}}>Addons</Text>
        </TouchableOpacity>
      </View>
      {loading ?
        (
          <View style={{justifyContent: 'center', alignItems: 'center', height:height * 0.5}}>
            <ActivityIndicator size="large" color={colorsTheme.naranja}/>
          </View>
        ) : (
          <>
            <View style={{marginHorizontal: 30, marginTop: 20, flexDirection: "row"}}>
              <TextInput
                value={filterTxt}
                onChangeText={(text) => handleFilter(text)}
                style={{...styles.inputForm}}
                placeholder='Buscador'
                placeholderTextColor={colorsTheme.gris80}
              />
              <TouchableOpacity style={{justifyContent: "center", marginHorizontal: 10}}>
                <FontAwesome5
                  name={"search"}
                  color={colorsTheme.naranja}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            <ListInventory />
          </>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTab: {
    backgroundColor: colorsTheme.naranja,
    flex: 1,
    height: height * 0.06,
    paddingTop: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonTabActive: {
    borderWidth: 1,
    borderColor: colorsTheme.blanco,
  },
  colorText: {
    color: colorsTheme.gris80,
  },
  inputForm: {
    fontSize: 17,
    color: colorsTheme.negro,
    flex: 1,
    marginBottom: 10,
    backgroundColor: colorsTheme.gris20,
    borderRadius: 10,
  },
});

export default InventoryScreen;
