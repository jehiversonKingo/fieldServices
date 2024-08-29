import React, { Fragment } from "react";
import { ActivityIndicator, StyleSheet, Text, View, FlatList } from "react-native";
import { colorsTheme } from "../../../configurations/configStyle";
import moment from "moment";

const TaskInfoScreen = ({data, isLoading}) => {
  return (
      <Fragment>
        <Text style={{
            color: colorsTheme.verdeHybricoDark,
            textAlign: "center",
            fontWeight: "700",
            fontSize: 20
        }}> {"Información general"}</Text>

        {
            isLoading ? (
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={colorsTheme.verdeHybrico}/>
                </View>
            ) : (
                <Fragment>
                    <View style={{...styles.container.background}}>
                        <Text style={{color: colorsTheme.gris80}}>   
                            <Text style={{color: colorsTheme.verdeHybrico, fontWeight: "700"}}>
                                {"Fecha de expiración: "}
                            </Text>{moment(data.expirationDate ?? "").format("MM-DD-YYYY")}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.verdeHybrico, fontWeight: "700"}}>
                                {"Tendero: "}
                            </Text>{data?.ticket?.customer.name ?? ""}  
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.verdeHybrico, fontWeight: "700"}}>
                                {"Teléfono: "}
                            </Text>{data?.ticket?.customer.phone ?? ""}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.verdeHybrico, fontWeight: "700"}}>
                                {"Descripción: "}
                            </Text>{data?.ticket?.description ?? ""}
                        </Text>

                        <Text style={{color: colorsTheme.gris80}}>
                            <Text style={{color: colorsTheme.verdeHybrico, fontWeight: "700"}}>
                                {"Tipo: "}
                            </Text>{data?.ticket?.ticketCategory.name ?? ""}  
                        </Text>
                    </View>

                    <View style={{...styles.container.background}}>
                        <Text style={{
                            color: colorsTheme.verdeHybrico,
                            textAlign: "center",
                            fontWeight: "700"
                        }}>
                            {"AddOns requeridos"}
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
                            color: colorsTheme.verdeHybrico,
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
                                    <Text style={{color: colorsTheme.gris80, textAlign: "center"}}>{"Esta tarea no tiene addons asignados"}</Text>
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