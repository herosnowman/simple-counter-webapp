const labelElem = document.querySelector('#label');
const amountElem = document.querySelector('#amount');
const submitEntryBtn = document.querySelector('#submitentry');
const clearAllBtn = document.querySelector('#clearall');
const itemsList = document.querySelector('#items');

const uploadForm = document.querySelector('#upload');
const uploadFormFile = document.querySelector('#file'); 
const downloadFileBtn = document.querySelector('#downloadbackup');

window.addEventListener('load', () => {
  registerSW();
});

submitEntryBtn.addEventListener('click', (e) => {
  e.preventDefault();

  saveEntry(labelElem.value, parseInt(amountElem.value, 10));
  renderList();

  labelElem.value = "";
  amountElem.value = "";
});

clearAllBtn.addEventListener('click', (e) => {
  e.preventDefault();

  localStorage.removeItem('items');

  renderList();
});

function saveEntry(label, value) {
  const items = localStorage.getItem('items');
  let data = [];

  if (items)
    data = JSON.parse(items);
  
  data.push({ id: data.length > 0 ? parseInt(data[data.length - 1].id) + 1 : 0, label: label, value: value ? value : 0 });
  localStorage.setItem('items', JSON.stringify(data));
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
  
    data[data.find(x => x.id.toString() == dataId).id].value = dataValue;
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

  downloadObjectAsJson(localStorage.getItem('items'), 'simple-counter-app-backup');
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
  console.log('yeet');

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
