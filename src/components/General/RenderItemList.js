import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {colorsTheme} from '../../configurations/configStyle';
import moment from 'moment';
const { width } = Dimensions.get('screen');

const RenderItemList = ({item, goTo, onLongPress}) => {
    let color = '';
    let colorLabel = '';
    let icon = '';
    let sizeAlert = '';
    switch (item.task.taskPriority.name) {
      case 'Alta':
        color = colorsTheme.rojo80;
        colorLabel = colorsTheme.blanco;
        icon = 'warning-outline';
        sizeAlert = 85;
        break;
      case 'Media':
        color = 'yellow';
        colorLabel = colorsTheme.gris80;
        icon = 'remove-circle-outline';
        sizeAlert = 90;
        break;
      case 'Baja':
        color = colorsTheme.verdeHybricoDark;
        colorLabel = colorsTheme.blanco;
        icon = 'checkmark-circle-outline';
        sizeAlert = 85;
        break;
    }

    return (
      <TouchableOpacity
        style={{
          ...styles.containerList.background,
          backgroundColor: moment().isAfter(moment(item.task.expirationDate)) ? colorsTheme.verdeHybricoLight : colorsTheme.blanco
        }}
        onLongPress={() => onLongPress(item.idTask)}
        onPress={() =>
          goTo(
            item.task.idTaskState !== 3 ? 'TaskDescription' : 'TaskNocValidation',
            {id: item.idTask, idCustomer: item.task.ticket.idCustomer, type: item.task.ticket.idTicketCategory},
          )
        }>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            borderRadius: 5,
            padding: 5,
          }}>
          <View
            style={{
              flex: 0.4,
              backgroundColor: item.task.taskState.idTaskState !== 3 ? colorsTheme.verdeHybrico : colorsTheme.verdeFuerte,
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              borderRadius: 5,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              <FontAwesome5
                name={'id-card-alt'}
                color={colorsTheme.blanco}
                size={25}
                style={styles.bottomMenu.icon}
              />
            </View>
          </View>
          <View style={{flex: 2, padding: 8}}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Text style={{...styles.bottomMenu.text, color: colorsTheme.gris80}}>
                  TK-{item.idTask}
                </Text>
                <Text style={{color: colorsTheme.gris80}}>{item.task.ticket.description}</Text>
              </View>
              <View style={{width: sizeAlert, position: 'absolute', right: 0, top: -12}}>
                <View
                  style={{
                    backgroundColor: `${color}`,
                    borderRadius: 50,
                    margin: 5,
                    height: 30,
                    flexDirection: 'row',
                  }}>
                  <Ionicons
                    name={icon}
                    color={colorLabel}
                    size={20}
                    style={{marginLeft: 6, marginTop: 4}}
                  />
                  <Text
                    style={{
                      color: colorLabel,
                      marginTop: 5,
                      position: 'absolute',
                      right: 12,
                    }}>
                    {item.task.taskPriority.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    containerList: {
      background: {
        flexDirection: 'row',
        width: width * 0.95,
        margin: 4,
        backgroundColor: colorsTheme.blanco,
        borderLeftColor: colorsTheme.verdeHybricoLight,
        borderLeftWidth: 5,
        borderRadius: 5,
        padding: 5,
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
    bottomMenu: {
      borderRadius: 5,
      marginRight: 10,
      padding: 30,
      paddingTop: -10,
      text: {
        fontSize: 15,
        color: colorsTheme.blanco,
      },
    },
  });

export default RenderItemList;
