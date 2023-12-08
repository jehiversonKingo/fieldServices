import React from 'react';
import {View, SafeAreaView, Text, TouchableOpacity} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {colorsTheme} from '../../../configurations/configStyle';

const ImageFullScreen = ({navigation, route}) => {
  const {photos, index} = route.params;
  return (
    <View style={{flex: 1, backgroundColor: colorsTheme.negro}}>
      <ImageViewer
        imageUrls={photos}
        index={index}
        enablePreload={true}
        loadingRender={() => <Text>Cargando...</Text>}
        renderHeader={() => (
          <SafeAreaView style={{alignItems: 'flex-end'}}>
            <TouchableOpacity
              hitSlop={{
                left: 10,
                top: 10,
                bottom: 10,
                right: 30,
              }}
              style={{
                alignItems: 'flex-end',
                position: 'absolute',
                right: 5,
                top: 25,
                zIndex: 15,
                width: 100,
              }}
              onPress={() => navigation.goBack()}>
              <Ionicons
                name="close"
                style={{margin: 15}}
                color={colorsTheme.blanco}
                size={25}
              />
            </TouchableOpacity>
          </SafeAreaView>
        )}
      />
    </View>
  );
};

export default ImageFullScreen;
