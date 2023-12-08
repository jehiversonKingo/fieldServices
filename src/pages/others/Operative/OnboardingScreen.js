import React, {useState, useEffect, useRef, useContext} from 'react';
import {Image, View, TouchableOpacity, Text} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { getStepInstruction } from '../../../services/task.services';
import { getStep} from '../../../functions/fncSqlite';

import {colorsTheme} from '../../../configurations/configStyle';
import {Context as AuthContext} from '../../../context/AuthContext';
import Logo from '../../../../assets/img/Isotipo-Kingo.png';

const OnboardingComponent = ({navigation, route}) => {
  const onboardingRef = useRef(null);
  const {idStep} = route.params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const {state} = useContext(AuthContext);
  const {inline} = state;

  const Square = ({ isLight, selected }) => {
    let backgroundColor;
    if (isLight) {
      backgroundColor = selected ? colorsTheme.gris80 : colorsTheme.gris20;
    } else {
      backgroundColor = selected ? colorsTheme.blanco : colorsTheme.gris60;
    }
    return (
      <View
        style={{
          width: 6,
          height: 6,
          marginHorizontal: 3,
          backgroundColor,
        }}
      />
    );
  };

  const Done = () => (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            fontSize: 16,
            color: colorsTheme.blanco,
            fontWeight: 'bold',
            marginRight: 5,
          }}>
          {' '}
          Finalizar{' '}
        </Text>
        <FontAwesome5
          name={'check-circle'}
          color={colorsTheme.blanco}
          size={20}
          style={{marginRight: 20}}
        />
      </View>
    </TouchableOpacity>
  );

  const Skip = () => (
    <TouchableOpacity>
      {/* <View style={{ flexDirection: "row" }}>
        <Text style={{ color: "white"}}> Omitir </Text>
        <FontAwesome5 name={"chevron-down"} color={colorsTheme.blanco} size={20} />
      </View> */}
    </TouchableOpacity>
  );

  const Next = () => (
    <TouchableOpacity
      onPress={() => {
        onboardingRef.current.goNext();
      }}>
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            fontSize: 16,
            color: colorsTheme.blanco,
            fontWeight: 'bold',
            marginRight: 5,
          }}>
          {' '}
          Siguiente{' '}
        </Text>
        <FontAwesome5
          name={'chevron-right'}
          color={colorsTheme.blanco}
          size={20}
          style={{marginRight: 20}}
        />
      </View>
    </TouchableOpacity>
  );

  const handleGetInstruction = async () => {
    let getDataStepToDo = [];
    if(inline){
      getDataStepToDo = await getStepInstruction(idStep);
    }else{
      getDataStepToDo = JSON.parse(await getStep('taskDescriptionToDo',idStep,0));
    }
    console.log(getDataStepToDo)
    const { getDataStep } = getDataStepToDo;

    let customDataInstructions = [];
    getDataStep.map((instruction) => {
      customDataInstructions.push(
        {
          backgroundColor: colorsTheme.blanco,
          //image: <Image source={{uri: instruction.file}} style={{ height: 300, width:300}}/>,
          image: <Image source={Logo} style={{ height: 300, width:300}} />,
          title: instruction.title,
          subtitle: instruction.description,
        }
      );
    });
    setData(customDataInstructions);
    setLoading(false);
  };

  useEffect(() => {
    handleGetInstruction();
  }, []);

  return loading ? (
    <Text>Label</Text>
  ) : (
    <Onboarding
      ref={onboardingRef}
      DoneButtonComponent={Done}
      SkipButtonComponent={Skip}
      NextButtonComponent={Next}
      bottomBarHighlight={false}
      bottomBarColor={colorsTheme.naranja}
      pages={data}
      DotComponent={Square}
    />
  );
};

export default OnboardingComponent;
