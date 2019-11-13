export default (obj, order) => {
  let arr = [];
  let ret = {};

  for (let key in obj) {
    arr.push(key);
  }

  arr.sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  if (order === 'desc') {
    for (let i = arr.length - 1; i >= 0; i--) {
      ret[arr[i]] = obj[arr[i]];
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      ret[arr[i]] = obj[arr[i]];
    }
  }

  return ret;
};
