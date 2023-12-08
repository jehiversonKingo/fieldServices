import {Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');

export const handleChange = (i, event, name, objData, setData) => {
  const values = [...objData];
  values[i][name] = event;
  setData(values);
};

export const handleChangeArray = (i, event, objData, setData) => {
  const values = [...objData];
  values[i] = event;
  setData(values);
};

export const handleAdd = (objData, setData, data) => {
  const values = [...objData];
  const {value, typeValue} = data;

  if (typeValue != null) {
    values.push({
      id: Math.random(),
      label: value,
      type: typeValue,
      value: '',
      isFocus: false,
      widthScreen: width,
    });

    setData(values);
  }
};

export const handleRemove = (i, objData, setData, list = false) => {
  const values = [...objData];

  /* if (list) { */
    values.splice(i, 1);
  /* } else {
    values[i] = {delete: true, id: Math.random()};
  } */
  setData(values);
  return values;
};
