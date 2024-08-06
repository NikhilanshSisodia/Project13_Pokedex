const allGenPokemon = [151, 251, 386, 493, 649, 721, 809, 905, 1025];
let currentIndex = 0;
let MAX_POKEMON = allGenPokemon[currentIndex];
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const searchMore = document.querySelector('#search-more-btn');
const suggestions = document.querySelector("#suggestions");

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  });

async function fetchPokemonDataBeforeRedirect(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json())
    ]);
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data before redirect");
  }
}

function displayPokemons(pokemon) {
  listWrapper.innerHTML = "";

  pokemon.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts">#${pokemonID}</p>
      </div>
      <div class="img-wrap">
        <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" />
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${pokemon.name}</p>
      </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }
    });

    listWrapper.appendChild(listItem);
  });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  if (numberFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else {
    filteredPokemons = allPokemons;
  }

  displayPokemons(filteredPokemons);

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }

  showSuggestions(searchTerm, filteredPokemons);
}

function showSuggestions(query, pokemons) {
  suggestions.innerHTML = '';
  if (!query) {
    suggestions.style.display = 'none';
    return;
  }
  
  const suggestionItems = pokemons.slice(0, 10).map(pokemon => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = pokemon.name;
    div.onclick = () => {
      searchInput.value = pokemon.name;
      suggestions.style.display = 'none';
      displayPokemons([pokemon]); // Display only the selected Pokémon
      notFoundMessage.style.display = "none";
    };
    return div;
  });

  suggestions.append(...suggestionItems);
  suggestions.style.display = 'block';
}

const closeButton = document.querySelector(".search-close-icon");
closeButton.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = "";
  displayPokemons(allPokemons);
  notFoundMessage.style.display = "none";
  suggestions.style.display = "none";
}

searchMore.addEventListener('click', addNextGen);

async function addNextGen() {
  if (currentIndex < 8) {
    currentIndex += 1;
    MAX_POKEMON = allGenPokemon[currentIndex];

    listWrapper.innerHTML = "";
    
    await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
      .then((response) => response.json())
      .then((data) => {
        allPokemons = data.results;
        displayPokemons(allPokemons);
      });

    notFoundMessage.style.display = "none";
    handleSearch();
    window.location.href = "#search-more-btn";
  } else {
    searchMore.style.display = "none";
  }
}
