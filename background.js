chrome.browserAction.onClicked.addListener(function(tab) {
  main(tab.id);
});

function main(tabId) {
  checkAvailability(tabId)
  const CHECK_EVERY_X_MS = 1000 * 60 * 15 /* minutes */;
  setInterval(() => checkAvailability(tabId), CHECK_EVERY_X_MS);
}

const wait = (delay, ...args) => new Promise(resolve => setTimeout(resolve, delay, ...args));

async function checkAvailability(tabId) {
  chrome.tabs.reload()
  await wait(4000);
  await moveThreePages()
  await checkAllSlots(tabId)
}

async function nextPage() {
  const getNextPage = () => {
    document.getElementById('nextButton').click();
  }
  await wait(2000);
  chrome.tabs.executeScript({
    code: '(' + getNextPage + ')();'
  })
}

async function moveThreePages() {
  // Load 3 pages of slots (4 days per page)
  await nextPage();
  await nextPage();
  await nextPage();
}

async function checkAllSlots(tabId) {
  chrome.tabs.sendMessage(tabId, {text: 'report_back'}, checkIfDomHasAvailability);
  await wait(3000);
}

function checkIfDomHasAvailability(domString) {
  const newDom = new DOMParser().parseFromString(domString, 'text/html');
  const matcher = /^No (attended|doorstep) delivery/;
  let count = 0;
  Array.from(newDom.getElementsByClassName('ServiceType-slot-container'))
    .forEach((el) => {
      // This needs to be updated to check the disabled/enabled timeslot radio list for
      // available delivery times. My fresh timeslots never showed this element
      // all weekend so I didn't add the logic yet.
      const content = el.querySelector('.a-size-base-plus').innerHTML.trim();
      if (matcher.test(content)) {
        count++;
      }
    })

  if (count !== 24) {
    // Make sure your volume is on (and loud)
    chrome.tabs.create({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})
  }
}
