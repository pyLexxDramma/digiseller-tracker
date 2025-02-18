document.getElementById('generateReport').addEventListener('click', () => {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const combineCategories = document.getElementById('combineCategories').checked;

  if (!startDate || !endDate) {
      alert('Пожалуйста, выберите обе даты.');
      return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { startDate, endDate, combineCategories }, (response) => {
          if (response) {
              document.getElementById('output').innerText = response.output;
          } else {
              document.getElementById('output').innerText = 'Ошибка при получении данных.';
          }
      });
  });
});
