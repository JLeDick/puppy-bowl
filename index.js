// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2601-Jason"; // Make sure to change this!
const API = BASE + COHORT;

// State
let puppies = [];
let SelectedPuppy;

//AsyncHandler - Replacing TryCatch with AsyncHandler for clarity and ease of use
function AsyncHandler(fn) {
  return async function (...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("Error", error);
    }
  };
}

// Adds all the puppies to the puppies array under [STATE] (see above)
const getPuppies = AsyncHandler(async () => {
  const response = await fetch(`${API}/players`);
  const json = await response.json();
  // changed const data to const json to clear things up - player data is at data.player, avoiding data.data.player
  puppies = json.data.players;
});

const getPuppy = AsyncHandler(async (id) => {
  const response = await fetch(`${API}/players/${id}`);
  const json = await response.json();
  SelectedPuppy = json.data.player;
  render();
});

/*
 = = = Recruit new puppies via API = = = 
 Instead of just calling getPuppies to refresh the full list of puppies each time we
recruit a new puppy, we can take the response, parse it with json, assign it to data and
use that data variable to push it onto the puppies array manually. This should reduce the amount
of API calls needed and make it more efficient (I think)
*/
const recruitPuppy = AsyncHandler(async (player) => {
  const response = await fetch(`${API}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
  const json = await response.json();
  puppies.push(json.data.newPlayer);
  render();
});

/* 
 = = = Banish a Puppy from the API-realm = = =
 Again, isntead of just calling `await getPuppies();` at the end of our banishPuppy function to refresh
 the puppy roster, we can specifically take the puppy we're banishing and remove him personally by
 using .filter on the puppies array, and if the puppy.id >IS NOT< the puppy.id we're passing to
 the banishPuppy function, then the puppy will be included in the filtered array. It will 
 make one less call to the API and, hopefully, be a bit more efficient.
*/
const banishPuppy = AsyncHandler(async (id) => {
  await fetch(`${API}/players/${id}`, {
    method: "DELETE",
  });
  puppies = puppies.filter((puppy) => puppy.id !== id);
  render();
});

// Components

/* 
 = = = Show Puppy Stat Page and Mugshot on Click = = =
 Clicking on the puppy will open a window that shows the relevant info from the related puppy object
*/
function PuppyRosterItem(puppy) {
  const $li = document.createElement("li");
  const $a = document.createElement("a");
  $a.href = `#selected`;
  $a.textContent = puppy.name;
  $li.append($a);
  $li.addEventListener("click", () => getPuppy(puppy.id));
  return $li;
}

/* 
 = = = The Full Puppy Roster = = =
 The list for our puppies, from which you can click with the above function
*/
function PuppyRoster() {
  const $ul = document.createElement("ul");
  $ul.className = "roster";
  for (const puppy of puppies) {
    const $li = PuppyRosterItem(puppy);
    $ul.append($li);
  }
  return $ul;
}

/* 
 = = = Puppy Stats for the Selected Puppy = = =
First create a guard clause if no puppy is selected
Next create the innerHTML for the section
Last give the button an eventListener so we can banish puppies
*/
function PuppyStats() {
  if (!SelectedPuppy) {
    const $p = document.createElement("p");
    $p.textContent = "Pick a Pup to View Stats";
    return $p;
  }

  const $section = document.createElement("section");
  $section.className = "puppy";
  $section.innerHTML = `
    <h3>${SelectedPuppy.name} #${SelectedPuppy.id}</h3>
    <figure>
      <img alt="${SelectedPuppy.name}" src="${SelectedPuppy.imageUrl}" />
    </figure>
    <p>Breed: ${SelectedPuppy.breed}</p>
    <p>Status: ${SelectedPuppy.status}</p>
    <button>Banish Puppy</button>
  `;

  const $delete = $section.querySelector("button");
  $delete.addEventListener("click", () => banishPuppy(SelectedPuppy.id));

  return $section;
}

/* 
 = = = Create a New Puppy Player = = =
 First made the innerHTML for the name, breed, puppy mugshot (imageUrl).
 Second addded an event listener for the "recruit puppy" button that >
 Third creates a player object that includes the three inputs we gave it
 Finally we call recruitPuppy function and reset the form (that we put off earlier with preventDefault)
*/
function NewPuppyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Breed
      <input name="breed" required />
    </label>
    <label>
      Puppy Mugshot URL
      <input name="imageUrl" required />
    </label>
    <button>Recruit Puppy</button>
  `;

  // Need preventDefault to make sure that we don't refresh the page immediately
  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    /* 
    Took a minute to figure this out using Lester's solution sheet for fullstack-gala-admin - It looks 
    like we're making a formData object based on the prototype of FormData($form) so that we can use 
    our new object to extact the values from the form fields. The API call happens when we pass 'player'
    to our recruitPuppy function below. It then receieves our player data (puppy stats) and creates a
    new puppy. This part is difficult to understand.
    */
    const formData = new FormData($form);
    const player = {
      name: formData.get("name"),
      breed: formData.get("breed"),
      imageUrl: formData.get("imageUrl"),
    };

    await recruitPuppy(player);
    $form.reset();
  });

  return $form;
}

// Render
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
  <h1>Puppy Bowl Bonanza<h1>
  <main>
    <section>
      <h2>Puppy Roster<h2>
      <PuppyRoster></PuppyRoster>
      <h3>Invite Puppy to Roster</h3>
      <NewPuppyForm></NewPuppyForm>
    </section>
    <section id="selected">
      <h2>Puppy Stat Sheet</h2>
      <PuppyStats></PuppyStats>
    </section>
  </main>
  `;

  $app.querySelector("PuppyRoster").replaceWith(PuppyRoster());
  $app.querySelector("NewPuppyForm").replaceWith(NewPuppyForm());
  $app.querySelector("PuppyStats").replaceWith(PuppyStats());
}

async function init() {
  await getPuppies();
  render();
}

init();
