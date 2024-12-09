import React, { Fragment } from "react";
import { ActivityIndicator, StyleSheet, Text, View, FlatList } from "react-native";
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import moment from "moment";

import { colorsTheme } from "../../../configurations/configStyle";
import { TouchableOpacity } from "react-native-gesture-handler";

const TaskInfoScreen = ({data, isLoading}) => {
    console.log("[-data-]", data);
  return (
      <Fragment>
        <Text style={{
            color: colorsTheme.naranja,
            textAlign: "center",
            fontWeight: "700",
            fontSize: 20
        }}> {"Información general"}</Text>

        {
            isLoading ? (
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={colorsTheme.naranja}/>
                </View>
            ) : (
                <Fragment>
                    
                    <View style={{...styles.container.background, flexDirection:'row'}}>
                       <TouchableOpacity style={{ justifyContent:'center', alignContent:'center', alignItems:'center' }}>
                            <AntDesignIcon name={"caretright"} color={colorsTheme.verdeFuerte} size={30} />
                            <Text style={{ color:colorsTheme.negro}}> Iniciar Camino </Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={{ justifyContent:'center', alignContent:'center', alignItems:'center' }}>
                            <AntDesignIcon name={"close"} color={colorsTheme.rojo} size={30} />
                            <Text style={{ color:colorsTheme.negro}}> Cancelar </Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={{ justifyContent:'center', alignContent:'center', alignItems:'center' }}>
                            <IoniconsIcon name={"location"} color={colorsTheme.azul} size={30} />
                            <Text style={{ color:colorsTheme.negro}}> Llegada a sitio </Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={{ justifyContent:'center', alignContent:'center', alignItems:'center' }}>
                            <IoniconsIcon name={"log-in-outline"} color={colorsTheme.rojo} size={30} />
                            <Text style={{ color:colorsTheme.negro}}> Salida del sitio</Text>
                       </TouchableOpacity>
                    </View>

                    <View style={{...styles.container.background}}>
                        <Text style={{color: colorsTheme.gris80}}>   
                            <Text style={{color: colorsTheme.naranja80, fontWeight: "700"}}>
                                {"Fecha de expiración: "}
                            </Text>{moment(data.expirationDate || new Date()).format("MM-DD-YYYY")}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.naranja80, fontWeight: "700"}}>
                                {"Tendero: "}
                            </Text>{data?.customer.name ?? ""}  
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.naranja80, fontWeight: "700"}}>
                                {"Teléfono: "}
                            </Text>{data?.customer.phone ?? ""}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.naranja80, fontWeight: "700"}}>
                                {"Descripción: "}
                            </Text>{data?.description ?? ""}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.naranja80, fontWeight: "700"}}>
                                {"Tipo: "}
                            </Text>{data?.taskCategory.name ?? ""}  
                        </Text>
                    </View>

                    <View style={{...styles.container.background}}>
                        <Text style={{
                            color: colorsTheme.naranja,
                            textAlign: "center",
                            fontWeight: "700"
                        }}>
                            {"Componentes requeridos"}
                        </Text>
                        <View>
                            {
                                data?.taskAddons?.length ?(
                                    <FlatList
                                        data={data.taskAddons}
                                        keyExtractor={(item) => item.idTaskAddon}
                                        numColumns={2}
                                        columnWrapperStyle={{paddingHorizontal: "5%", justifyContent: "space-between"}}
                                        renderItem={({ item }) => (
                                            <View style={{alignItems: "flex-start"}}>
                                                <Text key={item.idTaskAddon} style={{color: colorsTheme.gris80, textAlign: "center"}}>
                                                    {"● "}{item.addon.name}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                ):(
                                    <Text style={{color: colorsTheme.gris80, textAlign: "center"}}>{"No hay equipo para recoger"}</Text>
                                )
                            }
                        </View>
                    </View>
                    
                    <View style={{...styles.container.background}}>
                        <Text style={{
                            color: colorsTheme.naranja,
                            textAlign: "center",
                            fontWeight: "700"
                        }}>
                            {"Equipo a recoger"}
                        </Text>
                        <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                            {
                                data?.receivedAddons?.length > 0 ? (
                                    <FlatList
                                        data={data.receivedAddons}
                                        keyExtractor={(item) => item.idTaskAddon}
                                        numColumns={2}
                                        columnWrapperStyle={{paddingHorizontal: "5%", justifyContent: "space-between"}}
                                        renderItem={({ item }) => (
                                            <View style={{alignItems: "flex-start"}}>
                                                <Text key={item.idTaskAddon} style={{color: colorsTheme.gris80, textAlign: "center"}}>
                                                    {"● "}{item.addon.name}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                ) : (
                                    <Text style={{color: colorsTheme.gris80, textAlign: "center"}}>{"Esta tarea no tiene Componentes asignados"}</Text>
                                )
                            }
                        </View>
                    </View>
                </Fragment>
            )
        }
      </Fragment>
    )

};

const styles = StyleSheet.create({
    container: {
        background: {
          margin: 4,
          backgroundColor: colorsTheme.blanco,
          borderRadius: 5,
          padding: 15,
          shadowColor: colorsTheme.gris80,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 6,
        },
        text: {
          color: colorsTheme.gris80,
          fontSize: 15,
        },
      },
})

export default TaskInfoScreen