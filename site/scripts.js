const suits = [
    { symbol: "♥", name: "H" },
    { symbol: "♠", name: "S" },
    { symbol: "♦", name: "D" },
    { symbol: "♣", name: "C" },
  ];
  const values = [
    { symbol: "A", name: "A" },
    { symbol: "2", name: "2" },
    { symbol: "3", name: "3" },
    { symbol: "4", name: "4" },
    { symbol: "5", name: "5" },
    { symbol: "6", name: "6" },
    { symbol: "7", name: "7" },
    { symbol: "8", name: "8" },
    { symbol: "9", name: "9" },
    { symbol: "10", name: "10" },
    { symbol: "J", name: "J" },
    { symbol: "Q", name: "Q" },
    { symbol: "K", name: "K" },
  ];
  const deckOfCards = document.querySelector(".deck-of-cards");
  const defaultImagePath = "deck/default.png"; // Set the path to your default card image
  
function createDeck() {
    for (let suit of suits) {
      const suitRow = document.createElement("div");
      suitRow.className = "suit-row";
  
      for (let value of values) {
        const card = document.createElement("div");
        card.className = "card";
  
        const cardImage = document.createElement("img");
        cardImage.src = `deck-thumbnails/${value.name}${suit.name}.png`;
        cardImage.id = `${value.name}${suit.name}`;
        cardImage.alt = `${value.symbol} ${suit.symbol}`;
        cardImage.className = "card-image"; // Add this line to assign a class to the card images

        cardImage.onerror = function () {
          this.src = defaultImagePath;
        };
        // Add an event listener to the card image
        cardImage.addEventListener("click", () => {
            openModal(`deck/${value.name}${suit.name}.png`);
        });
        card.appendChild(cardImage);
  
        const cardName = document.createElement("p");
        cardName.className = "card-name";
        if (suit.name === "H" || suit.name === "D") {
          cardName.classList.add("red-suit");
        }
        cardName.textContent = `${value.symbol} ${suit.symbol}`;
        card.appendChild(cardName);
  
        suitRow.appendChild(card);
      }
  
      deckOfCards.appendChild(suitRow);
    }
  }
  
  createDeck();
  
  function openModal(imageSrc) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
  
    modalImage.src = imageSrc;
    modal.style.display = "block";
  }
  
  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
  
  const publicKeyInput = document.getElementById("walletPublicKey");  
  
publicKeyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default behavior of the Enter key
    fetchWalletData(); // Call the fetchWalletData function
  }
});

// Helper functions to identify poker hand combinations
function isRoyalFlush(cards) {
  const suits = ['H', 'D', 'S', 'C'];
  const royalFlushRanks = ['A', 'K', 'Q', 'J', '10'];

  for (const suit of suits) {
    const suitCards = cards.filter(card => card.endsWith(suit));
    if (royalFlushRanks.every(rank => suitCards.some(card => card.startsWith(rank)))) {
      return royalFlushRanks.map(rank => rank + suit);
    }
  }

  return null;
}

function findMatchingCards(cards, matchCount) {
  const cardCounts = {};

  for (const card of cards) {
    const rank = card.slice(0, -1);
    cardCounts[rank] = (cardCounts[rank] || 0) + 1;
  }

  for (const rank in cardCounts) {
    if (cardCounts[rank] === matchCount) {
      const matchingCards = cards.filter(card => card.startsWith(rank));
      return matchingCards;
    }
  }

  return null;
}

function isFourOfAKind(cards) {
  return findMatchingCards(cards, 4);
}


function isStraight(cards) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const uniqueCards = Array.from(new Set(cards.map(card => card.slice(0, -1))));
  const sortedIndices = uniqueCards.map(rank => ranks.indexOf(rank)).sort((a, b) => a - b);

  for (let i = 0; i < sortedIndices.length - 4; i++) {
    if (
      sortedIndices[i] + 1 === sortedIndices[i + 1] &&
      sortedIndices[i] + 2 === sortedIndices[i + 2] &&
      sortedIndices[i] + 3 === sortedIndices[i + 3] &&
      sortedIndices[i] + 4 === sortedIndices[i + 4]
    ) {
      const straightCards = [];
      for (let j = 0; j < 5; j++) {
        const rank = ranks[sortedIndices[i + j]];
        const card = cards.find(card => card.startsWith(rank));
        straightCards.push(card);
      }
      return straightCards;
    }
  }

  return null;
}

function isThreeOfAKind(cards) {
  return findMatchingCards(cards, 3);
}

function isPair(cards) {
  return findMatchingCards(cards, 2);
}

function findBestCombinations(cards) {
  const bestCombinations = [];
  let remainingCards = cards.slice();
  const combinationNames = {
    isRoyalFlush: "Royal flush",
    isFourOfAKind: "Four of a Kind",
    isStraight: "Straight",
    isThreeOfAKind: "Three of a kind",
    isPair: "Two pair"
  }
  const checkCombination = (combinationChecker) => {
    let matchingCards;
    do {
      matchingCards = combinationChecker(remainingCards);
      if (matchingCards) {
        bestCombinations.push({ name: combinationNames[combinationChecker.name], cards: matchingCards });
        remainingCards = remainingCards.filter(card => !matchingCards.includes(card));
      }
    } while (matchingCards);
  };

  checkCombination(isRoyalFlush);
  checkCombination(isFourOfAKind);
  checkCombination(isStraight);
  checkCombination(isThreeOfAKind);
  checkCombination(isPair);
  bestCombinations.push({ name: "No match", cards: remainingCards });
  return bestCombinations;
}


function cardNamesToSymbols(cards) {

  if (!Array.isArray(cards)) {
    console.error("Input is not an array:", cards);
    return cards;
  }


  const suits = [
    { symbol: "♥", name: "H", color: "red" },
    { symbol: "♠", name: "S", color: "black" },
    { symbol: "♦", name: "D", color: "red" },
    { symbol: "♣", name: "C", color: "black" },
  ];

  return cards.map(card => {
    const suit = suits.find(s => s.name === card.slice(-1));
    return `<span class="card" style="color: ${suit.color};">${card.slice(0, -1) + suit.symbol}&nbsp;</span>`;
  });
}

function displayBestCombinations(bestCombinations) {
  const combinationsContainer = document.getElementById("combinations") || createDisplayElement();
  let html = "<table>";
  // Store the combinations and their cards in an object
  const combinations = {};
  bestCombinations.forEach((combination) => {
    if (combination.cards.length > 0) {
      if (!combinations.hasOwnProperty(combination.name)) {
        combinations[combination.name] = [];
      }
      combinations[combination.name].push(combination.cards);
    }
  });

  const discount2combination = {
    "Royal flush": 100,
    "Four of a Kind": 50,
    "Straight": 30,
    "Three of a kind": 20,
    "Two pair": 10
  }

  // Display each combination and its relevant cards
  let isFisrt = true;
  for (const [combination, cardsList] of Object.entries(combinations)) {
    html += `<tr>`;
    html += `<td class="combination-name">${combination}</strong><td>`;

    const suits = [
      { symbol: "♥", name: "H", color: "red" },
      { symbol: "♠", name: "S", color: "black" },
      { symbol: "♦", name: "D", color: "red" },
      { symbol: "♣", name: "C", color: "black" },
    ];

    for (const cards of cardsList) {
      html += '<td class="card-container">';
      html += `<div class="card-combination">` + cardNamesToSymbols(cards).join(", ") + "</div>";
      html += '</td>';
    }
    if(isFisrt){
      html += `<td> <div class="combination-discount" style="background-color: lightgreen;">🎁 ${discount2combination[combination]}$ discount</div></td>`;
      isFisrt = false;
    }else{
      html += `<td></td>`;
    }
    html += `</tr>`;
  }
  html += "</table>";
  combinationsContainer.innerHTML = html;
}



function createDisplayElement() {
  const displayElement = document.createElement("div");
  displayElement.id = "combinations";
  document.body.appendChild(displayElement);
  return displayElement;
}

function combinationToHtml(combination) {
  const cardsHtml = combination.cards.map(card => `<span class="card">${card}</span>`).join(" ");
  return `
    <div class="combination">
      <h3>${combination.name}</h3>
      <div class="combination-cards">${cardsHtml}</div>
    </div>
  `;
}


let mintToCard;

async function fetchMintToCardData() {
  try {
    const jsonUrl = 'mint2card.json';
    const response = await fetch(jsonUrl);
    mintToCard = await response.json();
  } catch (error) {
    console.error("Error fetching mintToCard data:", error);
  }
}

// Call the fetchMintToCardData function when the page loads
fetchMintToCardData();

// Fetch wallet data and highlight cards
async function fetchWalletData() {
  const publicKeyInput = document.getElementById("walletPublicKey");
  const publicKey = publicKeyInput.value;

  if (!publicKey) {
    alert("Please enter a Solana wallet public key.");
    return;
  }

  try {
    const response = await fetch(`https://rpc-proxy.de7215.workers.dev/v0/addresses/${publicKey}/balances`);
    const data = await response.json();
    const tokens = data.tokens.filter((token) => token.amount > 0);
    
    highlightCards(tokens);
    
    const userCardsSet = new Set(
      tokens
        .map(token => mintToCard[token.mint])
        .filter(card => card !== undefined)
    );

    const userCards = Array.from(userCardsSet);
    
    const bestCombinations = findBestCombinations(userCards);
    
    // Display the best combinations on the page
    displayBestCombinations(bestCombinations);

    displayPassCardsInWallet(tokens);

  } catch (error) {
    console.error("Error fetching wallet data:", error);
    alert("An error occurred while fetching wallet data. Please try again.");
  }
}

// Highlight cards
function highlightCards(tokens) {
  clearAllHighlights();
  for (const token of tokens) {
    const cardName = mintToCard[token.mint];

    if (cardName) {
      const cardImage = document.getElementById(cardName);

      if (cardImage) {
        cardImage.style.boxShadow = "0 0 5px 5px rgba(0, 255, 0, 0.5)";
      }
    }
  }
}

function clearAllHighlights() {
  const cardImages = document.getElementsByClassName('card-image');

  for (const cardImage of cardImages) {
    cardImage.style.boxShadow = '';
  }
}


async function getMintList(verifiedCollectionAddress) {
  const url = `https://rpc-proxy.de7215.workers.dev/v1/mintlist`;
  let data = {
    query: {
      verifiedCollectionAddresses: [verifiedCollectionAddress],
    },
    options: {
      limit: 10000,
    },
  };
  let mintList = [];
  try {
    while (true) {
      let result = await jsonQuery(data, url);
      mintList = mintList.concat(result.result);
      if (!result.paginationToken) {
        break;
      }
      data.options.paginationToken = result.paginationToken;
    }
  } catch (error) {
    console.error('An error occurred while fetching the mint list:', error.message);
  }
  const mints = mintList.map(item => item.mint);
  return mints;
}

async function jsonQuery(data, url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred while making the HTTP request:', error.message);
    throw error;
  }
}

async function displayPassCardsInWallet(tokens) {
  passCardNftMintList = await getMintList('saga8uJYtWyHZ7spe4RVUA5eutbZPQYZe6D9uCkVK6r');

  const filteredTokens = tokens.filter(token => passCardNftMintList.includes(token.mint));

  const userPassInfo = document.getElementById('user-pass-info');
  userPassInfo.innerHTML = '';

  if (filteredTokens.length > 0) {
    const passFoundMessage = document.createElement('div');
    passFoundMessage.className = 'pass-found-message';
    passFoundMessage.textContent = `${filteredTokens.length} Saga pass NFTs found (click to expand)`;
    userPassInfo.appendChild(passFoundMessage);

    const passCardList = document.createElement('ul');
    passCardList.hidden = true; // Hide the list by default

    passCardList.className = 'pass-card-list';
    filteredTokens.forEach(token => {
      const passCardItem = document.createElement('li');
      passCardItem.className = 'pass-card-item';
      const passCardLink = document.createElement('a');
      passCardLink.href = `https://explorer.solana.com/address//${token.mint}`;
      passCardLink.textContent = `${token.mint}`;
      passCardLink.target = '_blank'; // Open the link in a new tab
      passCardItem.appendChild(passCardLink);
      passCardList.appendChild(passCardItem);
    });


    userPassInfo.appendChild(passCardList);

    passFoundMessage.addEventListener('click', () => {
      passCardList.hidden = !passCardList.hidden;
    });
  } else {
    // Create and display the warning message
    const warningMessage = document.createElement('div');
    warningMessage.className = 'warning-message';
    warningMessage.textContent = 'No Saga Pass NFT found - This means that the discount does not apply.';
    userPassInfo.appendChild(warningMessage);
  }
}

