import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FitImage from 'react-native-fit-image';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {handleIsValidUrl, handleCutString} from '../../functions/fncGeneral';
import {colorsTheme} from '../../configurations/configStyle';

const Inputs = ({
  item,
  index,
  objData,
  setInformation,
  navigation,
  isFocus,
  handleChange,
  search = true,
  propStyleIcon,
  widthScreen,
  handleRemove,
}) => {
  switch (item.type) {
    case 'photo':
      return (
        <View key={item.id}>
          <View style={{flexDirection: 'row', marginTop: 10}}>
            <View style={{width: `${widthScreen}` * 0.6, marginRight: 20}}>
              <Text style={styles.colorText}>{item.label}</Text>
              <TextInput
                style={styles.inputForm}
                value={
                  item.value === ''
                    ? ''
                    : handleCutString(
                        item.value.path ? item.value.path : item.value,
                        '/',
                        true,
                      )
                }
                editable={false}
              />
            </View>
            <View
              style={{
                width: `${widthScreen}` * 0.1,
                marginRight: 15,
                ...propStyleIcon,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Camera', {
                    label: item.label,
                    area: 'task',
                    index: index,
                    data: objData,
                    setData: setInformation,
                  });
                }}>
                <Ionicons name={'camera'} color={colorsTheme.verdeHybrico} size={40} />
              </TouchableOpacity>
            </View>
            <View style={{width: `${widthScreen}` * 0.2, ...propStyleIcon}}>
              <TouchableOpacity
                onPress={() => {
                  handleRemove(index, objData, setInformation);
                }}>
                <Ionicons
                  name={'close-circle-sharp'}
                  color={'red'}
                  size={40}
                  style={styles.iconImg}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <FitImage
              indicator={true}
              indicatorColor={colorsTheme.verdeHybrico}
              indicatorSize="small"
              source={{
                uri:
                  item.value !== ''
                    ? handleIsValidUrl(item.value)
                      ? item.value
                      : 'file://' + item.value.path
                    : 'https://via.placeholder.com/300',
              }}
              style={{width: 100, height: 100}}
            />
          </View>
        </View>
      );
    case 'barcode':
      return (
        <View style={{flexDirection: 'row'}} key={item.id}>
          <View style={{width: `${widthScreen}` * 0.6, marginRight: 20}}>
            <Text style={styles.colorText}>{item.label}</Text>
            <TextInput
              style={styles.inputForm}
              value={item.value}
              editable={false}
            />
          </View>
          <View
            style={{
              width: `${widthScreen}` * 0.1,
              marginRight: 15,
              ...propStyleIcon,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('BarCode', {
                  index: index,
                  data: objData,
                  setData: setInformation,
                });
              }}>
              <Ionicons
                name={'barcode'}
                color={colorsTheme.verdeHybrico}
                size={40}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <View style={{width: `${widthScreen}` * 0.2, ...propStyleIcon}}>
            <TouchableOpacity
              onPress={() => {
                handleRemove(index, objData, setInformation);
              }}>
              <Ionicons
                name={'close-circle-sharp'}
                color={'red'}
                size={40}
                style={styles.iconImg}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    case 'text':
      return (
        <View style={{flexDirection: 'row'}} key={item.id}>
          <View style={{width: `${widthScreen}` * 0.7, marginRight: 15}}>
            <Text style={styles.colorText}>{item.label}</Text>
            <TextInput
              style={styles.inputForm}
              onChangeText={text =>
                handleChange(index, text, 'value', objData, setInformation)
              }
              value={item.value}
            />
          </View>
          <View style={{width: `${widthScreen}` * 0.2, ...propStyleIcon}}>
            <TouchableOpacity
              onPress={() => {
                handleRemove(index, objData, setInformation);
              }}>
              <Ionicons
                name={'close-circle-sharp'}
                color={'red'}
                size={40}
                style={styles.iconImg}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  icon: {
    marginTop: 20,
    color: colorsTheme.verdeHybrico,
    marginRight: 5,
  },
  colorText: {
    color: colorsTheme.gris80,
},
inputForm: {
  fontSize: 17,
  color: colorsTheme.negro,
  marginBottom: 10,
  backgroundColor: colorsTheme.gris20,
  borderRadius: 10,
},
dropdown: {
  height: 50,
  borderColor: colorsTheme.gris,
  borderWidth: 0.5,
  borderRadius: 8,
  paddingHorizontal: 8,
},
label: {
  color: colorsTheme.gris80,
},
placeholderStyle: {
  fontSize: 16,
  color: colorsTheme.gris80,
},
selectedTextStyle: {
  color: colorsTheme.gris80,
  fontSize: 16,
},
iconStyle: {
  width: 20,
  height: 20,
},
inputSearchStyle: {
  color: colorsTheme.gris80,
  height: 40,
  fontSize: 16,
},
textItem: {
  color: colorsTheme.gris80,
},
});

export default Inputs;
