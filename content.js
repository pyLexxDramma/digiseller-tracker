chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { startDate, endDate, combineCategories } = request;

  const format = (num) => {
      return num.toFixed(2).toString().replace('.', ',');
  };

  const formatDate = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
  };

  const tbody = document.querySelector('.tbody-class');

  if (!tbody || tbody.children.length === 0) {
      sendResponse({ output: 'Нет данных в таблице. Проверьте структуру.' });
      return;
  }

  const data = Array.from(tbody.children)
      .map((item) => {
          return {
              id: item?.children?.[0]?.innerText,
              typeOperation: item?.children?.[1]?.innerText,
              title: item?.children?.[2]?.innerText,
              date: item?.children?.[3]?.innerText,
              sum: {
                  amount: parseFloat(
                      item?.children?.[6]?.children?.[0]?.innerText
                          ?.replace(/[^\d.,-]/g, '')
                          .replace(',', '.'),
                  ),
                  currency: item?.children?.[6]?.children?.[0]?.childNodes?.[1]?.innerText,
              },
          };
      })
      .filter((item) => !!item?.typeOperation);

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  let uniqueIds = new Set();
  let output = '';

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      const day = date.getDate();
      let viewProccess = '';

      const filteredByDate = data.filter((item) => {
          const itemDay = +item?.date?.split('.')?.[0];
          const itemDate = new Date(item.date.split('.').reverse().join('-'));
          return (
              itemDay === day &&
              itemDate >= start &&
              itemDate <= end &&
              !item?.typeOperation.toLowerCase().includes('вывод') &&
              !item?.typeOperation.toLowerCase().includes('перевод на кошелек') &&
              !item?.typeOperation.toLowerCase().includes('перевод на USDT') &&
              !item?.typeOperation.toLowerCase().includes('частичный возврат') &&
              !uniqueIds.has(item.id)
          );
      });

      filteredByDate.forEach(item => uniqueIds.add(item.id));

      if (filteredByDate.length === 0) {
          output += `Нет транзакций для ${day}.${date.getMonth() + 1}.${date.getFullYear()}\n`;
          continue;
      }

      // Обработка данных в зависимости от состояния переключателя
      if (combineCategories) {
          const total = filteredByDate.reduce((acc, cur) => acc + cur.sum.amount, 0);
          output += `Дата: ${filteredByDate[0].date.split(' ')[0]}\n`;
          output += `Сумма (объединенная): ${format(total)}\n`;
      } else {
          const filteredMain = filteredByDate.filter((item) => !item.title.includes('🔥'));
          const filteredXbox = filteredByDate.filter((item) => item.title.includes('🔥'));

          const totalMain = filteredMain.reduce((acc, cur) => acc + cur.sum.amount, 0);
          const totalXbox = filteredXbox.reduce((acc, cur) => acc + cur.sum.amount, 0);

          output += `Дата: ${filteredByDate[0].date.split(' ')[0]}\n`;
          output += `Сумма MAIN: ${format(totalMain)}\n`;
          output += `Сумма XBOX: ${format(totalXbox)}\n`;
      }

      output += `\n`;
  }

  sendResponse({ output });
});
