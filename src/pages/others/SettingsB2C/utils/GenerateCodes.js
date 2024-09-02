import rangeJSON from './json/ranges.json';

const PRODUCT_MULT = 37;
const CORRELATIVE_MULT = 59;

export const getCodesV5Time = () => {
  let now  = new Date();
  const initDate = new Date(now.getFullYear(), 0, 0);
  const diffDates = Number(now) - Number(initDate);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diffDates / oneDay);
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hour = now.getHours();
  const yearMod = now.getFullYear() % 4;

  const values = {
      seconds,
      minutes,
      hour,
      day,
      year: yearMod
  };

  return values;
}

export const formatCodeKingo = (numero) => {
  const numeroString = String(numero); // Convertir el número a cadena para asegurar su manipulación
  const grupos = [];

  for (let i = 0; i < numeroString.length; i += 4) {
    grupos.push(numeroString.substr(i, 4));
  }

  return grupos.join(' ');
}

export const getModel = async (id, region="gtm-pet") => {
  //const region = "gtm-pet"
  const systemInfo = decipherEsId(
    concatId(region, 'kingo', id)
  );
  console.log("VERSION DEL KINGO", systemInfo);
  switch (systemInfo.version) {
    case 1:
      console.log("V1");
      return await getModelV1(systemInfo);
    case 2:
      console.log("V2");
      return await getModelV2(systemInfo);
  }
}

const concatId = (region, type, id) => {
  id = String(id);
  while (id.length < 6) {
    id = '0' + id;
  }
  return [region, type, id].join(':');
}

var surnamer = {
  getSurname: getSurname,
  getProduct: getProduct
};

function getSurname(product, correlative) {
  return (product * PRODUCT_MULT + correlative * CORRELATIVE_MULT) % 90 + 10;
}

function getProduct(surname, correlative) {
  let corrmod = correlative * CORRELATIVE_MULT;
  let apmod = surname - 10;
  let preres = (apmod - corrmod);
  while (preres < 0 || preres % PRODUCT_MULT > 0) {
    preres += 90;
  }
  return preres / PRODUCT_MULT;
}


function decipherEsId(fullId){
  let id      = fullId.split(':')[2];
  let version = checkEsIdVersion(id);
  let result;

  switch (version) {
    case 1:
      result = {
        region:      fullId.split(':')[0],
        type:        fullId.split(':')[1],
        correlative: Number(fullId.split(':')[2]),
      };
      break;
    case 2:
      result = {
        region:      fullId.split(':')[0],
        type:        fullId.split(':')[1],
        surname:     Number(fullId.split(':')[2].substring(0,2)),
        correlative: Number(fullId.split(':')[2].substring(2,fullId.split(':')[2].length))
      };
      result.product = surnamer.getProduct(result.surname, result.correlative);

      break;
  }
  result.version = version;
  result.id      = id;
  return result;
}

function checkEsIdVersion(id) {
  let version;
  if (Number(id) < 1000000) {
    version = 1;
  }
  else {
    version = 2;
  }
  return version;
}

const getModelV1= async (systemInfo) => {
  const id = systemInfo.id;
  const ranges = rangeJSON;
  console.log("Rango",ranges["gtm-pet"]);
  const matchingRange = Object.keys(ranges["gtm-pet"]).find(rangeKey => {
    const [min, max] = rangeKey.split('-').map(v => Number(v));
    console.log("MM",min, max);
    if (min <= id && id <= max){
      console.log("PASE PERRO", min, max);
      return true;
    }
    return false;
  });

  console.log("QUE RETORNO", matchingRange);
  if (matchingRange) {
    const model = ranges["gtm-pet"][matchingRange];
    console.log("MODELO FINAL QUE ESTA JALANDO", model);
    if (typeof model === 'string') return model;

    return model.model;
  }
}

const getModelV2 = async(systemInfo) => {
  const products = rangeJSON.products;
  return products[systemInfo.product];
}