const requestList = document.getElementById('requestList');

function createRequestItem(query = '', results=[], addToEnd=false) {
  const container = document.createElement('div');
  container.className = 'request-item';

  const input = document.createElement('input');
  input.placeholder = 'Enter your query';
  input.value = query;

  const sendButton = document.createElement('div');
  sendButton.className = 'btn'
  sendButton.textContent = 'Send';

  const input_btn_group = document.createElement('div');
  input_btn_group.className = 'input-btn-g';
  input_btn_group.appendChild(input);
  input_btn_group.appendChild(sendButton);
  container.appendChild(input_btn_group);

  const deleteButton = document.createElement('div');
  deleteButton.className = 'closeCross';
  deleteButton.textContent = 'x';

  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  if(results.length > 0){
    results.forEach(r => resultDiv.appendChild(r));
  }
  sendButton.onclick = () => {
    sendRequest(input.value, resultDiv);
    let lastInput = container.parentElement.querySelector('.request-item:first-child input');
    if(lastInput&&lastInput.value!=''){  // 单纯点击send而没有实际内容，不用刷新
      createRequestItem();
    }
  };

  deleteButton.onclick = () => {
    container.remove();
    updateLocalStorage();
  };

  container.appendChild(deleteButton);
  container.appendChild(resultDiv);
  
  if(addToEnd){
    requestList.append(container);
  }else{
    requestList.insertBefore(container, requestList.firstChild);
  }
  
  input.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'Enter') {
      sendButton.click();
    }
  });
}

function sendRequest(query, result_anchor) {
  fetch('/v1/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query })
  })
    .then(response => response.json())
    .then(data => {
      const sortedResults = Object.entries(data.result_dict)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => {
          const resultSpan = document.createElement('span');
          resultSpan.textContent = `${key}: ${value.toFixed(2)}`;
          if (value > 0.5) resultSpan.className = 'bg-green';
          // else if (value > 0.4) resultSpan.className = 'bg-blue';
          return resultSpan;
        });
      
      // createRequestItem is now called with results as spans, not as a text content.
      result_anchor.innerHTML = '';
      sortedResults.forEach(span => result_anchor.appendChild(span));
      updateLocalStorage();
    })
    .catch(error => {
      result_anchor.textContent = 'Error: ' + error.message;
    });
}

function updateLocalStorage() {
  const items = [];
  document.querySelectorAll('.request-item').forEach(item => {
    const resultSpans = item.querySelector('.result').children;
    const results = Array.from(resultSpans).map(span => {
      return { text: span.textContent, className: span.className };
    });
    items.push({
      query: item.querySelector('input').value,
      results: results
    });
  });
  localStorage.setItem('requests', JSON.stringify(items));
}

// 亮、暗主题切换
const modeSwitch = document.getElementById('modeSwitch');
modeSwitch.addEventListener('click', function () {
  document.body.classList.add('transition');
  const isDarkMode = document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', isDarkMode);
  modeSwitch.innerText = isDarkMode?'🌞':'🌙';
  window.setTimeout(() => {
    document.body.classList.remove('transition');
  }, 500);
});

function loadFromLocalStorage() {
  // 亮暗主题状态加载
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  modeSwitch.innerText = isDarkMode?'🌞':'🌙'
  document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
  document.body.classList.remove(isDarkMode ? 'light-mode' : 'dark-mode');

  // 历史请求加载
  const requests = JSON.parse(localStorage.getItem('requests') || '[]');
  requests.forEach(req => {
    // Convert each stored result object into a span element.
    const results = req.results.map(r => {
      const span = document.createElement('span');
      span.textContent = r.text;
      span.className = r.className;
      return span;
    });
    createRequestItem(req.query, results, addToEnd=true);
  });
  if(requests.length === 0){
    createRequestItem();
  }
}

window.onload = loadFromLocalStorage;
