
import { GraphAudit } from "./graph.js";
import { Graphxp } from "./graphxp.js";

let connecte= false



let msg = document.getElementById('msg')
let delog = document.getElementById("delog")
const form = document.querySelector('#login-form');
delog.addEventListener('click', (event) => {
event.preventDefault()
window.location.reload()


})



form.addEventListener('submit', (event) => {
   event.preventDefault();
   
   

   
  
  
 
  
  // Créer des éléments de titre pour chaque graphique
 
  
  // Ajouter les éléments de titre en tant qu'enfants de chaque div parent
  
  // Get values from form
  const email = form.elements.email.value;
  const password = form.elements.password.value;

  // Encode credentials using base64

// Encode credentials using base64
const authString = btoa(`${email}:${password}`);

// Set headers for POST request
const headers = {
  'Authorization': `Basic ${authString}`,
  'Content-Type': 'application/json'
};

// Set data for POST request
const data = {
  'email': email,
  'password': password
};

// Make POST request to signin endpoint
fetch('https://zone01normandie.org/api/auth/signin', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
})
.then(response => {
  if (response.status === 200) {
    msg.textContent=""
  }else{
    console.log("mauvais id")
  msg.textContent="Veuillez entrer des identifiants valides"

  }
  return response.json();
})

.then(datas => {


// console.log(datas)


  // Set headers for GraphQL request
  const gqlHeaders = {
    'Authorization': `Bearer ${datas}`,
    'Content-Type': 'application/json'
  };

  //requete normale
  const queryUser = `
   
  {
    user {
      id
      lastName
     firstName
      login
      email
      createdAt
      campus
      
    }
  }

    
          `
//variable query nested
          const queryXP = `
   
          {

            transaction(where: {type: {_eq: xp}, path: {_ilike: "%div-01%"}}){
            
            type
              path
            
              amount
              createdAt
             
              id
              object {
              
                name
                
                
              }
            
            }
            
              }
      
            `


            const querySkill = `
   
            {
  
              transaction (where : {type: {_ilike: "%skill%"}}){
              
              type
               
              
                amount
                
               
              
              
              }
              
                }
        
              `
//variable queries avec des arguments


const query = `
  query {
    user(where: {id: {_eq: 761}}) {
      id
      lastName
      login
      audits(order_by: {createdAt: asc}, where: {grade: {_is_null: false}}) {
        id

        grade
        createdAt
      }
    }
  }
`

fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
  method: 'POST',
  headers: gqlHeaders,
  body: JSON.stringify({ query })
})
  .then(response => response.json())
  .then(data => {
   
    const user = data.data.user[0];




        const audits = user.audits;
audits.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
// console.log(audits)

   
   
GraphAudit(audits)




   } )
   fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
  method: 'POST',
  headers: gqlHeaders,
  body: JSON.stringify({ query: querySkill })
})
  .then(response => response.json())
  .then(data => {
    console.log(data)







   } )


fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
  method: 'POST',
  headers: gqlHeaders,
  body: JSON.stringify({ query: querySkill })
})
.then(response => response.json())
.then(data => {
 
  let skills = [];
  let totals = [];
 
  // boucle à travers les transactions
  data.data.transaction.forEach((transaction) => {
    // récupérer le nom de la compétence
    let skill = transaction.type.split(' ')[0];

    // si la compétence n'est pas encore dans le tableau, l'ajouter
    if (!skills.includes(skill)) {
      skills.push(skill);
      totals.push(0);
    }

    // trouver l'index de la compétence dans le tableau et ajouter le montant à son total
    let index = skills.indexOf(skill);
    totals[index] += transaction.amount;
  });

  // calculer le total de tous les montants
  let totalAmount = totals.reduce((a, b) => a + b, 0);

  // calculer les pourcentages et stocker dans un tableau
  let percentages = totals.map((total) => Math.round(total / totalAmount * 100));

  // regrouper les compétences avec un pourcentage inférieur à 5% sous la compétence "Autre"
  const minPercentage = 5;
  let otherTotal = 0;
  for (let i = 0; i < percentages.length; i++) {
    if (percentages[i] < minPercentage) {
      otherTotal += totals[i];
      percentages.splice(i, 1);
      skills.splice(i, 1);
      totals.splice(i, 1);
      i--;
    }
  }
  if (otherTotal > 0) {
    skills.push("Autre");
    totals.push(otherTotal);
    percentages.push(Math.round(otherTotal / totalAmount * 100));
  }

  // trier les compétences par ordre décroissant de pourcentage
  const sortedIndexes = percentages.map((_, index) => index).sort((a, b) => percentages[b] - percentages[a]);
  skills = sortedIndexes.map((index) => skills[index]);
  totals = sortedIndexes.map((index) => totals[index]);
  percentages = sortedIndexes.map((index) => percentages[index]);

  console.log(skills); // compétences
  console.log(totals); // totaux
  console.log(percentages); // pourcentages
  const width = 400;
  const height = 400;
  
  // données pour le camembert
  // const datad = [10, 20, 30, 40];
  
  // couleurs pour chaque part
 // échelle de couleurs pour le dégradé de bleu
// échelle de couleurs pour le dégradé de bleu
const colorScale = d3.scaleSequential()
  .domain([d3.max(percentages), d3.min(percentages)])
  .interpolator(d3.interpolateReds);


  
  // création de l'élément SVG
  const svg = d3.select('#pie-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // création d'un groupe pour le camembert
  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
  // création d'un générateur de camembert
  const pie = d3.pie();
  
  // génération des angles pour chaque part
  const angles = pie(percentages);
  
  // création d'un générateur de forme pour chaque part
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 10);
  
  // création des formes pour chaque part
  const paths = g.selectAll('path')
    .data(angles)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('stroke', 'black')

    .attr('stroke-width', 0.5)
    .attr('fill', (d, i) => colorScale(d.value));
   
    
    let datad = skills.map((skill, index) => ({ skill, percentage: percentages[index] }));

    // tri du tableau par pourcentage croissant
    datad.sort((a, b) => b.percent - a.percent);
    
    console.log(datad); // affiche le tableau trié
    const labels = g.selectAll('text')
    .data(angles)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('font-size', '10px') 
    .attr('dy', '0.35em')
    .text((d, i) => `${datad[i].skill}: ${d.value}%`);


    const pieChartDiv = document.getElementById('pie-chart');
    const pieChartTitle = document.createElement('h2');
    pieChartTitle.textContent = 'Skills en %';
    
  
    pieChartDiv.appendChild(pieChartTitle);
});

   fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: gqlHeaders,
    body: JSON.stringify({ query: queryUser })
  })
  .then(response => response.json())
  .then(data => {
// récupérer l'élément HTML cible
const userInfoDiv = document.querySelector('#user-info');

// créer une chaîne contenant les informations à afficher
let userInfoHtml="";
const user = data.data.user[0];
for (const [key, value] of Object.entries(user)) {
  userInfoHtml += `<p><strong>${key}:</strong> ${value}</p>`;
}

// injecter la chaîne HTML dans l'élément cible
userInfoDiv.style.visibility="visible"
userInfoDiv.innerHTML = userInfoHtml;
  
  

fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
  method: 'POST',
  headers: gqlHeaders,
  body: JSON.stringify({ query: queryXP })
})
.then(response => response.json())
.then(data => {
  const xp = data.data.transaction;
  // console.log(data.data.transaction[1].object.name)




 
xp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
// console.log(xp[2].path)
  // console.log(data.data.transaction[5])
  const uniquePaths = xp.reduce((acc, curr) => {
    const existingPath = acc.find(item => item.path === curr.path);
    if (!existingPath) {
      acc.push(curr);
    }
    return acc;
  }, []);
  
  console.log('uniquePaths:', uniquePaths);
  Graphxp(uniquePaths)
})

})}  )
   .catch(error => console.error(error));
  //  console.log("erreur")
  
  //   chartDiv.style.visibility="hidden"
  // //  const xpDiv = document.getElementById('xp');
  // //  const pieChartDiv = document.getElementById('pie-chart');
  // xpDiv.style.visibility="hidden"
  // pieChartDiv.style.visibility="hidden"
  
  // if (!connecte){
  //   chartDiv.style.visibility="hidden"
  
  //   xpDiv.style.visibility="hidden"
  //   pieChartDiv.style.visibility="hidden"
  // }
  })


