import React from 'react';
import Inputs from '../Forms/Inputs';

const InputGenerateStep = ({
  item,
  elementId,
  index,
  navigation,
  objWithData,
  setFunction,
  setIsAlert,
  setMessageAlert,
  setTitleAlert,
  disable = false,
  selectData = [],
  selectLabel,
  selectValue}) => {
  return (
    <Inputs
        key={item[elementId]}
        item={item}
        index={index}
        navigation={navigation}
        disable={disable}
        informacion={objWithData}
        setInformation={setFunction}
        setIsAlert={setIsAlert}
        setMessageAlert={setMessageAlert}
        setTitleAlert={setTitleAlert}
        selectData={selectData}
        selectLabel={selectLabel}
        selectValue={selectValue}
      />
  );
};

export default InputGenerateStep;
