const labelElem = document.querySelector('#label');
const amountElem = document.querySelector('#amount');
const submitEntryBtn = document.querySelector('#submitentry');
const itemsList = document.querySelector('#items');

const uploadForm = document.querySelector('#upload');
const uploadFormFile = document.querySelector('#file'); 
const downloadFileBtn = document.querySelector('#downloadbackup');

const clearAllBtn = document.querySelector('#clearall');
const confirmClearBtn = document.querySelector('#confirmclear');
const closeModalBtn = document.querySelector('#closemodal');
const modalElem = document.querySelector('#modal');

window.addEventListener('load', () => {
  registerSW();
});

submitEntryBtn.addEventListener('click', (e) => {
  e.preventDefault();

  saveNewEntry(labelElem.value, parseInt(amountElem.value, 10));
  renderList();

  labelElem.value = "";
  amountElem.value = "";
});

clearAllBtn.addEventListener('click', (e) => {
  e.preventDefault();

  modalElem.classList.add('show');
});

confirmClearBtn.addEventListener('click', (e) => {
  e.preventDefault();

  localStorage.removeItem('items');

  renderList();

  modalElem.classList.remove('show');
});

closeModalBtn.addEventListener('click', (e) => {
  e.preventDefault();

  modalElem.classList.remove('show');
});

function getTimestamp () {
  const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
  const d = new Date();
  
  return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())}--${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function saveNewEntry(label, value) {
  const items = localStorage.getItem('items');
  let data = [];

  if (items)
    data = JSON.parse(items);
  
  data.push({ id: generateUUID(), createdAt: new Date().toJSON(), label: label, value: value ? value : 0 });
  localStorage.setItem('items', JSON.stringify(data));
}

// https://stackoverflow.com/a/8809472
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function renderList() {
  const items = localStorage.getItem('items');

  itemsList.innerHTML = '';

  if (items) {
    const data = JSON.parse(items);

    data.forEach(({id, label, value}) => {
      var entry = document.createElement('div');
      entry.appendChild(createElem('div', id, 'id'));
      entry.appendChild(createElem('div', label, 'label'));
      entry.appendChild(createElem('div', value, 'value'));
      entry.classList.add('item');

      var listItem = createElem('li', '', 'listitem');
      listItem.appendChild(entry);
      listItem.appendChild(createElem('button', 'del', 'del'));
      listItem.appendChild(createElem('button', '-', 'dec'));
      listItem.appendChild(createElem('button', '+', 'inc'));
      itemsList.appendChild(listItem);
    });
  }

  addEventListeners();
}

function createElem(type, content, classes = "") {
  var element = document.createElement(type);

  if (content !== "")
    element.appendChild(document.createTextNode(content));

  if (classes !== "")
    element.classList.add(classes);

  return element;
}

function addEventListeners() {
  const listItems = document.querySelectorAll('.listitem');

  listItems.forEach(elem => {
    elem.querySelector('.dec').addEventListener('click', (e) => {
      e.preventDefault();
      modifyElem(elem, -1);
    });

    elem.querySelector('.inc').addEventListener('click', (e) => {
      e.preventDefault();
      modifyElem(elem, 1);
    });

    elem.querySelector('.del').addEventListener('click', (e) => {
      e.preventDefault();
      modifyElem(elem, 'delete');
    });
  });
}

function modifyElem(elem, amount) {
  const idEl = elem.querySelector('.id');
  const dataId = idEl.innerText;

  let data = JSON.parse(localStorage.getItem('items'));

  if (amount === 'delete') {
    data = data.filter(elem => elem.id.toString() !== dataId);
  } else {
    let dataValue = parseInt(data.find(x => x.id.toString() === dataId).value, 10);

    dataValue = +dataValue + +amount;
  
    data[data.findIndex(x => x.id.toString() == dataId)].value = dataValue;
  }

  localStorage.setItem('items', JSON.stringify(data));

  renderList();
}

function downloadObjectAsJson(jsonStr, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

downloadFileBtn.addEventListener('click', (e) => {
  e.preventDefault();

  downloadObjectAsJson(localStorage.getItem('items'), `simple-counter-app-backup_${getTimestamp()}`);
});

uploadFormFile.onchange = function(e) {
  // uploadForm.submit();
  if (!uploadFormFile.value.length) return;
  
  let reader = new FileReader();

  reader.onload = (e) => {
    const str = e.target.result;
    localStorage.setItem('items', str);
    renderList();
    uploadFormFile.value = null;
  };

  reader.readAsText(uploadFormFile.files[0]);
}

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!uploadFormFile.value.length) return;
  
  let reader = new FileReader();

  reader.onload = (e) => {
    const str = e.target.result;
    localStorage.setItem('items', str);
    renderList();
  };

  reader.readAsText(file.files[0]);
});

renderList();

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('register sw');
    } catch(e) {
      console.log('SW registration failed');
    }
  }
}
