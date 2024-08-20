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
  selectValue,
  bottonSheet,
  evidences,
  setEvidences,
  idTaskSteps,
  dataBalance = 0,
  type = 10
}) => {
  return (
    <Inputs
        idTaskSteps={idTaskSteps}
        evidences={evidences}
        setEvidences={setEvidences}
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
        bottonSheet={bottonSheet}
        dataBalance={dataBalance}
        type={type}
      />
  );
};

export default InputGenerateStep;
