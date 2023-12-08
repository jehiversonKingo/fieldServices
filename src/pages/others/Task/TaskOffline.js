import React, { useEffect, useState, useContext } from 'react';
import {View, FlatList, Dimensions, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import { ListItem } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FitImage from 'react-native-fit-image';
import AwesomeAlert from 'react-native-awesome-alerts';
//Components
import Header from '../../../components/Layouts/Header';
import { setDataAllTask } from '../../../services/task.services';
import {getAllDataStep, deleteStep} from '../../../functions/fncSqlite';
import {handleGetLocationReturnValue} from '../../../functions/fncLocation';
import {colorsTheme} from '../../../configurations/configStyle';
import { handleChangeArray } from '../../../functions/functionChangeValue';
import {Context as AuthContext} from '../../../context/AuthContext';

const {width, height} = Dimensions.get('screen');

const TaskOffline = ({navigation}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState([]);
    const [isAlert, setIsAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const {state} = useContext(AuthContext);
    const {inline} = state;

    const getAllDataTask = async () => {
      let getTasks = [];
      let dataTask = await getAllDataStep('TaskComplete');
      getTasks = dataTask;
      setData(getTasks);
      setLoading(false);
    };

    const TaskStackStep1 = ({item, index}) => {
      console.log(item)
        return(
            <View key={`B${index}`} style={{flexDirection: "row", backgroundColor: colorsTheme.naranja20}}>
              <View key={`C${index}`}>
                <Text key={`D${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
                  {
                    typeof item.value === 'object' ? (
                      item.screenElement.name +': '+ item.value.latitude + ', '+ item.value.longitude
                    ) : (
                      item.screenElement.name +': '+ item.value
                    )
                  }
                </Text>
              </View>
            </View>
        )
    };
   
    const TaskStackStep2 = ({item, index}) => {
        return(
            <View key={`B1${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
              <View key={`C1${index}`}>
                <Text key={`D1${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
                  {item.addon.name +': '+ item.value}
                </Text>
              </View>
            </View>
        )
    };
 
    const TaskStackStep3 = ({item, index}) => {
        return(
            <View key={`B2${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
              <View key={`C2${index}`}>
                <FitImage
                    indicator={true}
                    indicatorColor={colorsTheme.naranja}
                    indicatorSize="large"
                    source={{ uri: 'file://' + item.photo.path }}
                    resizeMode="stretch"
                    style={{ width: 150, height: 150 }}
                />
              </View>
            </View>
        )
    };

    const TaskStackStep4 = ({item, index}) => {
        return(
            <View key={`B3${index}`} style={{flexDirection: 'row', backgroundColor:colorsTheme.naranja20}}>
              <View key={`C3${index}`}>
                <Text key={`D3${index}`} style={{fontSize: 18, fontWeight: '500', margin:5, color:colorsTheme.negro, fontSize:12}}>
                  {item.addon.name +': '+ item.value}
                </Text>
              </View>
            </View>
        )
    };

    const TaskStack = ({item, index}) => {
        return (
          <View
            style={{
              padding: 12,
              margin:5,
              borderColor: colorsTheme.naranja60,
              borderWidth:3,
            }}
            key={`AT${index}`}>
            <ListItem.Accordion
              content={
                <>
                  <Ionicons
                    name={'list'}
                    size={30}
                    style={styles.iconImg}
                  />
                  <ListItem.Content>
                    <ListItem.Title>{' TASK ID: ' + item.idTask}</ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded[index]}
              onPress={() => {
                handleChangeArray(index, !expanded[index], expanded, setExpanded);
              }}
              containerStyle={{
                borderLeftColor: colorsTheme.naranja80,
                borderLeftWidth: 5,
                borderRadius: 5,
              }}
            >
            <FlatList
                key={'list-general' + index}
                listKey={'general'}
                data={item.step1}
                renderItem={TaskStackStep1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: '50%', margin:30}}
                keyExtractor={item => item.idTaskScreenElement}
                numColumns={2}
                ListHeaderComponent={
                <View
                    style={{
                      backgroundColor: colorsTheme.naranja,
                      borderRadius: 5,
                      width: width * 0.76,
                      padding: 10,
                      justifyContent:'center',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>Datos Generales</Text>
                </View>
                }
                ListEmptyComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.gris80,
                    width: width * 0.76,
                    padding: 10,
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>
                    No se han encontrado Datos generales.
                    </Text>
                </View>
                }
            />

            <FlatList
                key={'list-addons' + index}
                listKey={'addons'}
                data={item.step2}
                renderItem={TaskStackStep2}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: '50%', margin:30}}
                keyExtractor={item => item.idTaskAddon}
                ListHeaderComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.naranja,
                    width: width * 0.76,
                    padding: 10,
                    justifyContent:'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>Addons y Equipo</Text>
                </View>
                }
                ListEmptyComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.gris80,
                    width: width * 0.76,
                    padding: 10,
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>
                    No se han encontrado Addons ni Equipos.
                    </Text>
                </View>
                }
            />

            <FlatList
                key={'list-toDo' + index}
                listKey={'toDo'}
                data={item.evidences}
                renderItem={TaskStackStep3}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: '50%', margin:30}}
                keyExtractor={item => item.idTaskStep}
                ListHeaderComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.naranja,
                    width: width * 0.76,
                    padding: 10,
                    justifyContent:'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>Evidencia instrucciones</Text>
                </View>
                }
                ListEmptyComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.gris80,
                    width: width * 0.76,
                    padding: 10,
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>
                    No se han encontrado datos sobre evidencia.
                    </Text>
                </View>
                }
            />

            <FlatList
                key={'list-addon-back' + index}
                listKey={'addons-back'}
                data={item.step4}
                renderItem={TaskStackStep4}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: '50%', margin:30}}
                keyExtractor={item => item.idTaskScreenElement}
                ListHeaderComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.naranja,
                    width: width * 0.76,
                    padding: 10,
                    justifyContent:'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>Addons y equipo recogido</Text>
                </View>
                }
                ListEmptyComponent={
                <View
                    style={{
                    backgroundColor: colorsTheme.gris80,
                    width: width * 0.76,
                    padding: 10,
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    }}>
                    <Text style={{color: colorsTheme.blanco}}>
                    No se han encontrado datos sobre addons y equipos recogidos.
                    </Text>
                </View>
                }
            />

            </ListItem.Accordion>
          </View>
        );
      };

    const completeTask = async () => {
        setIsAlert(true);
        setTitleAlert('Cargando datos, espere por favor');
        if(inline){
            let errorList = [];
            data.forEach(async(task) => {
                for(let item of task.step1){
                    if(typeof item.value === 'object'){
                        let location = await handleGetLocationReturnValue(setIsAlert, setTitleAlert, setMessageAlert);
                        item.value = location;
                    }
                }
                let taskStatus = await setDataAllTask(task);
                console.log(taskStatus);
                if(!taskStatus.status){
                    errorList.push(task.idTask);
                    return;
                }else{
                  console.log('DELETE TASK')
                  await deleteStep('TaskComplete', task.idTask);
                  await deleteStep('taskInfo', task.idTask);
                }
                setIsAlert(false);
            });
            setIsAlert(false);
            navigation.navigate('Task', { taskStatus });
        } else {
            setTitleAlert('Error sigues offline');
            setMessageAlert('No se pueden cargar las tareas por que sigues offline.')
            setTimeout(() => {
                setIsAlert(false);
            }, 2500);
        }
    };

    useEffect(()=>{
        getAllDataTask();
    },[]);

    const ListOfflineTask = () => (
        <FlatList
            key={'list-offline'}
            data={data}
            renderItem={TaskStack}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: '50%', margin:30, marginTop:65}}
            keyExtractor={(item) => item.idTask}
            ListHeaderComponent={
            <View
                style={{
                backgroundColor: colorsTheme.naranja,
                width: width,
                padding: 10,
                alignItems: 'center',
                marginTop: 10,
                }}>
                <Text style={{color: colorsTheme.blanco}}>Listado Tareas Pendientes de enviar</Text>
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
                No se han encontrado tareas en cola.
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
        title={'Listado De Tareas'}
      />
      {loading ?
        (
          <View style={{justifyContent: 'center', alignItems: 'center', height:height * 0.5}}>
            <ActivityIndicator size="large" color={colorsTheme.naranja}/>
          </View>
        ) : (
            <>
                <TouchableOpacity
                    style={{
                        marginTop:10,
                        flexDirection: 'row',
                        backgroundColor: colorsTheme.naranja,
                        borderRadius: 10,
                        width: 50,
                        height: 50,
                        position:'absolute',
                        right:10,
                        alignItems:'center',
                        justifyContent:'center',
                        borderWidth:1,
                        borderColor:colorsTheme.blanco
                    }}
                    onPress={() => {
                        completeTask();
                    }}>
                    <Ionicons name={'arrow-up'} color={colorsTheme.blanco} size={25} />
                </TouchableOpacity>
            <ListOfflineTask />
            <AwesomeAlert
                show={isAlert}
                showProgress={true}
                title={titleAlert}
                message={messageAlert}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
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
});

export default TaskOffline;
