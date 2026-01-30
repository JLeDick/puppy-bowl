// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2601-Jason"; // Make sure to change this!
const API = BASE + COHORT;

// Constants

// State

//

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
