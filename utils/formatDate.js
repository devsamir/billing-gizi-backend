exports.formatDatabase = (date) => {
  const d = new Date(date);
  let year, month, day;
  year = `${d.getFullYear()}`;
  if (d.getMonth() + 1 < 10) {
    month = `0${d.getMonth() + 1}`;
  } else {
    month = `${d.getMonth() + 1}`;
  }
  if (d.getDate() < 10) {
    day = `0${d.getDate()}`;
  } else {
    day = `${d.getDate()}`;
  }
  return `${year}-${month}-${day}`;
};

exports.formatUi = (date) => {
  const d = new Date(date);
  let year, month, day;
  year = `${d.getFullYear()}`;
  if (d.getMonth() + 1 < 10) {
    month = `0${d.getMonth() + 1}`;
  } else {
    month = `${d.getMonth() + 1}`;
  }
  if (d.getDate() < 10) {
    day = `0${d.getDate()}`;
  } else {
    day = `${d.getDate()}`;
  }
  return `${day}/${month}/${year}`;
};

exports.formatTime = (date) => {
  const d = new Date(date);
  let year, month, day, hour, minute;
  year = `${d.getFullYear()}`;
  if (d.getMonth() + 1 < 10) {
    month = `0${d.getMonth() + 1}`;
  } else {
    month = `${d.getMonth() + 1}`;
  }
  if (d.getDate() < 10) {
    day = `0${d.getDate()}`;
  } else {
    day = `${d.getDate()}`;
  }
  if (d.getHours() < 10) {
    hour = `0${d.getHours()}`;
  } else {
    hour = `${d.getHours()}`;
  }
  if (d.getMinutes() < 10) {
    minute = `0${d.getMinutes()}`;
  } else {
    minute = `${d.getMinutes()}`;
  }
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

exports.formatTimeUI = (date) => {
  const d = new Date(date);
  let year, month, day, hour, minute;
  year = `${d.getFullYear()}`;
  if (d.getMonth() + 1 < 10) {
    month = `0${d.getMonth() + 1}`;
  } else {
    month = `${d.getMonth() + 1}`;
  }
  if (d.getDate() < 10) {
    day = `0${d.getDate()}`;
  } else {
    day = `${d.getDate()}`;
  }
  if (d.getHours() < 10) {
    hour = `0${d.getHours()}`;
  } else {
    hour = `${d.getHours()}`;
  }
  if (d.getMinutes() < 10) {
    minute = `0${d.getMinutes()}`;
  } else {
    minute = `${d.getMinutes()}`;
  }
  return `${day}/${month}/${year} - ${hour}:${minute}`;
};

exports.getArrayOfMonth = (awal, akhir) => {
  let awalT = new Date(awal).getTime();
  const akhirT = new Date(akhir).getTime();
  const arr = {};
  while (awalT <= akhirT) {
    let month = new Date(awalT).getMonth() + 1;
    if (month < 10) month = `0${month}`;
    const date = `${new Date(awalT).getFullYear()}-${month}`;
    arr[date] = arr[date] + 1 || 1;
    awalT += 24 * 60 * 60 * 1000;
  }
  return Object.keys(arr);
};

exports.getArrayOfDate = (awal, akhir) => {
  let awalT = new Date(awal).getTime();
  const akhirT = new Date(akhir).getTime();
  const arr = [];
  while (awalT <= akhirT) {
    let month = new Date(awalT).getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day = new Date(awalT).getDate();
    if (day < 10) day = `0${day}`;
    const date = `${new Date(awalT).getFullYear()}-${month}-${day}`;
    arr.push(date);
    awalT += 24 * 60 * 60 * 1000;
  }
  return arr;
};

exports.getArrayOfYear = (awal, akhir) => {
  let awalT = new Date(awal).getTime();
  const akhirT = new Date(akhir).getTime();
  const arr = {};
  while (awalT <= akhirT) {
    const date = `${new Date(awalT).getFullYear()}`;
    arr[date] = arr[date] + 1 || 1;
    awalT += 24 * 60 * 60 * 1000;
  }
  return Object.keys(arr);
};
