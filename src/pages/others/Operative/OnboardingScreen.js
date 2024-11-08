import React, {useState, useEffect, useContext} from 'react';
import {View, Text, FlatList, Dimensions, ActivityIndicator} from 'react-native';
import {getStepInstruction} from '../../../services/task.services';
import {getStep} from '../../../functions/fncSqlite';
import {colorsTheme} from '../../../configurations/configStyle';
import {Context as AuthContext} from '../../../context/AuthContext';
import Header from '../../../components/Layouts/Header';

const OnboardingComponent = ({route, navigation}) => {
  const {idStep} = route.params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const {state} = useContext(AuthContext);
  const {inline} = state;
  const {width} = Dimensions.get('screen');

  const handleGetInstruction = async () => {
    try {
      let getDataStepToDo = [];
      if (inline) {
        getDataStepToDo = await getStepInstruction(idStep);
      } else {
        const stepData = await getStep('taskDescriptionToDo', idStep, 0);
        getDataStepToDo = JSON.parse(stepData);
      }

      const {getDataStep} = getDataStepToDo;
      console.log("[Instrucciones]", getDataStep);
      setData(getDataStep || []);
    } catch (error) {
      console.error("Error al obtener las instrucciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetInstruction();
  }, []);

  const renderInstruction = ({ item, index }) => (
    <View
      style={{
        padding: 12,
        backgroundColor: colorsTheme.blanco,
        borderBottomColor: colorsTheme.naranja,
        borderBottomWidth: 0.8,
      }}
      key={index}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colorsTheme.naranja }}>
        {index + 1}. {item.title} 
      </Text>
      <Text style={{ marginTop: 5,  color: colorsTheme.naranja }}>
        {item.description} 
      </Text>
    </View>
  );
  

  return loading ? (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color={colorsTheme.naranja} />
      <Text>Cargando...</Text>
    </View>
  ) : (
    <View style={{ backgroundColor: colorsTheme.blanco, flex:1}}>
      <Header isLeft={true} navigation={navigation} />
    <FlatList
      data={data}
      renderItem={renderInstruction}
      keyExtractor={(item) => item.idStepInstruction.toString()} // Utiliza un identificador único
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ margin: 10 }}
      ListHeaderComponent={
        <View
          style={{
            backgroundColor: colorsTheme.naranja,
            width: width,
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ color: colorsTheme.blanco, fontWeight: 'bold' }}>
            Listado De Instrucciones
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colorsTheme.negro }}>No se encontraron datos.</Text>
        </View>
      }
    />
  </View>

  );
};

export default OnboardingComponent;
