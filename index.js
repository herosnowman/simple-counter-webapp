const labelElem = document.querySelector('#label');
const amountElem = document.querySelector('#amount');
const submitEntryBtn = document.querySelector('#submitentry');
const clearAllBtn = document.querySelector('#clearall');
const itemsList = document.querySelector('#items');

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

  if (items) {
    data = JSON.parse(items);
  }
  
  data.push({ id: data.length, label: label, value: value });
  localStorage.setItem('items', JSON.stringify(data));
}

function renderList() {
  const items = localStorage.getItem('items');

  itemsList.innerHTML = '';

  if (items) {
    const data = JSON.parse(items);

    data.forEach(({id, label, value}) => {
      var entry = document.createElement('div');

      var idEl = document.createElement('div');
      idEl.classList.add('id');
      idEl.appendChild(document.createTextNode(id));

      var labelEl = document.createElement('div');
      labelEl.classList.add('label');
      labelEl.appendChild(document.createTextNode(label));

      var valueEl = document.createElement('div');
      valueEl.classList.add('value');
      valueEl.appendChild(document.createTextNode(value));

      var decBtn = document.createElement('button');
      decBtn.appendChild(document.createTextNode('-'));
      decBtn.classList.add('dec');

      var incBtn = document.createElement('button');
      incBtn.appendChild(document.createTextNode('+'));
      incBtn.classList.add('inc');

      entry.appendChild(idEl);
      entry.appendChild(labelEl);
      entry.appendChild(valueEl);
      entry.classList.add('item');

      var listItem = document.createElement('li');
      listItem.appendChild(entry);
      listItem.appendChild(decBtn);
      listItem.appendChild(incBtn);
      listItem.classList.add('listitem');
      itemsList.appendChild(listItem);
    });
  }

  addEventListeners();
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
  });
}

function modifyElem(elem, amount) {
  const idEl = elem.querySelector('.id');
  const dataId = idEl.innerText;

  const data = JSON.parse(localStorage.getItem('items'));

  let dataValue = parseInt(data.find(x => x.id == dataId).value, 10);

  dataValue = +dataValue + +amount;

  data[data.find(x => x.id == dataId).id].value = dataValue;
  localStorage.setItem('items', JSON.stringify(data));

  renderList();
}

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
